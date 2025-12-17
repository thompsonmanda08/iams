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
import type { WorkflowTriggerType } from "@/lib/types/workflow";
import { handleBadRequest, handleError, successResponse } from "./api-config";
import authenticatedApiClient from "./api-config";

// ============================================================================
// WORKFLOWS
// ============================================================================

/**
 * List all workflows in the system
 */
export async function listWorkflows(): Promise<APIResponse> {
  const url = `/api/v1/simple-workflows`;
  try {
    const response = await authenticatedApiClient({ url });

    return successResponse(response.data?.data || [], "Workflows fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | WORKFLOWS", url);
  }
}

/**
 * Create a new workflow
 */
export async function createWorkflow(data: {
  name: string;
  // entity_type: "RISK" | "AUDIT_PLAN" | "FINDING" | "RECOMMENDATION";
  trigger_type?: WorkflowTriggerType;
  description?: string;
}): Promise<APIResponse> {
  if (!data.name) {
    return handleBadRequest("Workflow name is required");
  }

  const url = `/api/v1/simple-workflows`;

  try {
    const response = await authenticatedApiClient({ method: "POST", url, data });

    revalidatePath("/dashboard/workflow/manage", "page");

    return successResponse(response.data, "Workflow created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE WORKFLOW", "/api/v1/workflows");
  }
}

/**
 * Update an existing workflow
 * NOTE: This is a mock implementation. Real API endpoint TBD.
 */
export async function updateWorkflow(
  workflowId: string,
  data: {
    name: string;
    trigger_type?: WorkflowTriggerType;
    description?: string;
  }
): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  if (!data.name) {
    return handleBadRequest("Workflow name is required");
  }

  // Mock implementation - returns success
  // TODO: Replace with actual API call when endpoint is available
  return successResponse({ id: workflowId, ...data }, "Workflow updated successfully");
}

/**
 * Get workflow details by ID
 */
