/**
 * Risk Module TanStack Query Hooks
 *
 * This file contains all React Query hooks for the risk module,
 * including hooks for risks, risk categories, and risk registers.
 *
 * These hooks can be reused across the application for client-side data fetching.
 */

import { useQuery } from "@tanstack/react-query";
import { getRisks } from "@/app/_actions/risk-module-actions";
import { QUERY_KEYS } from "@/lib/constants";
import { getRiskMatrices, getEffectivenessLevels } from "@/app/_actions/config-actions";
import { RiskMatrix, RiskControls } from "@/lib/types/risk-type";

/**
 * Fetch risk matrices from the API
 * Used for selecting risk assessment matrices in forms
 */
export function useRiskMatrices(enabled: boolean = true) {
  return useQuery({
    queryKey: ["risk-matrices"],
    queryFn: async (): Promise<RiskMatrix[]> => {
      const response = await getRiskMatrices();
      if (response.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error("Failed to load risk matrices");
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    throwOnError: false
  });
}

/**
 * Fetch control effectiveness levels from the API
 * Used for selecting control effectiveness in risk assessments
 */
export function useEffectivenessLevels(enabled: boolean = true) {
  return useQuery({
    queryKey: ["effectiveness-levels"],
    queryFn: async (): Promise<RiskControls[]> => {
      const response = await getEffectivenessLevels();
      if (response.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error("Failed to load effectiveness levels");
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    throwOnError: false
  });
}

// ============================================================================
// RISKS HOOKS
// ============================================================================

/**
 * Hook to fetch all risks with optional filtering and pagination
 * @param params - Optional parameters for filtering and pagination
 * @returns Query result with risks data
 */
export const useRisks = (params?: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
  risk_owner_id?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.RISKS, params],
    queryFn: async () => {
      const response = await getRisks(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};
