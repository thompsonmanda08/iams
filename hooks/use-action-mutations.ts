"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import {
  createRiskAction,
  submitActionFindings,
  assessActionFindings
} from "@/app/_actions/risk-module-actions";

/**
 * Hook to create a risk action (assign action owners and reviewers)
 * Used in: app/dashboard/(modules)/risks/_components/action-findings-dialog.tsx
 *
 * Usage:
 * const { mutate: createAction, isPending } = useCreateActionMutation({
 *   onSuccess: () => {
 *     setOpen(false);
 *   }
 * });
 *
 * createAction({
 *   risk_id: "risk-123",
 *   instructions: "Please complete this action",
 *   executer_id: "user-456",
 *   reviewer_id: "user-789",
 *   due_date: "2024-12-31"
 * });
 */
export function useCreateActionMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      risk_id: string;
      instructions: string;
      executer_id: string;
      reviewer_id: string;
      due_date?: string;
    }) => {
      const result = await createRiskAction(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create action");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      queryClient.invalidateQueries({ queryKey: ["risks"] });
      notify({
        title: "Success",
        description: "Action created successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create action",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to submit action findings/evidence for a risk mitigation action
 * Used in: app/dashboard/(modules)/risks/_components/action-findings-dialog.tsx
 *          app/dashboard/(workflows)/actions/audit/_components/submit-evidence-dialog.tsx
 *
 * Usage:
 * const { mutate: submitFindings, isPending } = useSubmitActionFindingsMutation({
 *   onSuccess: () => {
 *     setOpen(false);
 *   }
 * });
 *
 * submitFindings({
 *   action_id: "action-123",
 *   task_id: "task-456",
 *   evidence_description: "Evidence details...",
 *   evidence_file_url: "https://...",
 *   evidence_file_name: "file.pdf"
 * });
 */
export function useSubmitActionFindingsMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      action_id: string;
      task_id: string;
      evidence_description: string;
      evidence_file_url?: string | null;
      evidence_file_name?: string | null;
      evidence_file_type?: string | null;
    }) => {
      const result = await submitActionFindings(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to submit action findings");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      queryClient.invalidateQueries({ queryKey: ["actionFindings"] });
      notify({
        title: "Success",
        description: "Action findings submitted successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to submit action findings",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to assess/review action findings
 * Used in: Components that allow reviewers to approve/reject action findings
 *
 * Usage:
 * const { mutate: assessFindings, isPending } = useAssessActionFindingsMutation({
 *   onSuccess: () => {
 *     setOpen(false);
 *   }
 * });
 *
 * assessFindings({
 *   findingsId: "findings-123",
 *   reviewer_id: "user-456",
 *   assessment_score: 8,
 *   reviewer_feedback: "Good job!",
 *   decision: "APPROVE"
 * });
 */
export function useAssessActionFindingsMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      findingsId: string;
      reviewer_id: string;
      assessment_score: number;
      reviewer_feedback: string;
      decision: "APPROVE" | "REQUEST_CHANGES";
    }) => {
      const result = await assessActionFindings(data.findingsId, {
        reviewer_id: data.reviewer_id,
        assessment_score: data.assessment_score,
        reviewer_feedback: data.reviewer_feedback,
        decision: data.decision
      });
      if (!result.success) {
        throw new Error(result.message || "Failed to assess action findings");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionFindings"] });
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      notify({
        title: "Success",
        description: "Action assessment completed successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to assess action findings",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
