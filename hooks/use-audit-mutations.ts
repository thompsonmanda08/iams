"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import {
  updateFinding,
  submitAuditPlanForApproval,
  deleteAuditPlan,
  createOrUpdateAuditMemo,
  sendAuditMemo,
  deleteAuditMemo
} from "@/app/_actions/audit-module-actions";

// ============================================================================
// GENERIC MUTATION FACTORIES
// ============================================================================

/**
 * Generic hook factory for plan-related mutations
 * Creates a mutation hook for creating/updating plan items
 *
 * Usage:
 * const { mutate: savePlanItem, isPending } = usePlanItemMutation(
 *   (data) => createAnnualAuditPlanItem(data),
 *   {
 *     onSuccess: () => {
 *       // Handle success
 *     }
 *   }
 * );
 *
 * savePlanItem(itemData);
 */
export function usePlanItemMutation<T = any>(
  mutationFn: (data: T) => Promise<any>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    queryKeyToInvalidate?: any[];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: T) => {
      const result = await mutationFn(data);
      if (!result.success && result.success !== undefined) {
        throw new Error(result.message || options?.errorMessage || "Operation failed");
      }
      return result;
    },
    onSuccess: () => {
      if (options?.queryKeyToInvalidate) {
        queryClient.invalidateQueries({ queryKey: options.queryKeyToInvalidate });
      } else {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      }

      notify({
        title: "Success",
        description: options?.successMessage || "Operation completed successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || options?.errorMessage || "An error occurred",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Generic hook for managing list mutations (add, edit, delete)
 * Used for managing collections of items
 *
 * Usage:
 * const { mutate: createItem, isPending: isCreating } = useListItemMutation(
 *   async (item) => await api.create(item),
 *   { successMessage: "Item created" }
 * );
 */
export function useListItemMutation<T = any>(
  mutationFn: (data: T) => Promise<any>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    invalidateQueries?: boolean;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: T) => {
      const result = await mutationFn(data);
      if (!result.success && result.success !== undefined) {
        throw new Error(result.message || "Operation failed");
      }
      return result;
    },
    onSuccess: () => {
      if (options?.invalidateQueries !== false) {
        queryClient.invalidateQueries({});
      }

      notify({
        title: "Success",
        description: options?.successMessage || "Operation completed successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || options?.errorMessage || "An error occurred",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook for form submission with validation
 * Handles form data transformation and submission
 *
 * Usage:
 * const { mutate: submitForm, isPending } = useFormSubmitMutation(
 *   async (formData) => {
 *     const transformed = transformData(formData);
 *     return await api.submit(transformed);
 *   },
 *   { successMessage: "Form submitted successfully" }
 * );
 */
export function useFormSubmitMutation<T = any>(
  mutationFn: (data: T) => Promise<any>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    resetForm?: () => void;
  }
) {
  return useMutation({
    mutationFn: mutationFn,
    onSuccess: () => {
      notify({
        title: "Success",
        description: options?.successMessage || "Form submitted successfully",
        type: "success"
      });
      options?.resetForm?.();
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || options?.errorMessage || "Failed to submit form",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

// ============================================================================
// FINDING MUTATIONS
// ============================================================================

/**
 * Hook to update a finding with query invalidation
 * Used in: finding-form.tsx
 *
 * Usage:
 * const { mutate: updateFinding, isPending } = useUpdateFindingDetailsMutation({
 *   onSuccess: () => {
 *     // Handle success
 *   }
 * });
 *
 * updateFinding({
 *   findingId: "finding-123",
 *   data: { severity: "HIGH", ... }
 * });
 */
export function useUpdateFindingDetailsMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { findingId: string; data: any }) => {
      const result = await updateFinding(params.findingId, params.data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update finding");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKPAPER_FINDINGS] });
      notify({
        title: "Success",
        description: "Finding updated successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "An error occurred while updating the finding",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

// ============================================================================
// AUDIT PLAN MUTATIONS
// ============================================================================

/**
 * Hook to submit an audit plan for approval
 * Used in: audit-plan-approvals-panel.tsx
 *
 * Usage:
 * const { mutate: submitPlan, isPending } = useSubmitAuditPlanMutation({
 *   onSuccess: () => {
 *     // Handle success
 *   }
 * });
 *
 * submitPlan("plan-123");
 */
export function useSubmitAuditPlanMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (auditPlanId: string) => {
      const result = await submitAuditPlanForApproval(auditPlanId);
      if (!result.success) {
        throw new Error(result.message || "Failed to submit audit plan");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      notify({
        title: "Success",
        description: "Audit plan submitted for approval",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit audit plan for approval",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to delete an audit plan
 * Used in: audit-plan-approvals-panel.tsx
 *
 * Usage:
 * const { mutate: deletePlan, isPending } = useDeleteAuditPlanMutation({
 *   onSuccess: () => {
 *     // Handle success
 *   }
 * });
 *
 * deletePlan("plan-123");
 */
export function useDeleteAuditPlanMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (auditPlanId: string) => {
      const result = await deleteAuditPlan(auditPlanId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete audit plan");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      notify({
        title: "Success",
        description: "Audit plan deleted successfully",
        type: "success"
      });
      options?.onSuccess?.();
      // Redirect after deletion
      router.push("/dashboard/audit/plans");
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to delete audit plan",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

// ============================================================================
// AUDIT MEMO MUTATIONS
// ============================================================================

/**
 * Hook to create or update an audit memo
 * Implements POST for create (new memo) and PUT for update (existing memo)
 * Used in: create-a-memo.tsx
 *
 * Usage:
 * const { mutate: saveMemo, isPending } = useMemoCreateOrUpdateMutation({
 *   auditPlanId: "plan-123",
 *   onSuccess: () => {
 *     // Handle success
 *   },
 *   onError: (message) => {
 *     // Handle error - show in modal alert
 *   }
 * });
 *
 * saveMemo({
 *   subject: "Audit Memo",
 *   content: "<html>...</html>",
 *   status: "DRAFT",
 *   memoExists: false  // Pass false for POST (create), true for PUT (update)
 * });
 */
export function useMemoCreateOrUpdateMutation(options: {
  auditPlanId: string;
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createOrUpdateAuditMemo(options.auditPlanId, data);
      if (!result.success) {
        throw new Error(result.message || "Failed to save memo");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_MEMOS, options.auditPlanId] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AUDIT_MEMOS, options.auditPlanId, "history"]
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      notify({
        title: "Success",
        description: "Memo saved successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      // Extract user-friendly error messages for common scenarios
      let errorMessage = error.message || "Failed to save memo";

      // Handle status conflict errors
      if (errorMessage.includes("not in DRAFT status")) {
        errorMessage = "Cannot edit memo - only memos in DRAFT status can be edited";
      }

      // Pass error to component for modal display
      options?.onError?.(errorMessage);
    }
  });
}

/**
 * Hook to send an audit memo via email
 * Used in: create-a-memo.tsx
 *
 * Usage:
 * const { mutate: sendMemo, isPending } = useSendMemoMutation({
 *   auditPlanId: "plan-123",
 *   onSuccess: () => {
 *     // Handle success
 *   },
 *   onError: (message) => {
 *     // Handle error - show in modal alert
 *   }
 * });
 *
 * sendMemo({
 *   recipient_email: "client@example.com",
 *   cc_emails: ["ceo@example.com"]
 * });
 */
export function useSendMemoMutation(options: {
  auditPlanId: string;
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await sendAuditMemo(options.auditPlanId, data);
      if (!result.success) {
        throw new Error(result.message || "Failed to send memo");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_MEMOS, options.auditPlanId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      notify({
        title: "Success",
        description: "Memo sent successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Failed to send memo";
      // Pass error to component for modal display
      options?.onError?.(errorMessage);
    }
  });
}

/**
 * Hook to delete an audit memo
 * Used in: create-a-memo.tsx
 *
 * Usage:
 * const { mutate: deleteMemo, isPending } = useDeleteMemoMutation({
 *   auditPlanId: "plan-123",
 *   onSuccess: () => {
 *     // Handle success
 *   },
 *   onError: (message) => {
 *     // Handle error - show in modal alert
 *   }
 * });
 *
 * deleteMemo();
 */
export function useDeleteMemoMutation(options: {
  auditPlanId: string;
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteAuditMemo(options.auditPlanId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete memo");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_MEMOS, options.auditPlanId] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AUDIT_MEMOS, options.auditPlanId, "history"]
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUDIT_PLANS] });
      notify({
        title: "Success",
        description: "Memo deleted successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Failed to delete memo";
      // Pass error to component for modal display
      options?.onError?.(errorMessage);
    }
  });
}
