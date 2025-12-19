# Mutation Hooks Refactoring Guide

## Overview

This document outlines the refactoring initiative to replace manual server action calls and state management with centralized TanStack React Query mutation hooks throughout the application.

## Benefits

- **Reduced Code Duplication**: Centralized error handling and notifications
- **Better State Management**: Automatic `isPending` states instead of manual `useState`
- **Consistent Patterns**: All mutations follow the same error handling and success notification patterns
- **Query Cache Management**: Automatic query invalidation on success
- **Improved Testing**: Easier to mock and test mutations

## Completed Refactorings

### 1. Audit Plan Mutations
**File**: `hooks/use-audit-mutations.ts`
**Components Updated**:
- `components/audit/submit-for-review-button.tsx` - Uses `useSubmitAuditPlanMutation`
- `app/dashboard/(modules)/audit/plans/_components/audit-plan-workpaper-view.tsx` - Uses `useSubmitAuditPlanMutation` and `useDeleteAuditPlanMutation`

**Pattern Used**:
```typescript
// BEFORE
const [isSubmitting, setIsSubmitting] = useState(false);
try {
  await submitAuditPlanForApproval(id);
  toast.success("Success");
} catch (error) {
  toast.error("Failed");
} finally {
  setIsSubmitting(false);
}

// AFTER
const { mutate: submitPlan, isPending: isSubmitting } = useSubmitAuditPlanMutation({
  onSuccess: () => {
    router.refresh();
  }
});
submitPlan(id);
```

### 2. Risk Acceptance Mutations
**File**: `hooks/use-risk-acceptance-mutations.ts`
**Components Updated**:
- `app/dashboard/(modules)/risks/risk-acceptances/page.tsx` - Uses query and mutation hooks

**Mutations Included**:
- `useRiskAcceptances()` - Query hook to fetch all risk acceptances
- `useUpdateRiskAcceptanceMutation()` - Mutation to update acceptance status
- `useSubmitRiskAcceptanceMutation()` - Mutation to submit for approval

**Key Improvement**: Replaced manual `useEffect` + `useState` data fetching with `useQuery` hook

### 3. Workflow Task Mutations
**File**: `hooks/use-task-mutations.ts`
**Components Updated**:
- `app/dashboard/(workflows)/approvals/_components/task-action-dialog.tsx` - Uses `useCompleteWorkflowTaskMutation`

**Pattern Used**: Simplified task approval/rejection with automatic router refresh

### 4. Budget Mutations
**File**: `hooks/use-budget-mutations.ts`
**Available Mutations**:
- `useCreateBudgetMutation()` - Create a new budget
- `useCreateBudgetLineMutation()` - Create budget line item

## Refactoring Pattern

### Step 1: Create the Hook File
Create a new file in `/hooks` directory with all related mutations:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";

export function useMyActionMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await myAction(data);
      if (!result.success) {
        throw new Error(result.message || "Operation failed");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myData"] });
      notify({
        title: "Success",
        description: "Operation completed",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Operation failed",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
```

### Step 2: Update Component Imports
Replace direct action imports with hook imports:

```typescript
// BEFORE
import { myAction } from "@/app/_actions/module-actions";

// AFTER
import { useMyActionMutation } from "@/hooks/use-my-mutations";
```

### Step 3: Replace State and Handlers
Replace manual `useState` and handlers:

```typescript
// BEFORE
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await myAction(data);
  } finally {
    setIsLoading(false);
  }
};

// AFTER
const { mutate: submitAction, isPending: isLoading } = useMyActionMutation({
  onSuccess: () => {
    // Cleanup logic here
  }
});

const handleSubmit = () => {
  submitAction(data);
};
```

### Step 4: Remove Try-Catch Blocks
The mutation hook handles all error cases through `onError` callback and automatic notifications.

## Components Pending Refactoring

### High Priority
1. **`app/dashboard/(modules)/audit/budgets/_components/budget-form.tsx`**
   - Uses: `useCreateBudgetMutation`, `useCreateBudgetLineMutation`
   - Status: Hook created, component refactoring pending
   - Complexity: Medium (two handlers with validation)

2. **`components/forms/risk-form-dialog.tsx`**
   - Create: `useRiskFormMutation` (for create/update risk)
   - Status: Pending
   - Complexity: Medium

3. **`app/dashboard/(modules)/audit/plans/_components/audit-closure-review.tsx`**
   - Create: `useAuditClosureMutation` (for request/validate closure)
   - Status: Pending
   - Complexity: Medium

### Medium Priority
1. **`components/forms/multi-step-risk-form.tsx`**
   - Create: `useMultiStepFormMutation`
   - Status: Pending

2. **`app/dashboard/(modules)/risks/_components/action-assessment-form.tsx`**
   - Create: `useActionAssessmentMutation`
   - Status: Pending

3. **`app/dashboard/(workflows)/approvals/_components/task-reassign-dialog.tsx`**
   - Create: `useTaskReassignMutation`
   - Status: Pending

## Query Hooks to Create

For data fetching operations that use manual try-catch blocks:

1. **Risk Acceptances** ✓ Completed
   ```typescript
   const { data: acceptances, isLoading } = useRiskAcceptances();
   ```

2. **Budgets** - Partially Complete
   - Need: `useBudgetDetails(budgetId)`
   - Existing: `useBudgets()` from `use-audit-settings-query-data.ts`

3. **Departments** - Already Exists
   ```typescript
   const { data: departments } = useDepartments();
   ```

4. **Workflow Tasks** - Pending
   ```typescript
   const { data: tasks } = useWorkflowTasks();
   ```

5. **Audit Closures** - Pending
   ```typescript
   const { data: closures } = useAuditClosures();
   ```

## Testing Checklist

Before marking a refactoring as complete:

- [ ] TypeScript compilation: `npx tsc --noEmit`
- [ ] No import errors in affected component
- [ ] Error handling works (notifications appear)
- [ ] Success handling works (data updates)
- [ ] Loading states work (`isPending` used in UI)
- [ ] Query invalidation works (data refetches on mutation success)
- [ ] Router refresh called where needed
- [ ] No console errors

## Common Patterns

### Pattern 1: Simple Create Operation
```typescript
const { mutate: create, isPending } = useCreateMutation({
  onSuccess: () => {
    setFormData(INIT_DATA);
    setOpen(false);
  }
});

const handleSubmit = () => {
  create(formData);
};
```

### Pattern 2: With Confirmation Dialog
```typescript
const { mutate: deleteItem, isPending } = useDeleteMutation({
  onSuccess: () => {
    setDeleteOpen(false);
  }
});

const handleConfirmDelete = () => {
  deleteItem(itemId);
};
```

### Pattern 3: With Related Data Fetch
```typescript
const { data: items = [], isLoading } = useItems();

const { mutate: updateItem, isPending: isUpdating } = useUpdateMutation();

return (
  <div>
    {isLoading ? <Skeleton /> : items.map(item => ...)}
    <Button disabled={isUpdating} onClick={handleUpdate}>
      {isUpdating ? "Updating..." : "Update"}
    </Button>
  </div>
);
```

## Next Steps

1. Create remaining mutation hooks for high-priority components
2. Refactor components to use the new hooks
3. Verify TypeScript compilation
4. Update tests if applicable
5. Document any custom patterns discovered

## Questions?

See examples in completed refactorings:
- `hooks/use-audit-mutations.ts`
- `hooks/use-risk-acceptance-mutations.ts`
- `hooks/use-task-mutations.ts`
