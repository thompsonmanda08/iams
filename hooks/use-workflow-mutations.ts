"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { WorkflowItem, State, Transition } from "@/lib/types/workflow";
import {
  createWorkflow,
  updateWorkflow,
  createWorkflowState,
  updateWorkflowState,
  deleteWorkflowState,
  createWorkflowTransition,
  updateWorkflowTransition,
  deleteWorkflowTransition
} from "@/app/_actions/workflow-actions";

/**
 * WorkflowItem Mutations Hook
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
  data?: WorkflowItem;
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
  const saveWorkflow = async (workflow: WorkflowItem): Promise<SaveWorkflowResult> => {
    setState({ isLoading: true, error: null });

    try {
      const response = await createWorkflow({
        name: workflow.name,
        trigger_type: workflow.trigger_type,
        description: workflow.description || `WorkflowItem for ${workflow.trigger_type}`
      });

      if (!response.success) {
        throw new Error((response as any).message || "Failed to save workflow");
      }

      setState({ isLoading: false, error: null });

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
  const updateWorkflowData = async (
    workflowId: string,
    workflow: WorkflowItem
  ): Promise<SaveWorkflowResult> => {
    setState({ isLoading: true, error: null });

    try {
      const response = await updateWorkflow(workflowId, {
        name: workflow.name,
        trigger_type: workflow.trigger_type,
        description: workflow.description || `WorkflowItem for ${workflow.trigger_type}`
      });

      if (!response.success) {
        throw new Error((response as any).message || "Failed to update workflow");
      }

      setState({ isLoading: false, error: null });

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
  // const deleteWorkflow = async (workflowId: string): Promise<SaveWorkflowResult> => {
  //   setState({ isLoading: true, error: null });

  //   try {
  //     const response = await deleteWorkflowAction(workflowId);

  //     if (!response.success) {
  //       throw new Error(response.message || "Failed to delete workflow");
  //     }

  //     setState({ isLoading: false, error: null });
  //     toast.success("WorkflowItem deleted successfully!");
  //     router.refresh();

  //     return {
  //       success: true
  //     };
  //   } catch (error: any) {
  //     const errorMessage = error?.message || "Failed to delete workflow";
  //     setState({ isLoading: false, error: errorMessage });
  //     toast.error(errorMessage);

  //     return {
  //       success: false,
  //       error: errorMessage
  //     };
  //   }
  // };

  /**
   * Create workflow states
   * Handles bulk creation of states with automatic display_order
   */
  const createStates = async (workflowId: string, states: State[]): Promise<SaveWorkflowResult> => {
    try {
      const createdStates: State[] = [];

      for (let i = 0; i < states.length; i++) {
        const state = states[i];

        const response = await createWorkflowState({
          workflow_id: workflowId,
          state_name: state.name,
          description: state.description || `WorkflowItem state: ${state.name}`,
          display_order: state?.display_order ?? i, // Auto-increment based on order
          is_initial: state.isInitial,
          is_final: state.isFinal
        });

        if (!response.success) {
          throw new Error(`Failed to create state "${state.name}": ${response.message}`);
        }

        createdStates.push(response.data);
      }

      return {
        success: true,
        data: { states: createdStates } as any
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create workflow states";
      setState({ isLoading: false, error: errorMessage });
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Update workflow states
   * Handles bulk updates of states
   */
  const updateStates = async (
    _workflowId: string,
    states: State[]
  ): Promise<SaveWorkflowResult> => {
    try {
      const updatedStates: State[] = [];

      for (const state of states) {
        if (!state._serverId) continue; // Skip if no server ID

        const response = await updateWorkflowState(state._serverId, {
          state_name: state.name,
          description: state.description || `WorkflowItem state: ${state.name}`,
          display_order: state.display_order ?? 0,
          is_initial: state.isInitial,
          is_final: state.isFinal
        });

        if (!response.success) {
          throw new Error(`Failed to update state "${state.name}": ${response.message}`);
        }

        updatedStates.push(response.data);
      }

      return {
        success: true,
        data: { states: updatedStates } as any
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update workflow states";
      setState({ isLoading: false, error: errorMessage });
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Delete workflow states
   * Handles bulk deletion of states
   */
  const deleteStates = async (states: State[]): Promise<SaveWorkflowResult> => {
    try {
      for (const state of states) {
        if (!state._serverId) continue; // Skip if no server ID

        const response = await deleteWorkflowState(state._serverId);

        if (!response.success) {
          throw new Error(`Failed to delete state "${state.name}": ${response.message}`);
        }
      }

      return {
        success: true
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete workflow states";
      setState({ isLoading: false, error: errorMessage });
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Create workflow transitions
   */
  const createTransitions = async (
    workflowId: string,
    transitions: Transition[],
    states?: State[]
  ): Promise<SaveWorkflowResult> => {
    try {
      const createdTransitions: Transition[] = [];

      for (const transition of transitions) {
        // Extract status values from state IDs or transition name
        let fromStatus = "";
        let toStatus = "";

        // Try to get status from state names if states are provided
        if (states) {
          const fromState = states.find((s) => s.id === transition.from_state_id);
          const toState = states.find((s) => s.id === transition.to_state_id);

          if (fromState) {
            fromStatus = fromState.name;
          }
          if (toState) {
            toStatus = toState.name;
          }
        }

        // Fallback: Extract from transition_name and preserve original casing
        // Format: "State Name-|-Other State Name" -> "State Name" and "Other State Name"
        if (!fromStatus || !toStatus) {
          const parts = transition.transition_name.split("-|-");
          if (parts.length === 2) {
            if (!fromStatus) fromStatus = parts[0];
            if (!toStatus) toStatus = parts[1];
          }
        }

        if (!fromStatus || !toStatus) {
          throw new Error(
            `Cannot determine status values for transition "${transition.transition_name}"`
          );
        }

        if (!transition.required_role_id) {
          throw new Error(`Transition "${transition.transition_name}" must have a role assigned`);
        }

        const response = await createWorkflowTransition({
          workflow_id: workflowId,
          from_status: fromStatus,
          to_status: toStatus,
          required_role_id: transition.required_role_id
        });

        if (!response.success) {
          throw new Error(
            `Failed to create transition "${transition.transition_name}": ${response.message}`
          );
        }

        createdTransitions.push(response.data);
      }

      return {
        success: true,
        data: { transitions: createdTransitions } as any
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create workflow transitions";
      setState({ isLoading: false, error: errorMessage });
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Update workflow transitions
   */
  const updateTransitions = async (
    transitions: Transition[],
    states?: State[]
  ): Promise<SaveWorkflowResult> => {
    try {
      const updatedTransitions: Transition[] = [];

      for (const transition of transitions) {
        if (!transition._serverId) continue; // Skip if no server ID

        // Extract status values from state IDs or transition name
        let fromStatus = "";
        let toStatus = "";

        // Try to get status from state names if states are provided
        if (states) {
          const fromState = states.find((s) => s.id === transition.from_state_id);
          const toState = states.find((s) => s.id === transition.to_state_id);

          if (fromState) {
            fromStatus = fromState.name;
          }
          if (toState) {
            toStatus = toState.name;
          }
        }

        // Fallback: Extract from transition_name and preserve original casing
        // Format: "State Name-|-Other State Name" -> "State Name" and "Other State Name"
        if (!fromStatus || !toStatus) {
          const parts = transition.transition_name.split("-|-");
          if (parts.length === 2) {
            if (!fromStatus) fromStatus = parts[0];
            if (!toStatus) toStatus = parts[1];
          }
        }

        if (!fromStatus || !toStatus) {
          throw new Error(
            `Cannot determine status values for transition "${transition.transition_name}"`
          );
        }

        if (!transition.required_role_id) {
          throw new Error(`Transition "${transition.transition_name}" must have a role assigned`);
        }

        const response = await updateWorkflowTransition(transition._serverId, {
          from_status: fromStatus,
          to_status: toStatus,
          required_role_id: transition.required_role_id
        });

        if (!response.success) {
          throw new Error(
            `Failed to update transition "${transition.transition_name}": ${response.message}`
          );
        }

        updatedTransitions.push(response.data);
      }

      return {
        success: true,
        data: { transitions: updatedTransitions } as any
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update workflow transitions";
      setState({ isLoading: false, error: errorMessage });
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Delete workflow transitions
   */
  const deleteTransitions = async (transitions: Transition[]): Promise<SaveWorkflowResult> => {
    try {
      for (const transition of transitions) {
        if (!transition._serverId) continue; // Skip if no server ID

        const response = await deleteWorkflowTransition(transition._serverId);

        if (!response.success) {
          throw new Error(
            `Failed to delete transition "${transition.transition_name}": ${response.message}`
          );
        }
      }

      return {
        success: true
      };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete workflow transitions";
      setState({ isLoading: false, error: errorMessage });
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Save or update workflow with all states and transitions
   * Comprehensive save that handles the complete workflow structure
   */
  const saveOrUpdateWorkflow = async (
    workflow: WorkflowItem,
    isExisting: boolean
  ): Promise<SaveWorkflowResult> => {
    setState({ isLoading: true, error: null });

    try {
      // Step 1: Create or update the workflow itself
      let workflowResult: SaveWorkflowResult;

      if (isExisting) {
        workflowResult = await updateWorkflowData(workflow.id, workflow);
      } else {
        workflowResult = await saveWorkflow(workflow);
      }

      if (!workflowResult.success) {
        throw new Error(workflowResult.error || "Failed to save workflow");
      }

      const workflowId = workflowResult.data?.id || workflow.id;

      // Step 2: Categorize states by change type
      const statesToCreate = ((workflow.states || []) as State[]).filter(
        (s) => s._changeType === "created"
      );
      const statesToUpdate = ((workflow.states || []) as State[]).filter(
        (s) => s._changeType === "modified"
      );
      const statesToDelete = ((workflow.states || []) as State[]).filter(
        (s) => s._changeType === "deleted"
      );

      // Step 3: Categorize transitions by change type
      const transitionsToCreate = ((workflow.transitions || []) as Transition[]).filter(
        (t) => t._changeType === "created"
      );
      const transitionsToUpdate = ((workflow.transitions || []) as Transition[]).filter(
        (t) => t._changeType === "modified" || t._changeType === "synced"
      );
      const transitionsToDelete = ((workflow.transitions || []) as Transition[]).filter(
        (t) => t._changeType === "deleted"
      );

      // Step 4: Save states (delete first, then update, then create)
      if (statesToDelete.length > 0) {
        const deleteResult = await deleteStates(statesToDelete);
        if (!deleteResult.success) {
          throw new Error(deleteResult.error || "Failed to delete states");
        }
      }

      if (statesToUpdate.length > 0) {
        const updateResult = await updateStates(workflowId, statesToUpdate);
        if (!updateResult.success) {
          throw new Error(updateResult.error || "Failed to update states");
        }
      }

      if (statesToCreate.length > 0) {
        const createResult = await createStates(workflowId, statesToCreate);
        if (!createResult.success) {
          throw new Error(createResult.error || "Failed to create states");
        }
      }

      // Step 5: Save transitions (delete first, then update, then create)
      if (transitionsToDelete.length > 0) {
        const deleteResult = await deleteTransitions(transitionsToDelete);
        if (!deleteResult.success) {
          throw new Error(deleteResult.error || "Failed to delete transitions");
        }
      }

      if (transitionsToUpdate.length > 0) {
        const updateResult = await updateTransitions(transitionsToUpdate, workflow.states);
        if (!updateResult.success) {
          throw new Error(updateResult.error || "Failed to update transitions");
        }
      }

      if (transitionsToCreate.length > 0) {
        const createResult = await createTransitions(
          workflowId,
          transitionsToCreate,
          workflow.states
        );
        if (!createResult.success) {
          throw new Error(createResult.error || "Failed to create transitions");
        }
      }

      setState({ isLoading: false, error: null });

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

  return {
    saveWorkflow,
    updateWorkflowData,
    // deleteWorkflow,
    saveOrUpdateWorkflow,
    createStates,
    updateStates,
    deleteStates,
    createTransitions,
    updateTransitions,
    deleteTransitions,
    isLoading: state.isLoading,
    error: state.error
  };
}
