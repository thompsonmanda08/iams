# Workflows Module

**Status:** ⚠️ PARTIAL - Backend-defined, frontend execution missing

## Overview

Database-driven state machine workflows for managing complex business processes across entities like risks, audit plans, and findings. Rules are configured in the database rather than hard-coded.

## Architecture

Workflows are defined using a decoupled architecture:

```
Entity (Risk, Audit Plan, etc.)
    → Workflow Definition (in database)
        → States (Draft, Submitted, Approved, etc.)
            → Transitions (rules for state changes)
                → Conditions (must be met)
                → Permissions (who can perform)
                → Actions (automated triggers)
```

## Core Concepts

| Concept | Definition |
|---------|-----------|
| **Workflow** | Definition of a business process linked to an entity_type |
| **State** | A specific step/status within a workflow (e.g., Draft, Approved) |
| **Transition** | A path from one state to another (e.g., Submit, Approve) |
| **Condition** | A rule that must be true for transition (e.g., risk_score > 15) |
| **Permission** | Assigns roles that can perform a transition |
| **Action** | Automated side-effect (email, logging, webhook) |

## Supported Entity Types

- `RISK` - Risk register workflows
- `AUDIT_PLAN` - Audit plan approval workflows
- `FINDING` - Audit finding workflows
- `RECOMMENDATION` - Management recommendation tracking

## Standard Execution Flow

```
1. User clicks "Approve" button
   ↓
2. Application handler receives request
   ↓
3. WorkflowService checks:
   - Is transition defined?
   - Does user have required role?
   - Are conditions met?
   ↓
4. If valid:
   - Update entity state
   - Record in workflow_history
   - Execute automated actions
   ↓
5. Return success/error to UI
```

## Automated Entry Flow

Entities can be automatically entered into workflows upon creation based on conditions:

```
1. Entity created (e.g., "CRITICAL" risk)
   ↓
2. WorkflowEntryService checks entry triggers
   ↓
3. If conditions met:
   - Set entity to initial workflow state
   - Record workflow start
   - Execute entry actions
   ↓
4. Entity now in active workflow
```

## Database Tables

- `workflows` - Workflow definitions
- `workflow_states` - State definitions
- `workflow_transitions` - Transition rules
- `workflow_transition_roles` - Role-based access
- `workflow_conditions` - Conditional rules
- `workflow_actions` - Automated triggers
- `workflow_history` - Audit trail

## Current Implementation Status

### ✅ Implemented (Backend)
- Workflow definition management
- State machine logic
- Transition validation
- Permission checking
- Condition evaluation
- Automated actions

### ❌ Missing (Frontend)
- Workflow UI for non-admin users
- Transition action buttons
- Status visualization
- Workflow history display
- Conditional action hiding

## Admin Configuration

**Location:** `/dashboard/system-configs/workflow/*`

Backoffice users can configure:
- Workflow states and initial state
- Transition rules and conditions
- Role-based permissions
- Automated actions (email, logging, webhooks)

## Server Actions

`app/_actions/workflow-actions.ts`:
- `getWorkflowsByEntityType()` - Get workflow definition
- `transitionWorkflowState()` - Move entity to new state
- `getWorkflowHistory()` - Get entity's workflow audit trail
- `getAvailableTransitions()` - Get user's allowed transitions

## API Integration

**Endpoints (PocketBase):**
- `GET /api/v1/workflows` - List workflows
- `GET /api/v1/workflows/:id` - Get workflow definition
- `POST /api/v1/workflow-transitions` - Execute transition
- `GET /api/v1/workflow-history/:entityId` - Get audit trail
- `GET /api/v1/workflow-conditions` - List conditions

## Example: Audit Plan Approval

```
States:
  1. Draft (initial)
  2. Submitted
  3. HIAR_Approved
  4. CEO_Approved
  5. Approved (final)

Transitions:
  Draft → Submitted (anyone can submit)
  Submitted → HIAR_Approved (requires HIAR role)
  HIAR_Approved → CEO_Approved (requires CEO role)
  CEO_Approved → Approved (requires Audit Chair role)

Conditions:
  - budget > 1000 (example)
  - all_findings_resolved (example)

Actions:
  - Send email to next approver
  - Log in workflow_history
  - Update audit_plan.status field
```

## Example: Risk Entry Trigger

```
Trigger: ON_CREATE
Entity: RISK
Condition: severity == "CRITICAL"
Entry State: "Identified"
Actions:
  - Notify risk owner via email
  - Create audit log entry
```

## Known Issues

⚠️ **Frontend execution not implemented** - While workflows are fully defined in backend, the UI doesn't expose workflow transitions. Users must use admin interface or API calls.

## Next Steps

1. **Implement frontend transitions** - Add workflow action buttons to risk/audit/finding details
2. **Status visualization** - Show current workflow state in UI
3. **History display** - Show who did what and when
4. **Conditional UI** - Hide/show actions based on workflow state
5. **Notifications** - Notify users of workflow state changes
6. **Webhook triggers** - Connect to external systems
7. **Bulk transitions** - Move multiple entities through workflow
