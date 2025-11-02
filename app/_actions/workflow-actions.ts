/**
 * Workflow Administration Server Actions
 *
 * This file contains all server-side actions for workflow administration.
 * These actions correspond to the Workflow Administration endpoints in the API.
 *
 * @module workflow-actions
 */

"use server";

import { revalidatePath } from "next/cache";
import type { APIResponse } from "@/lib/types";
import { handleBadRequest, handleError, successResponse } from "./api-config";
import authenticatedApiClient from "./api-config";

// ============================================================================
// WORKFLOW CRUD OPERATIONS
// ============================================================================

/**
 * List all workflows in the system
 */
export async function listWorkflows(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: "/api/v1/workflows"
    });

    return successResponse(response.data?.data || [], "Workflows fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | WORKFLOWS", "/api/v1/workflows");
  }
}

/**
 * Create a new workflow
 */
export async function createWorkflow(data: {
  name: string;
  entity_type: "RISK" | "AUDIT_PLAN" | "FINDING" | "RECOMMENDATION";
  description?: string;
}): Promise<APIResponse> {
  console.log("=== SERVER ACTION: CREATE WORKFLOW ===");
  console.log("Received data:", JSON.stringify(data, null, 2));
  console.log("data.name:", data.name);
  console.log("data.entity_type:", data.entity_type);
  console.log("data.description:", data.description);
  console.log("======================================");

  if (!data.name) {
    return handleBadRequest("Workflow name is required");
  }

  if (!data.entity_type) {
    console.log("ERROR: entity_type is missing or undefined!");
    return handleBadRequest("Entity type is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/workflows",
      data
    });

    console.log("=== WORKFLOW CREATED ===");
    console.log("API Response:", response.data);
    console.log("Revalidating paths...");

    revalidatePath("/dashboard/system-configs/workflow", "page");

    console.log("Path revalidated: /dashboard/system-configs/workflow");
    console.log("========================");

    return successResponse(response.data, "Workflow created successfully");
  } catch (error: any) {
    console.log("=== CREATE WORKFLOW ERROR ===");
    console.log("Error:", error);
    console.log("=============================");
    return handleError(error, "POST | CREATE WORKFLOW", "/api/v1/workflows");
  }
}

/**
 * Get workflow details by ID
 */
export async function getWorkflowDetails(workflowId: string): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/workflows/details?workflow_id=${workflowId}`
    });

    return successResponse(response.data, "Workflow details fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | WORKFLOW DETAILS",
      `/api/v1/workflows/details?workflow_id=${workflowId}`
    );
  }
}

/**
 * Update an existing workflow
 */
export async function updateWorkflow(
  workflowId: string,
  data: {
    name?: string;
    description?: string;
    is_active?: boolean;
  }
): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/workflows/update?workflow_id=${workflowId}`,
      data
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Workflow updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE WORKFLOW",
      `/api/v1/workflows/update?workflow_id=${workflowId}`
    );
  }
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(workflowId: string): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/workflows/delete?workflow_id=${workflowId}`
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Workflow deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | DELETE WORKFLOW",
      `/api/v1/workflows/delete?workflow_id=${workflowId}`
    );
  }
}

// ============================================================================
// WORKFLOW STATES
// ============================================================================

/**
 * Get all states for a workflow
 */
export async function getWorkflowStates(workflowId: string): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/workflows/states?workflow_id=${workflowId}`
    });

    return successResponse(response.data?.data || [], "Workflow states fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | WORKFLOW STATES",
      `/api/v1/workflows/states?workflow_id=${workflowId}`
    );
  }
}

/**
 * Create a new workflow state
 */
export async function createWorkflowState(
  workflowId: string,
  data: {
    name: string;
    description?: string;
    is_initial?: boolean;
    is_final?: boolean;
  }
): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  if (!data.name) {
    return handleBadRequest("State name is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/workflows/states?workflow_id=${workflowId}`,
      data
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Workflow state created successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE WORKFLOW STATE",
      `/api/v1/workflows/states?workflow_id=${workflowId}`
    );
  }
}

/**
 * Update a workflow state
 */
export async function updateWorkflowState(
  stateId: string,
  data: {
    name?: string;
    description?: string;
    is_initial?: boolean;
    is_final?: boolean;
  }
): Promise<APIResponse> {
  if (!stateId) {
    return handleBadRequest("State ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/workflows/states/update?state_id=${stateId}`,
      data
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Workflow state updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE WORKFLOW STATE",
      `/api/v1/workflows/states/update?state_id=${stateId}`
    );
  }
}

/**
 * Delete a workflow state
 */
export async function deleteWorkflowState(stateId: string): Promise<APIResponse> {
  if (!stateId) {
    return handleBadRequest("State ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/workflows/states/delete?state_id=${stateId}`
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Workflow state deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | DELETE WORKFLOW STATE",
      `/api/v1/workflows/states/delete?state_id=${stateId}`
    );
  }
}

