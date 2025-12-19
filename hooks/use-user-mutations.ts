"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  resetUserPassword
} from "@/app/_actions/user-actions";

/**
 * Hook to delete a user
 * Used in: app/dashboard/system-configs/users/data-table.tsx
 *
 * Usage:
 * const { mutate: removeUser, isPending } = useDeleteUserMutation({
 *   onSuccess: () => {
 *     setDeleteOpen(false);
 *   }
 * });
 *
 * removeUser(userId);
 */
export function useDeleteUserMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await deleteUser(userId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete user");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notify({
        title: "Success",
        description: "User deleted successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete user",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to activate a user
 * Used in: app/dashboard/system-configs/users/data-table.tsx
 *
 * Usage:
 * const { mutate: activateUser, isPending } = useActivateUserMutation({
 *   onSuccess: () => {
 *     setStatusOpen(false);
 *   }
 * });
 *
 * activateUser(userId);
 */
export function useActivateUserMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await activateUser(userId);
      if (!result.success) {
        throw new Error(result.message || "Failed to activate user");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notify({
        title: "Success",
        description: "User activated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to activate user",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to deactivate a user
 * Used in: app/dashboard/system-configs/users/data-table.tsx
 *
 * Usage:
 * const { mutate: deactivateUser, isPending } = useDeactivateUserMutation({
 *   onSuccess: () => {
 *     setStatusOpen(false);
 *   }
 * });
 *
 * deactivateUser(userId);
 */
export function useDeactivateUserMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await deactivateUser(userId);
      if (!result.success) {
        throw new Error(result.message || "Failed to deactivate user");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notify({
        title: "Success",
        description: "User deactivated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to deactivate user",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to reset user password
 * Used in: app/dashboard/system-configs/users/data-table.tsx
 *
 * Usage:
 * const { mutate: resetPassword, isPending } = useResetUserPasswordMutation({
 *   onSuccess: () => {
 *     setPasswordOpen(false);
 *   }
 * });
 *
 * resetPassword({
 *   userId: "user-123",
 *   password: "tempPassword123"
 * });
 */
export function useResetUserPasswordMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userId: string; password: string }) => {
      const result = await resetUserPassword(params.userId, params.password);
      if (!result.success) {
        throw new Error(result.message || "Failed to reset password");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notify({
        title: "Success",
        description: "User password reset successfully. New password has been sent to the user.",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to reset password",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
