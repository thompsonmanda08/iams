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
