# Workflow Simulation Guide

This guide explains how to use the complete end-to-end workflow simulation system built with Zustand and localStorage persistence.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Step-by-Step Testing Guide](#step-by-step-testing-guide)
4. [Features Demonstrated](#features-demonstrated)
5. [Data Stores](#data-stores)
6. [Mock Data](#mock-data)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The workflow simulation system provides a **complete end-to-end demonstration** of workflow creation, task assignment, and execution **without requiring any backend implementation**. All data is stored in the browser's localStorage using Zustand stores.

### What Can You Test?

- ✅ Create and save workflows with states and transitions
- ✅ Define role-based permissions
- ✅ Set conditions for transitions (e.g., budget > $10,000)
- ✅ Configure post-transition actions
- ✅ Create entities (Audit Plans, Risks, etc.)
- ✅ Generate workflow tasks automatically
- ✅ Assign tasks to users based on roles
- ✅ Approve/Reject tasks
- ✅ Reassign tasks to other users with the same role
- ✅ Watch workflows progress through states
- ✅ See condition-based routing (HIAR vs CEO approval)
- ✅ View task statistics in real-time

---

## Architecture

### Technology Stack

```
Zustand (State Management)
  ↓
localStorage (Persistence Middleware)
  ↓
React Components (UI)
  ↓
Workflow Executor (Business Logic)
```

### Key Components

1. **Zustand Stores** (Client-side state management with persistence)
   - `workflow-store.ts` - Manages workflows
   - `task-store.ts` - Manages tasks
   - `entity-store.ts` - Manages entities (Audit Plans, Risks)

2. **Workflow Executor** (`workflow-executor.ts`)
   - Permission validation
   - Condition evaluation
   - State transitions
   - Task creation

3. **Mock Data** (`mock-users.ts`)
   - 13 simulated users across different roles
   - AUDITOR, HIAR, CEO, CFO, RISK_MANAGER, etc.

4. **UI Components**
   - Workflow Editor
   - Workflow Simulator
   - Tasks Table
   - Task Action Dialogs

---

## Step-by-Step Testing Guide

### Phase 1: Setup Workflow

1. **Navigate to Workflow Configuration**
   - Go to: `/dashboard/system-configs/workflow`
   - You should see the Workflow Simulator card

2. **Load Sample Workflow**
   - Click: **"Load Sample Workflow"**
   - This creates an "Audit Plan Approval Workflow" with:
     - 6 states: Draft, Submitted, HIAR Review, CEO Approval, Approved, Rejected
     - 6 transitions with different conditions and permissions
   - Check: You should see "Sample workflow loaded successfully!" toast

3. **View the Workflow** (Optional)
   - Click: **"New Workflow"** to open the editor
   - You'll see the workflow diagram if it was loaded
   - Click back to return

### Phase 2: Create Entities

4. **Create Sample Audit Plans**
   - Click: **"Create Sample Audit Plans"**
   - This creates 2 audit plans:
     - **Low Budget Plan**: "Q1 2025 IT Audit" ($8,500)
     - **High Budget Plan**: "Annual Financial Audit 2025" ($25,000)
   - Both start in "Draft" state
   - Check: You should see "Created 2 sample audit plans!" toast

### Phase 3: Generate Tasks

5. **Create Initial Tasks**
   - Click: **"Create Tasks for Draft Plans"**
   - This creates "SUBMIT" tasks for each draft plan
   - Tasks are assigned to random AUDITOR role users
   - Check: You should see "Created tasks for 2 draft entities!" toast

### Phase 4: Execute Tasks

6. **Navigate to Tasks Page**
   - Go to: `/dashboard/audit/tasks`
   - You should see:
     - Task statistics (Pending: 2)
     - Task table with 2 SUBMIT tasks

7. **View Task Details**
   - Each task shows:
     - Task name: "SUBMIT"
     - Workflow: "Audit Plan Approval Workflow"
     - Entity: Audit plan name
     - Type: "Audit Plan"
     - Assigned user and email
     - Required role: "AUDITOR"
     - Status: "Pending"

8. **Approve Low Budget Plan**
   - Click: **"Approve"** on the Q1 2025 IT Audit task
   - Dialog opens showing task details
   - Add comment (optional): "Budget reviewed and approved"
   - Click: **"Approve"**
   - **What happens:**
     - Task marked as COMPLETED
     - Entity transitions: Draft → Submitted → HIAR Review
     - Condition evaluated: budget ($8,500) < $10,000 ✓
     - NEW task created: "APPROVE_HIAR" assigned to HIAR user
   - Check: Toast shows "Task approved! 1 new task(s) created."

9. **Approve High Budget Plan**
   - Click: **"Approve"** on the Annual Financial Audit task
   - Add comment: "High priority audit, proceed to review"
   - Click: **"Approve"**
   - **What happens:**
     - Task marked as COMPLETED
     - Entity transitions: Draft → Submitted → CEO Approval
     - Condition evaluated: budget ($25,000) >= $10,000 ✓
     - NEW task created: "ESCALATE_CEO" assigned to CEO user
   - Check: Different routing based on budget!

10. **View Updated Statistics**
    - Statistics should now show:
      - Pending: 2 (new tasks)
      - Completed: 2 (original tasks)

### Phase 5: Second Level Approvals

11. **Approve HIAR Task (Low Budget)**
    - Find the "FINALIZE_HIAR" or "APPROVE_HIAR" task
    - Click: **"Approve"**
    - **What happens:**
      - Task marked as COMPLETED
      - Entity transitions: HIAR Review → Approved
      - Workflow complete (final state reached)
      - No new tasks created
    - Check: Q1 2025 IT Audit is now in "Approved" state

12. **Approve CEO Task (High Budget)**
    - Find the "APPROVE_CEO" task
    - Click: **"Approve"**
    - Add comment: "Strategic audit approved by executive team"
    - **What happens:**
      - Task marked as COMPLETED
      - Entity transitions: CEO Approval → Approved
      - Workflow complete (final state reached)
    - Check: Annual Financial Audit is now in "Approved" state

### Phase 6: Test Rejection

13. **Create Another Entity**
    - Go back to: `/dashboard/system-configs/workflow`
    - Click: **"Create Sample Audit Plans"** again
    - Create tasks: **"Create Tasks for Draft Plans"**

14. **Reject a Task**
    - Go to: `/dashboard/audit/tasks`
    - Find a new SUBMIT task
    - Click: **"Reject"**
    - **Must add comment**: "Budget not aligned with department goals"
    - Click: **"Reject"**
    - **What happens:**
      - Task marked as REJECTED
      - Entity transitions to "Rejected" state (if configured)
      - Workflow ends
    - Check: Task status shows "Rejected"

### Phase 7: Test Reassignment

15. **Reassign a Task**
    - Find a pending task
    - Click: **"More" → "Reassign Task"**
    - Dialog shows:
      - Current assignee
      - Required role
      - Alert about role filtering
    - Select a different user with the same role
    - Add comment (optional): "Better expertise in this area"
    - Click: **"Reassign Task"**
    - **What happens:**
      - Task assigned to new user
      - Task status remains PENDING
      - Previous assignee recorded in metadata
    - Check: Task now shows new assignee

---

## Features Demonstrated

### 1. Role-Based Permissions

```
SUBMIT → Requires AUDITOR role
APPROVE_HIAR → Requires HIAR role
ESCALATE_CEO → Requires HIAR role
APPROVE_CEO → Requires CEO role
REJECT → Requires HIAR or CEO role
```

### 2. Condition-Based Routing

```
If budget < $10,000:
  Submitted → HIAR Review → Approved
  (Single HIAR approval)

If budget >= $10,000:
  Submitted → CEO Approval → Approved
  (Escalated to CEO)
```

### 3. Task Assignment

- Tasks automatically assigned to random users with required role
- Users filtered by role when reassigning
- Each task tracks assignee name, email, and role

### 4. Workflow State Transitions

```
Draft
  ↓ (SUBMIT by AUDITOR)
Submitted
  ↓ (APPROVE_HIAR by HIAR, if budget < 10k)
HIAR Review
  ↓ (FINALIZE_HIAR by HIAR)
Approved (Final)

OR

Submitted
  ↓ (ESCALATE_CEO by HIAR, if budget >= 10k)
CEO Approval
  ↓ (APPROVE_CEO by CEO)
Approved (Final)
```

### 5. Post-Transition Actions

Simulated actions include:
- **send_email**: Email notifications
- **create_log**: Audit trail entries
- **update_field**: Entity field updates
- **trigger_webhook**: External system calls

---

## Data Stores

### Workflow Store (`workflow-storage` in localStorage)

```typescript
{
  workflows: [
    {
      id: "wf-...",
      name: "Audit Plan Approval Workflow",
      entityType: "AUDIT_PLAN",
      states: [...],
      transitions: [...],
      entryConditions: []
    }
  ]
}
```

### Entity Store (`entity-storage` in localStorage)

```typescript
{
  entities: [
    {
      id: "entity-...",
      type: "AUDIT_PLAN",
      name: "Q1 2025 IT Audit",
      currentState: "Approved",
      currentStateId: "state-approved",
      data: { budget: 8500, year: 2025, ... },
      history: [
        {
          fromState: "Draft",
          toState: "Submitted",
          actionName: "SUBMIT",
          performedBy: "John Smith",
          performedAt: "2025-01-01T10:00:00Z",
          comment: "Budget reviewed and approved"
        },
        ...
      ]
    }
  ]
}
```

### Task Store (`task-storage` in localStorage)

```typescript
{
  tasks: [
    {
      id: "task-...",
      workflowId: "wf-...",
      workflowName: "Audit Plan Approval Workflow",
      entityId: "entity-...",
      entityName: "Q1 2025 IT Audit",
      assignedUserId: "user-1",
      assignedUserName: "John Smith",
      assignedUserEmail: "john.smith@company.com",
      requiredRole: "AUDITOR",
      status: "COMPLETED",
      createdAt: "...",
      completedAt: "...",
      completedByUserId: "user-1",
      completedByUserName: "John Smith",
      metadata: { ... }
    }
  ]
}
```

---

## Mock Data

### Users by Role

**AUDITOR** (3 users):
- John Smith
- Sarah Johnson
- Michael Williams

**HIAR** (2 users):
- Patricia Brown
- Robert Davis

**CEO** (1 user):
- Jennifer Martinez

**CFO** (1 user):
- David Garcia

**RISK_MANAGER** (2 users):
- Emily Rodriguez
- James Wilson

**COMPLIANCE_OFFICER** (2 users):
- Linda Taylor
- Christopher Anderson

**DEPARTMENT_HEAD** (2 users):
- Jessica Thomas
- Daniel Jackson

### Workflow Sample

- **Name**: Audit Plan Approval Workflow
- **Entity Type**: AUDIT_PLAN
- **States**: 6 (Draft, Submitted, HIAR Review, CEO Approval, Approved, Rejected)
- **Transitions**: 6 with various conditions and permissions

### Entity Samples

1. **Q1 2025 IT Audit**
   - Budget: $8,500
   - Department: IT
   - Routes through: HIAR approval (low budget)

2. **Annual Financial Audit 2025**
   - Budget: $25,000
   - Department: Finance
   - Routes through: CEO approval (high budget)

---

## Troubleshooting

### Issue: Tasks not appearing

**Solution:**
1. Ensure workflow is loaded first
2. Create entities
3. Generate tasks
4. Refresh the tasks page

### Issue: Cannot approve task

**Possible causes:**
1. Task already completed/rejected
2. Required role mismatch
3. Conditions not met

**Solution:**
Check task status and entity data in browser console:
```javascript
// In browser console
localStorage.getItem('task-storage')
localStorage.getItem('entity-storage')
localStorage.getItem('workflow-storage')
```

### Issue: No users available for reassignment

**Cause:** No users exist with the required role

**Solution:**
The mock data includes users for all common roles. If you added a custom role, update `mock-users.ts`

### Issue: Workflow not progressing

**Solution:**
1. Check browser console for errors
2. Verify workflow has proper transitions defined
3. Ensure conditions are valid (e.g., entity has `budget` field)

### Reset Everything

To start fresh:
1. Go to workflow page
2. Click: **"Clear All Simulation Data"**
3. Reload the page
4. Start from Phase 1 again

OR clear manually:
```javascript
// In browser console
localStorage.removeItem('workflow-storage')
localStorage.removeItem('task-storage')
localStorage.removeItem('entity-storage')
location.reload()
```

---

## Advanced Testing

### Custom Workflows

1. Click "New Workflow" in workflow page
2. Add custom states and transitions
3. Configure permissions and conditions
4. Save workflow
5. Create entities matching the entity type
6. Generate tasks and test

### Edge Cases to Test

- [ ] Task approval when conditions fail
- [ ] Task rejection with missing comment
- [ ] Reassignment to user without required role (should filter them out)
- [ ] Multiple tasks pending for same entity
- [ ] Workflow with no final state
- [ ] Workflow with multiple final states
- [ ] Circular transitions (if configured)

---

## Summary

This simulation system provides a **fully functional** workflow engine that:
- ✅ Stores data persistently in localStorage
- ✅ Executes workflows with proper state transitions
- ✅ Validates permissions and conditions
- ✅ Creates and manages tasks
- ✅ Filters users by role
- ✅ Tracks complete workflow history

**No backend required!** Perfect for:
- UI/UX testing
- Client demonstrations
- Feature validation
- Training and documentation
- Development before backend is ready

Once the backend is implemented, simply swap the Zustand actions with real API calls, and the UI will work identically.