// ============================================================================
// WORKFLOW TRANSITIONS
// ============================================================================

/**
 * Get all transitions for a workflow
 */
export async function getWorkflowTransitions(workflowId: string): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/workflows/transitions?workflow_id=${workflowId}`
    });

    return successResponse(response.data?.data || [], "Workflow transitions fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | WORKFLOW TRANSITIONS",
      `/api/v1/workflows/transitions?workflow_id=${workflowId}`
    );
  }
}

/**
 * Create a new workflow transition
 */
export async function createWorkflowTransition(
  workflowId: string,
  data: {
    name: string;
    from_state_id: string;
    to_state_id: string;
    action_name: string;
    description?: string;
  }
): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  if (!data.name || !data.from_state_id || !data.to_state_id || !data.action_name) {
    return handleBadRequest("Name, from_state_id, to_state_id, and action_name are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/workflows/transitions?workflow_id=${workflowId}`,
      data
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Workflow transition created successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE WORKFLOW TRANSITION",
      `/api/v1/workflows/transitions?workflow_id=${workflowId}`
    );
  }
}

/**
 * Update a workflow transition
 */
export async function updateWorkflowTransition(
  transitionId: string,
  data: {
    name?: string;
    action_name?: string;
    description?: string;
  }
): Promise<APIResponse> {
  if (!transitionId) {
    return handleBadRequest("Transition ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/workflows/transitions/update?transition_id=${transitionId}`,
      data
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Workflow transition updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE WORKFLOW TRANSITION",
      `/api/v1/workflows/transitions/update?transition_id=${transitionId}`
    );
  }
}

/**
 * Delete a workflow transition
 */
export async function deleteWorkflowTransition(transitionId: string): Promise<APIResponse> {
  if (!transitionId) {
    return handleBadRequest("Transition ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/workflows/transitions/delete?transition_id=${transitionId}`
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Workflow transition deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | DELETE WORKFLOW TRANSITION",
      `/api/v1/workflows/transitions/delete?transition_id=${transitionId}`
    );
  }
}

// ============================================================================
// TRANSITION TRIGGERS
// ============================================================================

/**
 * Get all triggers for a transition
 */
export async function getTransitionTriggers(transitionId: string): Promise<APIResponse> {
  if (!transitionId) {
    return handleBadRequest("Transition ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/workflows/transitions/triggers?transition_id=${transitionId}`
    });

    return successResponse(response.data?.data || [], "Transition triggers fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | TRANSITION TRIGGERS",
      `/api/v1/workflows/transitions/triggers?transition_id=${transitionId}`
    );
  }
}

/**
 * Create a new transition trigger
 */
export async function createTransitionTrigger(
  transitionId: string,
  data: {
    trigger_name: string;
    trigger_type: string;
    delay_duration?: string;
  }
): Promise<APIResponse> {
  if (!transitionId) {
    return handleBadRequest("Transition ID is required");
  }

  if (!data.trigger_name || !data.trigger_type) {
    return handleBadRequest("Trigger name and type are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/workflows/transitions/triggers?transition_id=${transitionId}`,
      data
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Transition trigger created successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE TRANSITION TRIGGER",
      `/api/v1/workflows/transitions/triggers?transition_id=${transitionId}`
    );
  }
}

/**
 * Update a transition trigger
 */
export async function updateTransitionTrigger(
  triggerId: string,
  data: {
    trigger_name?: string;
    delay_duration?: string;
  }
): Promise<APIResponse> {
  if (!triggerId) {
    return handleBadRequest("Trigger ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/workflows/transitions/triggers/update?trigger_id=${triggerId}`,
      data
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Transition trigger updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE TRANSITION TRIGGER",
      `/api/v1/workflows/transitions/triggers/update?trigger_id=${triggerId}`
    );
  }
}

/**
 * Delete a transition trigger
 */
export async function deleteTransitionTrigger(triggerId: string): Promise<APIResponse> {
  if (!triggerId) {
    return handleBadRequest("Trigger ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/workflows/transitions/triggers/delete?trigger_id=${triggerId}`
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Transition trigger deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | DELETE TRANSITION TRIGGER",
      `/api/v1/workflows/transitions/triggers/delete?trigger_id=${triggerId}`
    );
  }
}

// ============================================================================
// WORKFLOW ENTRY TRIGGERS
// ============================================================================

/**
 * Get all entry triggers for a workflow
 */
