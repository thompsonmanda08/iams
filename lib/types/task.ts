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
  entity_name: string;
}
