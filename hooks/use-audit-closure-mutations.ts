import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import {
  requestAuditClosure,
  submitAuditeeSignOff,
  requestAuditeeSignOffNotification
} from "@/app/_actions/audit-closure-actions";
import { getFindingActionsByFinding } from "@/app/_actions/finding-actions";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetches actions for all given finding IDs in parallel and returns a flat list.
 * This is the only remaining network call needed by the closure checklist —
 * all other data (audit plan, workpaper, findings, userTasks) is passed as props.
 */
export function useFindingActionsQuery(findingIds: string[]) {
  const sortedIds = [...findingIds].sort();

  return useQuery({
    queryKey: ["finding-actions-batch", ...sortedIds],
    queryFn: async () => {
      const results = await Promise.all(sortedIds.map((id) => getFindingActionsByFinding(id)));
      return results.flatMap((r) => {
        if (!r.success) return [];
        const d = r.data?.data ?? r.data ?? [];
        return Array.isArray(d) ? d : [];
      });
    },
    enabled: sortedIds.length > 0,
    staleTime: 30_000,
    placeholderData: [] as any[]
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useSubmitAuditeeSignOffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      auditPlanId,
      managementComments
    }: {
      auditPlanId: string;
      managementComments: string;
    }) => submitAuditeeSignOff(auditPlanId, managementComments),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
        notify({
          title: "Sign-Off Submitted",
          description: "Auditee sign-off comments have been recorded",
          type: "success"
        });
      } else {
        notify({
          title: "Submission Failed",
          description: response.message || "Failed to submit sign-off",
          type: "error"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit sign-off",
        type: "error"
      });
    }
  });
}

export function useRequestSignOffNotificationMutation() {
  return useMutation({
    mutationFn: (auditPlanId: string) => requestAuditeeSignOffNotification(auditPlanId),
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to send sign-off notification",
        type: "error"
      });
    }
  });
}

export function useRequestAuditClosureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestAuditClosure,
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
        notify({
          title: "Closure Requested",
          description: "Audit closure has been requested for approval",
          type: "success"
        });
      } else {
        notify({
          title: "Request Failed",
          description: response.message || "Failed to request audit closure",
          type: "error"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to request audit closure",
        type: "error"
      });
    }
  });
}
