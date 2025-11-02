"use client";
import { EntityType, State, Transition, Workflow } from "@/lib/types/workflow";
import { useState, useMemo } from "react";
import { WorkflowHeader } from "./workflow-header";
import { WorkflowCanvas } from "./workflow-canvas";
import { TransitionPanel } from "./transition-panel";
import { useWorkflowMutations } from "@/lib/hooks/use-workflow-mutations";
import { getWorkflowDetails } from "@/app/_actions/workflow-actions";
import { toast } from "sonner";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface WorkflowEditorProps {
  onBack: () => void;
  workflowId?: string | null;
}

// Helper function to transform API response to editor format
const transformWorkflowData = (apiWorkflow: any): Workflow => {
  // Map states from API format (snake_case)
  const mappedStates: State[] = (apiWorkflow.states || []).map((state: any) => ({
    id: state.id,
    name: state.name,
    isInitial: state.is_initial ?? false,
    isFinal: state.is_final ?? false,
    position: state.position || { x: 100, y: 100 },
    description: state.description,
    color: state.color
  }));

  // Map transitions from API format
  const mappedTransitions: Transition[] = (apiWorkflow.transitions || []).map((trans: any) => ({
    id: trans.id,
    from_state_id: trans.from_state_id,
    to_state_id: trans.to_state_id,
    action_name: trans.action_name || trans.name,
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
    description: trans.description
  }));

  return {
    id: apiWorkflow.id,
    name: apiWorkflow.name,
    entityType: apiWorkflow.entity_type,
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
    entityType: "AUDIT_PLAN",
    states: [
      {
        id: "state-1",
        name: "Draft",
        isInitial: true,
        isFinal: false,
        position: { x: 100, y: 100 }
      },
      {
        id: "state-2",
        name: "Submitted",
        isInitial: false,
        isFinal: false,
        position: { x: 400, y: 100 }
      },
      {
        id: "state-3",
        name: "Approved",
        isInitial: false,
        isFinal: true,
        position: { x: 700, y: 100 }
      }
    ],
    transitions: [
      {
        id: "trans-1",
        from_state_id: "state-1",
        to_state_id: "state-2",
        action_name: "SUBMIT",
        permissions: [{ id: "p1", role: "AUDITOR" }],
        conditions: [],
        actions: []
      },
      {
        id: "trans-2",
        from_state_id: "state-2",
        to_state_id: "state-3",
        action_name: "APPROVE_HIAR",
        permissions: [{ id: "p2", role: "HIAR" }],
        conditions: [{ id: "c1", field: "budget", operator: "<", value: "10000" }],
        actions: [{ id: "a1", type: "send_email", config: { recipient: "auditor" } }]
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
    queryKey: ["workflow", workflowId],
    queryFn: async () => {
      if (!workflowId) return null;

      const response = await getWorkflowDetails(workflowId);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to load workflow");
      }

      return transformWorkflowData(response.data);
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
      position: { x: 100 + workflow.states.length * 50, y: 100 + workflow.states.length * 50 }
    };

    setWorkflow({
      ...workflow,
      states: [...workflow.states, newState]
    });

    toast.success("State added");
  };

  const handleStateUpdate = (updatedState: State) => {
    setWorkflow({
      ...workflow,
      states: workflow.states.map((s) => (s.id === updatedState.id ? updatedState : s))
    });
  };

  const handleStateDelete = (stateId: string) => {
    setWorkflow({
      ...workflow,
      states: workflow.states.filter((s) => s.id !== stateId),
      transitions: workflow.transitions.filter(
        (t) => t.from_state_id !== stateId && t.to_state_id !== stateId
      )
    });
    toast.success("State deleted");
  };

  const handleTransitionClick = (transition: Transition) => {
    setSelectedTransition(transition);
    setIsPanelOpen(true);
  };

  const handleTransitionUpdate = (updatedTransition: Transition) => {
    setWorkflow({
      ...workflow,
      transitions: workflow.transitions.map((t) =>
        t.id === updatedTransition.id ? updatedTransition : t
      )
    });
    toast.success("Transition updated");
  };

  const handleTransitionAdd = (from_state_id: string, to_state_id: string) => {
    const exists = workflow.transitions.some(
      (t) => t.from_state_id === from_state_id && t.to_state_id === to_state_id
    );

    if (exists) {
      toast.error("Transition already exists between these states");
      return;
    }

    const newTransition: Transition = {
      id: `trans-${Date.now()}`,
      from_state_id,
      to_state_id,
      action_name: "NEW_ACTION",
      permissions: [],
      conditions: [],
      actions: []
    };

    setWorkflow({
      ...workflow,
      transitions: [...workflow.transitions, newTransition]
    });

    setSelectedTransition(newTransition);
    setIsPanelOpen(true);
    toast.success("Transition added - configure it now");
  };

  const handleSave = async () => {
    if (!workflow.name.trim()) {
      toast.error("Workflow name is required");
      return;
    }

    if (workflow.states.length === 0) {
      toast.error("Workflow must have at least one state");
      return;
    }

    const hasInitialState = workflow.states.some((s) => s.isInitial);
    if (!hasInitialState) {
      toast.error("Workflow must have an initial state");
      return;
    }

    const isExisting = !!workflowId;
    const result = await saveOrUpdateWorkflow(workflow, isExisting);

    if (result.success) {
      toast.success(isExisting ? "Workflow updated successfully" : "Workflow created successfully");

      // Invalidate workflow queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["workflows"] });

      // Close the editor
      onBack();
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
        entityType={workflow.entityType}
        onWorkflowNameChange={(name) => setWorkflow({ ...workflow, name })}
        onEntityTypeChange={(entityType: EntityType) => setWorkflow({ ...workflow, entityType })}
        onSave={handleSave}
        onBack={onBack}
        isLoading={isSaving}
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
      />
    </div>
  );
};

export default WorkflowEditor;
