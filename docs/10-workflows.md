# 10 - Workflows

## Overview

The Workflows Module provides approval and review processes:
- Multi-step workflows
- Role-based approvals
- Automatic notifications
- Workflow history
- Status tracking

## Core Concepts

### Workflow Types

1. **Approval Workflow** - Sequential approvals
2. **Review Workflow** - Parallel reviews
3. **Custom Workflow** - User-defined steps

### Workflow States

```
PENDING → IN_PROGRESS → APPROVED / REJECTED
```

### Workflow Steps

Each workflow consists of ordered steps:
```typescript
{
  step_number: 1,
  name: "Manager Review",
  assigned_to: userId,
  status: "PENDING",
  completed_at: null,
  comments: ""
}
```

## Workflow Structure

### Database Schema

```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'report', 'audit_plan', 'risk'
  workflow_type TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  current_step INTEGER DEFAULT 1,
  steps JSONB NOT NULL,
  initiated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workflow_history (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  step_number INTEGER,
  action TEXT, -- 'APPROVED', 'REJECTED', 'COMMENTED'
  performed_by UUID REFERENCES auth.users(id),
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Approval Workflow Example

### Step 1: Initiate Workflow

```typescript
const workflow = await createWorkflow({
  entity_id: reportId,
  entity_type: "report",
  workflow_type: "approval",
  steps: [
    {
      step_number: 1,
      name: "Manager Review",
      assigned_to: managerId,
      status: "PENDING"
    },
    {
      step_number: 2,
      name: "Director Approval",
      assigned_to: directorId,
      status: "PENDING"
    },
    {
      step_number: 3,
      name: "Final Sign-off",
      assigned_to: ceoId,
      status: "PENDING"
    }
  ]
});
```

### Step 2: User Approves/Rejects

```typescript
const result = await processWorkflowStep({
  workflow_id: workflowId,
  step_number: 1,
  action: "APPROVED",
  comments: "Looks good, proceeding to next step"
});

// If approved, advance to step 2
// If rejected, workflow status = REJECTED
```

### Step 3: Complete Workflow

When final step is approved:
```typescript
await completeWorkflow(workflowId);
// Update entity status
// Send notifications
// Archive workflow
```

## Server Actions

**File:** `app/_actions/workflow-actions.ts`

```typescript
// Create workflow
export async function createWorkflow(input: CreateWorkflowInput) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("workflows")
    .insert({
      ...input,
      status: "PENDING",
      current_step: 1
    })
    .select()
    .single();

  if (error) throw error;

  // Send notification to first assignee
  await notifyWorkflowAssignee(data.id, 1);

  return data;
}

// Process step
export async function processWorkflowStep(input: ProcessStepInput) {
  const supabase = createClient();

  // Get workflow
  const { data: workflow } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", input.workflow_id)
    .single();

  // Update step status
  const steps = workflow.steps;
  steps[input.step_number - 1].status = input.action;
  steps[input.step_number - 1].completed_at = new Date().toISOString();

  // Record history
  await supabase.from("workflow_history").insert({
    workflow_id: input.workflow_id,
    step_number: input.step_number,
    action: input.action,
    performed_by: (await supabase.auth.getUser()).data.user?.id,
    comments: input.comments
  });

  if (input.action === "REJECTED") {
    // Workflow rejected
    await supabase
      .from("workflows")
      .update({ status: "REJECTED", steps })
      .eq("id", input.workflow_id);
  } else if (input.step_number === steps.length) {
    // Final step approved - complete workflow
    await supabase
      .from("workflows")
      .update({ status: "APPROVED", steps })
      .eq("id", input.workflow_id);
  } else {
    // Advance to next step
    await supabase
      .from("workflows")
      .update({
        current_step: input.step_number + 1,
        steps
      })
      .eq("id", input.workflow_id);

    // Notify next assignee
    await notifyWorkflowAssignee(input.workflow_id, input.step_number + 1);
  }

  revalidatePath("/dashboard/workflows");
}

