/**
 * Task Management Types
 *
 * These types represent workflow task instances and their related entities.
 * Tasks are generated when a workflow requires user action (approve/reject transitions).
 *
 * @module task-types
 */

import { StandardStatus } from "../statuses";
import { EntityType, WorkflowTriggerType } from "./workflow";

/**
 * Workflow instance - represents a specific instance of a workflow execution
 */
export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  organization_id: string;
  entity_type: WorkflowTriggerType;
  entity_id: string;
  status: StandardStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  [x: string]: any;
}

/**
 * Entity - represents the entity being processed in the workflow
 */
export interface Entity {
  id: string;
  status?: StandardStatus;
  title?: string;
  name?: string | EntityType;
  total_amount?: string;
  year?: number;
  [x: string]: any;
}

/**
 * Task - represents a workflow task with instance and entity information
 * This is the main type used in the tasks page and components
 */
export interface Task {
  instance: WorkflowInstance;
  entity: Entity;
  entity_type: EntityType;
  status: StandardStatus;
  entity_name: string;
}

/**
 * Rich entity data as returned by the workflow tasks API.
 * Different entity types populate different subsets of these fields.
 */
export interface WorkflowTaskEntity {
  // Common fields
  entity_id?: string;
  entity_name?: string;
  entity_type?: string;
  id?: string;
  status?: string;
  title?: string;
  name?: string;

  // Finding-specific
  audit_plan_id?: string;
  audit_plan_name?: string;
  working_paper_id?: string;
  working_paper_name?: string;
  conclusion?: string;
  objectives?: string;

  // Annual Audit Plan / Budget-specific
  year?: number;

  // Budget-specific
  total_amount?: number | string;

  // Universe-specific
  universe_name?: string;

  // Allow additional fields from API
  [key: string]: any;
}

/**
 * Full workflow task as returned by the /api/v1/workflow-tasks/user endpoint.
 * Single source of truth — all approval components should import this type.
 */
export interface WorkflowTask {
  id: string;
  instance_id: string;
  organization_id?: string;
  required_role_id?: string;
  required_role_name?: string;
  assigned_to_user_id: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "REASSIGNED" | "APPROVED";
  created_at: string;
  updated_at: string;

  // Completion metadata
  completed_by_user_id?: string;
  completed_by_name?: string;
  completed_at?: string;

  instance: {
    id?: string;
    workflow_id?: string;
    organization_id?: string;
    entity_type: string;
    entity_id?: string;
    status: string;
    is_finalized?: boolean;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
  };

  entity: WorkflowTaskEntity;
}