export async function getWorkflowEntryTriggers(workflowId: string): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/workflows/entry-triggers?workflow_id=${workflowId}`
    });

    return successResponse(
      response.data?.data || [],
      "Workflow entry triggers fetched successfully"
    );
  } catch (error: any) {
    return handleError(
      error,
      "GET | WORKFLOW ENTRY TRIGGERS",
      `/api/v1/workflows/entry-triggers?workflow_id=${workflowId}`
    );
  }
}

/**
 * Create a new entry trigger for a workflow
 */
export async function createEntryTrigger(
  workflowId: string,
  data: {
    trigger_name: string;
    trigger_type: string;
  }
): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  if (!data.trigger_name || !data.trigger_type) {
    return handleBadRequest("Trigger name and type are required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/workflows/entry-triggers?workflow_id=${workflowId}`,
      data
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Entry trigger created successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | CREATE ENTRY TRIGGER",
      `/api/v1/workflows/entry-triggers?workflow_id=${workflowId}`
    );
  }
}

/**
 * Update an entry trigger
 */
export async function updateEntryTrigger(
  triggerId: string,
  data: {
    trigger_name?: string;
  }
): Promise<APIResponse> {
  if (!triggerId) {
    return handleBadRequest("Trigger ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "PUT",
      url: `/api/v1/workflows/entry-triggers/update?trigger_id=${triggerId}`,
      data
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Entry trigger updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE ENTRY TRIGGER",
      `/api/v1/workflows/entry-triggers/update?trigger_id=${triggerId}`
    );
  }
}

/**
 * Delete an entry trigger
 */
export async function deleteEntryTrigger(triggerId: string): Promise<APIResponse> {
  if (!triggerId) {
    return handleBadRequest("Trigger ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/workflows/entry-triggers/delete?trigger_id=${triggerId}`
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Entry trigger deleted successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | DELETE ENTRY TRIGGER",
      `/api/v1/workflows/entry-triggers/delete?trigger_id=${triggerId}`
    );
  }
}

// ============================================================================
// TRANSITION ROLES
// ============================================================================

/**
 * Get all roles for a transition
 */
export async function getTransitionRoles(transitionId: string): Promise<APIResponse> {
  if (!transitionId) {
    return handleBadRequest("Transition ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/workflows/transitions/roles?transition_id=${transitionId}`
    });

    return successResponse(response.data?.data || [], "Transition roles fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | TRANSITION ROLES",
      `/api/v1/workflows/transitions/roles?transition_id=${transitionId}`
    );
  }
}

/**
 * Get a specific transition role
 */
export async function getTransitionRole(
  transitionId: string,
  roleId: string
): Promise<APIResponse> {
  if (!transitionId) {
    return handleBadRequest("Transition ID is required");
  }

  if (!roleId) {
    return handleBadRequest("Role ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/workflows/transitions/roles/details?transition_id=${transitionId}&role_id=${roleId}`
    });

    return successResponse(response.data, "Transition role fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | TRANSITION ROLE",
      `/api/v1/workflows/transitions/roles/details?transition_id=${transitionId}&role_id=${roleId}`
    );
  }
}

/**
 * Assign a role to a transition
 */
export async function assignRoleToTransition(
  transitionId: string,
  roleId: string
): Promise<APIResponse> {
  if (!transitionId) {
    return handleBadRequest("Transition ID is required");
  }

  if (!roleId) {
    return handleBadRequest("Role ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/workflows/transitions/roles?transition_id=${transitionId}`,
      data: { role_id: roleId }
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Role assigned to transition successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | ASSIGN ROLE TO TRANSITION",
      `/api/v1/workflows/transitions/roles?transition_id=${transitionId}`
    );
  }
}

/**
 * Remove a role from a transition
 */
export async function removeRoleFromTransition(
  transitionId: string,
  roleId: string
): Promise<APIResponse> {
  if (!transitionId) {
    return handleBadRequest("Transition ID is required");
  }

  if (!roleId) {
    return handleBadRequest("Role ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "DELETE",
      url: `/api/v1/workflows/transitions/roles/remove?transition_id=${transitionId}&role_id=${roleId}`
    });

    revalidatePath("/dashboard/admin/workflows");
    return successResponse(response.data, "Role removed from transition successfully");
  } catch (error: any) {
    return handleError(
      error,
      "DELETE | REMOVE ROLE FROM TRANSITION",
      `/api/v1/workflows/transitions/roles/remove?transition_id=${transitionId}&role_id=${roleId}`
    );
  }
}

// ============================================================================
// BACKGROUND WORKER
// ============================================================================

/**
 * Get the background worker status
 */
export async function getBackgroundWorkerStatus(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: "/api/v1/workflows/worker/status"
    });

    return successResponse(response.data, "Background worker status fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | BACKGROUND WORKER STATUS", "/api/v1/workflows/worker/status");
  }
}

/**
 * Manually trigger the background worker to process pending triggers
 */
export async function triggerBackgroundWorker(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: "/api/v1/workflows/worker/process"
    });

    return successResponse(response.data, "Background worker triggered successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | TRIGGER BACKGROUND WORKER",
      "/api/v1/workflows/worker/process"
    );
  }
}
