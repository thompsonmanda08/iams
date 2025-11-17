"use client";
import {
  EntityType,
  State,
  Transition,
  WorkflowItem,
  WorkflowTriggerType
} from "@/lib/types/workflow";
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
const transformWorkflowData = (apiWorkflow: any): WorkflowItem => {
  // Map states from API format (snake_case)
  const statesPerRow = 3; // Number of states before wrapping to next row
  const horizontalSpacing = 520; // Space between states horizontally
  const verticalSpacing = 350; // Space between rows vertically

  // Sort states by display_order before mapping
  const sortedStates = [...(apiWorkflow?.states || [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  const mappedStates: State[] = sortedStates.map((state: any, index: number) => {
    const row = Math.floor(index / statesPerRow);
    const col = index % statesPerRow;

    return {
      id: state.id,
      name: state.state_name || state.name,
      isInitial: state.is_initial ?? false,
      isFinal: state.is_final ?? false,
      position: state.position || {
        x: 150 + col * horizontalSpacing, // Horizontal position based on column
        y: 150 + row * verticalSpacing // Vertical position based on row
      },
      description: state.description,
      color: state.color,
      display_order: state.display_order ?? 0,
      _changeType: "synced" as const,
      _serverId: state.id
    };
  });

  // Map transitions from API format
  const mappedTransitions: Transition[] = (apiWorkflow?.transitions || []).map((trans: any) => {
    // Handle both state ID-based (from_state_id/to_state_id) and status-based (from_status/to_status) transitions
    let fromStateId = trans.from_state_id;
    let toStateId = trans.to_state_id;
    let transitionName = trans.transition_name || trans.action_name || trans.name || "";

    // If using status-based transitions, find the matching state IDs and construct transition name
    if ((trans.from_status || trans.to_status) && !transitionName) {
      const fromStatus = trans.from_status;
      const toStatus = trans.to_status;

      // Normalize status values: convert to uppercase and replace spaces with underscores
      const normalizeStatus = (status: string) => status?.toUpperCase().replace(/\s+/g, "_") || "";
      const normalizedFromStatus = normalizeStatus(fromStatus);
      const normalizedToStatus = normalizeStatus(toStatus);

      // Try to find state IDs by matching state names with statuses
      if (fromStatus && !fromStateId) {
        const fromState = apiWorkflow.states?.find((s: any) => {
          const stateName = s.state_name?.toUpperCase().replace(/\s+/g, "_") || "";
          return stateName === normalizedFromStatus;
        });
        if (fromState) {
          fromStateId = fromState.id;
        }
      }

      if (toStatus && !toStateId) {
        const toState = apiWorkflow.states?.find((s: any) => {
          const stateName = s.state_name?.toUpperCase().replace(/\s+/g, "_") || "";
          return stateName === normalizedToStatus;
        });
        if (toState) {
          toStateId = toState.id;
        }
      }

      // Construct transition name from status values
      if (fromStatus && toStatus) {
        transitionName = `${normalizedFromStatus}_TO_${normalizedToStatus}`;
      }
    } else if (!transitionName && (fromStateId || toStateId)) {
      // Fallback: construct from state names if IDs are available
      const fromState = apiWorkflow.states?.find((s: any) => s.id === fromStateId);
      const toState = apiWorkflow.states?.find((s: any) => s.id === toStateId);
      const fromStateName = fromState?.state_name || fromState?.name || "";
      const toStateName = toState?.state_name || toState?.name || "";
      if (fromStateName && toStateName) {
        transitionName = `${fromStateName}_TO_${toStateName}`;
      }
    }

    // Default fallback if no name could be determined
    if (!transitionName) {
      transitionName = `Transition ${trans.id?.slice(0, 4)}`;
    }

    return {
      id: trans.id,
      from_state_id: fromStateId,
      to_state_id: toStateId,
      transition_name: transitionName,
      required_role_id: trans.required_role_id || "",
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
    };
  });

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
  const createDefaultWorkflow = (): WorkflowItem => ({
    id: `wf-${Date.now()}`,
    name: "New WorkflowItem",
    trigger_type: "AUDIT_PLAN",
    states: [
      {
        id: "state-1",
        name: "Draft",
        isInitial: true,
        isFinal: false,
        position: { x: 150, y: 150 },
        _changeType: "created"
      },
      {
        id: "state-2",
        name: "Submitted",
        isInitial: false,
        isFinal: false,
        position: { x: 450, y: 150 },
        _changeType: "created"
      },
      {
        id: "state-3",
        name: "Approved",
        isInitial: false,
        isFinal: true,
        position: { x: 750, y: 150 },
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

      const fullWorkflowObject = {
        ...details.data,
        states: states?.data || [],
        transitions: transitions?.data || []
      };

      console.log("===> WORKFLOW DETAILS", fullWorkflowObject);
      console.log("===> TRANSITIONS RAW DATA", transitions?.data);
      const transformed = transformWorkflowData(fullWorkflowObject);
      console.log("===> TRANSFORMED TRANSITIONS", transformed.transitions);
      return transformed;
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
  const [workflow, setWorkflow] = useState<WorkflowItem>(initialWorkflow);
  const [selectedTransition, setSelectedTransition] = useState<Transition | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
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
    const currentStates = (workflow?.states || []) as State[];
    // Calculate the next display_order based on the maximum existing order
    const maxDisplayOrder = Math.max(0, ...currentStates.map((s) => s.display_order ?? 0));

    const newState: State = {
      id: `state-${Date.now()}`,
      name: `State ${currentStates.length + 1}`,
      isInitial: false,
      isFinal: false,
      position: {
        x: 100 + currentStates.length * 50,
        y: 100 + currentStates.length * 50
      },
      display_order: maxDisplayOrder + 1,
      _changeType: "created"
    };

    setWorkflow({
      ...workflow,
      states: [...currentStates, newState]
    });

    toast.success("State added");
  };

  const handleStateUpdate = (updatedState: State) => {
    const states = (workflow.states || []) as State[];

    // Enforce: only one initial state (excluding deleted states)
    if (
      updatedState.isInitial &&
      states.some((s) => s.id !== updatedState.id && s.isInitial && s._changeType !== "deleted")
    ) {
      toast.error("Only one initial state is allowed");
      return;
    }

    // Allow multiple final states - no restriction needed

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
      // If setting this state as initial, unset other initial states
      if (updatedState.isInitial && s.isInitial && s.id !== updatedState.id) {
        return {
          ...s,
          isInitial: false,
          _changeType: (s._changeType === "synced" ? "modified" : s._changeType) as any
        };
      }
      // Don't unset final states - allow multiple final states
      return s;
    });

    setWorkflow({
      ...workflow,
      states: newStates
    });
  };

  const handleStateDelete = (stateId: string) => {
    // Find the state and related transitions
    const stateToDelete = ((workflow.states || []) as State[]).find((s) => s.id === stateId);
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
    const updatedWorkflow = {
      ...workflow,
      transitions: (workflow.transitions || []).map((t) =>
        t.id === updatedTransition.id ? transitionToUpdate : t
      )
    };

    setWorkflow(updatedWorkflow);

    // Update selectedTransition to keep the panel in sync
    setSelectedTransition(transitionToUpdate);

    toast.success("Transition updated");
  };

  const handleTransitionAdd = (from_state_id: string, to_state_id: string) => {
    const transitions = workflow.transitions || [];

    // Allow multiple transitions between the same states (for different roles, conditions, etc.)
    // Generate transition_name from status values (will be set in transition panel)
    const newTransition: Transition = {
      id: `trans-${Date.now()}`,
      from_state_id,
      to_state_id,
      transition_name: "DRAFT_TO_SUBMITTED", // Default transition name format
      required_role_id: "",
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

  const handleSave = async () => {
    if (!workflow.name.trim()) {
      toast.error("WorkflowItem name is required");
      return;
    }

    // States are already renamed when transitions are saved, so no need to call autoCreateMissingStates
    const workflowToSave = workflow;

    const activeStates = (workflowToSave.states || []).filter((s) => s._changeType !== "deleted");

    if (activeStates.length === 0) {
      toast.error("WorkflowItem must have at least one state");
      return;
    }

    const hasInitialState = activeStates.some((s) => s.isInitial);
    if (!hasInitialState) {
      toast.error("WorkflowItem must have exactly one initial state");
      return;
    }

    const initialStateCount = activeStates.filter((s) => s.isInitial).length;
    if (initialStateCount > 1) {
      toast.error("WorkflowItem can only have one initial state");
      return;
    }

    const hasFinalState = activeStates.some((s) => s.isFinal);
    if (!hasFinalState) {
      toast.error("WorkflowItem must have at least one final state");
      return;
    }

    const isExisting = !!workflowId;

    setIsSavingLocal(true);
    const result = await saveOrUpdateWorkflow(workflowToSave, isExisting);

    if (result.success) {
      toast.success(
        isExisting ? "WorkflowItem updated successfully" : "WorkflowItem created successfully"
      );

      // Invalidate workflow queries to trigger refetch
      await queryClient.invalidateQueries({ queryKey: ["workflows"] });

      // Close the editor
      onBack();
    } else {
      toast.error(result.error || "Failed to save workflow");
      setIsSavingLocal(false);
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
        isLoading={isSaving || isSavingLocal}
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
