/**
 * Audit Settings TanStack Query Hooks
 *
 * This file contains all React Query hooks for audit settings configurations,
 * including hooks for auditable areas, strategic pillars, initiatives,
 * findings categories, process activities, and indicative targets.
 *
 * These hooks can be reused across the application for client-side data fetching.
 */

import { useQuery } from "@tanstack/react-query";
import {
  getAuditableAreas,
  getStrategicPillars,
  getStrategicInitiatives,
  getFindingsCategories,
  getProcessActivities,
  getIndicativeTargets
} from "@/app/_actions/audit-settings-actions";
import {
  getUniverses,
  getUniverseItems,
  getBudgets,
  getBudgetLines
} from "@/app/_actions/audit-module-actions";
import { QUERY_KEYS } from "@/lib/constants";

// ============================================================================
// AUDITABLE AREAS HOOKS
// ============================================================================

/**
 * Hook to fetch all auditable areas
 * @returns Query result with auditable areas data
 */
export const useAuditableAreas = (
  params?: { page?: number; page_size?: number; department_id?: string } | undefined
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.AUDITABLE_AREAS, params],
    queryFn: async () => {
      const response = await getAuditableAreas(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

// ============================================================================
// STRATEGIC PILLARS HOOKS
// ============================================================================

/**
 * Hook to fetch all strategic pillars with optional pagination
 * @param params - Optional parameters for filtering and pagination
 * @returns Query result with strategic pillars data
 */
export const useStrategicPillars = (
  pillarId?: string,
  params?: {
    page?: number;
    page_size?: number;
    department_id?: string;
    // is_active?: boolean;
  }
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STRATEGIC_PILLARS, params],
    queryFn: async () => {
      const response = await getStrategicPillars(pillarId, params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

// ============================================================================
// STRATEGIC INITIATIVES HOOKS
// ============================================================================

/**
 * Hook to fetch strategic initiatives for a specific pillar
 * @param pillarId - The ID of the strategic pillar
 * @param params - Optional pagination parameters
 * @returns Query result with strategic initiatives data
 */
export const useStrategicInitiatives = (
  pillarId?: string,
  params?: { page?: number; page_size?: number; department_id?: string }
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STRATEGIC_INITIATIVES, pillarId, params],
    queryFn: async () => {
      if (!pillarId) {
        throw new Error("Pillar ID is required");
      }
      const response = await getStrategicInitiatives(pillarId, params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!pillarId, // Only run query if pillarId is provided
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

// ============================================================================
// PROCESS ACTIVITIES HOOKS
// ============================================================================

/**
 * Hook to fetch all process activities
 * @returns Query result with process activities data
 */
export const useProcessActivities = (params?: {
  page?: number;
  page_size?: number;
  department_id?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROCESS_ACTIVITIES, params],
    queryFn: async () => {
      const response = await getProcessActivities(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

// ============================================================================
// INDICATIVE TARGETS HOOKS
// ============================================================================

/**
 * Hook to fetch all indicative targets with optional pagination
 * @param params - Optional parameters for filtering and pagination
 * @returns Query result with indicative targets data
 */
export const useIndicativeTargets = (params?: {
  page?: number;
  page_size?: number;
  department_id?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INDICATIVE_TARGETS, params],
    queryFn: async () => {
      const response = await getIndicativeTargets(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

// ============================================================================
// AUDIT UNIVERSES HOOKS
// ============================================================================

/**
 * Hook to fetch all audit universes
 * @param params - Optional parameters for filtering and pagination
 * @returns Query result with universes data
 */
export const useUniverses = (params?: {
  page?: number;
  page_size?: number;
  is_active?: boolean;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.UNIVERSES, params],
    queryFn: async () => {
      const response = await getUniverses(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

/**
 * Hook to fetch universe items for a specific universe
 * @param universeId - The ID of the audit universe
 * @param params - Optional pagination parameters
 * @returns Query result with universe items data
 */
export const useUniverseItems = (
  universeId?: string,
  params?: { page?: number; page_size?: number; department_id?: string }
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.UNIVERSE_ITEMS, universeId, params],
    queryFn: async () => {
      const response = await getUniverseItems({
        audit_universe_id: universeId,
        ...params
      });
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    // enabled: !!universeId, // Only run query if universeId is provided
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

// ============================================================================
// BUDGETS HOOKS
// ============================================================================

/**
 * Hook to fetch all budgets
 * @returns Query result with budgets data
 */
export const useBudgets = (params?: {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  department_id?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BUDGETS, params],
    queryFn: async () => {
      const response = await getBudgets(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};
export const useBudgetLines = (
  budgetId: string,
  params?: {
    page?: number;
    page_size?: number;
    is_active?: boolean;
    department_id?: string;
    status?: string;
  }
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BUDGETS, budgetId, params],
    queryFn: async () => {
      const response = await getBudgetLines(budgetId, params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!budgetId,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};
