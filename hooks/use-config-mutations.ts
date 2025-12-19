"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  createEffectivenessLevel,
  updateEffectivenessLevel,
  createRiskMatrix,
  updateRiskMatrix,
  deleteRiskMatrix,
  createBusinessProcess,
  updateBusinessProcess,
  deleteBusinessProcess
} from "@/app/_actions/config-actions";

// ============================================================================
// CONTROL EFFECTIVENESS MUTATIONS
// ============================================================================

/**
 * Hook to create a control effectiveness level
 * Used in: app/dashboard/system-configs/_components/control-effectiveness-dialog.tsx
 *
 * Usage:
 * const { mutate: createLevel, isPending } = useCreateEffectivenessLevelMutation({
 *   onSuccess: () => setOpen(false);
 * });
 *
 * createLevel({
 *   name: "Effective",
 *   description: "..."
 * });
 */
export function useCreateEffectivenessLevelMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createEffectivenessLevel(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create effectiveness level");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["effectivenessLevels"] });
      notify({
        title: "Success",
        description: "Effectiveness level created successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create effectiveness level",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to update a control effectiveness level
 * Used in: app/dashboard/system-configs/_components/control-effectiveness-dialog.tsx
 *
 * Usage:
 * const { mutate: updateLevel, isPending } = useUpdateEffectivenessLevelMutation({
 *   onSuccess: () => setOpen(false);
 * });
 *
 * updateLevel({
 *   id: "level-123",
 *   data: { name: "...", ... }
 * });
 */
export function useUpdateEffectivenessLevelMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: any }) => {
      const result = await updateEffectivenessLevel(params.id, params.data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update effectiveness level");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["effectivenessLevels"] });
      notify({
        title: "Success",
        description: "Effectiveness level updated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update effectiveness level",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

// ============================================================================
// RISK MATRIX MUTATIONS
// ============================================================================

/**
 * Hook to create a risk matrix
 * Used in: app/dashboard/system-configs/_components/create-risk-matrix-dialog.tsx
 *
 * Usage:
 * const { mutate: createMatrix, isPending } = useCreateRiskMatrixMutation({
 *   onSuccess: () => setOpen(false);
 * });
 *
 * createMatrix({
 *   name: "Risk Matrix",
 *   description: "...",
 *   ...
 * });
 */
export function useCreateRiskMatrixMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createRiskMatrix(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create risk matrix");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskMatrices"] });
      notify({
        title: "Success",
        description: "Risk matrix created successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create risk matrix",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to update a risk matrix
 */
export function useUpdateRiskMatrixMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: any }) => {
      const result = await updateRiskMatrix(params.id, params.data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update risk matrix");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskMatrices"] });
      notify({
        title: "Success",
        description: "Risk matrix updated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update risk matrix",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to delete a risk matrix
 */
export function useDeleteRiskMatrixMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matrixId: string) => {
      const result = await deleteRiskMatrix(matrixId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete risk matrix");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskMatrices"] });
      notify({
        title: "Success",
        description: "Risk matrix deleted successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete risk matrix",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

// ============================================================================
// BUSINESS PROCESS MUTATIONS
// ============================================================================

/**
 * Hook to create a business process
 * Used in: app/dashboard/system-configs/_components/business-process-list.tsx
 */
export function useCreateBusinessProcessMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createBusinessProcess(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create business process");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessProcesses"] });
      notify({
        title: "Success",
        description: "Business process created successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create business process",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to update a business process
 */
export function useUpdateBusinessProcessMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: any }) => {
      const result = await updateBusinessProcess(params.id, params.data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update business process");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessProcesses"] });
      notify({
        title: "Success",
        description: "Business process updated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update business process",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to delete a business process
 */
export function useDeleteBusinessProcessMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (processId: string) => {
      const result = await deleteBusinessProcess(processId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete business process");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessProcesses"] });
      notify({
        title: "Success",
        description: "Business process deleted successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete business process",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
