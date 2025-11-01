"use client";
import { EntityType, State, Transition, Workflow } from "@/lib/types/workflow";
import { useState, useEffect } from "react";
import { WorkflowHeader } from "./workflow-header";
import { WorkflowCanvas } from "./workflow-canvas";
import { TransitionPanel } from "./transition-panel";
import { useWorkflowStore } from "@/lib/stores/workflow-store";
import { useWorkflowMutations } from "@/lib/hooks/use-workflow-mutations";
import { toast } from "sonner";

interface WorkflowEditorProps {
  onBack: () => void;
  workflowId?: string | null;
}

export const WorkflowEditor = ({ onBack, workflowId }: WorkflowEditorProps) => {
  const { getWorkflow, workflows } = useWorkflowStore();
  const { saveOrUpdateWorkflow, isLoading } = useWorkflowMutations();

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
        fromStateId: "state-1",
        toStateId: "state-2",
        actionName: "SUBMIT",
        permissions: [{ id: "p1", role: "AUDITOR" }],
        conditions: [],
        actions: []
      },
      {
        id: "trans-2",
        fromStateId: "state-2",
        toStateId: "state-3",
        actionName: "APPROVE_HIAR",
        permissions: [{ id: "p2", role: "HIAR" }],
        conditions: [{ id: "c1", field: "budget", operator: "<", value: "10000" }],
        actions: [{ id: "a1", type: "send_email", config: { recipient: "auditor" } }]
      }
    ],
    entryConditions: []
  });

  const [workflow, setWorkflow] = useState<Workflow>(() => {
    // Initialize state with either existing workflow or default
    if (workflowId) {
      const existingWorkflow = getWorkflow(workflowId);
      if (existingWorkflow) {
        return existingWorkflow;
      }
    }
    return createDefaultWorkflow();
  });

  const [selectedTransition, setSelectedTransition] = useState<Transition | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Reload workflow when workflowId changes
  useEffect(() => {
    if (workflowId) {
      const existingWorkflow = getWorkflow(workflowId);
      if (existingWorkflow) {
        setWorkflow(existingWorkflow);
      }
    } else {
      setWorkflow(createDefaultWorkflow());
    }
  }, [workflowId, getWorkflow]);

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
        (t) => t.fromStateId !== stateId && t.toStateId !== stateId
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

  const handleTransitionAdd = (fromStateId: string, toStateId: string) => {
    // Check if transition already exists
    const exists = workflow.transitions.some(
      (t) => t.fromStateId === fromStateId && t.toStateId === toStateId
    );

    if (exists) {
      toast.error("Transition already exists between these states");
      return;
    }

    const newTransition: Transition = {
      id: `trans-${Date.now()}`,
      fromStateId,
      toStateId,
      actionName: "NEW_ACTION",
      permissions: [],
      conditions: [],
      actions: []
    };

    setWorkflow({
      ...workflow,
      transitions: [...workflow.transitions, newTransition]
    });

    // Open the panel to configure the new transition
    setSelectedTransition(newTransition);
    setIsPanelOpen(true);
    toast.success("Transition added - configure it now");
  };

  const handleSave = async () => {
    // Validate workflow before saving
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

    // Check if workflow already exists
    const existingWorkflow = workflows.find((w) => w.id === workflow.id);
    const isExisting = !!existingWorkflow;

    // Use mutation to save or update
    const result = await saveOrUpdateWorkflow(workflow, isExisting);

    if (result.success) {
      // Optionally go back to list after save
      // onBack();
    }
  };

  return (
    <div className="flex h-[92svh] flex-col">
      <WorkflowHeader
        workflowName={workflow.name}
        entityType={workflow.entityType}
        onWorkflowNameChange={(name) => setWorkflow({ ...workflow, name })}
        onEntityTypeChange={(entityType: EntityType) => setWorkflow({ ...workflow, entityType })}
        onSave={handleSave}
        onBack={onBack}
        isLoading={isLoading}
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
