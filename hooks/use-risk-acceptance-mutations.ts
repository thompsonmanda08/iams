"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils";
import {
  updateRiskAcceptance,
  submitRiskAcceptanceForApproval,
  getRiskAcceptances
} from "@/app/_actions/risk-module-actions";

/**
 * Hook to fetch all risk acceptances
 * Used in: risk-acceptances/page.tsx
 *
 * Usage:
 * const { data: acceptances, isLoading } = useRiskAcceptances();
 */
export function useRiskAcceptances() {
  return useQuery({
    queryKey: ["riskAcceptances"],
    queryFn: async () => {
      const response = await getRiskAcceptances();
      if (!response.status || !response.data?.acceptances) {
        throw new Error(response.message || "Failed to fetch risk acceptances");
      }
      return response.data.acceptances;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
}

/**
 * Hook to update a risk acceptance with status and remarks
 * Used in: risk-acceptances/page.tsx
 *
 * Usage:
 * const { mutate: updateAcceptance, isPending } = useUpdateRiskAcceptanceMutation({
 *   onSuccess: () => {
 *     setShowModal(false);
 *     setSelectedAcceptance(null);
 *   }
 * });
 *
 * updateAcceptance({
 *   id: "acceptance-123",
 *   data: { acceptance_status: "APPROVED", additional_remarks: "..." }
 * });
 */
export function useUpdateRiskAcceptanceMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: any }) => {
      const result = await updateRiskAcceptance(params.id, params.data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update risk acceptance");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskAcceptances"] });
      notify({
        title: "Success",
        description: "Risk acceptance updated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update risk acceptance",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to submit a risk acceptance for approval
 * Used in: risk-acceptances/page.tsx
 *
 * Usage:
 * const { mutate: submitAcceptance, isPending } = useSubmitRiskAcceptanceMutation({
 *   onSuccess: () => {
 *     router.refresh();
 *   }
 * });
 *
 * submitAcceptance("acceptance-123");
 */
export function useSubmitRiskAcceptanceMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (acceptanceId: string) => {
      const result = await submitRiskAcceptanceForApproval(acceptanceId);
      if (!result.success) {
        throw new Error(result.message || "Failed to submit risk acceptance for approval");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskAcceptances"] });
      notify({
        title: "Success",
        description: "Risk acceptance submitted for approval successfully",
        type: "success"
      });
      options?.onSuccess?.();
      router.refresh();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit risk acceptance for approval",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
