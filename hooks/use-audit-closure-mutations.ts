import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  requestAuditClosure,
  approveAuditClosure,
  cancelAuditClosureRequest,
  getAuditClosureStatus,
  validateAuditClosure
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

export function useRequestAuditClosureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestAuditClosure,
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: AUDIT_CLOSURE_QUERY_KEYS.status(variables.auditPlanId)
        });
        queryClient.invalidateQueries({
          queryKey: ["audit-plans"]
        });

        notify({
          title: "Closure Requested",
          description: "Audit closure has been requested for approval",
          type: "success"
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

export function useApproveAuditClosureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveAuditClosure,
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: AUDIT_CLOSURE_QUERY_KEYS.status(variables.auditPlanId)
        });
        queryClient.invalidateQueries({
          queryKey: ["audit-plans"]
        });

        notify({
          title: "Closure Approved",
          description: `Audit closure has been ${variables.approvalStatus.toLowerCase()}`,
          type: "success"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to process closure approval",
        type: "error"
      });
    }
  });
}

export function useCancelAuditClosureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAuditClosureRequest,
    onSuccess: (response, auditPlanId) => {
      if (response.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: AUDIT_CLOSURE_QUERY_KEYS.status(auditPlanId)
        });
        queryClient.invalidateQueries({
          queryKey: ["audit-plans"]
        });

        notify({
          title: "Cancelled",
          description: "Audit closure request has been cancelled",
          type: "success"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to cancel closure request",
        type: "error"
      });
    }
  });
}
