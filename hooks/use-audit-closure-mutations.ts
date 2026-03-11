import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  requestAuditClosure,
  getAuditClosureStatus,
  validateAuditClosure,
  submitAuditeeSignOff,
  requestAuditeeSignOffNotification
} from "@/app/_actions/audit-closure-actions";

// Query Keys
const AUDIT_CLOSURE_QUERY_KEYS = {
  all: ["audit-closure"],
  status: (auditPlanId: string) => [...AUDIT_CLOSURE_QUERY_KEYS.all, "status", auditPlanId],
  validation: (auditPlanId: string) => [...AUDIT_CLOSURE_QUERY_KEYS.all, "validation", auditPlanId]
};

// ============================================================================
// QUERIES
// ============================================================================

export function useAuditClosureValidation(auditPlanId: string) {
  return useQuery({
    queryKey: AUDIT_CLOSURE_QUERY_KEYS.validation(auditPlanId),
    queryFn: () => validateAuditClosure(auditPlanId),
    enabled: !!auditPlanId,
    select: (response) => (response.success ? response.data : null)
  });
}

export function useAuditClosureStatus(auditPlanId: string) {
  return useQuery({
    queryKey: AUDIT_CLOSURE_QUERY_KEYS.status(auditPlanId),
    queryFn: () => getAuditClosureStatus(auditPlanId),
    enabled: !!auditPlanId,
    select: (response) => (response.success ? response.data : null)
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
        queryClient.invalidateQueries();
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
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries();

        notify({
          title: "Closure Requested",
          description: "Audit closure has been requested for approval",
          type: "success"
        });
      } else {
        // Handle failed response
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
