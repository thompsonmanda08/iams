"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils";
import { completeWorkflowTask, reassignTask } from "@/app/_actions/task-actions";
import { getUsers } from "@/app/_actions/user-actions";

/**
 * Hook to complete/approve/reject a workflow task
 * Used in: task-action-dialog.tsx
 *
 * Usage:
 * const { mutate: completeTask, isPending } = useCompleteWorkflowTaskMutation({
 *   onSuccess: () => {
 *     onOpenChange(false);
 *     setComment("");
 *   }
 * });
 *
 * completeTask({
 *   taskId: "task-123",
 *   action: "APPROVED",
 *   comment: "Looks good!"
 * });
 */
export function useCompleteWorkflowTaskMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (params: {
      taskId: string;
      action: "APPROVED" | "REJECTED";
      comment?: string;
    }) => {
      const result = await completeWorkflowTask(params.taskId, params.action, params.comment);
      if (!result?.success) {
        throw new Error(result?.message || "Failed to complete task");
      }
      return result;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-workflow-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-instances"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-instance-tasks"] });
      const actionLabel = variables.action === "APPROVED" ? "approved" : "rejected";
      notify({
        title: "Success",
        description: response?.message || `Task ${actionLabel} successfully!`,
        type: "success"
      });
      options?.onSuccess?.();
      router.refresh();
    },
    onError: (error: Error, variables) => {
      const actionLabel = variables.action === "APPROVED" ? "approve" : "reject";
      notify({
        title: "Error",
        description: error.message || `Failed to ${actionLabel} task`,
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to fetch users with a specific role for task reassignment
 * Used in: task-reassign-dialog.tsx
 *
 * Usage:
 * const { data: users, isLoading } = useUsersWithRole(task.requiredRole);
 */
export function useUsersWithRole(role: string | undefined) {
  return useQuery({
    queryKey: ["users-role", role],
    queryFn: async () => {
      if (!role) return [];
      const result = await getUsers({ role });
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch users");
      }
      return result.data || [];
    },
    enabled: !!role,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Hook to reassign a task to another user
 * Used in: task-reassign-dialog.tsx
 *
 * Usage:
 * const { mutate: reassign, isPending } = useReassignTaskMutation({
 *   onSuccess: () => {
 *     onOpenChange(false);
 *   }
 * });
 *
 * reassign({
 *   taskId: "task-123",
 *   userId: "user-456",
 *   comment: "Reassigning for review"
 * });
 */
export function useReassignTaskMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (params: {
      taskId: string;
      userId: string;
      comment?: string;
    }) => {
      const result = await reassignTask(params.taskId, params.userId, params.comment);
      if (!result?.success) {
        throw new Error(result?.message || "Failed to reassign task");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-workflow-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-instances"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-instance-tasks"] });
      notify({
        title: "Success",
        description: "Task reassigned successfully",
        type: "success"
      });
      options?.onSuccess?.();
      router.refresh();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to reassign task",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