export async function getWorkflowDetails(workflowId: string): Promise<APIResponse> {
  if (!workflowId) {
    return handleBadRequest("Workflow ID is required");
  }

  const url = `/api/v1/simple-workflows/${workflowId}`;

  try {
    const response = await authenticatedApiClient({ url });

    return successResponse(
      response.data?.data || response.data || {},
      "Workflow details fetched successfully"
    );
  } catch (error: any) {
    return handleError(
      error,
      "GET | WORKFLOW DETAILS",
      `/api/v1/workflows/details?workflow_id=${workflowId}`
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

  const url = `/api/v1/simple-workflows/states?workflow_id=${workflowId}`;

  try {
    const response = await authenticatedApiClient({ url });

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
export async function createWorkflowState(data: {
  workflow_id: string;
  state_name: string;
  description: string;
  display_order: number;
  is_initial: boolean;
  is_final: boolean;
}): Promise<APIResponse> {
  if (!data?.workflow_id) {
    return handleBadRequest("Workflow ID is required");
  }

  const url = `/api/v1/simple-workflows/states`;

  try {
    const response = await authenticatedApiClient({ method: "POST", url, data });

    revalidatePath("/dashboard/workflow/manage");
    return successResponse(response.data, "Workflow state created successfully");
  } catch (error: any) {
    return handleError(error, "POST | CREATE WORKFLOW STATE", url);
  }
}

/**
 * Update a workflow state
 */
export async function updateWorkflowState(
  stateId: string,
  data: {
    state_name?: string;
    description?: string;
    display_order?: number;
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
      url: `/api/v1/simple-workflows/states/${stateId}`,
      data
    });

    revalidatePath("/dashboard/workflow/manage");
    return successResponse(response.data, "Workflow state updated successfully");
  } catch (error: any) {
    return handleError(
      error,
      "PUT | UPDATE WORKFLOW STATE",
      `/api/v1/simple-workflows/states/${stateId}`
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

  const url = `/api/v1/simple-workflows/states/${stateId}`;

  try {
    const response = await authenticatedApiClient({ method: "DELETE", url });

    revalidatePath("/dashboard/workflow/manage");
    return successResponse(response.data, "Workflow state deleted successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | DELETE WORKFLOW STATE", url);
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

  const url = `/api/v1/simple-workflow-transitions?workflow_id=${workflowId}`;

  try {
    const response = await authenticatedApiClient({ url });

    return successResponse(response.data?.data || [], "Workflow transitions fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | WORKFLOW TRANSITIONS", url);
  }
}

/**
 * Create a new workflow transition
 */
export async function createWorkflowTransition(data: {
  workflow_id: string;
  from_status: string;
  to_status: string;
  required_role_id: string;
}): Promise<APIResponse> {
  if (!data?.workflow_id) {
    return handleBadRequest("Workflow ID is required");
  }

  if (!data.from_status || !data.to_status) {
    return handleBadRequest("From Status, and To Status are required");
  }

  const url = `/api/v1/simple-workflow-transitions`;

  try {
    console.log("=== CREATE WORKFLOW TRANSITION ===");
    console.log("URL:", url);
    console.log("Payload:", data);

    const response = await authenticatedApiClient({ method: "POST", url, data });

    console.log("Response:", response.data);
    console.log("==================================");

    revalidatePath("/dashboard/workflow/manage");
    return successResponse(response.data, "Workflow transition created successfully");
  } catch (error: any) {
    console.error("=== ERROR CREATE WORKFLOW TRANSITION ===");
    console.error("URL:", url);
    console.error("Payload:", data);
    console.error("Error:", error);
    console.error("========================================");

    return handleError(error, "POST | CREATE WORKFLOW TRANSITION", url);
  }
}

/**
 * Update a workflow transition
 */
export async function updateWorkflowTransition(
  transitionId: string,
  data: {
    from_status?: string;
    to_status?: string;
    required_role_id?: string;
  }
): Promise<APIResponse> {
  if (!transitionId) {
    return handleBadRequest("Transition ID is required");
  }

  const url = `/api/v1/simple-workflow-transitions/${transitionId}`;

  try {
    const response = await authenticatedApiClient({ method: "PUT", url, data });

    revalidatePath("/dashboard/workflow/manage");
    return successResponse(response.data, "Workflow transition updated successfully");
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE WORKFLOW TRANSITION", url);
  }
}

/**
 * Delete a workflow transition
 */
export async function deleteWorkflowTransition(transitionId: string): Promise<APIResponse> {
  if (!transitionId) {
    return handleBadRequest("Transition ID is required");
  }

  const url = `/api/v1/simple-workflow-transitions/${transitionId}`;

  try {
    const response = await authenticatedApiClient({ method: "DELETE", url });

    revalidatePath("/dashboard/workflow/manage");
    return successResponse(response.data, "Workflow transition deleted successfully");
  } catch (error: any) {
    return handleError(error, "DELETE | DELETE WORKFLOW TRANSITION", url);
  }
}

// ============================================================================
// WORKFLOW APPROVALS
// ============================================================================

/**
 * Approve a workflow transition
 * POST /api/v1/simple-workflows/instances/{id}/approve
 */
export async function approveWorkflowTransition(
  instanceId: string,
  approvedBy: string,
  comments?: string
): Promise<APIResponse> {
  if (!instanceId) {
    return handleBadRequest("Instance ID is required");
  }

  if (!approvedBy) {
    return handleBadRequest("Approved by user ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/simple-workflows/instances/${instanceId}/approve`,
      data: {
        approved_by: approvedBy,
        comments
      }
    });

    revalidatePath("/dashboard/workflow/manage");
    return successResponse(
      response.data?.data || response.data,
      "Workflow instance approved successfully"
    );
  } catch (error: any) {
    return handleError(
      error,
      "POST | APPROVE INSTANCE",
      `/api/v1/simple-workflows/instances/${instanceId}/approve`
    );
  }
}

/**
 * Reject a workflow transition
 * POST /api/v1/simple-workflows/instances/{id}/reject
 */
export async function rejectWorkflowTransition(
  instanceId: string,
  rejectedBy: string,
  reason: string
): Promise<APIResponse> {
  if (!instanceId) {
    return handleBadRequest("Instance ID is required");
  }

  if (!rejectedBy) {
    return handleBadRequest("Rejected by user ID is required");
  }

  if (!reason) {
    return handleBadRequest("Rejection reason is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/simple-workflows/instances/${instanceId}/reject`,
      data: {
        rejected_by: rejectedBy,
        reason
      }
    });

    revalidatePath("/dashboard/workflow/manage");
    return successResponse(
      response.data?.data || response.data,
      "Workflow instance rejected successfully"
    );
  } catch (error: any) {
    return handleError(
      error,
      "POST | REJECT INSTANCE",
      `/api/v1/simple-workflows/instances/${instanceId}/reject`
    );
  }
}

/**
 * Get pending approvals for an instance
 * GET /api/v1/simple-workflows/instances/{id}/approvals
 */
export async function getWorkflowApprovals(instanceId: string): Promise<APIResponse> {
  if (!instanceId) {
    return handleBadRequest("Instance ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/simple-workflows/instances/${instanceId}/approvals`
    });

    return successResponse(response.data?.data || [], "Workflow approvals fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | WORKFLOW APPROVALS",
      `/api/v1/simple-workflows/instances/${instanceId}/approvals`
    );
  }
}
