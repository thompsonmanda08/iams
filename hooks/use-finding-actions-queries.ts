/**
 * Finding Actions React Query Hooks
 *
 * Provides hooks for managing finding actions, evidence, reviews, and reassessments
 *
 * @module use-finding-actions-queries
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  getFindingActions,
  getFindingActionsByFinding,
  getFindingAction,
  createFindingAction,
  updateFindingAction,
  deleteFindingAction,
  getFindingActionEvidence,
  createFindingActionEvidence,
  updateFindingActionEvidence,
  deleteFindingActionEvidence,
  getFindingActionReviews,
  createFindingActionReview,
  updateFindingActionReview,
  deleteFindingActionReview,
  getFindingReassessments,
  getLatestFindingReassessment,
  createFindingReassessment,
  updateFindingReassessment,
  deleteFindingReassessment,
  reviewFindingActionEvidence
} from "@/app/_actions/finding-actions";
import { getFinding } from "@/app/_actions/audit-module-actions";
import type {
  FindingAction,
  CreateFindingActionInput,
  UpdateFindingActionInput,
  FindingActionEvidence,
  CreateFindingActionEvidenceInput,
  UpdateFindingActionEvidenceInput,
  CreateFindingActionReviewInput,
  FindingReassessment,
  CreateFindingReassessmentInput,
  UpdateFindingReassessmentInput,
  WorkpaperFinding
} from "@/lib/types/audit-types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const FINDING_ACTION_QUERY_KEYS = {
  all: ["finding-actions"] as const,
  lists: () => [...FINDING_ACTION_QUERY_KEYS.all, "list"] as const,
  list: (filters?: any) => [...FINDING_ACTION_QUERY_KEYS.lists(), filters] as const,
  byFinding: (findingId: string) =>
    [...FINDING_ACTION_QUERY_KEYS.all, "finding", findingId] as const,
  byId: (actionId: string) => [...FINDING_ACTION_QUERY_KEYS.all, "id", actionId] as const,
  evidence: (actionId: string) => [...FINDING_ACTION_QUERY_KEYS.all, "evidence", actionId] as const,
  reviews: (actionId: string) => [...FINDING_ACTION_QUERY_KEYS.all, "reviews", actionId] as const,
  reassessments: (findingId: string) =>
    [...FINDING_ACTION_QUERY_KEYS.all, "reassessments", findingId] as const,
  latestReassessment: (findingId: string) =>
    [...FINDING_ACTION_QUERY_KEYS.all, "reassessments", findingId, "latest"] as const
};

export const FINDING_QUERY_KEYS = {
  all: ["findings"] as const,
  byId: (findingId: string) => [...FINDING_QUERY_KEYS.all, "id", findingId] as const
};

// ============================================================================
// FINDING ACTION HOOKS
// ============================================================================

/**
 * Hook to fetch all finding actions with optional filters
 */
export function useFindingActions(filters?: {
  status?: string;
  assigned_to?: string;
  finding_id?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: FINDING_ACTION_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const response = await getFindingActions(filters);
      if (response.success) {
        return response.data as FindingAction[];
      }
      return [];
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

/**
 * Hook to fetch finding actions by finding ID
 */
export function useFindingActionsByFinding(findingId: string | null | undefined) {
  return useQuery({
    queryKey: findingId
      ? FINDING_ACTION_QUERY_KEYS.byFinding(findingId)
      : ["finding-actions-disabled"],
    queryFn: async () => {
      if (!findingId) return [];
      const response = await getFindingActionsByFinding(findingId);
      if (response.success) {
        return response.data as FindingAction[];
      }
      return [];
    },
    enabled: !!findingId,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook to fetch single finding action
 */
export function useFindingAction(actionId: string | null | undefined) {
  return useQuery({
    queryKey: actionId ? FINDING_ACTION_QUERY_KEYS.byId(actionId) : ["finding-action-disabled"],
    queryFn: async () => {
      if (!actionId) return null;
      const response = await getFindingAction(actionId);
      if (response.success) {
        return response.data as FindingAction;
      }
      return null;
    },
    enabled: !!actionId,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook to create finding action
 */
export function useCreateFindingActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFindingActionInput) => {
      const response = await createFindingAction(data);

      if (!response.success) {
        throw new Error(response.message || "Failed to create finding action");
      }

      return response.data as FindingAction;
    },
    onSuccess: (data, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.lists()
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.byFinding(variables.finding_id)
      });

      notify({
        title: "Success",
        description: "Finding action created successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create finding action",
        type: "error"
      });
    }
  });
}

/**
 * Hook to update finding action
 */
export function useUpdateFindingActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { action_id: string; data: UpdateFindingActionInput }) => {
      const response = await updateFindingAction(params.action_id, params.data);

      if (!response.success) {
        throw new Error(response.message || "Failed to update finding action");
      }

      return response.data as FindingAction;
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.lists()
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.byId(data.id)
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.byFinding(data.finding_id)
      });

      notify({
        title: "Success",
        description: "Finding action updated successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update finding action",
        type: "error"
      });
    }
  });
}

