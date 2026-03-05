/**
 * Workflow Tasks Hooks
 *
 * Custom React Query hooks for managing workflow tasks data and mutations.
 * Provides proper caching, synchronization, and error handling.
 *
 * @module use-workflow-tasks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  getUserAssignedWorkflowTasks,
  getWorkflowInstanceTasks,
  getWorkflowInstances,
  completeWorkflowTask,
  reassignTask
} from "@/app/_actions/task-actions";

/**
 * Hook to fetch workflow tasks assigned to the current user
 * Tasks are user-assigned items that require action from the logged-in user
 *
 * @param params - Pagination and filter parameters
 * @returns Query result with tasks data, loading state, and error
 */
export function useUserAssignedWorkflowTasks(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  entity_id?: string;
}) {
  return useQuery({
    queryKey: ["user-workflow-tasks", params?.page, params?.page_size, params?.status, params?.entity_id],
    queryFn: async () => {
      const response = await getUserAssignedWorkflowTasks({
        page: String(params?.page || 1),
        page_size: String(params?.page_size || 15),
        status: params?.status,
        entity_id: params?.entity_id
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch user workflow tasks");
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    refetchOnWindowFocus: false
  });
}

/**
 * Hook to fetch all workflow instances with pagination
 * Instances are active/pending workflow executions available to all authorized users
 *
 * @param params - Pagination and filter parameters
 * @returns Query result with instances data, loading state, and error
 */
export function useWorkflowInstances(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  entity_id?: string;
}) {
  return useQuery({
    queryKey: ["workflow-instances", params?.page, params?.page_size, params?.status, params?.entity_id],
    queryFn: async () => {
      const response = await getWorkflowInstances({
        page: String(params?.page || 1),
        page_size: String(params?.page_size || 15),
        status: params?.status,
        entity_id: params?.entity_id
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch workflow instances");
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    refetchOnWindowFocus: false
  });
}

/**
 * Hook to fetch workflow tasks for a specific workflow instance
 * Tasks are related to a particular workflow execution
 *
 * @param instanceId - The workflow instance ID
 * @param params - Pagination parameters
 * @returns Query result with tasks data, loading state, and error
 */
export function useWorkflowInstanceTasks(
  instanceId?: string,
  params?: {
    page?: number;
    page_size?: number;
  }
) {
  return useQuery({
    queryKey: ["workflow-instance-tasks", instanceId, params?.page, params?.page_size],
    queryFn: async () => {
      if (!instanceId) {
        throw new Error("Instance ID is required");
      }

      const response = await getWorkflowInstanceTasks(instanceId, {
        page: String(params?.page || 1),
        page_size: String(params?.page_size || 10)
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch workflow instance tasks");
      }

      return response.data;
    },
    enabled: !!instanceId, // Only run query if instanceId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
}

/**
 * Mutation hook to complete a workflow task
 * Allows marking a task as approved or rejected with remarks
 *
 * @returns Mutation object with mutate function and state
 */
export function useCompleteWorkflowTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: string;
      action: "APPROVED" | "REJECTED";
      remarks?: string;
    }) => {
      const response = await completeWorkflowTask(params.taskId, params.action, params.remarks);

      if (!response.success) {
        throw new Error(response.message || "Failed to complete workflow task");
      }

      return response.data;
    },
    onSuccess: () => {
      notify({ description: "Workflow task completed successfully", type: "success" });

      // Invalidate related queries to trigger refresh
      queryClient.invalidateQueries({
        queryKey: ["user-workflow-tasks"]
      });
      queryClient.invalidateQueries({
        queryKey: ["workflow-instances"]
      });
      queryClient.invalidateQueries({
        queryKey: ["workflow-instance-tasks"]
      });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to complete workflow task", type: "error" });
    }
  });
}

/**
 * Mutation hook to reassign a workflow task to another user
 * Transfers task responsibility and updates task assignment
 *
 * @returns Mutation object with mutate function and state
 */
export function useReassignWorkflowTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { taskId: string; assignedToUserId: string; remarks?: string }) => {
      const response = await reassignTask(params.taskId, params.assignedToUserId, params.remarks);

      if (!response.success) {
        throw new Error(response.message || "Failed to reassign workflow task");
      }

      return response.data;
    },
    onSuccess: () => {
      notify({ description: "Workflow task reassigned successfully", type: "success" });

      // Invalidate related queries to trigger refresh
      queryClient.invalidateQueries({
        queryKey: ["user-workflow-tasks"]
      });
      queryClient.invalidateQueries({
        queryKey: ["workflow-instances"]
      });
      queryClient.invalidateQueries({
        queryKey: ["workflow-instance-tasks"]
      });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to reassign workflow task", type: "error" });
    }
  });
}

/**
 * Combined hook for all workflow task mutations
 * Useful when you need multiple mutations in a single component
 *
 * @returns Object containing all mutation hooks
 */
export function useWorkflowTaskMutations() {
  return {
    completeTask: useCompleteWorkflowTaskMutation(),
    reassignTask: useReassignWorkflowTaskMutation()
  };
}
