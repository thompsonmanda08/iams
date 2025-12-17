"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils";
import {
  handleSaveFinding,
  handleUpdateFinding,
  handleUpdateFindingStatus,
  handleClearFinding
} from "@/app/_actions/finding-actions";

/**
 * Hook to save a new finding
 *
 * Usage:
 * const { mutate: saveFinding, isPending } = useSaveFindingMutation({
 *   onSuccess: () => {
 *     // Handle success
 *   }
 * });
 *
 * saveFinding({
 *   auditPlanId: "plan-123",
 *   workingPaperId: "paper-456",
 *   finding: { ... }
 * });
 */
export function useSaveFindingMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const router = useRouter();

  return useMutation({
    mutationFn: async (params: {
      auditPlanId: string;
      workingPaperId: string;
      finding: any;
    }) => {
      await handleSaveFinding(params.auditPlanId, params.workingPaperId, params.finding);
    },
    onSuccess: () => {
      notify({
        title: "Finding created",
        description: "The finding has been created successfully",
        type: "success"
      });
      router.refresh();
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to update an existing finding
 *
 * Usage:
 * const { mutate: updateFinding, isPending } = useUpdateFindingMutation({
 *   onSuccess: () => {
 *     // Handle success
 *   }
 * });
 *
 * updateFinding({
 *   findingId: "finding-123",
 *   finding: { ... }
 * });
 */
export function useUpdateFindingMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const router = useRouter();

  return useMutation({
    mutationFn: async (params: { findingId: string; finding: any }) => {
      await handleUpdateFinding(params.findingId, params.finding);
    },
    onSuccess: () => {
      notify({
        title: "Finding updated",
        description: "The finding has been updated successfully",
        type: "success"
      });
      router.refresh();
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to update finding status
 *
 * Usage:
 * const { mutate: updateStatus, isPending } = useUpdateFindingStatusMutation({
 *   onSuccess: () => {
 *     // Handle success
 *   }
 * });
 *
 * updateStatus({
 *   findingId: "finding-123",
 *   status: "RESOLVED"
 * });
 */
export function useUpdateFindingStatusMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const router = useRouter();

  return useMutation({
    mutationFn: async (params: { findingId: string; status: string }) => {
      await handleUpdateFindingStatus(params.findingId, params.status);
    },
    onSuccess: () => {
      notify({
        title: "Status updated",
        description: "The finding status has been updated successfully",
        type: "success"
      });
      router.refresh();
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to clear a finding
 *
 * Usage:
 * const { mutate: clearFinding, isPending } = useClearFindingMutation({
 *   onSuccess: () => {
 *     // Handle success
 *   }
 * });
 *
 * clearFinding("finding-123");
 */
export function useClearFindingMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const router = useRouter();

  return useMutation({
    mutationFn: async (findingId: string) => {
      await handleClearFinding(findingId);
    },
    onSuccess: () => {
      notify({
        title: "Finding cleared",
        description: "All finding details have been reset to empty/default values",
        type: "success"
      });
      router.refresh();
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
