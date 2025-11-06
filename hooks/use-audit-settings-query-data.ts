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
import { QUERY_KEYS } from "@/lib/constants";

// ============================================================================
// AUDITABLE AREAS HOOKS
// ============================================================================

/**
 * Hook to fetch all auditable areas
 * @returns Query result with auditable areas data
 */
export const useAuditableAreas = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.AUDITABLE_AREAS],
    queryFn: async () => {
      const response = await getAuditableAreas();
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
export const useStrategicPillars = (params?: {
  pillarId?: string;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STRATEGIC_PILLARS, params],
    queryFn: async () => {
      const response = await getStrategicPillars(params?.pillarId, params);
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
  params?: { page?: number; page_size?: number }
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
// FINDINGS CATEGORIES HOOKS
// ============================================================================

/**
 * Hook to fetch all findings categories
 * @returns Query result with findings categories data
 */
export const useFindingsCategories = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FINDINGS_CATEGORIES],
    queryFn: async () => {
      const response = await getFindingsCategories();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
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
export const useProcessActivities = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROCESS_ACTIVITIES],
    queryFn: async () => {
      const response = await getProcessActivities();
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
 * Hook to fetch all indicative targets
 * @returns Query result with indicative targets data
 */
export const useIndicativeTargets = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.INDICATIVE_TARGETS],
    queryFn: async () => {
      const response = await getIndicativeTargets();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};
