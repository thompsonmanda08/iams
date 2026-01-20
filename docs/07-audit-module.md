# 07 - Audit Module

## Overview

The Audit Module manages internal audit engagements with support for:
- ISO 27001, COSO, COBIT, NIST frameworks
- Audit planning and execution
- Findings management
- Workpapers
- Report generation

## Core Features

### 1. Audit Plans

**Location:** `app/dashboard/(modules)/audit/plans/`

**Create new audit plan:**
```typescript
const plan = await createAuditPlan({
  title: "Q1 2026 ISO 27001 Audit",
  management_standard: "ISO27001:2022",
  start_date: "2026-01-01",
  end_date: "2026-03-31",
  status: "DRAFT"
});
```

**Key fields:**
- `title` - Audit engagement name
- `management_standard` - Framework (ISO27001, COSO, etc.)
- `start_date` / `end_date` - Audit period
- `status` - DRAFT, IN_PROGRESS, COMPLETED
- `scope` - Areas covered
- `objectives` - Audit objectives

### 2. Findings

**Location:** `app/dashboard/(modules)/audit/findings/`

**Create finding:**
```typescript
const finding = await createFinding({
  audit_plan_id: planId,
  title: "Inadequate access controls",
  description: "Users have excessive permissions",
  severity: "HIGH",
  control_reference: "A.9.2.1",
  status: "OPEN"
});
```

**Severity levels:**
- `CRITICAL` - Immediate action required
- `HIGH` - Significant risk
- `MEDIUM` - Moderate risk
- `LOW` - Minor issue

**Status flow:**
```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

### 3. Workpapers

**Location:** Embedded in audit plan view

**Purpose:** Document audit evidence and procedures

```typescript
const workpaper = await createWorkpaper({
  audit_plan_id: planId,
  title: "Access Control Testing",
  content: documentContent,
  type: "TESTING",
  attachments: fileUrls
});
```

### 4. Frameworks Support

#### ISO 27001:2022

**Controls:** `lib/config/iso27001-clauses.ts`

```typescript
export const ISO27001_CONTROLS = {
  "A.5": "Organizational Controls",
  "A.6": "People Controls",
  "A.7": "Physical Controls",
  "A.8": "Technological Controls"
};
```

#### COSO, COBIT, NIST

Framework-specific templates and control references available in `lib/templates/`.

## Key Components

### Audit Plan Table

**File:** `app/dashboard/(modules)/audit/plans/_components/audit-plans-table.tsx`

Features:
- Sortable columns
- Status filtering
- Quick actions
- Framework badges

### Audit Plan Details

**File:** `app/dashboard/(modules)/audit/plans/engagement/[id]/page.tsx`

Tabs:
- **Overview** - Plan metadata
- **Findings** - Linked findings
- **Workpapers** - Evidence documents
- **Report** - Generated report

### Report Tab Integration

**File:** `app/dashboard/(modules)/audit/plans/_components/audit-plan-report-tab.tsx`

Key features:
- Template merging
- Status synchronization
- Save draft / Publish
- PDF export

```typescript
// Ensure status sync
const mergedReport = mergeReportWithTemplate(
  record.report_content,
  auditPlan.management_standard,
  { /* ... */ }
);

mergedReport.report_id = record.id;
mergedReport.status = record.status; // Database status wins
```

## Workflows

### Audit Plan Creation

1. Navigate to Audit Plans
2. Click "Create Audit Plan"
3. Fill in details (title, framework, dates)
4. Set scope and objectives
5. Save as DRAFT
6. Start audit → Status: IN_PROGRESS

### Findings Management

1. Open audit plan
2. Go to Findings tab
3. Add finding with details
4. Assign to user
5. Track remediation
6. Mark as RESOLVED → CLOSED

### Report Generation

1. Open audit plan
2. Go to Report tab
3. Select template (or use default)
4. Add sections and content
5. Preview PDF
6. Save draft
7. Publish when ready

## Server Actions

**File:** `app/_actions/audit-actions.ts`

```typescript
// Get audit plan with relations
export async function getAuditPlan(planId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("audit_plans")
    .select(`
      *,
      findings(*),
      workpapers(*),
      reports(*)
    `)
    .eq("id", planId)
    .single();

  return data;
}

// Update plan status
export async function updateAuditPlanStatus(
  planId: string,
  status: AuditPlanStatus
) {
  const supabase = createClient();
  await supabase
    .from("audit_plans")
    .update({ status })
    .eq("id", planId);

  revalidatePath("/dashboard/audit/plans");
}
```

## Hooks

**File:** `hooks/use-audit-queries.ts`

```typescript
export function useAuditPlan(planId: string) {
  return useQuery({
    queryKey: ["audit-plan", planId],
    queryFn: () => getAuditPlan(planId)
  });
}

export function useUpdateAuditPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAuditPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-plan"] });
    }
  });
}
```

## Database Schema

```sql
CREATE TABLE audit_plans (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  management_standard TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'DRAFT',
  scope JSONB,
  objectives TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE findings (
  id UUID PRIMARY KEY,
  audit_plan_id UUID REFERENCES audit_plans(id),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT,
  control_reference TEXT,
  status TEXT DEFAULT 'OPEN',
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Next Steps

Continue to → [08-risk-module.md](08-risk-module.md)
