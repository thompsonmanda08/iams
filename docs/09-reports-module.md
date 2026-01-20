# 09 - Reports Module

## Overview

The Reports Module provides dynamic report generation:
- Template-based reports
- Drag-and-drop builder
- PDF export
- Smart template merging
- Status management (DRAFT → PUBLISHED)

## Core Features

### 1. Report Builder

**Location:** `components/reports/report-builder.tsx`

**Key capabilities:**
- Add/remove/reorder sections
- Rich text editing
- Data source integration
- Widget embedding
- Live preview

### 2. Report Templates

**Location:** `components/reports/report-templates.ts`

**Available templates:**
- ISO 27001 Audit Report
- COSO Internal Audit Report
- Risk Assessment Report
- Follow-up Audit Report
- Custom templates

**Template structure:**
```typescript
{
  id: "iso27001-audit",
  name: "ISO 27001 Audit Report",
  managementStandard: "ISO27001:2022",
  sections: [
    {
      id: "executive-summary",
      title: "Executive Summary",
      type: "rich_text",
      content: ""
    },
    {
      id: "findings",
      title: "Audit Findings",
      type: "findings_table",
      dataSource: "findings"
    }
  ]
}
```

### 3. Template Merging

**File:** `lib/config/report-template-merger.ts`

**Purpose:** Intelligently merge database content with templates

```typescript
const mergedReport = mergeReportWithTemplate(
  savedReportContent,
  "ISO27001:2022",
  {
    id: reportId,
    title: reportTitle,
    status: reportStatus
  }
);

// Ensures database values override template
mergedReport.report_id = reportId;
mergedReport.status = reportStatus;
```

**Merge strategy:**
- Preserve user content
- Add new template sections
- Remove deprecated sections
- Sync metadata

### 4. Report Status

**Status flow:**
```
DRAFT → PUBLISHED
```

**Key behavior:**
- DRAFT: Save button visible
- PUBLISHED: Save button hidden (read-only)

**Implementation:**
```typescript
// components/reports/report-builder.tsx
{report.status !== "PUBLISHED" && (
  <Button onClick={handleSave} variant="outline">
    <Save className="h-4 w-4" />
    Save Draft
  </Button>
)}
```

### 5. PDF Export

**Library:** `@react-pdf/renderer`

**File:** `components/reports/pdf-react/pdf-document.tsx`

```typescript
import { Document, Page, Text, View } from "@react-pdf/renderer";

<Document>
  <Page size="A4" style={styles.page}>
    <View style={styles.section}>
      <Text>{report.title}</Text>
    </View>
  </Page>
</Document>
```

**Export flow:**
1. User clicks "Export PDF"
2. React-PDF renders document
3. Download as PDF file

## Key Components

### Report Details (Standalone)

**File:** `app/dashboard/(modules)/reports/[id]/page.tsx`

Server component that:
1. Fetches report from database
2. Passes to ReportDetailsClient
3. Ensures status sync

```typescript
export default async function ReportPage({ params }) {
  const report = await getReport(params.id);

  return (
    <ReportDetailsClient
      reportId={params.id}
      initialReport={report.report_content}
      reportStatus={report.status} // Database status
      entity={entity}
      entityType={entityType}
    />
  );
}
```

### Report Details Client

**File:** `app/dashboard/(modules)/reports/_components/report-details-client.tsx`

Client component that:
1. Merges template
2. Syncs report ID and status
3. Renders ReportBuilder

```typescript
const mergedReport = mergeReportWithTemplate(
  initialReport,
  entity.management_standard,
  { /* ... */ }
);

// CRITICAL: Override with database values
mergedReport.report_id = reportId;
mergedReport.status = reportStatus;

return <ReportBuilder report={mergedReport} />;
```

### Audit Plan Report Tab

**File:** `app/dashboard/(modules)/audit/plans/_components/audit-plan-report-tab.tsx`

Embedded report builder within audit plan:
- Same merge logic as standalone
- Same status sync
- Same save/publish flow

**Feature parity achieved:**
```typescript
// Same critical sync as report-details-client
mergedReport.report_id = record.id;
mergedReport.status = record.status;
```

### Reports Table

**File:** `app/dashboard/(modules)/reports/_components/reports-table.tsx`

Lists all reports with:
- StatusBadge component
- Quick actions
- Filter by status
- Sort by date

## Server Actions

**File:** `app/_actions/reports-actions.ts`

```typescript
// Get report
export async function getReport(reportId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single();

  return data;
}

// Update report (Save Draft)
export async function updateReport(
  reportId: string,
  reportContent: ReportContent
) {
  const supabase = createClient();
  await supabase
    .from("reports")
    .update({
      report_content: reportContent,
      updated_at: new Date().toISOString()
    })
    .eq("id", reportId);

  // Revalidate cache
  revalidatePath("/dashboard/reports");
  revalidatePath(`/dashboard/reports/${reportId}`);
  revalidatePath("/dashboard/audit/plans", "layout");
}

// Publish report
export async function publishReport(reportId: string) {
  const supabase = createClient();
  await supabase
    .from("reports")
    .update({
      status: "PUBLISHED",
      published_at: new Date().toISOString()
    })
    .eq("id", reportId);

  revalidatePath("/dashboard/reports");
  revalidatePath(`/dashboard/reports/${reportId}`);
  revalidatePath("/dashboard/audit/plans", "layout");
}
```

## Hooks

**File:** `hooks/use-report-queries.ts`

```typescript
export function useReport(reportId: string) {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: () => getReport(reportId)
  });
}

export function useSaveReport() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: updateReport,
    onSuccess: (_data, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", variables.reportId] });

      // Refresh server components
      router.refresh();

      toast.success("Report saved!");
    }
  });
}

export function usePublishReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report published!");
    }
  });
}
```

## Cache Revalidation Strategy

**After mutations:**
1. **Server-side:** `revalidatePath()` in Server Actions
2. **Client-side:** `invalidateQueries()` in mutation hooks
3. **Server Components:** `router.refresh()` in ReportBuilder

**Example flow:**
```
User clicks Save
  ↓
useSaveReport mutation
  ↓
updateReport server action
  ↓
revalidatePath (server cache)
  ↓
onSuccess callback
  ↓
invalidateQueries (client cache)
  ↓
router.refresh (server components)
  ↓
UI updates with fresh data
```

## Database Schema

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'audit_plan' or 'risk'
  report_content JSONB NOT NULL,
  status TEXT DEFAULT 'DRAFT',
  published_at TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Common Issues

**Issue: Report ID missing**
- Cause: Template merge doesn't preserve ID
- Fix: Explicitly set `mergedReport.report_id = reportId`

**Issue: Status out of sync**
- Cause: report_content.status overrides database
- Fix: Explicitly set `mergedReport.status = reportStatus`

**Issue: UI not refreshing**
- Cause: Cache not invalidated
- Fix: Use full revalidation strategy (server + client)

**Issue: Save button visible when published**
- Cause: Missing conditional check
- Fix: `{report.status !== "PUBLISHED" && <Button />}`

## Next Steps

Continue to → [10-workflows.md](10-workflows.md)
