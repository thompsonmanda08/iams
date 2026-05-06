/**
 * Risk Actions React Query Hooks
 *
 * Provides hooks for fetching risk action assignments with optional
 * server-side hydrated initialData.
 */

import { useQuery } from "@tanstack/react-query";
import { getActions, type ActionDefinition } from "@/app/_actions/risk-module-actions";
import type { Pagination } from "@/lib/types";

export const RISK_ACTIONS_QUERY_KEYS = {
  all: ["actions"] as const,
  list: (filters?: { page?: number; page_size?: number }) =>
    [...RISK_ACTIONS_QUERY_KEYS.all, "list", filters] as const
};

export interface RiskActionsResult {
  actions: ActionDefinition[];
  pagination: Pagination;
}

const DEFAULT_PAGINATION: Pagination = {
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 0,
  has_next: false,
  has_prev: false
};

export function useRiskActions(
  filters: { page?: number; page_size?: number } = {},
  initialData?: RiskActionsResult
) {
  return useQuery<RiskActionsResult>({
    queryKey: RISK_ACTIONS_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const response = await getActions(filters);
      return {
        actions: response.success && response.data?.data ? response.data.data : [],
        pagination: response.data?.pagination || DEFAULT_PAGINATION
      };
    },
    initialData,
    staleTime: 60 * 1000
  });
}
