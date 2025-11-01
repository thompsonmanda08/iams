export type EntityType = "RISK" | "AUDIT_PLAN" | "FINDING" | "RECOMMENDATION";

export type OperatorType = "=" | "!=" | ">" | "<" | ">=" | "<=" | "is" | "contains";

export interface Condition {
  id: string;
  field: string;
  operator: OperatorType;
  value: string;
}

export interface Action {
  id: string;
  type: "send_email" | "create_log" | "update_field" | "trigger_webhook";
  config: Record<string, any>;
}

export interface Permission {
  id: string;
  role: string;
}

export interface Transition {
  id: string;
  fromStateId: string;
  toStateId: string;
  actionName: string;
  permissions: Permission[];
  conditions: Condition[];
  actions: Action[];
}

export interface State {
  id: string;
  name: string;
  isInitial: boolean;
  isFinal: boolean;
  position: { x: number; y: number };
}

export interface Workflow {
  id: string;
  name: string;
  entityType: EntityType;
  states: State[];
  transitions: Transition[];
  entryConditions: Condition[];
}
