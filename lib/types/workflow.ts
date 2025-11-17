// ============================================================================
// ENUMS & TYPES
// ============================================================================

import { StandardStatus } from "../statuses";

export type EntityType =
  | "RISK_ACCEPTANCE"
  | "AUDIT_PLAN"
  | "BUDGET"
  | "AUDIT_UNIVERSE"
  | "FINDINGS";

export type OperatorType = "=" | "!=" | ">" | "<" | ">=" | "<=" | "is" | "contains";

export type ActionType = "send_email" | "create_log" | "update_field" | "trigger_webhook";

export type WorkflowTriggerType =
  | "BUDGET_CREATION"
  | "UNIVERSE_CREATION"
  | "AUDIT_PLAN"
  | "FINDINGS"
  | "RISK_ACCEPTANCE";

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
  role: string; // Role name for display
  role_id?: string; // Role ID for API requests
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
  status?: "from_status" | "to_status"; // Consistent with API
  display_order?: number;
  // Tracking metadata (not persisted to API)
  _changeType?: "created" | "modified" | "deleted" | "synced";
  _serverId?: string; // Original server ID if modified
}

export interface WorkflowState extends Omit<State, "position"> {
  workflow_id: string;
  state_name: string;
  description?: string;
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
  transition_name: string;
  required_role_id: string;
  conditions: Condition[];
  actions: Action[];
  description?: string;
  // Tracking metadata (not persisted to API)
  _changeType?: "created" | "modified" | "deleted" | "synced";
  _serverId?: string; // Original server ID if modified
}

export interface WorkflowTransition {
  id: string;
  workflow_id: string;
  from_state_id: string;
  to_state_id: string;
  transition_name: string;
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

export interface WorkflowDetails {
  id: string;
  name: string;
  entity_type: EntityType;
  description?: string;
  status?: StandardStatus;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  entry_conditions?: EntryCondition[];
  entry_triggers?: EntryTrigger[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export type WorkflowItem = {
  id: string;
  name: string;
  trigger_type: WorkflowTriggerType;
  description?: string;
  state_count?: number;
  transitions_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  status?: StandardStatus;
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
  transition_name: string;
  name?: string;
  description?: string;
}

export interface UpdateTransitionRequest {
  transition_name?: string;
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

export type WorkflowFormData = Omit<WorkflowItem, "id" | "states" | "transitions">;

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
