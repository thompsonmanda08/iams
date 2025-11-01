/**
 * Task Management Server Actions (Simulation Version)
 *
 * This file provides simulated task actions using Zustand stores
 * instead of real API calls. This allows for end-to-end testing
 * of the workflow system without backend implementation.
 *
 * @module task-actions-simulation
 */

"use server";

import type { APIResponse } from "@/lib/types";
import { successResponse } from "./api-config";

/**
 * Note: These are placeholder server actions for simulation.
 * The actual simulation logic is handled client-side using Zustand stores.
 * These functions return mock success responses to maintain the API contract.
 */

export async function getTasksSimulation(): Promise<APIResponse> {
  return successResponse([], "Tasks fetched (simulation mode)");
}

export async function getTaskStatsSimulation(): Promise<APIResponse> {
  return successResponse(
    { pending: 0, inProgress: 0, completed: 0, rejected: 0 },
    "Task stats fetched (simulation mode)"
  );
}

export async function approveTaskSimulation(taskId: string, comment?: string): Promise<APIResponse> {
  return successResponse({ taskId, comment }, "Task approved (simulation mode)");
}

export async function rejectTaskSimulation(taskId: string, comment?: string): Promise<APIResponse> {
  return successResponse({ taskId, comment }, "Task rejected (simulation mode)");
}

export async function reassignTaskSimulation(
  taskId: string,
  reassignToUserId: string,
  comment?: string
): Promise<APIResponse> {
  return successResponse(
    { taskId, reassignToUserId, comment },
    "Task reassigned (simulation mode)"
  );
}
