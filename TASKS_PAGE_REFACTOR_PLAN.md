# Audit Tasks Page Refactor Plan

## Overview

Refactor the audit tasks page to support two tabs: **Workflow Instances** and **Workflow Tasks**, with SSR-first approach using proper hooks and mutations.

## Current State Analysis

### Existing Implementation

- Single page showing workflow instances (confusingly named "Workflow Instances & Tasks")
- Uses `getWorkflowInstances()` which fetches from `/api/v1/simple-workflows/instances`
- TasksTable displays instances with approval history drawer
- Basic CRUD operations: approve, reject, reassign

### Available API Endpoints (from Postman collection)

#### Workflow Instances

- `GET /api/v1/simple-workflows/instances` - List instances
- `GET /api/v1/simple-workflows/instances/{instance_id}/status` - Get instance status
- `GET /api/v1/simple-workflows/instances/{instance_id}/approvals` - Get approvals history
- `POST /api/v1/simple-workflows/instances/{instance_id}/approve` - Approve instance
- `POST /api/v1/simple-workflows/instances/{instance_id}/reject` - Reject instance

#### Workflow Tasks (NEW - Not Yet Implemented)

- `GET /api/v1/workflow-tasks/user` - Get user's tasks (assigned to current user)
- `GET /api/v1/workflow-tasks/instance/{instance_id}` - Get tasks for specific instance
- `POST /api/v1/workflow-tasks/{task_id}/complete` - Complete task (approve/reject with action)
- `POST /api/v1/workflow-tasks/{task_id}/reassign` - Reassign task to another user

## Implementation Plan

### Phase 1: Server Actions & API Layer

**Files to Create/Update:**

- `app/_actions/task-actions.ts` - ADD new functions

**New Server Actions to Add:**

```typescript
// Get user's workflow tasks
export async function getUserWorkflowTasks(filters?: {
  page?: string;
  page_size?: string;
}): Promise<APIResponse>;

// Get workflow instance tasks
export async function getWorkflowInstanceTasks(
  instanceId: string,
  filters?: {
    page?: string;
    page_size?: string;
  }
): Promise<APIResponse>;

// Complete workflow task (approve/reject)
export async function completeWorkflowTask(
  taskId: string,
  action: "APPROVED" | "REJECTED",
  remarks?: string
): Promise<APIResponse>;

// Reassign workflow task
export async function reassignWorkflowTask(
  taskId: string,
  assignedToUserId: string,
  remarks?: string
): Promise<APIResponse>;
```

### Phase 2: Custom Hooks

**File to Create:**

- `hooks/use-workflow-tasks.ts`

**Hook Functions:**

```typescript
// useUserWorkflowTasks() - Fetch user's assigned tasks
export function useUserWorkflowTasks(params?: { page?: number; page_size?: number });

// useWorkflowTasksForInstance() - Fetch tasks for specific instance
export function useWorkflowTasksForInstance(
  instanceId: string,
  params?: { page?: number; page_size?: number }
);

// useCompleteWorkflowTaskMutation() - Mutation for completing tasks
export function useCompleteWorkflowTaskMutation();

// useReassignWorkflowTaskMutation() - Mutation for reassigning tasks
export function useReassignWorkflowTaskMutation();
```

**Features:**

- TanStack Query for caching and synchronization
- Proper error handling
- Loading states
- Automatic refetch on mutation success

### Phase 3: UI Components

#### Component Hierarchy

```
TasksPageLayout (Main Container)
├── Tabs Component
│   ├── Tab 1: Workflow Instances
│   │   ├── WorkflowInstancesPanel
│   │   │   ├── WorkflowInstancesTable
│   │   │   ├── ApprovalHistoryDrawer
│   │   │   └── Pagination
│   │   └── Dialogs
│   │       ├── InstanceActionDialog (Approve/Reject)
│   │       └── InstanceReassignDialog
│   │
│   └── Tab 2: Workflow Tasks
│       ├── WorkflowTasksPanel
│       │   ├── WorkflowTasksTable
│       │   ├── TaskFiltersBar
│       │   └── Pagination
│       └── Dialogs
│           ├── TaskActionDialog (Complete/Reject)
│           └── TaskReassignDialog
```

**Files to Create:**

1. `_components/workflow-instances-panel.tsx` - Container for instances view
2. `_components/workflow-instances-table.tsx` - Renamed from TasksTable
3. `_components/workflow-tasks-panel.tsx` - NEW Container for tasks view
4. `_components/workflow-tasks-table.tsx` - NEW Table for tasks
5. `_components/workflow-task-action-dialog.tsx` - NEW Dialog for task actions
6. `_components/workflow-task-reassign-dialog.tsx` - NEW Dialog for reassigning tasks
7. `_components/tasks-page-layout.tsx` - NEW Main layout with tabs

**Files to Deprecate/Rename:**

- `_components/tasks-page-client.tsx` → Replaced by tasks-page-layout.tsx
- `_components/tasks-table.tsx` → Rename to workflow-instances-table.tsx

### Phase 4: Component Specifications

#### WorkflowInstancesPanel

- Container component (client)
- Shows list of workflow instances with approval history
- Features:
  - Displays all active/pending workflow instances
  - Approval history drawer on row click
  - Approve/Reject/Reassign actions
  - Pagination support

#### WorkflowInstancesTable

- Refactored TasksTable
- Columns: Entity Name, Entity Type, Workflow State, Task Status, Date Created, Actions
- Row actions: View History, Approve, Reject, Reassign
- Status badges with proper styling

#### WorkflowTasksPanel

