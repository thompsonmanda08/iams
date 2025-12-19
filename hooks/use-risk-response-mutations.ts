"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  createRiskResponse,
  updateRiskResponse,
  deleteRiskResponse
} from "@/app/_actions/config-actions";

/**
 * Hook to create a risk response
 * Used in: app/dashboard/system-configs/_components/create-risk-response-dialog.tsx
 *
 * Usage:
 * const { mutate: createResponse, isPending } = useCreateRiskResponseMutation({
 *   onSuccess: () => {
 *     setOpen(false);
 *   }
 * });
 *
 * createResponse({
 *   name: "Risk Transfer",
 *   description: "Transfer risk to third party...",
 *   response_type: "TRANSFER"
 * });
 */
export function useCreateRiskResponseMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createRiskResponse(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create risk response");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskResponses"] });
      notify({
        title: "Success",
        description: "Risk response created successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create risk response",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to update a risk response
 * Used in: app/dashboard/system-configs/_components/edit-risk-response-dialog.tsx
 *
 * Usage:
 * const { mutate: updateResponse, isPending } = useUpdateRiskResponseMutation({
 *   onSuccess: () => {
 *     setOpen(false);
 *   }
 * });
 *
 * updateResponse({
 *   id: "response-123",
 *   data: {
 *     name: "Updated Risk Transfer",
 *     description: "Updated description..."
 *   }
 * });
 */
export function useUpdateRiskResponseMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: any }) => {
      const result = await updateRiskResponse(params.id, params.data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update risk response");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskResponses"] });
      notify({
        title: "Success",
        description: "Risk response updated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update risk response",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to delete a risk response
 * Used in: Configuration components with delete functionality
 *
 * Usage:
 * const { mutate: deleteResponse, isPending } = useDeleteRiskResponseMutation({
 *   onSuccess: () => {
 *     setDeleteOpen(false);
 *   }
 * });
 *
 * deleteResponse(responseId);
 */
export function useDeleteRiskResponseMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (responseId: string) => {
      const result = await deleteRiskResponse(responseId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete risk response");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskResponses"] });
      notify({
        title: "Success",
        description: "Risk response deleted successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete risk response",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
