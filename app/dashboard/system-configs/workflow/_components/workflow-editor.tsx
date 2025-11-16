"use client";
import { EntityType, State, Transition, Workflow, WorkflowTriggerType } from "@/lib/types/workflow";
import { useState, useMemo } from "react";
import { WorkflowHeader } from "./workflow-header";
import { WorkflowCanvas } from "./workflow-canvas";
import { TransitionPanel } from "./transition-panel";
import { useWorkflowMutations } from "@/hooks/use-workflow-mutations";
import {
  getWorkflowDetails,
  getWorkflowStates,
  getWorkflowTransitions
} from "@/app/_actions/workflow-actions";
import { toast } from "sonner";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { QUERY_KEYS } from "@/lib/constants";
import { STANDARD_STATUSES } from "@/lib/statuses";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface WorkflowEditorProps {
  onBack: () => void;
  workflowId?: string | null;
}

// Helper function to transform API response to editor format
const transformWorkflowData = (apiWorkflow: any): Workflow => {
  // Map states from API format (snake_case)
  const mappedStates: State[] = (apiWorkflow?.states || []).map((state: any) => ({
    id: state.id,
    name: state.name,
    isInitial: state.is_initial ?? false,
    isFinal: state.is_final ?? false,
    position: state.position || { x: 100, y: 100 },
    description: state.description,
    color: state.color,
    display_order: state.display_order ?? 0,
    _changeType: "synced" as const,
    _serverId: state.id
  }));

  // Map transitions from API format
  const mappedTransitions: Transition[] = (apiWorkflow?.transitions || []).map((trans: any) => ({
    id: trans.id,
    from_state_id: trans.from_state_id,
    to_state_id: trans.to_state_id,
    transition_name: trans.transition_name || trans.action_name || trans.name,
    permissions: (trans.permissions || []).map((perm: any) => ({
      id: perm.id || `perm-${Date.now()}`,
      role: perm.role?.name || perm.role_name || ""
    })),
    conditions: (trans.conditions || []).map((cond: any) => ({
      id: cond.id || `cond-${Date.now()}`,
      field: cond.field,
      operator: cond.operator,
      value: cond.value,
      description: cond.description
    })),
    actions: (trans.actions || []).map((action: any) => ({
      id: action.id || `action-${Date.now()}`,
      type: action.type,
      config: action.config || {},
      description: action.description
    })),
    description: trans.description,
    _changeType: "synced" as const,
    _serverId: trans.id
  }));

  return {
    id: apiWorkflow.id,
    name: apiWorkflow.name,
    trigger_type: apiWorkflow.trigger_type || apiWorkflow.entity_type || "AUDIT_PLAN",
    states: mappedStates,
    transitions: mappedTransitions,
    entry_conditions: (apiWorkflow.entry_conditions || []).map((cond: any) => ({
      id: cond.id || `cond-${Date.now()}`,
      field: cond.field,
      operator: cond.operator,
      value: cond.value,
      description: cond.description
    })),
    description: apiWorkflow.description,
    status: apiWorkflow.status
  };
};

