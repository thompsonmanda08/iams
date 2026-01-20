# 06 - API Integration

## Overview

INFRATEL IAMS uses **Next.js Server Actions** as the primary API layer:
- Type-safe with TypeScript
- Co-located with frontend code
- Automatic serialization
- Built-in error handling

## Server Actions Pattern

### Location
All server actions in `app/_actions/`:
```
app/_actions/
├── reports-actions.ts
├── audit-actions.ts
├── risk-actions.ts
└── workflow-actions.ts
```

### Basic Structure

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateReport(reportId: string, data: ReportData) {
  const supabase = createClient();

  // Validate input
  if (!reportId) throw new Error("Report ID required");

  // Update database
  const { data: report, error } = await supabase
    .from("reports")
    .update(data)
    .eq("id", reportId)
    .select()
    .single();

  if (error) throw error;

  // Revalidate cache
  revalidatePath("/dashboard/reports");
  revalidatePath(`/dashboard/reports/${reportId}`);

  return report;
}
```

## Key Actions

### Reports Actions

**File:** `app/_actions/reports-actions.ts`

```typescript
// Fetch report
export async function getReport(reportId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single();

  if (error) throw error;
  return data;
}

// Create report
export async function createReport(input: CreateReportInput) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reports")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/reports");
  return data;
}

// Publish report
export async function publishReport(reportId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("reports")
    .update({
      status: "PUBLISHED",
      published_at: new Date().toISOString()
    })
    .eq("id", reportId);

  if (error) throw error;

  revalidatePath("/dashboard/reports");
  revalidatePath(`/dashboard/reports/${reportId}`);
}
```

### Audit Actions

**File:** `app/_actions/audit-actions.ts`

```typescript
export async function getAuditPlan(planId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("audit_plans")
    .select(`
      *,
      findings(*),
      workpapers(*)
    `)
    .eq("id", planId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateAuditPlan(planId: string, updates: Partial<AuditPlan>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("audit_plans")
    .update(updates)
    .eq("id", planId)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/audit/plans");
  revalidatePath(`/dashboard/audit/plans/engagement/${planId}`);
  return data;
}
```

## React Query Integration

### Query Hook

```typescript
// hooks/use-report-queries.ts
import { useQuery } from "@tanstack/react-query";
import { getReport } from "@/app/_actions/reports-actions";

export function useReport(reportId: string) {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: () => getReport(reportId),
    enabled: !!reportId
  });
}
```

### Mutation Hook

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateReport } from "@/app/_actions/reports-actions";

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReport,
    onSuccess: (data, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", variables.reportId] });

      // Optional: Show toast
      toast.success("Report updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}
```

## Cache Revalidation Strategy

### Server-side (revalidatePath)

```typescript
import { revalidatePath } from "next/cache";

// Revalidate specific page
revalidatePath("/dashboard/reports");

// Revalidate dynamic route
revalidatePath(`/dashboard/reports/${reportId}`);

// Revalidate entire layout
revalidatePath("/dashboard/audit/plans", "layout");
```

### Client-side (React Query)

```typescript
const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ["report", reportId] });

// Invalidate all reports queries
queryClient.invalidateQueries({ queryKey: ["reports"] });

// Refetch active queries
queryClient.refetchQueries({ queryKey: ["reports"] });
```

### Combined Strategy

```typescript
// In mutation onSuccess
onSuccess: (data, variables) => {
  // Client invalidation
  queryClient.invalidateQueries({ queryKey: ["reports"] });
  queryClient.invalidateQueries({ queryKey: ["report", variables.reportId] });

  // Server refresh
  router.refresh();

  toast.success("Changes saved!");
}
```

## Error Handling

### Server Action

```typescript
export async function updateReport(reportId: string, data: ReportData) {
  try {
    const supabase = createClient();

    const { data: report, error } = await supabase
      .from("reports")
      .update(data)
      .eq("id", reportId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/reports");
    return { success: true, data: report };
  } catch (error) {
    console.error("Update failed:", error);
    return { success: false, error: error.message };
  }
}
```

### Client Hook

```typescript
const mutation = useUpdateReport();

const handleSave = async () => {
  try {
    await mutation.mutateAsync(reportData);
  } catch (error) {
    console.error("Save failed:", error);
  }
};
```

## API Routes (Alternative)

**When to use:** External webhooks, file uploads, non-React clients

**Location:** `app/api/`

```typescript
// app/api/webhooks/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Process webhook
  // ...

  return NextResponse.json({ success: true });
}
```

## Best Practices

1. **Always revalidate** - Update cache after mutations
2. **Use try-catch** - Handle errors gracefully
3. **Validate input** - Check parameters before queries
4. **Type everything** - Use TypeScript for safety
5. **Invalidate related queries** - Keep UI consistent
6. **Use optimistic updates** - Better UX

## Next Steps

Continue to → [07-audit-module.md](07-audit-module.md)
