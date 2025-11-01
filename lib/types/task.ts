import { EntityType } from "./workflow";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "REASSIGNED";

export type TaskAction = "APPROVE" | "REJECT" | "REASSIGN";

export interface Task {
  id: string;
  workflowId: string;
  workflowName: string;
  transitionId: string;
  actionName: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  assignedUserId: string;
  assignedUserName: string;
  assignedUserEmail: string;
  requiredRole: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completedByUserId?: string;
  completedByUserName?: string;
  metadata?: {
    currentState?: string;
    targetState?: string;
    conditions?: Record<string, any>;
    [key: string]: any;
  };
}

export interface TaskActionRequest {
  taskId: string;
  action: TaskAction;
  comment?: string;
  reassignToUserId?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  entityType?: EntityType;
  assignedUserId?: string;
  requiredRole?: string;
}
