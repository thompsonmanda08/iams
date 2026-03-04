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
import { cache } from "react";
import type { APIResponse } from "@/lib/types";
import { handleBadRequest, handleError, successResponse } from "./api-config";
import authenticatedApiClient from "./api-config";

// ============================================================================
// WORKFLOW INSTANCES
// ============================================================================

/**
 * Get all workflow instances with optional filters (internal - with caching)
 */
async function _getWorkflowInstances(filters?: {
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

    return successResponse(response.data, "Tasks fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | TASKS", "/api/v1/workflow/tasks");
  }
}

/**
 * Get all workflow instances with optional filters (cached for request deduplication)
 */
export const getWorkflowInstances = cache(_getWorkflowInstances);

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

    revalidatePath("/dashboard/workflows/approvals");
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
 * Get approvals log for a workflow instance (internal - with caching)
 */
async function _getApprovalsLog(
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

/**
 * Get approvals log for a workflow instance (cached for request deduplication)
 */
export const getApprovalsLog = cache(_getApprovalsLog);

// ============================================================================
// WORKFLOW TASKS ACTIONS (User-Assigned Tasks)
// ============================================================================

/**
 * Get all workflow tasks assigned to the current user (internal - with caching)
 * These are tasks that require action from the logged-in user
 */
async function _getUserAssignedWorkflowTasks(filters?: {
  page?: string;
  page_size?: string;
  status?: string;
  entity_id?: string;
}): Promise<APIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page);
    if (filters?.page_size) params.append("page_size", filters.page_size);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.entity_id) params.append("entity_id", filters.entity_id);

    const queryString = params.toString();
    const url = `/api/v1/workflow-tasks/user${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedApiClient({ method: "GET", url });

    return successResponse(response.data, "User workflow tasks fetched successfully");
  } catch (error: any) {
    return handleError(error, "GET | USER WORKFLOW TASKS", "/api/v1/workflow-tasks/user");
  }
}

/**
 * Get all workflow tasks assigned to the current user (cached for request deduplication)
 */
export const getUserAssignedWorkflowTasks = cache(_getUserAssignedWorkflowTasks);

/**
 * Get all workflow tasks for a specific workflow instance (internal - with caching)
 * These are the tasks related to a particular workflow execution
 */
async function _getWorkflowInstanceTasks(
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
 * Get all workflow tasks for a specific workflow instance (cached for request deduplication)
 */
export const getWorkflowInstanceTasks = cache(_getWorkflowInstanceTasks);

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

  if (!remarks) {
    return handleBadRequest("Remarks is required for an action");
  }

  let url = "";

  if (action == "REJECTED") {
    url = `/api/v1/workflow-tasks/${taskId}/reject`;
  } else {
    url = `/api/v1/workflow-tasks/${taskId}/approve`;
  }

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url,
      data: {
        remarks
      }
    });

    revalidatePath("/dashboard/workflows/approvals");
    revalidatePath("/dashboard/audit/tasks");
    return successResponse(response.data, `Workflow task completed with action: ${action}`);
  } catch (error: any) {
    return handleError(error, "POST | COMPLETE WORKFLOW TASK", url);
  }
}

// ============================================================================
// RISK ACTIONS REMINDERS
// ============================================================================

/**
 * Send a reminder for a risk action
 * Endpoint: POST /api/v1/risk-actions/{risk_action_id}/remind
 * Sends a notification to the assigned executor/reviewer about the pending action
 */
export async function sendRiskActionReminder(riskActionId: string): Promise<APIResponse> {
  if (!riskActionId) {
    return handleBadRequest("Risk action ID is required");
  }

  const url = `/api/v1/risk-actions/${riskActionId}/remind`;

  try {
    const response = await authenticatedApiClient({
      method: "POST",
      url,
      data: {}
    });

    revalidatePath("/dashboard/actions/risk");
    return successResponse(
      response.data,
      "Reminder sent successfully to the assigned user"
    );
  } catch (error: any) {
    return handleError(error, "POST | SEND RISK ACTION REMINDER", url);
  }
}
