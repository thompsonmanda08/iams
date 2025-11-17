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
// TASK ACTIONS
// ============================================================================

/**
 * Get all tasks with optional filters
 */
export async function getTasks(filters?: {
  page: string;
  page_size: string;
  workflow_id: string;
  entity_id: string;
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
 * Get single task by ID
 */
export async function getTask(id: string): Promise<APIResponse> {
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
 * Approve a task
 */
export async function approveTask(instance_id: string, remarks?: string): Promise<APIResponse> {
  if (!instance_id) {
    return handleBadRequest("Task ID is required");
  }

  const url = `/api/v1/simple-workflows/instances/${instance_id}/approve`;

  try {
    const response = await authenticatedApiClient({ method: "POST", url, data: { remarks } });

    revalidatePath("/dashboard/audit/tasks");
    return successResponse(response.data, "Task approved successfully");
  } catch (error: any) {
    return handleError(error, "POST | APPROVE TASK", url);
  }
}

/**
 * Reject a task
 */
export async function rejectTask(instance_id: string, remarks?: string): Promise<APIResponse> {
  if (!instance_id) {
    return handleBadRequest("Task ID is required");
  }

  const url = `/api/v1/simple-workflows/instances/${instance_id}/reject`;

  try {
    const response = await authenticatedApiClient({ method: "POST", url, data: { remarks } });

    revalidatePath("/dashboard/audit/tasks");
    return successResponse(response.data, "Task rejected successfully");
  } catch (error: any) {
    return handleError(error, "POST | REJECT TASK", url);
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
 * Execute task action (approve, reject, or reassign)
 */
export async function executeTaskAction(request: {
  instance_id: string;
  action: string;
  require_role_id: string;
  comment?: string;
}): Promise<APIResponse> {
  const { instance_id, action, comment, require_role_id } = request;

  if (!instance_id) {
    return handleBadRequest("Task ID is required");
  }

  if (!action) {
    return handleBadRequest("Action is required");
  }

  switch (action) {
    case "APPROVE":
      return approveTask(instance_id, comment);

    case "REJECT":
      return rejectTask(instance_id, comment);

    case "REASSIGN":
      if (!require_role_id) {
        return handleBadRequest("User ID to reassign to is required for REASSIGN action");
      }
      return reassignTask(instance_id, require_role_id, comment);

    default:
      return handleBadRequest(`Invalid action: ${action}`);
  }
}

/**
 * Get task statistics for current user (MOCK)
 */
export async function getTaskStats(): Promise<APIResponse> {
  try {
    // const response = await authenticatedApiClient({
    //   method: "GET",
    //   url: "/api/v1/workflow/tasks/stats"
    // });

    return successResponse([], "Task statistics fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | TASK STATS", "/api/v1/workflow/tasks/stats");
  }
}