// Get user's pending workflows
export async function getUserWorkflows() {
  const supabase = createClient();
  const user = (await supabase.auth.getUser()).data.user;

  const { data } = await supabase
    .from("workflows")
    .select("*")
    .contains("steps", [{ assigned_to: user?.id, status: "PENDING" }])
    .eq("status", "IN_PROGRESS");

  return data;
}
```

## Key Components

### Workflow Panel

**File:** `components/workflows/workflow-panel.tsx`

Displays workflow status and actions.

```typescript
<WorkflowPanel workflow={workflow}>
  {currentUserStep && (
    <div className="flex gap-2">
      <Button onClick={() => approve(workflow.id)}>
        Approve
      </Button>
      <Button variant="destructive" onClick={() => reject(workflow.id)}>
        Reject
      </Button>
    </div>
  )}
</WorkflowPanel>
```

### Workflow History

**File:** `components/workflows/workflow-history.tsx`

Timeline of workflow actions.

```typescript
<WorkflowHistory workflowId={workflowId}>
  {history.map((entry) => (
    <TimelineItem key={entry.id}>
      <User>{entry.performed_by.name}</User>
      <Action>{entry.action}</Action>
      <Date>{entry.created_at}</Date>
      <Comments>{entry.comments}</Comments>
    </TimelineItem>
  ))}
</WorkflowHistory>
```

### Workflow Badge

**File:** `components/workflows/workflow-badge.tsx`

Shows workflow status with color coding.

```typescript
<WorkflowBadge status={workflow.status} />

// PENDING - Yellow
// IN_PROGRESS - Blue
// APPROVED - Green
// REJECTED - Red
```

## Notifications

### Email Notifications

When a step is assigned:
```typescript
await sendEmail({
  to: assignee.email,
  subject: `Workflow Action Required: ${workflow.entity_type}`,
  body: `You have been assigned step ${stepNumber}: ${stepName}`
});
```

### In-app Notifications

Display notification badge:
```typescript
const { data: pendingCount } = await supabase
  .from("workflows")
  .select("count")
  .contains("steps", [{ assigned_to: userId, status: "PENDING" }]);

<Badge count={pendingCount} />
```

## Hooks

**File:** `hooks/use-workflow-queries.ts`

```typescript
export function useWorkflow(workflowId: string) {
  return useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: () => getWorkflow(workflowId)
  });
}

export function useProcessStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processWorkflowStep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Step processed successfully!");
    }
  });
}

export function useUserWorkflows() {
  return useQuery({
    queryKey: ["user-workflows"],
    queryFn: getUserWorkflows,
    refetchInterval: 60000 // Refetch every minute
  });
}
```

## Common Use Cases

### 1. Report Approval

```typescript
// After user clicks "Submit for Approval"
await createWorkflow({
  entity_id: reportId,
  entity_type: "report",
  workflow_type: "approval",
  steps: reportApprovalSteps
});
```

### 2. Audit Plan Review

```typescript
// Parallel review by multiple auditors
await createWorkflow({
  entity_id: auditPlanId,
  entity_type: "audit_plan",
  workflow_type: "review",
  steps: [
    { name: "Auditor 1 Review", assigned_to: auditor1 },
    { name: "Auditor 2 Review", assigned_to: auditor2 },
    { name: "Auditor 3 Review", assigned_to: auditor3 }
  ]
});
```

### 3. Risk Treatment Approval

```typescript
// Sequential approval for risk treatment
await createWorkflow({
  entity_id: riskId,
  entity_type: "risk",
  workflow_type: "approval",
  steps: riskApprovalSteps
});
```

## Best Practices

1. **Always notify assignees** when steps are assigned
2. **Record history** for audit trail
3. **Handle rejections** properly (notify initiator, allow resubmission)
4. **Time limits** - Set due dates for steps
5. **Escalation** - Auto-escalate overdue steps
6. **Parallel workflows** - Support concurrent reviews

## Next Steps

Continue to → [11-admin-config.md](11-admin-config.md)
