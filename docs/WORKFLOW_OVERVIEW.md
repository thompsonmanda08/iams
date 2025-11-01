# Workflow Engine Overview

This document provides a high-level overview of the dynamic workflow engine, explaining its core concepts and data flows.

---

## 1. Core Concepts

The system is built on a database-driven state machine. Instead of hard-coding business rules like "only a CEO can approve this," we define these rules in the database. This allows administrators to modify business processes without changing the application code.

*   **Workflow**: A definition of a business process, like "Audit Plan Approval". It is linked to an `entity_type` (e.g., `AUDIT_PLAN`).
*   **State**: A specific step or status within a workflow, such as `Draft`, `Submitted`, or `Approved`.
*   **Transition**: A defined path from one state to another, triggered by an `action_name` (e.g., `APPROVE_HIAR`).
*   **Permission**: A rule that assigns one or more user roles to a transition. A user must have one of the assigned roles to perform the action.
*   **Condition**: A dynamic rule that must be true for a transition to proceed (e.g., `risk_score > 15`).
*   **Action (Trigger)**: An automated side-effect that occurs after a successful transition, such as sending an email or creating an audit log.

---

## 2. Standard Workflow Execution Flow

This diagram illustrates what happens when a user performs a workflow action, such as clicking an "Approve" button in the UI.

```mermaid
graph TD
    subgraph "User Interface"
        A[User clicks 'Approve' button]
    end

    subgraph "Application Layer (Go)"
        B[1. HTTP Handler Receives Request<br>(e.g., auditPlanHandler.ApproveByHIAR)]
        C[2. Handler calls WorkflowService<br>workflowService.TransitionState(user, entity, "APPROVE_HIAR")]
        
        subgraph "WorkflowService.TransitionState"
            D[3. Find Transition<br>Get rules for 'APPROVE_HIAR' from 'Submitted' state]
            E{4. Check Permissions<br>Does user have 'HIAR' role?}
            F{5. Evaluate Conditions<br>Is entity.budget > 1000?}
            G[6. Update Entity State<br>entity.Status = "HIAR_Approved"]
            H[7. Persist Entity<br>Save updated entity to its table (e.g., audit_plans)]
            I[8. Record History<br>Write to 'workflow_history' table]
            J[9. Execute Actions<br>Trigger notifications, logging, etc.]
        end

        K[10. Return Success/Error to Handler]
    end

    subgraph "Database Layer (PostgreSQL)"
        DB_T[workflows, workflow_states, workflow_transitions, workflow_transition_roles, workflow_conditions]
        DB_E[audit_plans, risks]
        DB_H[workflow_history]
        DB_A[workflow_actions]
    end

    A --> B
    B --> C
    C --> D
    D -- Rules --> DB_T
    D --> E
    E -- Yes --> F
    E -- No --> K
    F -- Yes --> G
    F -- No --> K
    G --> H
    H -- Write --> DB_E
    H --> I
    I -- Write --> DB_H
    I --> J
    J -- Rules --> DB_A
    J --> K
```

---

## 3. Automated Workflow Entry Flow

This diagram shows how an entity (like a new "Risk") can be automatically entered into a workflow upon creation.

```mermaid
graph TD
    subgraph "User Action"
        A[User creates a 'CRITICAL' Risk via API]
    end

    subgraph "Application Layer (Go)"
        B[1. RiskHandler receives request]
        C[2. RiskService saves the new Risk entity]
        D[3. Handler calls WorkflowEntryService<br>entryService.CheckEntryTriggersOnCreate(risk)]
        
        subgraph "WorkflowEntryService"
            E[4. Find Entry Triggers<br>Get 'ON_CREATE' triggers for 'RISK' entity type]
            F{5. Evaluate Conditions<br>Is risk.severity == 'CRITICAL'?}
            G[6. Enter Workflow<br>Set risk.Status to initial state (e.g., 'Identified')]
            H[7. Record History<br>Log 'WORKFLOW_STARTED' event]
        end

        I[8. Return response to user]
    end

    subgraph "Database Layer (PostgreSQL)"
        DB_ET[workflow_entry_triggers, workflow_entry_conditions]
        DB_R[risks]
        DB_H[workflow_history]
    end

    A --> B
    B --> C
    C -- Write --> DB_R
    C --> D
    D --> E
    E -- Rules --> DB_ET
    E --> F
    F -- Yes --> G
    F -- No --> I
    G -- Update --> DB_R
    G --> H
    H -- Write --> DB_H
    H --> I
```

---

## 4. Key Takeaways

1.  **Decoupled Logic**: Business process rules (who can do what, and when) are stored in the database, not in the Go code. This makes the system highly configurable.
2.  **Centralized Control**: The `WorkflowService` is the single point of control for all state changes, ensuring consistency and auditability.
3.  **Automation**: The `WorkflowEntryService` and `WorkflowTriggerService` provide powerful automation for starting workflows and moving them along based on events or time.
4.  **Extensibility**: To make a new entity (e.g., "Finding") part of a workflow, you only need to:
    *   Implement the `Workflowable` interface on the `Finding` struct.
    *   Add the `FindingRepository` to the `WorkflowService`'s `saveEntity` method.
    *   Define the workflow, states, and transitions in the database.

This architecture provides a robust foundation for managing complex, multi-step processes across the entire application.