export const WorkflowEditor = ({ onBack, workflowId }: WorkflowEditorProps) => {
  const { saveOrUpdateWorkflow, isLoading: isSaving } = useWorkflowMutations();
  const queryClient = useQueryClient();

  // Create default workflow template
  const createDefaultWorkflow = (): Workflow => ({
    id: `wf-${Date.now()}`,
    name: "New Workflow",
    trigger_type: "AUDIT_PLAN",
    states: [
      {
        id: "state-1",
        name: "Draft",
        isInitial: true,
        isFinal: false,
        position: { x: 100, y: 100 },
        _changeType: "created"
      },
      {
        id: "state-2",
        name: "Submitted",
        isInitial: false,
        isFinal: false,
        position: { x: 400, y: 100 },
        _changeType: "created"
      },
      {
        id: "state-3",
        name: "Approved",
        isInitial: false,
        isFinal: true,
        position: { x: 700, y: 100 },
        _changeType: "created"
      }
    ],
    transitions: [
      {
        id: "trans-1",
        from_state_id: "state-1",
        to_state_id: "state-2",
        transition_name: "SUBMIT",
        permissions: [{ id: "p1", role: "AUDITOR" }],
        conditions: [],
        actions: [],
        _changeType: "created"
      },
      {
        id: "trans-2",
        from_state_id: "state-2",
        to_state_id: "state-3",
        transition_name: "APPROVE_HIAR",
        permissions: [{ id: "p2", role: "HIAR" }],
        conditions: [{ id: "c1", field: "budget", operator: "<", value: "10000" }],
        actions: [{ id: "a1", type: "send_email", config: { recipient: "auditor" } }],
        _changeType: "created"
      }
    ],
    entry_conditions: []
  });

  // Use TanStack Query to fetch workflow data
  const {
    data: fetchedWorkflow,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: [QUERY_KEYS.WORKFLOWS, workflowId],
    queryFn: async () => {
      if (!workflowId) return null;

      const [details, states, transitions] = await Promise.all([
        getWorkflowDetails(workflowId),
        getWorkflowStates(workflowId),
        getWorkflowTransitions(workflowId)
      ]);

      if (!details.success || !states.success || !transitions.success) {
        throw new Error(details.message || "Failed to load workflow");
      }

      return transformWorkflowData({
        ...details.data,
        states: states?.data || [],
        transitions: transitions?.data || []
      });
    },
    enabled: !!workflowId, // Only fetch if workflowId exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1 // Retry once on failure
  });

  // Determine the initial workflow (from API or default template)
  const initialWorkflow = useMemo(() => {
    if (workflowId && fetchedWorkflow) {
      return fetchedWorkflow;
    }
    return createDefaultWorkflow();
  }, [workflowId, fetchedWorkflow]);

  // Local state for editing
  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);
  const [selectedTransition, setSelectedTransition] = useState<Transition | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    stateId: string | null;
    stateName: string;
    relatedTransitionCount: number;
  }>({
    isOpen: false,
    stateId: null,
    stateName: "",
    relatedTransitionCount: 0
  });

  // Update local state when fetched data changes
  useMemo(() => {
    if (initialWorkflow) {
      setWorkflow(initialWorkflow);
    }
  }, [initialWorkflow]);

  const handleStateAdd = () => {
    const newState: State = {
      id: `state-${Date.now()}`,
      name: `State ${workflow.states.length + 1}`,
      isInitial: false,
      isFinal: false,
      position: { x: 100 + workflow.states.length * 50, y: 100 + workflow.states.length * 50 },
      _changeType: "created"
    };

    setWorkflow({
      ...workflow,
      states: [...workflow.states, newState]
    });

    toast.success("State added");
  };

  const handleStateUpdate = (updatedState: State) => {
    const states = workflow.states || [];

    // Enforce: only one initial state
    if (updatedState.isInitial && states.some((s) => s.id !== updatedState.id && s.isInitial)) {
      toast.error("Only one initial state is allowed");
      return;
    }

    // Enforce: only one final state
    if (updatedState.isFinal && states.some((s) => s.id !== updatedState.id && s.isFinal)) {
      toast.error("Only one final state is allowed");
      return;
    }

    // Mark as modified if it was synced
    const stateToUpdate = {
      ...updatedState,
      _changeType: (updatedState._changeType === "synced"
        ? "modified"
        : updatedState._changeType) as any
    };

    // Update the state
    const newStates = states.map((s) => {
      if (s.id === updatedState.id) {
        return stateToUpdate;
      }
      // If setting this state as initial/final, unset other states
      if (updatedState.isInitial && s.isInitial && s.id !== updatedState.id) {
        return {
          ...s,
          isInitial: false,
          _changeType: (s._changeType === "synced" ? "modified" : s._changeType) as any
        };
      }
      if (updatedState.isFinal && s.isFinal && s.id !== updatedState.id) {
        return {
          ...s,
          isFinal: false,
          _changeType: (s._changeType === "synced" ? "modified" : s._changeType) as any
        };
      }
      return s;
    });

    setWorkflow({
      ...workflow,
      states: newStates
    });
  };

  const handleStateDelete = (stateId: string) => {
    // Find the state and related transitions
    const stateToDelete = (workflow.states || []).find((s) => s.id === stateId);
    const relatedTransitions = (workflow.transitions || []).filter(
      (t) =>
        (t.from_state_id === stateId || t.to_state_id === stateId) && t._changeType !== "deleted"
    );

    if (!stateToDelete) return;

    // Show confirmation dialog if there are related transitions
    if (relatedTransitions.length > 0) {
      setDeleteConfirmDialog({
        isOpen: true,
        stateId,
        stateName: stateToDelete.name,
        relatedTransitionCount: relatedTransitions.length
      });
    } else {
      // No transitions, delete immediately
      performStateDelete(stateId);
    }
  };

  const performStateDelete = (stateId: string) => {
    // Mark the state as deleted instead of removing it
    // This allows proper cleanup on save
    const updatedStates = (workflow.states || []).map((s) =>
      s.id === stateId ? { ...s, _changeType: "deleted" as const } : s
    );

    // Also mark related transitions as deleted
    const updatedTransitions = (workflow.transitions || []).map((t) =>
      t.from_state_id === stateId || t.to_state_id === stateId
        ? { ...t, _changeType: "deleted" as const }
        : t
    );

    setWorkflow({
      ...workflow,
      states: updatedStates,
      transitions: updatedTransitions
    });

    toast.success("State marked for deletion");
  };

  const handleTransitionClick = (transition: Transition) => {
    setSelectedTransition(transition);
    setIsPanelOpen(true);
  };

  const handleTransitionUpdate = (updatedTransition: Transition) => {
    // Mark as modified if it was synced
    const transitionToUpdate = {
      ...updatedTransition,
      _changeType: (updatedTransition._changeType === "synced"
        ? "modified"
        : updatedTransition._changeType) as any
    };

    // Update workflow with the new transition
    let updatedWorkflow = {
      ...workflow,
      transitions: (workflow.transitions || []).map((t) =>
        t.id === updatedTransition.id ? transitionToUpdate : t
      )
    };

    // Rename states to match the transition's status labels immediately
    updatedWorkflow = applyStateRenaming({
      ...updatedWorkflow,
      transitions: updatedWorkflow.transitions || []
    });

    setWorkflow(updatedWorkflow);

    // Update selectedTransition to keep the panel in sync
    setSelectedTransition(transitionToUpdate);

    toast.success("Transition updated");
  };

  const handleTransitionAdd = (from_state_id: string, to_state_id: string) => {
    const transitions = workflow.transitions || [];
    const exists = transitions.some(
      (t) =>
        t.from_state_id === from_state_id &&
        t.to_state_id === to_state_id &&
        t._changeType !== "deleted"
    );

    if (exists) {
      toast.error("Transition already exists between these states");
      return;
    }

    // Generate transition_name from status values (will be set in transition panel)
    const newTransition: Transition = {
      id: `trans-${Date.now()}`,
      from_state_id,
      to_state_id,
      transition_name: "DRAFT_TO_SUBMITTED", // Default transition name format
      permissions: [],
      conditions: [],
      actions: [],
      _changeType: "created"
    };

    setWorkflow({
      ...workflow,
      transitions: [...transitions, newTransition]
    });

    setSelectedTransition(newTransition);
    setIsPanelOpen(true);
    toast.success("Transition added - configure it now");
  };

  /**
   * Apply state renaming based on transitions' status labels
   * Used when a transition is saved to immediately update state names
   * without waiting for workflow save
   */
  const applyStateRenaming = (workflowToUpdate: Workflow): Workflow => {
    let states = [...(workflowToUpdate.states || [])];
    let transitions = [...(workflowToUpdate.transitions || [])];

    // Map status labels to state IDs for updating transitions
    const statusLabelToStateId = new Map<string, string>();

    // Track which state IDs have already been assigned to a status to prevent duplicates
    const usedStateIds = new Set<string>();

    // Extract all status names from transitions
    const statusesFromTransitions = new Set<string>();
    transitions.forEach((trans) => {
      const parts = trans.transition_name.split("_TO_");
      if (parts.length === 2) {
        const fromStatus = parts[0];
        const toStatus = parts[1];

        // Only add if it's a valid status
        if (fromStatus in STANDARD_STATUSES) statusesFromTransitions.add(fromStatus);
        if (toStatus in STANDARD_STATUSES) statusesFromTransitions.add(toStatus);
      }
    });

    // Update existing states to match status labels
    statusesFromTransitions.forEach((statusId) => {
      const statusConfig = STANDARD_STATUSES[statusId as keyof typeof STANDARD_STATUSES];
      if (statusConfig) {
        const label = statusConfig.label;

        // Check if a state with this label already exists
        const existingStateWithLabel = states.find(
          (s) => s._changeType !== "deleted" && s.name === label
        );

        if (existingStateWithLabel) {
          // State with this label already exists, just map it
          statusLabelToStateId.set(label, existingStateWithLabel.id);
          usedStateIds.add(existingStateWithLabel.id);
        } else {
          // Check if there's an unnamed or generic state that we can rename
          const genericState = states.find(
            (s) =>
              s._changeType !== "deleted" &&
              !usedStateIds.has(s.id) &&
              (s.name.startsWith("State ") ||
                !Object.values(STANDARD_STATUSES).some((config) => config.label === s.name))
          );

          if (genericState) {
            // Rename existing generic state to match status label
            const newChangeType = (
              genericState._changeType === "synced" ? "modified" : genericState._changeType
            ) as "created" | "modified" | "deleted" | "synced" | undefined;
            const renamedState = {
              ...genericState,
              name: label,
              _changeType: newChangeType
            };
            states = states.map((s) => (s.id === genericState.id ? renamedState : s));
            statusLabelToStateId.set(label, genericState.id);
            usedStateIds.add(genericState.id);
          } else {
            // Create a new state with the status label as name
            const newStateId = `state-${statusId}-${Date.now()}`;
            const newState: State = {
              id: newStateId,
              name: label,
              isInitial: false,
              isFinal: false,
              position: { x: 100 + states.length * 50, y: 100 },
              _changeType: "created"
            };
            states.push(newState);
            statusLabelToStateId.set(label, newStateId);
            usedStateIds.add(newStateId);
          }
        }
      }
    });

    // Update transition state IDs to point to the created/renamed states
    transitions = transitions.map((trans) => {
      const parts = trans.transition_name.split("_TO_");
      if (parts.length === 2) {
        const fromStatusId = parts[0];
        const toStatusId = parts[1];

        const fromStatusConfig = STANDARD_STATUSES[fromStatusId as keyof typeof STANDARD_STATUSES];
        const toStatusConfig = STANDARD_STATUSES[toStatusId as keyof typeof STANDARD_STATUSES];

        let updatedTrans = { ...trans };

        // Update from_state_id if we have a matching state
        if (fromStatusConfig) {
          const stateId = statusLabelToStateId.get(fromStatusConfig.label);
          if (stateId) {
            updatedTrans.from_state_id = stateId;
          }
        }

        // Update to_state_id if we have a matching state
        if (toStatusConfig) {
          const stateId = statusLabelToStateId.get(toStatusConfig.label);
          if (stateId) {
            updatedTrans.to_state_id = stateId;
          }
        }

        return updatedTrans;
      }
      return trans;
    });

    return { ...workflowToUpdate, states, transitions };
  };

  const handleSave = async () => {
    if (!workflow.name.trim()) {
      toast.error("Workflow name is required");
      return;
    }

    // States are already renamed when transitions are saved, so no need to call autoCreateMissingStates
    const workflowToSave = workflow;

    const activeStates = (workflowToSave.states || []).filter((s) => s._changeType !== "deleted");

    if (activeStates.length === 0) {
      toast.error("Workflow must have at least one state");
      return;
    }

    const hasInitialState = activeStates.some((s) => s.isInitial);
    if (!hasInitialState) {
      toast.error("Workflow must have exactly one initial state");
      return;
    }

    const initialStateCount = activeStates.filter((s) => s.isInitial).length;
    if (initialStateCount > 1) {
      toast.error("Workflow can only have one initial state");
      return;
    }

    const finalStateCount = activeStates.filter((s) => s.isFinal).length;
    if (finalStateCount > 1) {
      toast.error("Workflow can only have one final state");
      return;
    }

    const isExisting = !!workflowId;

    const result = await saveOrUpdateWorkflow(workflowToSave, isExisting);

    if (result.success) {
      toast.success(isExisting ? "Workflow updated successfully" : "Workflow created successfully");

      // Invalidate workflow queries to trigger refetch
      await queryClient.invalidateQueries({ queryKey: ["workflows"] });

      // Close the editor
      onBack();
    } else {
      toast.error(result.error || "Failed to save workflow");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[92svh] flex-col items-center justify-center">
        <Spinner className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground mt-4 text-sm">Loading workflow...</p>
      </div>
    );
  }

  // Error state
  if (isError && workflowId) {
    return (
      <div className="flex h-[92svh] flex-col items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <p className="font-semibold">Failed to load workflow</p>
            <p className="mt-1 text-sm">{error?.message || "An error occurred"}</p>
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[92svh] flex-col">
      <WorkflowHeader
        workflowName={workflow.name}
        triggerType={workflow.trigger_type}
        onWorkflowNameChange={(name) => setWorkflow({ ...workflow, name })}
        onTriggerTypeChange={(trigger_type: WorkflowTriggerType) =>
          setWorkflow({ ...workflow, trigger_type })
        }
        onSave={handleSave}
        onBack={onBack}
        isLoading={isSaving}
        onStateAdd={handleStateAdd}
      />

      <WorkflowCanvas
        states={workflow.states}
        transitions={workflow.transitions}
        onStateAdd={handleStateAdd}
        onStateUpdate={handleStateUpdate}
        onStateDelete={handleStateDelete}
        onTransitionClick={handleTransitionClick}
        onTransitionAdd={handleTransitionAdd}
      />

      <TransitionPanel
        transition={selectedTransition}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedTransition(null);
        }}
        onUpdate={handleTransitionUpdate}
        states={workflow.states}
        workflowId={workflow.id}
      />

      <AlertDialog
        open={deleteConfirmDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmDialog({ ...deleteConfirmDialog, isOpen: false });
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete State "{deleteConfirmDialog.stateName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  This state has <strong>{deleteConfirmDialog.relatedTransitionCount}</strong>{" "}
                  transition
                  {deleteConfirmDialog.relatedTransitionCount !== 1 ? "s" : ""} attached to it.
                </p>
                <p>
                  When you delete this state, all related transitions will also be removed. The
                  incomplete transitions will show partial state names.
                </p>
                <p className="text-muted-foreground pt-2 text-sm">
                  To complete the workflow, you'll need to add new states and connect them to form
                  valid transitions.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteConfirmDialog({ ...deleteConfirmDialog, isOpen: false });
              }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmDialog.stateId) {
                  performStateDelete(deleteConfirmDialog.stateId);
                  setDeleteConfirmDialog({ ...deleteConfirmDialog, isOpen: false });
                }
              }}
              className="bg-destructive hover:bg-destructive/90 text-white">
              Delete State
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkflowEditor;