- Container component (client)
- Shows user's assigned workflow tasks
- Features:
  - Displays only tasks assigned to current user
  - Task status and priority indicators
  - Complete/Reassign actions
  - Filter by status/priority (future enhancement)
  - Pagination support

#### WorkflowTasksTable

- NEW component
- Columns: Task ID, Entity, Workflow State, Status, Assigned Date, Actions
- Row actions: Complete (with action choice), Reassign
- Task status badges

#### TasksPageLayout

- Client component serving as main container
- Tabs:
  1. **Workflow Instances** - All workflow instances (existing data)
  2. **Workflow Tasks** - User's assigned tasks (new data)
- Common features:
  - Statistics cards (Pending, In Progress, Completed, Rejected)
  - Shared dialogs (reusable across tabs)
  - Error states and loading states

### Phase 5: Data Flow Diagram

```
SSR Page (Server)
    ↓
    ├─ fetchWorkflowInstances() → Pass to client
    ├─ getCurrentUser() → For initial context
    └─ TasksPageLayout (Client)
           ↓
           ├─ WorkflowInstancesPanel
           │  ├─ useWorkflowInstances() [useQuery]
           │  └─ Mutations
           │     ├─ approveInstance [useMutation]
           │     ├─ rejectInstance [useMutation]
           │     └─ reassignInstance [useMutation]
           │
           └─ WorkflowTasksPanel
              ├─ useUserWorkflowTasks() [useQuery]
              └─ Mutations
                 ├─ completeTask [useMutation]
                 └─ reassignTask [useMutation]
```

### Phase 6: Implementation Order

1. **Update Server Actions** (task-actions.ts)
   - Add new functions for workflow tasks
   - Keep existing functions for instances

2. **Create Custom Hooks** (use-workflow-tasks.ts)
   - Implement all query and mutation hooks
   - Proper error handling and loading states

3. **Create Base Components**
   - Rename `tasks-table.tsx` → `workflow-instances-table.tsx`
   - Copy and adapt to `workflow-tasks-table.tsx`

4. **Create Panel Containers**
   - `workflow-instances-panel.tsx`
   - `workflow-tasks-panel.tsx`

5. **Create Dialog Components**
   - `workflow-task-action-dialog.tsx`
   - `workflow-task-reassign-dialog.tsx`

6. **Create Main Layout**
   - `tasks-page-layout.tsx` with tabs
   - Connect all components

7. **Update Page Component**
   - Keep SSR data fetching
   - Pass to TasksPageLayout

8. **Testing & Refinement**
   - Test tab switching
   - Test all CRUD operations
   - Verify pagination works
   - Check error handling

## Component Naming Convention

**Naming Pattern:**

- `workflow-instances-*` → Components related to workflow instances
- `workflow-tasks-*` → Components related to workflow tasks
- `*-panel.tsx` → Container components managing section logic
- `*-table.tsx` → Table display components
- `*-dialog.tsx` → Dialog/modal components

## State Management

**Server State:**

- Fetch initial data in SSR page
- Pass to client components as props
- Refresh via React Query mutations

**Client State:**

- Use React Query (TanStack Query) for server state
- useState for UI state (dialogs, selections)
- useTransition for async operations

## Error Handling

- Toast notifications for all actions (via Sonner)
- Error boundaries for component failures
- Proper error messages from API responses
- Retry logic in mutations

## Accessibility & UX

- Keyboard navigation for tables
- ARIA labels on interactive elements
- Clear loading and error states
- Confirmation dialogs for destructive actions
- Proper focus management

## Type Safety

- Define proper TypeScript types for workflow tasks
- Create interfaces for API responses
- Use discriminated unions for action types

## Future Enhancements

1. Bulk actions (approve/reject multiple)
2. Task filtering by status/priority
3. Advanced search and sorting
4. Task delegation workflows
5. Task templates
6. Notification system for task assignments

---

## Files to be Modified/Created

### Modified

- `app/_actions/task-actions.ts` - Add new server actions
- `app/dashboard/(modules)/audit/tasks/page.tsx` - Minor updates to pass context

### Created

- `hooks/use-workflow-tasks.ts` - New custom hooks
- `app/dashboard/(modules)/audit/tasks/_components/tasks-page-layout.tsx`
- `app/dashboard/(modules)/audit/tasks/_components/workflow-instances-panel.tsx`
- `app/dashboard/(modules)/audit/tasks/_components/workflow-instances-table.tsx` (from rename)
- `app/dashboard/(modules)/audit/tasks/_components/workflow-tasks-panel.tsx`
- `app/dashboard/(modules)/audit/tasks/_components/workflow-tasks-table.tsx`
- `app/dashboard/(modules)/audit/tasks/_components/workflow-task-action-dialog.tsx`
- `app/dashboard/(modules)/audit/tasks/_components/workflow-task-reassign-dialog.tsx`

### Deprecated

- `app/dashboard/(modules)/audit/tasks/_components/tasks-page-client.tsx`
- `app/dashboard/(modules)/audit/tasks/_components/tasks-table.tsx` (replaced by workflow-instances-table)

## Success Criteria

✅ Two distinct tabs: Workflow Instances and Workflow Tasks
✅ Workflow Instances tab shows all pending/active instances
✅ Workflow Tasks tab shows only user-assigned tasks
✅ All CRUD operations work properly (approve, reject, reassign, complete)
✅ Proper pagination on both tabs
✅ Error handling and loading states
✅ Type-safe throughout
✅ Follows SSR-first approach
✅ Proper component naming convention
✅ All tests passing
