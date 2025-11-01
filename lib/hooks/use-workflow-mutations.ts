"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Workflow } from "@/lib/types/workflow";
import {
  createWorkflow as createWorkflowAction,
  updateWorkflow as updateWorkflowAction,
  deleteWorkflow as deleteWorkflowAction
} from "@/app/_actions/workflow-actions";

/**
 * Workflow Mutations Hook
 *
 * This hook provides mutation functions for workflow CRUD operations.
 * Uses real API calls via server actions.
 *
 * Usage:
 * const { saveWorkflow, updateWorkflow, deleteWorkflow, isLoading } = useWorkflowMutations();
 *
 * await saveWorkflow(workflowData);
 */

interface MutationState {
  isLoading: boolean;
  error: string | null;
}

interface SaveWorkflowResult {
  success: boolean;
  data?: Workflow;
  error?: string;
}

export function useWorkflowMutations() {
  const router = useRouter();
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null
  });

  /**
   * Save a new workflow
   * POST /api/v1/workflows
   */
  const saveWorkflow = async (workflow: Workflow): Promise<SaveWorkflowResult> => {
    setState({ isLoading: true, error: null });

    try {
      const response = await createWorkflowAction({
        name: workflow.name,
        entity_type: workflow.entityType,
        description: `Workflow for ${workflow.entityType}`
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to save workflow");
      }

      setState({ isLoading: false, error: null });
      toast.success("Workflow saved successfully!");
      router.refresh();

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to save workflow";
      setState({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Update an existing workflow
   * PUT /api/v1/workflows/update
   */
  const updateWorkflow = async (
    workflowId: string,
    workflow: Workflow
  ): Promise<SaveWorkflowResult> => {
    setState({ isLoading: true, error: null });

    try {
      const response = await updateWorkflowAction(workflowId, {
        name: workflow.name,
        description: `Workflow for ${workflow.entityType}`,
        is_active: true
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update workflow");
      }

      setState({ isLoading: false, error: null });
      toast.success("Workflow updated successfully!");
      router.refresh();

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update workflow";
      setState({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Delete a workflow
   * DELETE /api/v1/workflows/delete
   */
  const deleteWorkflow = async (workflowId: string): Promise<SaveWorkflowResult> => {
    setState({ isLoading: true, error: null });

    try {
      const response = await deleteWorkflowAction(workflowId);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete workflow");
      }

      setState({ isLoading: false, error: null });
      toast.success("Workflow deleted successfully!");
      router.refresh();

      return {
        success: true
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete workflow";
      setState({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Save or update workflow (smart function)
   * Determines whether to create or update based on workflow existence
   */
  const saveOrUpdateWorkflow = async (
    workflow: Workflow,
    isExisting: boolean
  ): Promise<SaveWorkflowResult> => {
    if (isExisting) {
      return updateWorkflow(workflow.id, workflow);
    } else {
      return saveWorkflow(workflow);
    }
  };

  return {
    saveWorkflow,
    updateWorkflow,
    deleteWorkflow,
    saveOrUpdateWorkflow,
    isLoading: state.isLoading,
    error: state.error
  };
}
