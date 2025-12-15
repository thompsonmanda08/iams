/**
 * Entity Preview React Query Hooks
 *
 * Custom React Query hooks for fetching entity data for the preview modal.
 *
 * @module entity-preview-hooks
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getEntityDetails } from "@/app/_actions/entity-preview-actions";
import type { EntityType, EntityPreviewData } from "@/lib/types/entity-preview-types";

/**
 * Fetch entity preview data
 *
 * Custom hook for fetching entity details when opening the preview modal.
 * Includes caching and conditional fetching based on modal open state.
 *
 * @param entityType - The type of entity to fetch
 * @param entityId - The ID of the entity to fetch
 * @param enabled - Whether the query is enabled (usually based on modal open state)
 * @returns Query result object with data, loading, and error states
 */
export function useEntityPreview(
  entityType: EntityType | null,
  entityId: string | null,
  enabled: boolean = false
): UseQueryResult<EntityPreviewData, Error> {
  return useQuery({
    queryKey: ["entity-preview", entityType, entityId],
    queryFn: async () => {
      // Additional validation in query function
      if (!entityType || !entityId) {
        throw new Error("Entity type and ID are required");
      }

      try {
        const response = await getEntityDetails(entityType, entityId);

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch entity details");
        }

        // Return the data from response
        // The response.data could be the entity object directly
        return response.data || response;
      } catch (error: any) {
        throw new Error(error?.message || "Failed to fetch entity details");
      }
    },
    // Only enable query when modal is open and we have the required data
    enabled: enabled && !!entityType && !!entityId,
    // Cache for 2 minutes
    staleTime: 2 * 60 * 1000,
    // Retry only once on failure
    retry: 1,
    // Don't show stale data while refetching
    refetchOnWindowFocus: false
  });
}
