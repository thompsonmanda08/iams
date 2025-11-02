// ============================================================================
// ENUMS & TYPES
// ============================================================================

export type EntityType = "RISK" | "AUDIT_PLAN" | "FINDING" | "RECOMMENDATION";

export type OperatorType = "=" | "!=" | ">" | "<" | ">=" | "<=" | "is" | "contains";

export type ActionType = "send_email" | "create_log" | "update_field" | "trigger_webhook";

export type WorkflowStatus = "draft" | "active" | "inactive" | "archived";

// ============================================================================
// CONDITION INTERFACES
// ============================================================================

export interface Condition {
  id: string;
  field: string;
  operator: OperatorType;
  value: string;
  description?: string;
}

export interface EntryCondition extends Condition {
  workflowId: string;
}

// ============================================================================
// ACTION INTERFACES
// ============================================================================

export interface Action {
  id: string;
  type: ActionType;
  config: Record<string, any>;
  description?: string;
}

export interface EmailActionConfig {
  recipient: string;
  subject?: string;
  body?: string;
  cc?: string[];
  bcc?: string[];
}

export interface WebhookActionConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

export interface UpdateFieldActionConfig {
  field: string;
  value: string | number | boolean;
}

// ============================================================================
// PERMISSION INTERFACES
// ============================================================================

export interface Permission {
  id: string;
  role: string;
}

export interface TransitionRole {
  id: string;
  transition_id: string;
  role_id: string;
  role?: {
    id: string;
    name: string;
    code: string;
  };
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// TRIGGER INTERFACES
// ============================================================================

export interface TransitionTrigger {
  id: string;
  transition_id: string;
  trigger_name: string;
  trigger_type: "IMMEDIATE" | "DELAYED" | "SCHEDULED" | "CONDITIONAL";
  delay_duration?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EntryTrigger {
  id: string;
  workflow_id: string;
  trigger_tame: string;
  trigger_type: "ON_CREATE" | "ON_UPDATE" | "ON_DELETE" | "MANUAL" | "SCHEDULED";
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// STATE INTERFACES
// ============================================================================

export interface State {
  id: string;
  name: string;
  isInitial: boolean;
  isFinal: boolean;
  position: { x: number; y: number };
  description?: string;
  color?: string;
}

export interface WorkflowState extends Omit<State, "position"> {
  workflow_id: string;
  position?: { x: number; y: number };
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// TRANSITION INTERFACES
// ============================================================================

export interface Transition {
  id: string;
  from_state_id: string;
  to_state_id: string;
  action_name: string;
  permissions: Permission[];
  conditions: Condition[];
  actions: Action[];
  description?: string;
}

export interface WorkflowTransition {
  id: string;
  workflow_id: string;
  from_state_id: string;
  to_state_id: string;
  action_name: string;
  name?: string;
  description?: string;
  from_state?: State;
  to_state?: State; 
  permissions?: TransitionRole[];
  conditions?: Condition[];
  actions?: Action[];
  triggers?: TransitionTrigger[];
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// WORKFLOW INTERFACES
// ============================================================================

export interface Workflow {
  id: string;
  name: string;
  entityType: EntityType;
  states: State[];
  transitions: Transition[];
  entry_conditions: Condition[];
  description?: string;
  status?: WorkflowStatus;
}

export interface WorkflowDetails {
  id: string;
  name: string;
  entity_type: EntityType;
  description?: string;
  status?: WorkflowStatus;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  entry_conditions?: EntryCondition[];
  entry_triggers?: EntryTrigger[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface WorkflowListItem {
  id: string;
  name: string;
  entity_type: EntityType;
  description?: string;
  status?: WorkflowStatus;
  states_count?: number;
  transitions_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// ============================================================================
// WORKER INTERFACES
// ============================================================================

export interface WorkflowWorkerStatus {
  status: "active" | "idle" | "error" | "stopped";
  is_running: boolean;
  last_run?: string;
  next_run?: string;
  pending_triggers?: number;
  processed_Today?: number;
  errors?: number;
  error_details?: string[];
}

// ============================================================================
// API REQUEST/RESPONSE INTERFACES
// ============================================================================

export interface CreateWorkflowRequest {
  name: string;
  entity_type: EntityType;
  description?: string;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  status?: WorkflowStatus;
}

export interface CreateStateRequest {
  workflow_id: string;
  name: string;
  is_initial?: boolean;
  is_final?: boolean;
  position?: { x: number; y: number };
  description?: string;
}

export interface UpdateStateRequest {
  name?: string;
  is_initial?: boolean;
  is_final?: boolean;
  position?: { x: number; y: number };
  description?: string;
}

export interface CreateTransitionRequest {
  workflow_id: string;
  from_state_id: string;
  to_state_id: string;
  action_name: string;
  name?: string;
  description?: string;
}

export interface UpdateTransitionRequest {
  action_name?: string;
  name?: string;
  description?: string;
}

export interface AssignRoleToTransitionRequest {
  role_id: string;
}

export interface CreateTransitionTriggerRequest {
  trigger_name: string;
  trigger_type: "IMMEDIATE" | "DELAYED" | "SCHEDULED" | "CONDITIONAL";
  delay_duration?: string;
}

export interface UpdateTransitionTriggerRequest {
  trigger_name?: string;
  delay_duration?: string;
}

export interface CreateEntryTriggerRequest {
  trigger_name: string;
  trigger_type: "ON_CREATE" | "ON_UPDATE" | "ON_DELETE" | "MANUAL" | "SCHEDULED";
}

export interface UpdateEntryTriggerRequest {
  trigger_name?: string;
}

// ============================================================================
// QUERY KEYS (for TanStack Query)
// ============================================================================

export const workflowKeys = {
  all: ["workflows"] as const,
  lists: () => [...workflowKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) => [...workflowKeys.lists(), filters] as const,
  details: () => [...workflowKeys.all, "detail"] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
  states: (workflowId: string) => [...workflowKeys.detail(workflowId), "states"] as const,
  transitions: (workflowId: string) => [...workflowKeys.detail(workflowId), "transitions"] as const,
  transitionRoles: (transitionId: string) => ["transition-roles", transitionId] as const,
  transitionTriggers: (transitionId: string) => ["transition-triggers", transitionId] as const,
  entryTriggers: (workflowId: string) => ["entry-triggers", workflowId] as const,
  workerStatus: () => ["workflow-worker-status"] as const
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WorkflowFormData = Omit<Workflow, "id" | "states" | "transitions" | "entryConditions">;

export type StateFormData = Omit<State, "id">;

export type TransitionFormData = Omit<Transition, "id" | "permissions" | "conditions" | "actions">;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isEmailAction = (action: Action): action is Action & { config: EmailActionConfig } => {
  return action.type === "send_email";
};

export const isWebhookAction = (
  action: Action
): action is Action & { config: WebhookActionConfig } => {
  return action.type === "trigger_webhook";
};

export const isUpdateFieldAction = (
  action: Action
): action is Action & { config: UpdateFieldActionConfig } => {
  return action.type === "update_field";
};
