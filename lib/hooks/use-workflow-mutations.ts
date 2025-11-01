"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Workflow } from "@/lib/types/workflow";
import { useWorkflowStore } from "@/lib/stores/workflow-store";

/**
 * Workflow Mutations Hook
 *
 * This hook provides mutation functions for workflow CRUD operations.
 * Currently uses Zustand store for simulation, but can be easily swapped
 * for real API calls when backend is ready.
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
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null
  });

  // Get Zustand store actions (simulation mode)
  const { addWorkflow, updateWorkflow: updateWorkflowStore, deleteWorkflow: deleteWorkflowStore } =
    useWorkflowStore();

  /**
   * Save a new workflow
   * Currently: Saves to Zustand store
   * Future: POST /api/v1/workflows
   */
  const saveWorkflow = async (workflow: Workflow): Promise<SaveWorkflowResult> => {
    setState({ isLoading: true, error: null });

    try {
      // SIMULATION MODE: Save to Zustand store
      addWorkflow(workflow);

      // FUTURE API MODE: Uncomment and replace with real API call
      // const response = await fetch('/api/v1/workflows', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(workflow)
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.error);

      setState({ isLoading: false, error: null });
      toast.success("Workflow saved successfully!");

      return {
        success: true,
        data: workflow
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
   * Currently: Updates in Zustand store
   * Future: PUT /api/v1/workflows/:id
   */
  const updateWorkflow = async (
    workflowId: string,
    workflow: Workflow
  ): Promise<SaveWorkflowResult> => {
    setState({ isLoading: true, error: null });

    try {
      // SIMULATION MODE: Update in Zustand store
      updateWorkflowStore(workflowId, workflow);

      // FUTURE API MODE: Uncomment and replace with real API call
      // const response = await fetch(`/api/v1/workflows/${workflowId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(workflow)
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.error);

      setState({ isLoading: false, error: null });
      toast.success("Workflow updated successfully!");

      return {
        success: true,
        data: workflow
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
   * Currently: Removes from Zustand store
   * Future: DELETE /api/v1/workflows/:id
   */
  const deleteWorkflow = async (workflowId: string): Promise<SaveWorkflowResult> => {
    setState({ isLoading: true, error: null });

    try {
      // SIMULATION MODE: Delete from Zustand store
      deleteWorkflowStore(workflowId);

      // FUTURE API MODE: Uncomment and replace with real API call
      // const response = await fetch(`/api/v1/workflows/${workflowId}`, {
      //   method: 'DELETE'
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.error);

      setState({ isLoading: false, error: null });
      toast.success("Workflow deleted successfully!");

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

/**
 * MIGRATION GUIDE: From Zustand to API
 *
 * When backend is ready, update this file:
 *
 * 1. Replace Zustand store calls with fetch/axios calls
 * 2. Add authentication headers
 * 3. Handle API-specific error responses
 * 4. Add revalidation/cache invalidation
 * 5. Optionally add React Query for better caching
 *
 * Example API implementation:
 *
 * const saveWorkflow = async (workflow: Workflow) => {
 *   setState({ isLoading: true, error: null });
 *
 *   try {
 *     const response = await authenticatedApiClient({
 *       method: 'POST',
 *       url: '/api/v1/workflows',
 *       data: workflow
 *     });
 *
 *     setState({ isLoading: false, error: null });
 *     toast.success("Workflow saved successfully!");
 *
 *     return { success: true, data: response.data };
 *   } catch (error: any) {
 *     setState({ isLoading: false, error: error.message });
 *     toast.error(error.message);
 *
 *     return { success: false, error: error.message };
 *   }
 * };
 *
 * No other changes needed in components!
 */
