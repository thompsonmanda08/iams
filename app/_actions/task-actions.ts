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
import type { Task, TaskActionRequest, TaskFilters } from "@/lib/types/task";
import { handleBadRequest, handleError, successResponse } from "./api-config";
import authenticatedApiClient from "./api-config";

// ============================================================================
// TASK ACTIONS
// ============================================================================

/**
 * Get all tasks with optional filters
 */
export async function getTasks(filters?: TaskFilters): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.entityType) params.append("entity_type", filters.entityType);
    if (filters?.assignedUserId) params.append("assigned_user_id", filters.assignedUserId);
    if (filters?.requiredRole) params.append("required_role", filters.requiredRole);

    const queryString = params.toString();
    const url = `/api/v1/workflow/tasks${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

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

  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: `/api/v1/workflow/tasks/${id}`
    });

    return successResponse(response.data, "Task fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | TASK", `/api/v1/workflow/tasks/${id}`);
  }
}

/**
 * Get tasks assigned to current user
 */
export async function getMyTasks(filters?: Omit<TaskFilters, "assignedUserId">): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.entityType) params.append("entity_type", filters.entityType);
    if (filters?.requiredRole) params.append("required_role", filters.requiredRole);

    const queryString = params.toString();
    const url = `/api/v1/workflow/tasks/my-tasks${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({
      method: "GET",
      url
    });

    return successResponse(response.data?.data || [], "My tasks fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | MY TASKS", "/api/v1/workflow/tasks/my-tasks");
  }
}

/**
 * Approve a task
 */
export async function approveTask(taskId: string, comment?: string): Promise<APIResponse> {
  if (!taskId) {
    return handleBadRequest("Task ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/workflow/tasks/${taskId}/approve`,
      data: { comment }
    });

    revalidatePath("/dashboard/audit/tasks");
    return successResponse(response.data, "Task approved successfully");
  } catch (error: any) {
    return handleError(error, "POST | APPROVE TASK", `/api/v1/workflow/tasks/${taskId}/approve`);
  }
}

/**
 * Reject a task
 */
export async function rejectTask(taskId: string, comment?: string): Promise<APIResponse> {
  if (!taskId) {
    return handleBadRequest("Task ID is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/workflow/tasks/${taskId}/reject`,
      data: { comment }
    });

    revalidatePath("/dashboard/audit/tasks");
    return successResponse(response.data, "Task rejected successfully");
  } catch (error: any) {
    return handleError(error, "POST | REJECT TASK", `/api/v1/workflow/tasks/${taskId}/reject`);
  }
}

/**
 * Reassign a task to another user
 */
export async function reassignTask(
  taskId: string,
  reassignToUserId: string,
  comment?: string
): Promise<APIResponse> {
  if (!taskId) {
    return handleBadRequest("Task ID is required");
  }

  if (!reassignToUserId) {
    return handleBadRequest("User ID to reassign to is required");
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url: `/api/v1/workflow/tasks/${taskId}/reassign`,
      data: {
        reassign_to_user_id: reassignToUserId,
        comment
      }
    });

    revalidatePath("/dashboard/audit/tasks");
    return successResponse(response.data, "Task reassigned successfully");
  } catch (error: any) {
    return handleError(error, "POST | REASSIGN TASK", `/api/v1/workflow/tasks/${taskId}/reassign`);
  }
}

/**
 * Execute task action (approve, reject, or reassign)
 */
export async function executeTaskAction(request: TaskActionRequest): Promise<APIResponse> {
  const { taskId, action, comment, reassignToUserId } = request;

  if (!taskId) {
    return handleBadRequest("Task ID is required");
  }

  if (!action) {
    return handleBadRequest("Action is required");
  }

  switch (action) {
    case "APPROVE":
      return approveTask(taskId, comment);

    case "REJECT":
      return rejectTask(taskId, comment);

    case "REASSIGN":
      if (!reassignToUserId) {
        return handleBadRequest("User ID to reassign to is required for REASSIGN action");
      }
      return reassignTask(taskId, reassignToUserId, comment);

    default:
      return handleBadRequest(`Invalid action: ${action}`);
  }
}

/**
 * Get task statistics for current user
 */
export async function getTaskStats(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      method: "GET",
      url: "/api/v1/workflow/tasks/stats"
    });

    return successResponse(response.data, "Task statistics fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | TASK STATS", "/api/v1/workflow/tasks/stats");
  }
}
