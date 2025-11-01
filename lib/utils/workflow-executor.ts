import type { Workflow, Transition, Condition, Action, OperatorType } from "@/lib/types/workflow";
import type { Task } from "@/lib/types/task";
import { getRandomUserByRole, getUserById } from "@/lib/data/mock-users";

interface ExecutionContext {
  userId: string;
  userRole: string;
  entityData: Record<string, any>;
}

interface ExecutionResult {
  success: boolean;
  error?: string;
  newState?: string;
  tasksCreated?: Task[];
  actionsExecuted?: string[];
}

/**
 * Workflow Execution Simulator
 * This simulates the backend workflow execution engine
 */
export class WorkflowExecutor {
  private workflow: Workflow;

  constructor(workflow: Workflow) {
    this.workflow = workflow;
  }

  /**
   * Execute a transition action
   */
  executeTransition(
    actionName: string,
    currentStateId: string,
    context: ExecutionContext
  ): ExecutionResult {
    // Find the transition
    const transition = this.workflow.transitions.find(
      (t) => t.fromStateId === currentStateId && t.actionName === actionName
    );

    if (!transition) {
      return {
        success: false,
        error: `No transition found for action "${actionName}" from current state`
      };
    }

    // Check permissions
    const hasPermission = this.checkPermissions(transition, context.userRole);
    if (!hasPermission) {
      return {
        success: false,
        error: `User does not have permission to perform this action. Required roles: ${transition.permissions.map((p) => p.role).join(", ")}`
      };
    }

    // Evaluate conditions
    const conditionsPassed = this.evaluateConditions(transition.conditions, context.entityData);
    if (!conditionsPassed.passed) {
      return {
        success: false,
        error: `Conditions not met: ${conditionsPassed.failedCondition}`
      };
    }

    // Get target state
    const targetState = this.workflow.states.find((s) => s.id === transition.toStateId);
    if (!targetState) {
      return {
        success: false,
        error: "Target state not found"
      };
    }

    // Execute post-transition actions
    const actionsExecuted = this.executeActions(transition.actions);

    // Create tasks for next transitions (if not final state)
    const tasksCreated = this.createTasksForNextTransitions(transition.toStateId, context.entityData);

    return {
      success: true,
      newState: targetState.name,
      tasksCreated,
      actionsExecuted
    };
  }

  /**
   * Check if user has required permissions
   */
  private checkPermissions(transition: Transition, userRole: string): boolean {
    if (transition.permissions.length === 0) {
      return true; // No permissions required
    }

    return transition.permissions.some((p) => p.role === userRole);
  }

  /**
   * Evaluate transition conditions
   */
  private evaluateConditions(
    conditions: Condition[],
    entityData: Record<string, any>
  ): { passed: boolean; failedCondition?: string } {
    if (conditions.length === 0) {
      return { passed: true };
    }

    for (const condition of conditions) {
      const fieldValue = entityData[condition.field];
      const conditionValue = this.parseValue(condition.value);
      const result = this.evaluateOperator(fieldValue, condition.operator, conditionValue);

      if (!result) {
        return {
          passed: false,
          failedCondition: `${condition.field} ${condition.operator} ${condition.value}`
        };
      }
    }

    return { passed: true };
  }

  /**
   * Evaluate a single operator
   */
  private evaluateOperator(fieldValue: any, operator: OperatorType, conditionValue: any): boolean {
    switch (operator) {
      case "=":
        return fieldValue == conditionValue;
      case "!=":
        return fieldValue != conditionValue;
      case ">":
        return Number(fieldValue) > Number(conditionValue);
      case "<":
        return Number(fieldValue) < Number(conditionValue);
      case ">=":
        return Number(fieldValue) >= Number(conditionValue);
      case "<=":
        return Number(fieldValue) <= Number(conditionValue);
      case "is":
        return fieldValue === conditionValue;
      case "contains":
        return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      default:
        return false;
    }
  }

  /**
   * Parse condition value to appropriate type
   */
  private parseValue(value: string): any {
    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }

    // Try to parse as boolean
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    // Return as string
    return value;
  }

  /**
   * Execute post-transition actions
   */
  private executeActions(actions: Action[]): string[] {
    const executed: string[] = [];

    for (const action of actions) {
      switch (action.type) {
        case "send_email":
          executed.push(`Email sent to ${action.config.recipient || "unknown"}`);
          break;
        case "create_log":
          executed.push(`Log entry created: ${action.config.message || "Transition executed"}`);
          break;
        case "update_field":
          executed.push(
            `Field updated: ${action.config.field} = ${action.config.value || "N/A"}`
          );
          break;
        case "trigger_webhook":
          executed.push(`Webhook triggered: ${action.config.url || "unknown"}`);
          break;
      }
    }

    return executed;
  }

  /**
   * Create tasks for transitions from the new state
   */
  private createTasksForNextTransitions(
    stateId: string,
    entityData: Record<string, any>
  ): Task[] {
    const tasks: Task[] = [];
    const nextTransitions = this.workflow.transitions.filter((t) => t.fromStateId === stateId);

    for (const transition of nextTransitions) {
      // Get first required role (if any)
      const requiredRole = transition.permissions[0]?.role;
      if (!requiredRole) continue;

      // Assign to a random user with that role
      const assignedUser = getRandomUserByRole(requiredRole);
      if (!assignedUser) continue;

      const task: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflowId: this.workflow.id,
        workflowName: this.workflow.name,
        transitionId: transition.id,
        actionName: transition.actionName,
        entityType: this.workflow.entityType,
        entityId: entityData.id || "unknown",
        entityName: entityData.name || entityData.title || "Unknown Entity",
        assignedUserId: assignedUser.id,
        assignedUserName: `${assignedUser.first_name} ${assignedUser.last_name}`,
        assignedUserEmail: assignedUser.email,
        requiredRole: requiredRole,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          currentState: this.workflow.states.find((s) => s.id === stateId)?.name,
          targetState: this.workflow.states.find((s) => s.id === transition.toStateId)?.name,
          conditions: transition.conditions
        }
      };

      tasks.push(task);
    }

    return tasks;
  }

  /**
   * Get initial state
   */
  getInitialState() {
    return this.workflow.states.find((s) => s.isInitial);
  }

  /**
   * Get available transitions from a state
   */
  getAvailableTransitions(stateId: string) {
    return this.workflow.transitions.filter((t) => t.fromStateId === stateId);
  }
}
