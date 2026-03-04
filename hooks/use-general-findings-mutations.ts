"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import {
  createGeneralFinding,
  updateGeneralFinding,
  deleteGeneralFinding,
  submitGeneralFinding,
  submitGeneralWorkpaperForApproval,
  updateWorkpaperMetadata
} from "@/app/_actions/general-findings-actions";

// ============================================================================
// GENERAL WORK PAPER FINDINGS MUTATIONS
// ============================================================================

/**
 * Hook to create a general finding (auto-save — no success toast)
 */
export function useCreateGeneralFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      audit_plan_id: string;
      working_paper_id: string;
      columns: Record<string, any>[];
      keys: Record<string, any>[];
      audit_observation?: string;
      audit_comments?: string;
      evidence?: string;
      status?: string;
    }) => {
      const result = await createGeneralFinding(data);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GENERAL_FINDINGS, variables.working_paper_id]
      });
      // Silent — auto-save should not show toasts
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to save finding",
        type: "error"
      });
    }
  });
}

/**
 * Hook to update a general finding (auto-save — no success toast)
 */
export function useUpdateGeneralFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      findingId: string;
      data: {
        columns?: Record<string, any>[];
        keys?: Record<string, any>[];
        audit_observation?: string;
        audit_comments?: string;
        evidence?: string;
        status?: string;
      };
      workingPaperId: string;
    }) => {
      const result = await updateGeneralFinding(params.findingId, params.data);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GENERAL_FINDINGS, variables.workingPaperId]
      });
      // Silent — auto-save should not show toasts
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update finding",
        type: "error"
      });
    }
  });
}

/**
 * Hook to delete a general finding
 */
export function useDeleteGeneralFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { findingId: string; workingPaperId: string }) => {
      const result = await deleteGeneralFinding(params.findingId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GENERAL_FINDINGS, variables.workingPaperId]
      });
      notify({
        title: "Success",
        description: "Finding deleted successfully"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete finding",
        type: "error"
      });
    }
  });
}

/**
 * Hook to submit a single general finding for approval
 */
export function useSubmitGeneralFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { findingId: string; workingPaperId: string }) => {
      const result = await submitGeneralFinding(params.findingId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GENERAL_FINDINGS, variables.workingPaperId]
      });
      notify({
        title: "Success",
        description: "Finding submitted for approval"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit finding",
        type: "error"
      });
    }
  });
}

/**
 * Hook to submit entire general workpaper for approval
 * TODO: Uncomment when API endpoint is ready
 */
export function useSubmitGeneralWorkpaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { workingPaperId: string }) => {
      const result = await submitGeneralWorkpaperForApproval(params.workingPaperId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GENERAL_FINDINGS, variables.workingPaperId]
      });
      notify({
        title: "Success",
        description: "Workpaper submitted for approval"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit workpaper",
        type: "error"
      });
    }
  });
}

// ============================================================================
// WORKPAPER METADATA MUTATION
// ============================================================================

/**
 * Hook to update workpaper metadata (work done, conclusion, etc.)
 */
export function useUpdateWorkpaperMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { workingPaperId: string; metadata: Record<string, any> }) => {
      const result = await updateWorkpaperMetadata(params.workingPaperId, params.metadata);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GENERAL_FINDINGS, variables.workingPaperId]
      });
      notify({
        title: "Success",
        description: "Workpaper metadata saved successfully"
      });
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to save workpaper metadata",
        type: "error"
      });
    }
  });
}
