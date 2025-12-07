/**
 * Audit Plans React Query Hooks
 *
 * Provides hooks for managing audit plan data with React Query
 *
 * @module use-audit-plan-queries
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import { deleteAuditPlan, submitAuditPlanForApproval } from "@/app/_actions/audit-module-actions";
import type { AuditPlan } from "@/lib/types/audit-types";
import { QUERY_KEYS } from "@/lib/constants";
import { Dispatch, SetStateAction } from "react";

export const useSubmitAuditPlanForApproval = ({
  auditPlan,
  setAuditPlanData
}: {
  auditPlan: AuditPlan;
  setAuditPlanData: Dispatch<SetStateAction<AuditPlan>>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await submitAuditPlanForApproval(auditPlan.id);
      return result;
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
        notify({
          title: "Success",
          description: "Audit plan submitted for approval",
          type: "success"
        });
        // Update local state - set status to SUBMITTED
        setAuditPlanData((prev) => ({ ...prev, status: "SUBMITTED" }));
      } else {
        notify({
          title: "Error",
          description: response.message || "Failed to submit audit plan for approval",
          type: "error"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit audit plan for approval",
        type: "error"
      });
    }
  });
};

/**
 * Hook to delete an audit plan
 */
export const useDeleteAuditPlan = ({
  planId,
  setDeleteDialogOpen
}: {
  planId: string;
  setDeleteDialogOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteAuditPlan(planId);
      return result;
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
        notify({
          title: "Success",
          description: "Audit plan deleted successfully",
          type: "success"
        });
        setDeleteDialogOpen(false);
        window.location.href = "/dashboard/audit/plans";
        // Optionally navigate away or trigger parent callback
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete audit plan",
        type: "error"
      });
    }
  });
};
