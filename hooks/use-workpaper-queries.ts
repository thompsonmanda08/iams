/**
 * Audit Workpapers React Query Hooks
 *
 * Provides hooks for managing workpapers & their category data with React Query
 *
 * @module use-workpaper-queries
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import { submitCategoryFindingsForApproval } from "@/app/_actions/finding-actions";

export const EVIDENCE_QUERY_KEYS = {
  all: ["evidence"] as const,
  byFinding: (findingId: string) => [...EVIDENCE_QUERY_KEYS.all, "finding", findingId] as const,
  byId: (evidenceId: string) => [...EVIDENCE_QUERY_KEYS.all, "id", evidenceId] as const
};

/**
 * Hook to submit category with findings & evidence for approval
 */

export const useSubmitCategoryFindingsForApproval = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { category_id: string; objectives: string; conclusion: string }) => {
      const response = await submitCategoryFindingsForApproval({
        category_id: params.category_id,
        objectives: params.objectives,
        conclusion: params.conclusion
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create evidence");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate the finding's category list
      queryClient.invalidateQueries();
      onSuccess?.();

      notify({
        title: "Success",
        description: "Findings submitted successfully",
        type: "success"
      });
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit findings",
        type: "error"
      });
    }
  });
};
