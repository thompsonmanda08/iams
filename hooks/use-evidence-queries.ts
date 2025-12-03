/**
 * Finding Evidence React Query Hooks
 *
 * Provides hooks for managing finding evidence data with React Query
 *
 * @module use-evidence-queries
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  getFindingEvidence,
  createFindingEvidence,
  updateFindingEvidence,
  deleteFindingEvidence
} from "@/app/_actions/audit-module-actions";
import type { FindingEvidence } from "@/lib/types/audit-types";

export const EVIDENCE_QUERY_KEYS = {
  all: ["evidence"] as const,
  byFinding: (findingId: string) => [...EVIDENCE_QUERY_KEYS.all, "finding", findingId] as const,
  byId: (evidenceId: string) => [...EVIDENCE_QUERY_KEYS.all, "id", evidenceId] as const
};

/**
 * Hook to fetch all evidence for a specific finding with stats
 */
export function useFindingEvidence(findingId: string | null | undefined) {
  return useQuery({
    queryKey: findingId ? EVIDENCE_QUERY_KEYS.byFinding(findingId) : ["evidence-disabled"],
    queryFn: async () => {
      if (!findingId) return { evidence: [], total_count: 0, verified_count: 0, unverified_count: 0 };
      const response = await getFindingEvidence(findingId);
      if (response.success) {
        return response.data as {
          evidence: FindingEvidence[];
          total_count: number;
          verified_count: number;
          unverified_count: number;
        };
      }
      return { evidence: [], total_count: 0, verified_count: 0, unverified_count: 0 };
    },
    enabled: !!findingId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Hook to create finding evidence with optional file upload
 */
export function useCreateEvidenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      finding_id: string;
      evidence_type: string;
      title: string;
      description?: string;
      external_link?: string;
      collection_date?: string;
      notes?: string;
      file_link?: string;
    }) => {
      const response = await createFindingEvidence(params.finding_id, {
        evidence_type: params.evidence_type,
        title: params.title,
        description: params.description,
        external_link: params.external_link,
        file_link: params.file_link,
        collection_date: params.collection_date,
        notes: params.notes
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create evidence");
      }

      return response.data as FindingEvidence;
    },
    onSuccess: (data) => {
      // Invalidate the finding's evidence list
      queryClient.invalidateQueries({
        queryKey: EVIDENCE_QUERY_KEYS.byFinding(data.finding_id)
      });

      notify({
        title: "Success",
        description: "Evidence created successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create evidence",
        type: "error"
      });
    }
  });
}

/**
 * Hook to update finding evidence
 */
export function useUpdateEvidenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      evidence_id: string;
      finding_id: string;
      evidence_type?: string;
      title?: string;
      description?: string;
      external_link?: string;
      collection_date?: string;
      notes?: string;
      file_link?: string;
    }) => {
      const response = await updateFindingEvidence(params.evidence_id, {
        evidence_type: params.evidence_type,
        title: params.title,
        description: params.description,
        external_link: params.external_link,
        collection_date: params.collection_date,
        notes: params.notes,
        file_link: params.file_link
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update evidence");
      }

      return response.data as FindingEvidence;
    },
    onSuccess: (data) => {
      // Invalidate the finding's evidence list
      queryClient.invalidateQueries({
        queryKey: EVIDENCE_QUERY_KEYS.byFinding(data.finding_id)
      });

      notify({
        title: "Success",
        description: "Evidence updated successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update evidence",
        type: "error"
      });
    }
  });
}

/**
 * Hook to delete finding evidence
 */
export function useDeleteEvidenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { evidence_id: string; finding_id: string }) => {
      const response = await deleteFindingEvidence(params.evidence_id);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete evidence");
      }

      return params;
    },
    onSuccess: (params) => {
      // Invalidate the finding's evidence list
      queryClient.invalidateQueries({
        queryKey: EVIDENCE_QUERY_KEYS.byFinding(params.finding_id)
      });

      notify({
        title: "Success",
        description: "Evidence deleted successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete evidence",
        type: "error"
      });
    }
  });
}
