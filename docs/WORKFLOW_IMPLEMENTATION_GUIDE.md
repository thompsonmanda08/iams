# Workflow Implementation Guide & End-to-End Simulation

This document provides a comprehensive guide to implementing and testing the workflow system, including the new Tasks module for tracking and executing workflow actions.

---

## Table of Contents

1. [Overview](#overview)
2. [Current Implementation Status](#current-implementation-status)
3. [Tasks Module](#tasks-module)
4. [End-to-End Workflow Simulation](#end-to-end-workflow-simulation)
5. [Backend API Requirements](#backend-api-requirements)
6. [Testing Checklist](#testing-checklist)

---

## Overview

The workflow system provides a database-driven state machine that allows administrators to define business processes without code changes. The system includes:

- **Workflow Editor**: Visual interface to define workflows, states, and transitions
- **Task Management**: UI to track, approve, reject, and reassign workflow tasks
- **Role-Based Permissions**: Control who can perform specific actions
- **Conditions**: Dynamic rules to control transition execution
- **Post-Transition Actions**: Automated actions after state changes

---

## Current Implementation Status

### ✅ Implemented (Frontend)

1. **Workflow UI Components**
   - Visual workflow editor at `/dashboard/system-configs/workflow`
   - State node management with drag-and-drop
   - Transition configuration panel
   - Permission, condition, and action builders
   - Complete TypeScript type system

2. **Tasks Module** (NEW)
   - Tasks list page at `/dashboard/audit/tasks`
   - Task statistics dashboard
   - Approve/Reject functionality
   - Task reassignment with role-filtered user selection
   - Server actions for all task operations

3. **Navigation**
   - Tasks route added to Audit module menu
   - Accessible from main navigation

### ❌ Not Implemented (Backend Required)

1. **Workflow API Endpoints**
   - `POST /api/v1/workflows` - Create workflow
   - `PUT /api/v1/workflows/:id` - Update workflow
   - `GET /api/v1/workflows` - List workflows
   - `GET /api/v1/workflows/:id` - Get workflow details
   - `DELETE /api/v1/workflows/:id` - Delete workflow

2. **Workflow Execution Engine**
   - State transition validation
   - Permission checking
   - Condition evaluation
   - Action execution
   - History tracking

3. **Task API Endpoints**
   - `GET /api/v1/workflow/tasks` - List all tasks
   - `GET /api/v1/workflow/tasks/my-tasks` - Get current user's tasks
   - `GET /api/v1/workflow/tasks/:id` - Get task details
   - `POST /api/v1/workflow/tasks/:id/approve` - Approve task
   - `POST /api/v1/workflow/tasks/:id/reject` - Reject task
   - `POST /api/v1/workflow/tasks/:id/reassign` - Reassign task
   - `GET /api/v1/workflow/tasks/stats` - Get task statistics

---

## Tasks Module

### Features

The Tasks module (`/dashboard/audit/tasks`) provides:

#### 1. Task List Table
- **Columns:**
  - Task name and workflow
  - Entity name and ID
  - Entity type (Risk, Audit Plan, Finding, Recommendation)
  - Assigned user (name and email)
  - Required role
  - Status (Pending, In Progress, Completed, Rejected, Reassigned)
  - Creation time
  - Action buttons

#### 2. Task Actions
- **Approve**: Complete the task and move workflow forward
- **Reject**: Reject the task (requires comment)
- **Reassign**: Transfer task to another user with the same role

#### 3. Role-Filtered User Selection
When reassigning a task, the system:
- Filters users to show only those with the required role
- Displays user's full name and email
- Prevents reassignment if no eligible users exist
- Shows helpful alerts about role filtering

#### 4. Task Statistics
Dashboard cards showing:
- Pending tasks
- In Progress tasks
- Completed tasks
- Rejected tasks

### UI Components Created

```
app/dashboard/(modules)/audit/tasks/
├── page.tsx                           # Main tasks page
└── _components/
    ├── task-stats.tsx                 # Statistics cards
    ├── tasks-table.tsx                # Task list table
    ├── task-action-dialog.tsx         # Approve/Reject dialog
    └── task-reassign-dialog.tsx       # Reassignment dialog
```

### Server Actions

All task operations are available in `app/_actions/task-actions.ts`:

```typescript
getTasks(filters?)          // Get all tasks with optional filters
getMyTasks(filters?)        // Get current user's tasks
getTask(id)                 // Get single task
approveTask(id, comment?)   // Approve a task
rejectTask(id, comment?)    // Reject a task (comment required)
reassignTask(id, userId, comment?)  // Reassign to another user
executeTaskAction(request)  // Generic action executor
getTaskStats()              // Get statistics
```

---

## End-to-End Workflow Simulation

### Scenario: Audit Plan Approval Workflow

This simulation demonstrates a complete workflow from creation to task execution.

#### Step 1: Define the Workflow

1. Navigate to `/dashboard/system-configs/workflow`
2. Create a new workflow or edit existing "Audit Plan Approval"
3. Define states:
   - **Draft** (initial)
   - **Submitted**
   - **HIAR Review**
   - **CEO Approval**
   - **Approved** (final)
   - **Rejected** (final)

4. Define transitions:

   **Transition 1: Draft → Submitted**
   - Action Name: `SUBMIT`
   - Permission: `AUDITOR` role
   - Conditions: None
   - Actions: Send email to HIAR

   **Transition 2: Submitted → HIAR Review**
   - Action Name: `APPROVE_HIAR`
   - Permission: `HIAR` role
   - Conditions: `budget < 10000`
   - Actions:
     - Create log entry
     - Send email to auditor

   **Transition 3: HIAR Review → CEO Approval**
   - Action Name: `ESCALATE_CEO`
   - Permission: `HIAR` role
   - Conditions: `budget >= 10000`
   - Actions: Send email to CEO

   **Transition 4: CEO Approval → Approved**
   - Action Name: `APPROVE_CEO`
   - Permission: `CEO` role
   - Conditions: None
   - Actions:
     - Update field: `approved_by = CEO`
     - Send email to auditor
     - Create log entry

   **Transition 5: Submitted/HIAR Review → Rejected**
   - Action Name: `REJECT`
   - Permission: `HIAR` or `CEO` roles
   - Conditions: None
   - Actions: Send email to auditor

#### Step 2: Create Audit Plan

1. Navigate to `/dashboard/audit/plans/new`
2. Create audit plan with:
   - Title: "Q1 2025 Financial Audit"
   - Budget: 8500 (< 10000 for HIAR direct approval)
   - All other required fields

3. On creation, the plan should:
   - Be set to "Draft" status
   - No task created yet (waiting for user action)

#### Step 3: Submit for Approval (AUDITOR)

**User Role: AUDITOR**

1. View the audit plan
2. Click "Submit for Approval" button
3. Backend should:
   - Check user has AUDITOR role ✓
   - Evaluate conditions (none) ✓
   - Change state: Draft → Submitted ✓
   - Execute actions: Send email to HIAR ✓
   - **Create Task**: "APPROVE_HIAR" assigned to HIAR users

#### Step 4: View Tasks (HIAR)

**User Role: HIAR**

1. Navigate to `/dashboard/audit/tasks`
2. Should see task statistics:
   - Pending: 1
   - In Progress: 0
   - Completed: 0
   - Rejected: 0

3. Should see task in table:
   - Task: "APPROVE HIAR"
   - Workflow: "Audit Plan Approval"
   - Entity: "Q1 2025 Financial Audit"
   - Type: "Audit Plan"
   - Assigned To: Current HIAR user
   - Role: "HIAR"
   - Status: "Pending"
   - Actions: Approve, Reject, More (Reassign)

#### Step 5: Approve Task (HIAR)

**User Role: HIAR**

1. Click "Approve" button
2. Dialog opens showing:
   - Task details
   - Workflow name
   - Entity information
   - Comment field (optional)

3. Add comment: "Budget reviewed, approved for Q1 execution"
4. Click "Approve"
5. Backend should:
   - Verify user has HIAR role ✓
   - Check condition: `budget < 10000` → TRUE ✓
   - Change state: Submitted → HIAR Review → Approved (direct path) ✓
   - Mark task as COMPLETED ✓
   - Record completion in history ✓
   - Execute actions: Create log, send email ✓

6. UI should:
   - Show success toast ✓
   - Refresh task list ✓
   - Update statistics ✓
   - Task status changes to "Completed" ✓

#### Step 6: Alternative - Reassign Task

**User Role: HIAR (alternative flow)**

1. Click "More" → "Reassign Task"
2. Dialog opens:
   - Shows current assignee
   - Shows required role: "HIAR"
   - Alert: "Only users with HIAR role are shown"
   - Dropdown with users filtered by HIAR role

3. Select another HIAR user
4. Add comment: "You have more context on this audit"
5. Click "Reassign Task"
6. Backend should:
   - Verify user has permission to reassign ✓
   - Verify target user has HIAR role ✓
   - Update task assignment ✓
   - Change status to REASSIGNED → PENDING ✓
   - Send notification to new assignee ✓

#### Step 7: Alternative - Reject Task

**User Role: HIAR (alternative flow)**

1. Click "Reject" button
2. Dialog opens
3. Add comment (required): "Budget exceeds departmental allocation"
4. Click "Reject"
5. Backend should:
   - Verify comment provided ✓
   - Change state to Rejected ✓
   - Mark task as COMPLETED with REJECTED status ✓
   - Execute actions: Send email to auditor ✓

### High Budget Scenario (CEO Approval Required)

**Audit Plan with budget >= 10,000**

1. Create plan with budget: 15,000
2. AUDITOR submits → Task created for HIAR
3. HIAR approves → Condition `budget >= 10000` → TRUE
4. System escalates to CEO:
   - State changes: Submitted → HIAR Review → CEO Approval
   - **New Task created**: "APPROVE_CEO" assigned to CEO users
   - Email sent to CEO

5. CEO views tasks at `/dashboard/audit/tasks`
6. CEO approves or rejects
7. Final state reached

---

## Backend API Requirements

### 1. Workflow CRUD APIs

```
POST /api/v1/workflows
Body: { name, entity_type, states[], transitions[], entry_conditions[] }
Response: { id, ...workflow }

GET /api/v1/workflows
Query: ?entity_type=AUDIT_PLAN
Response: { data: [workflows] }

GET /api/v1/workflows/:id
Response: { id, name, states[], transitions[], ... }

PUT /api/v1/workflows/:id
Body: { name?, states[]?, transitions[]?, ... }
Response: { id, ...updated_workflow }

DELETE /api/v1/workflows/:id
Response: { success: true }
```

### 2. Task APIs

```
GET /api/v1/workflow/tasks
Query: ?status=PENDING&entity_type=AUDIT_PLAN&assigned_user_id=123&required_role=HIAR
Response: { data: [tasks] }

GET /api/v1/workflow/tasks/my-tasks
Query: ?status=PENDING&entity_type=RISK
Response: { data: [tasks for current user] }

GET /api/v1/workflow/tasks/:id
Response: { id, workflow_id, entity_id, assigned_user_id, ... }

POST /api/v1/workflow/tasks/:id/approve
Body: { comment?: string }
Response: { success: true, message: "Task approved" }

POST /api/v1/workflow/tasks/:id/reject
Body: { comment: string } // Required
Response: { success: true, message: "Task rejected" }

POST /api/v1/workflow/tasks/:id/reassign
Body: { reassign_to_user_id: string, comment?: string }
Response: { success: true, message: "Task reassigned" }

GET /api/v1/workflow/tasks/stats
Response: {
  pending: 5,
  inProgress: 2,
  completed: 45,
  rejected: 3
}
```

### 3. Workflow Execution API

```
POST /api/v1/workflows/execute
Body: {
  entity_type: "AUDIT_PLAN",
  entity_id: "plan-123",
  action_name: "APPROVE_HIAR",
  user_id: "user-456",
  metadata?: { comment: "Looks good" }
}

Process:
1. Load workflow for entity_type
2. Get current state from entity
3. Find transition matching action_name from current state
4. Check permissions (user has required role)
5. Evaluate conditions
6. Update entity state
7. Record history
8. Execute post-transition actions
9. Create tasks if needed for next transition
10. Return response

Response: {
  success: true,
  new_state: "HIAR_Review",
  tasks_created: [{ id: "task-789", ... }]
}
```

---

## Testing Checklist

### Workflow Editor
- [ ] Create new workflow
- [ ] Add states (initial, intermediate, final)
- [ ] Drag states to reposition
- [ ] Edit state names
- [ ] Delete states
- [ ] Create transitions between states
- [ ] Configure transition permissions
- [ ] Add conditions to transitions
- [ ] Add post-transition actions
- [ ] Save workflow (when backend ready)

### Task Management
- [ ] View all tasks at `/dashboard/audit/tasks`
- [ ] View task statistics
- [ ] Filter tasks by status
- [ ] Filter tasks by entity type
- [ ] Approve a pending task
- [ ] Reject a pending task (with comment)
- [ ] Reassign task to another user
- [ ] View role-filtered user list in reassignment
- [ ] See task status update in real-time
- [ ] Verify completed tasks show completion details

### Workflow Execution
- [ ] Create entity (Audit Plan, Risk)
- [ ] Trigger workflow transition
- [ ] Verify permission checking
- [ ] Verify condition evaluation
- [ ] Verify state changes correctly
- [ ] Verify tasks created for next step
- [ ] Verify email notifications sent
- [ ] Verify workflow history recorded
- [ ] Test multi-step approval flow
- [ ] Test rejection flow
- [ ] Test task reassignment flow

### Edge Cases
- [ ] No users with required role (reassignment blocked)
- [ ] User without permission tries to act
- [ ] Condition fails, transition blocked
- [ ] Task already completed, actions disabled
- [ ] Multiple transitions from same state
- [ ] Parallel approval paths

---

## Database Schema Requirements

### workflows table
```sql
id, name, entity_type, created_at, updated_at, is_active
```

### workflow_states table
```sql
id, workflow_id, name, is_initial, is_final, position_x, position_y
```

### workflow_transitions table
```sql
id, workflow_id, from_state_id, to_state_id, action_name, created_at
```

### workflow_transition_roles table
```sql
id, transition_id, role
```

### workflow_conditions table
```sql
id, transition_id, field, operator, value
```

### workflow_actions table
```sql
id, transition_id, type, config (jsonb)
```

### workflow_tasks table
```sql
id, workflow_id, transition_id, entity_type, entity_id, entity_name,
assigned_user_id, assigned_user_name, assigned_user_email, required_role,
status, created_at, updated_at, completed_at, completed_by_user_id, metadata (jsonb)
```

### workflow_history table
```sql
id, workflow_id, entity_type, entity_id, from_state, to_state, action_name,
performed_by_user_id, comment, created_at
```

---

## Next Steps

1. **Backend Implementation**
   - Implement workflow CRUD APIs
   - Build workflow execution engine
   - Create task APIs
   - Add permission checking middleware
   - Implement condition evaluator
   - Build action dispatcher

2. **Frontend Integration**
   - Connect workflow editor save button to API
   - Add loading states
   - Implement error handling
   - Add optimistic updates

3. **Testing**
   - Unit tests for condition evaluator
   - Integration tests for workflow execution
   - E2E tests for complete flows
   - Permission boundary testing

4. **Documentation**
   - API documentation
   - User guide for workflow creation
   - Admin guide for task management

---

## Summary

The workflow system is architecturally complete with a robust frontend implementation. The Tasks module provides comprehensive functionality for:

- Viewing all workflow tasks
- Approving/rejecting tasks with comments
- Reassigning tasks with role-based user filtering
- Real-time statistics and status tracking

The backend implementation should follow the patterns documented in the workflow overview and this guide to complete the end-to-end system.