/**
 * Hook to delete finding action
 */
export function useDeleteFindingActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action_id: string) => {
      const response = await deleteFindingAction(action_id);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete finding action");
      }

      return action_id;
    },
    onSuccess: () => {
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.lists()
      });

      notify({
        title: "Success",
        description: "Finding action deleted successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete finding action",
        type: "error"
      });
    }
  });
}

// ============================================================================
// FINDING HOOKS
// ============================================================================

/**
 * Hook to fetch a finding by ID
 */
export function useFinding(findingId: string | null | undefined) {
  return useQuery({
    queryKey: findingId ? FINDING_QUERY_KEYS.byId(findingId) : ["finding-disabled"],
    queryFn: async () => {
      if (!findingId) return null;
      const response = await getFinding(findingId);
      if (response.success) {
        // The response has structure: { status, message, data: { actual_finding_data } }
        // So we need to extract response.data which is the actual finding object
        const findingData = response.data;
        if (findingData && typeof findingData === "object") {
          return findingData?.data as WorkpaperFinding;
        }
      }
      return null;
    },
    enabled: !!findingId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

// ============================================================================
// EVIDENCE HOOKS
// ============================================================================

/**
 * Hook to fetch evidence for a finding action
 */
export function useFindingActionEvidence(actionId: string | null | undefined) {
  return useQuery({
    queryKey: actionId
      ? FINDING_ACTION_QUERY_KEYS.evidence(actionId)
      : ["action-evidence-disabled"],
    queryFn: async () => {
      if (!actionId) return [];
      const response = await getFindingActionEvidence(actionId);
      if (response.success) {
        return response.data as FindingActionEvidence[];
      }
      return [];
    },
    enabled: !!actionId,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook to create finding action evidence
 */
export function useCreateFindingActionEvidenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFindingActionEvidenceInput) => {
      const response = await createFindingActionEvidence(data);

      if (!response.success) {
        throw new Error(response.message || "Failed to submit evidence");
      }

      return response.data as FindingActionEvidence;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.evidence(variables.finding_action_id)
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.byId(variables.finding_action_id)
      });

      notify({
        title: "Success",
        description: "Evidence submitted successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit evidence",
        type: "error"
      });
    }
  });
}

/**
 * Hook to update finding action evidence
 */
export function useUpdateFindingActionEvidenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      evidence_id: string;
      action_id: string;
      data: UpdateFindingActionEvidenceInput;
    }) => {
      const response = await updateFindingActionEvidence(params.evidence_id, params.data);

      if (!response.success) {
        throw new Error(response.message || "Failed to update evidence");
      }

      return response.data as FindingActionEvidence;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.evidence(variables.action_id)
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
 * Hook to delete finding action evidence
 */
export function useDeleteFindingActionEvidenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { evidence_id: string; action_id: string }) => {
      const response = await deleteFindingActionEvidence(params.evidence_id);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete evidence");
      }

      return params;
    },
    onSuccess: (params) => {
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.evidence(params.action_id)
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

// ============================================================================
// REVIEW HOOKS
// ============================================================================

/**
 * Hook to fetch reviews for a finding action
 */
export function useFindingActionReviews(actionId: string | null | undefined) {
  return useQuery({
    queryKey: actionId ? FINDING_ACTION_QUERY_KEYS.reviews(actionId) : ["action-reviews-disabled"],
    queryFn: async () => {
      if (!actionId) return [];
      const response = await getFindingActionReviews(actionId);
      if (response.success) {
        return response.data;
      }
      return [];
    },
    enabled: !!actionId,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook to create review
 */
export function useCreateFindingActionReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFindingActionReviewInput & { action_id: string }) => {
      const response = await createFindingActionReview({
        finding_action_evidence_id: data.finding_action_evidence_id,
        review_status: data.review_status,
        review_comments: data.review_comments
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to submit review");
      }

      return { ...response.data, action_id: data.action_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.reviews(data.action_id)
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.byId(data.action_id)
      });

      notify({
        title: "Success",
        description: "Review submitted successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit review",
        type: "error"
      });
    }
  });
}

