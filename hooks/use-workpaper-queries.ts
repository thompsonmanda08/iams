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

// /**
//  * Hook to fetch all evidence for a specific finding with stats
//  */
// export function useFindingEvidence(findingId: string | null | undefined) {
//   return useQuery({
//     queryKey: findingId ? EVIDENCE_QUERY_KEYS.byFinding(findingId) : ["evidence-disabled"],
//     queryFn: async () => {
//       if (!findingId) return { evidence: [], total_count: 0, verified_count: 0, unverified_count: 0 };
//       const response = await getFindingEvidence(findingId);
//       if (response.success) {
//         return response.data as {
//           evidence: FindingEvidence[];
//           total_count: number;
//           verified_count: number;
//           unverified_count: number;
//         };
//       }
//       return { evidence: [], total_count: 0, verified_count: 0, unverified_count: 0 };
//     },
//     enabled: !!findingId,
//     staleTime: 5 * 60 * 1000 // 5 minutes
//   });
// }

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
