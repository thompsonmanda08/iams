/**
 * Task Management Server Actions
 *
 * This file contains all server-side actions for workflow task management.
 * Tasks are generated when a workflow transition requires user action.
 *
 * @module task-actions
 */

"use server";

import { revalidatePath } from "next/cache";
import type { APIResponse } from "@/lib/types";
import { handleBadRequest, handleError, successResponse } from "./api-config";
import authenticatedApiClient from "./api-config";

// ============================================================================
// WORKFLOW INSTANCES
// ============================================================================

/**
 * Get all  workflow instances with optional filters
 */
export async function getWorkflowInstances(filters?: {
  page?: string;
  page_size?: string;
  workflow_id?: string;
  entity_id?: string;
}): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page);
    if (filters?.page_size) params.append("page_size", filters.page_size);
    if (filters?.workflow_id) params.append("workflow_id", filters.workflow_id);
    if (filters?.entity_id) params.append("entity_id", filters.entity_id);

    const queryString = params.toString();
    const url = `/api/v1/simple-workflows/instances${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({ method: "GET", url });

    return successResponse(response.data?.data || [], "Tasks fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | TASKS", "/api/v1/workflow/tasks");
  }
}

/**
 * Get single workflow instance by ID
 */
export async function getWorkflowInstanceById(id: string): Promise<APIResponse> {
  if (!id) {
    return handleBadRequest("Task ID is required");
  }

  const url = `/api/v1/simple-workflows/instances/${id}`;

  try {
    const response = await authenticatedApiClient({ method: "GET", url });

    return successResponse(response.data, "Task fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | TASK", `/api/v1/workflow/tasks/${id}`);
  }
}

/**
 * Reassign a task to another user
 */
export async function reassignTask(
  instance_id: string,
  require_role_id: string,
  comment?: string
): Promise<APIResponse> {
  if (!instance_id) {
    return handleBadRequest("Task ID is required");
  }

  if (!require_role_id) {
    return handleBadRequest("User ID to reassign to is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/workflow/tasks/${instance_id}/reassign`,
      data: {
        reassign_to_user_id: require_role_id,
        comment
      }
    });

    revalidatePath("/dashboard/audit/tasks");
    return successResponse(response.data, "Task reassigned successfully");
  } catch (error: any) {
    return handleError(
      error,
      "POST | REASSIGN TASK",
      `/api/v1/workflow/tasks/${instance_id}/reassign`
    );
  }
}

/**
 * Get approvals log for a workflow instance
 */
export async function getApprovalsLog(
  instanceId: string,
  filters?: {
    page?: string;
    page_size?: string;
  }
): Promise<APIResponse> {
  if (!instanceId) {
    return handleBadRequest("Instance ID is required");
  }

  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page);
    if (filters?.page_size) params.append("page_size", filters.page_size);

    const queryString = params.toString();
    const url = `/api/v1/simple-workflows/instances/${instanceId}/approvals${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({ method: "GET", url });

    return successResponse(response.data, "Approvals log fetched successfully");
  } catch (error: any) {
    return handleError(
      error,
      "GET | APPROVALS LOG",
      `/api/v1/simple-workflows/instances/${instanceId}/approvals`
    );
  }
}

// ============================================================================
// WORKFLOW TASKS ACTIONS (User-Assigned Tasks)
// ============================================================================

/**
 * Get all workflow tasks assigned to the current user
 * These are tasks that require action from the logged-in user
 */
export async function getUserAssignedWorkflowTasks(filters?: {
  page?: string;
  page_size?: string;
  status?: string;
}): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page);
    if (filters?.page_size) params.append("page_size", filters.page_size);
    if (filters?.status) params.append("status", filters.status);

    const queryString = params.toString();
    const url = `/api/v1/workflow-tasks/user${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({ method: "GET", url });

    return successResponse(response.data?.data || [], "User workflow tasks fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | USER WORKFLOW TASKS", "/api/v1/workflow-tasks/user");
  }
}

/**
 * Get all workflow tasks for a specific workflow instance
 * These are the tasks related to a particular workflow execution
 */
export async function getWorkflowInstanceTasks(
  instanceId: string,
  filters?: {
    page?: string;
    page_size?: string;
  }
): Promise<APIResponse> {
  if (!instanceId) {
    return handleBadRequest("Instance ID is required");
  }

  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page);
    if (filters?.page_size) params.append("page_size", filters.page_size);

    const queryString = params.toString();
    const url = `/api/v1/workflow-tasks/instance/${instanceId}${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({ method: "GET", url });

    return successResponse(
      response.data?.data || [],
      "Workflow instance tasks fetched successfully"
    );
  } catch (error: any) {
    return handleError(
      error,
      "GET | WORKFLOW INSTANCE TASKS",
      `/api/v1/workflow-tasks/instance/${instanceId}`
    );
  }
}

/**
 * Complete a workflow task (approve or reject)
 * Executes the task with the specified action and optional remarks
 */
export async function completeWorkflowTask(
  taskId: string,
  action: "APPROVED" | "REJECTED",
  remarks?: string
): Promise<APIResponse> {
  if (!taskId) {
    return handleBadRequest("Task ID is required");
  }

  if (!action || !["APPROVED", "REJECTED"].includes(action)) {
    return handleBadRequest("Valid action (APPROVED or REJECTED) is required");
  }

  const url = `/api/v1/workflow-tasks/${taskId}/complete`;

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url,
      data: {
        action,
        remarks
      }
    });

    revalidatePath("/dashboard/audit/tasks");
    return successResponse(response.data, `Workflow task completed with action: ${action}`);
  } catch (error: any) {
    return handleError(error, "POST | COMPLETE WORKFLOW TASK", url);
  }
}
