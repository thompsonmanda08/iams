# Workflow Mutations Guide

This guide explains how the workflow mutation system works and how to swap from simulation (Zustand) to real API calls.

---

## Table of Contents

1. [Overview](#overview)
2. [Current Implementation (Simulation)](#current-implementation-simulation)
3. [How Mutations Work](#how-mutations-work)
4. [Migration to Backend API](#migration-to-backend-api)
5. [Usage Examples](#usage-examples)
6. [Validation Rules](#validation-rules)

---

## Overview

The workflow mutation system provides a **clean abstraction** for workflow CRUD operations. The same hook works for both:
- ✅ **Simulation Mode**: Uses Zustand store with localStorage
- ✅ **Production Mode**: Uses real backend API calls

This allows you to:
- Test the complete UI/UX without a backend
- Swap to real API calls by changing **only one file**
- Maintain consistent loading states and error handling

---

## Current Implementation (Simulation)

### Architecture

```
Component
  ↓
useWorkflowMutations() hook
  ↓
Zustand Store (localStorage)
  ↓
UI Updates + Toast Notifications
```

### Files

- **Hook**: [`lib/hooks/use-workflow-mutations.ts`](../lib/hooks/use-workflow-mutations.ts)
- **Store**: [`lib/stores/workflow-store.ts`](../lib/stores/workflow-store.ts)
- **Usage**: [`workflow-editor.tsx`](../app/dashboard/system-configs/workflow/_components/workflow-editor.tsx)

---

## How Mutations Work

### 1. Save Workflow (Create)

**When**: Creating a brand new workflow

```typescript
const { saveWorkflow, isLoading } = useWorkflowMutations();

const handleCreate = async () => {
  const result = await saveWorkflow(newWorkflow);

  if (result.success) {
    // Workflow saved successfully
    console.log("Created:", result.data);
  } else {
    // Handle error
    console.error(result.error);
  }
};
```

**Current Behavior (Simulation)**:
- Saves to Zustand store
- Persists to localStorage
- Shows success toast
- Returns immediately

**Future Behavior (API)**:
```typescript
POST /api/v1/workflows
Body: { name, entityType, states[], transitions[], ... }
Response: { id, name, ... }
```

---

### 2. Update Workflow (Edit)

**When**: Editing an existing workflow

```typescript
const { updateWorkflow, isLoading } = useWorkflowMutations();

const handleUpdate = async () => {
  const result = await updateWorkflow(workflowId, updatedWorkflow);

  if (result.success) {
    // Workflow updated successfully
  }
};
```

**Current Behavior (Simulation)**:
- Updates in Zustand store
- Persists to localStorage
- Shows success toast

**Future Behavior (API)**:
```typescript
PUT /api/v1/workflows/:id
Body: { name, entityType, states[], transitions[], ... }
Response: { id, name, ... }
```

---

### 3. Delete Workflow

**When**: Removing a workflow

```typescript
const { deleteWorkflow, isLoading } = useWorkflowMutations();

const handleDelete = async () => {
  const result = await deleteWorkflow(workflowId);

  if (result.success) {
    // Workflow deleted successfully
  }
};
```

**Current Behavior (Simulation)**:
- Removes from Zustand store
- Removes from localStorage
- Shows success toast

**Future Behavior (API)**:
```typescript
DELETE /api/v1/workflows/:id
Response: { success: true }
```

---

### 4. Smart Save/Update

**When**: Don't know if workflow exists or not

```typescript
const { saveOrUpdateWorkflow, isLoading } = useWorkflowMutations();

const handleSave = async () => {
  const isExisting = !!existingWorkflow;
  const result = await saveOrUpdateWorkflow(workflow, isExisting);

  // Automatically calls saveWorkflow or updateWorkflow
};
```

---

## Migration to Backend API

### Step 1: Update the Mutations Hook

Open [`lib/hooks/use-workflow-mutations.ts`](../lib/hooks/use-workflow-mutations.ts) and replace the simulation code with API calls.

**Before (Simulation)**:
```typescript
const saveWorkflow = async (workflow: Workflow) => {
  setState({ isLoading: true, error: null });

  try {
    // SIMULATION MODE: Save to Zustand store
    addWorkflow(workflow);

    setState({ isLoading: false, error: null });
    toast.success("Workflow saved successfully!");

    return { success: true, data: workflow };
  } catch (error: any) {
    // Error handling...
  }
};
```

**After (API)**:
```typescript
const saveWorkflow = async (workflow: Workflow) => {
  setState({ isLoading: true, error: null });

  try {
    // API MODE: Call backend
    const response = await authenticatedApiClient({
      method: 'POST',
      url: '/api/v1/workflows',
      data: workflow
    });

    setState({ isLoading: false, error: null });
    toast.success("Workflow saved successfully!");

    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to save workflow";
    setState({ isLoading: false, error: errorMessage });
    toast.error(errorMessage);

    return { success: false, error: errorMessage };
  }
};
```

### Step 2: Import API Client

```typescript
import authenticatedApiClient from "@/app/_actions/api-config";
```

### Step 3: Remove Zustand Dependencies

```typescript
// Remove this line:
import { useWorkflowStore } from "@/lib/stores/workflow-store";

// Remove these destructures:
const { addWorkflow, updateWorkflow: updateWorkflowStore, deleteWorkflow: deleteWorkflowStore } =
  useWorkflowStore();
```

### Step 4: Add Revalidation

```typescript
import { revalidatePath } from "next/cache";

const saveWorkflow = async (workflow: Workflow) => {
  // ... API call ...

  // Revalidate workflow pages
  revalidatePath("/dashboard/system-configs/workflow");

  return { success: true, data: response.data };
};
```

### Step 5: Done!

**No changes needed in**:
- `workflow-editor.tsx`
- `index.tsx` (workflow list)
- Any other components using the hook

The mutation interface remains exactly the same!

---

## Usage Examples

### Example 1: Workflow Editor (Current)

```typescript
export const WorkflowEditor = ({ onBack, workflowId }: WorkflowEditorProps) => {
  const { getWorkflow, workflows } = useWorkflowStore();
  const { saveOrUpdateWorkflow, isLoading } = useWorkflowMutations();

  const [workflow, setWorkflow] = useState<Workflow>(/* ... */);

  const handleSave = async () => {
    // Validate workflow
    if (!workflow.name.trim()) {
      toast.error("Workflow name is required");
      return;
    }

    // Check if existing
    const existingWorkflow = workflows.find((w) => w.id === workflow.id);
    const isExisting = !!existingWorkflow;

    // Save or update
    const result = await saveOrUpdateWorkflow(workflow, isExisting);

    if (result.success) {
      // Optionally navigate back
      // onBack();
    }
  };

  return (
    <WorkflowHeader
      onSave={handleSave}
      isLoading={isLoading}
      // ... other props
    />
  );
};
```

### Example 2: Delete Workflow

```typescript
const WorkflowList = () => {
  const { workflows } = useWorkflowStore();
  const { deleteWorkflow, isLoading } = useWorkflowMutations();

  const handleDelete = async (workflowId: string) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      await deleteWorkflow(workflowId);
    }
  };

  return (
    <>
      {workflows.map((workflow) => (
        <Card key={workflow.id}>
          <Button
            onClick={() => handleDelete(workflow.id)}
            disabled={isLoading}
          >
            <Trash2 />
          </Button>
        </Card>
      ))}
    </>
  );
};
```

### Example 3: Loading States

```typescript
const { saveWorkflow, isLoading, error } = useWorkflowMutations();

return (
  <Button onClick={handleSave} disabled={isLoading}>
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Saving...
      </>
    ) : (
      <>
        <Save className="mr-2 h-4 w-4" />
        Save
      </>
    )}
  </Button>
);
```

---

## Validation Rules

The mutation system includes built-in validation before saving:

### Required Fields

```typescript
if (!workflow.name.trim()) {
  toast.error("Workflow name is required");
  return;
}
```

### States Validation

```typescript
if (workflow.states.length === 0) {
  toast.error("Workflow must have at least one state");
  return;
}
```

### Initial State Required

```typescript
const hasInitialState = workflow.states.some((s) => s.isInitial);
if (!hasInitialState) {
  toast.error("Workflow must have an initial state");
  return;
}
```

### Custom Validations (Add More)

```typescript
// Ensure at least one final state
const hasFinalState = workflow.states.some((s) => s.isFinal);
if (!hasFinalState) {
  toast.error("Workflow must have at least one final state");
  return;
}

// Validate transitions
if (workflow.transitions.length === 0) {
  toast.error("Workflow must have at least one transition");
  return;
}

// Check for disconnected states
const statesInTransitions = new Set(
  workflow.transitions.flatMap(t => [t.fromStateId, t.toStateId])
);

const disconnectedStates = workflow.states.filter(
  s => !s.isInitial && !statesInTransitions.has(s.id)
);

if (disconnectedStates.length > 0) {
  toast.warning(`${disconnectedStates.length} state(s) are not connected to any transitions`);
}
```

---

## Benefits of This Approach

### ✅ Separation of Concerns
- UI components don't care about data source
- Easy to mock for testing
- Clean component code

### ✅ Type Safety
- Full TypeScript support
- Consistent return types
- Error handling built-in

### ✅ Loading States
- Automatic loading state management
- Disable buttons during operations
- Show loading spinners

### ✅ Error Handling
- Centralized error handling
- Toast notifications
- Error state available in components

### ✅ Easy Migration
- Change **one file** to switch from simulation to API
- No component changes needed
- Gradual migration possible

### ✅ Optimistic Updates (Future)
```typescript
const saveWorkflow = async (workflow: Workflow) => {
  // Optimistic update
  addWorkflow(workflow); // Update UI immediately

  try {
    // API call
    const response = await api.post('/workflows', workflow);
    return { success: true, data: response.data };
  } catch (error) {
    // Rollback on error
    deleteWorkflow(workflow.id);
    return { success: false, error: error.message };
  }
};
```

---

## Testing

### Test Save Operation

1. Go to `/dashboard/system-configs/workflow`
2. Click "New Workflow"
3. Modify workflow name, add states
4. Click "Save Workflow"
5. Observe:
   - ✅ Button shows "Saving..." with spinner
   - ✅ Toast notification appears
   - ✅ Workflow appears in saved list
   - ✅ Workflow persists after page refresh

### Test Update Operation

1. Click "Edit" on existing workflow
2. Change workflow name or add state
3. Click "Save Workflow"
4. Observe:
   - ✅ Button shows "Saving..." with spinner
   - ✅ Toast shows "Workflow updated successfully!"
   - ✅ Changes persist after going back

### Test Delete Operation

1. Click trash icon on workflow card
2. Confirm deletion
3. Observe:
   - ✅ Workflow removed from list
   - ✅ Toast shows "Workflow deleted successfully!"
   - ✅ Deletion persists after page refresh

---

## Summary

The mutation system provides:

✅ **Consistent API** - Same interface for simulation and production
✅ **Loading States** - Built-in loading management
✅ **Error Handling** - Centralized error management
✅ **Validation** - Pre-save validation rules
✅ **Type Safety** - Full TypeScript support
✅ **Easy Migration** - One-file change to switch to API

**When backend is ready**: Update [`lib/hooks/use-workflow-mutations.ts`](../lib/hooks/use-workflow-mutations.ts) with API calls. That's it!