/**
 * Hook to approve evidence
 */
export function useReviewFindingActionEvidenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      evidence_id: string;
      action_id: string;
      comments: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      const response = await reviewFindingActionEvidence({
        evidence_id: params.evidence_id,
        reviewer_comments: params.comments,
        finding_action_id: params.action_id,
        approval_status: params.status
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to approve evidence");
      }

      return params;
    },
    onSuccess: (params) => {
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.evidence(params.action_id)
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.reviews(params.action_id)
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.byId(params.action_id)
      });

      notify({
        title: "Success",
        description: "Evidence approved successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to approve evidence",
        type: "error"
      });
    }
  });
}

/**
 * Hook to update an existing review
 */
export function useUpdateFindingActionReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      evidence_id: string;
      action_id: string;
      status: "APPROVED" | "REJECTED";
      comments: string;
    }) => {
      const response = await updateFindingActionReview({
        evidence_id: params.evidence_id,
        approval_status: params.status,
        reviewer_comments: params.comments
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update review");
      }

      return params;
    },
    onSuccess: (params) => {
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.evidence(params.action_id)
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.reviews(params.action_id)
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.byId(params.action_id)
      });

      notify({
        title: "Success",
        description: "Review updated successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update review",
        type: "error"
      });
    }
  });
}

// ============================================================================
// REASSESSMENT HOOKS
// ============================================================================

/**
 * Hook to fetch reassessments for a finding
 */
export function useFindingReassessments(findingId: string | null | undefined) {
  return useQuery({
    queryKey: findingId
      ? FINDING_ACTION_QUERY_KEYS.reassessments(findingId)
      : ["reassessments-disabled"],
    queryFn: async () => {
      if (!findingId) return [];
      const response = await getFindingReassessments(findingId);
      if (response.success) {
        return response.data as FindingReassessment[];
      }
      return [];
    },
    enabled: !!findingId,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook to fetch latest reassessment for a finding
 */
export function useLatestFindingReassessment(findingId: string | null | undefined) {
  return useQuery({
    queryKey: findingId
      ? FINDING_ACTION_QUERY_KEYS.latestReassessment(findingId)
      : ["latest-reassessment-disabled"],
    queryFn: async () => {
      if (!findingId) return null;
      const response = await getLatestFindingReassessment(findingId);
      if (response.success) {
        return response.data as FindingReassessment;
      }
      return null;
    },
    enabled: !!findingId,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook to create finding reassessment
 */
export function useCreateFindingReassessmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFindingReassessmentInput) => {
      const response = await createFindingReassessment(data);

      if (!response.success) {
        throw new Error(response.message || "Failed to create reassessment");
      }

      return response.data as FindingReassessment;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.reassessments(variables.finding_id)
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.latestReassessment(variables.finding_id)
      });

      notify({
        title: "Success",
        description: "Reassessment created successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create reassessment",
        type: "error"
      });
    }
  });
}

/**
 * Hook to update finding reassessment
 */
export function useUpdateFindingReassessmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      reassessment_id: string;
      finding_id: string;
      data: UpdateFindingReassessmentInput;
    }) => {
      const response = await updateFindingReassessment(params.reassessment_id, params.data);

      if (!response.success) {
        throw new Error(response.message || "Failed to update reassessment");
      }

      return response.data as FindingReassessment;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.reassessments(variables.finding_id)
      });
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.latestReassessment(variables.finding_id)
      });

      notify({
        title: "Success",
        description: "Reassessment updated successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update reassessment",
        type: "error"
      });
    }
  });
}

/**
 * Hook to delete finding reassessment
 */
export function useDeleteFindingReassessmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { reassessment_id: string; finding_id: string }) => {
      const response = await deleteFindingReassessment(params.reassessment_id);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete reassessment");
      }

      return params;
    },
    onSuccess: (params) => {
      queryClient.invalidateQueries({
        queryKey: FINDING_ACTION_QUERY_KEYS.reassessments(params.finding_id)
      });

      notify({
        title: "Success",
        description: "Reassessment deleted successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete reassessment",
        type: "error"
      });
    }
  });
}
