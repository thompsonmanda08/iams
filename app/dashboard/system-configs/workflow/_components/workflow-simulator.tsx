"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkflowStore } from "@/lib/stores/workflow-store";
import { useEntityStore, type WorkflowEntity } from "@/lib/stores/entity-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { toast } from "sonner";
import { Play, Trash2, Database } from "lucide-react";
import type { Workflow } from "@/lib/types/workflow";

export function WorkflowSimulator() {
  const { workflows, addWorkflow, clearWorkflows } = useWorkflowStore();
  const { entities, addEntity, clearEntities } = useEntityStore();
  const { tasks, addTask, clearTasks } = useTaskStore();

  const loadSampleWorkflow = () => {
    const sampleWorkflow: Workflow = {
      id: `wf-audit-plan-${Date.now()}`,
      name: "Audit Plan Approval Workflow",
      entityType: "AUDIT_PLAN",
      states: [
        {
          id: "state-draft",
          name: "Draft",
          isInitial: true,
          isFinal: false,
          position: { x: 100, y: 200 }
        },
        {
          id: "state-submitted",
          name: "Submitted",
          isInitial: false,
          isFinal: false,
          position: { x: 300, y: 200 }
        },
        {
          id: "state-hiar-review",
          name: "HIAR Review",
          isInitial: false,
          isFinal: false,
          position: { x: 500, y: 150 }
        },
        {
          id: "state-ceo-approval",
          name: "CEO Approval",
          isInitial: false,
          isFinal: false,
          position: { x: 500, y: 250 }
        },
        {
          id: "state-approved",
          name: "Approved",
          isInitial: false,
          isFinal: true,
          position: { x: 700, y: 200 }
        },
        {
          id: "state-rejected",
          name: "Rejected",
          isInitial: false,
          isFinal: true,
          position: { x: 500, y: 350 }
        }
      ],
      transitions: [
        {
          id: "trans-submit",
          fromStateId: "state-draft",
          toStateId: "state-submitted",
          actionName: "SUBMIT",
          permissions: [{ id: "perm-1", role: "AUDITOR" }],
          conditions: [],
          actions: [
            {
              id: "action-1",
              type: "send_email",
              config: { recipient: "HIAR", subject: "New Audit Plan Submitted" }
            }
          ]
        },
        {
          id: "trans-approve-hiar-low",
          fromStateId: "state-submitted",
          toStateId: "state-hiar-review",
          actionName: "APPROVE_HIAR",
          permissions: [{ id: "perm-2", role: "HIAR" }],
          conditions: [{ id: "cond-1", field: "budget", operator: "<", value: "10000" }],
          actions: [
            {
              id: "action-2",
              type: "create_log",
              config: { message: "HIAR approved low-budget plan" }
            }
          ]
        },
        {
          id: "trans-escalate-ceo",
          fromStateId: "state-submitted",
          toStateId: "state-ceo-approval",
          actionName: "ESCALATE_CEO",
          permissions: [{ id: "perm-3", role: "HIAR" }],
          conditions: [{ id: "cond-2", field: "budget", operator: ">=", value: "10000" }],
          actions: [
            {
              id: "action-3",
              type: "send_email",
              config: { recipient: "CEO", subject: "High-Budget Audit Plan Requires Approval" }
            }
          ]
        },
        {
          id: "trans-hiar-to-approved",
          fromStateId: "state-hiar-review",
          toStateId: "state-approved",
          actionName: "FINALIZE_HIAR",
          permissions: [{ id: "perm-4", role: "HIAR" }],
          conditions: [],
          actions: [
            {
              id: "action-4",
              type: "send_email",
              config: { recipient: "AUDITOR", subject: "Audit Plan Approved" }
            }
          ]
        },
        {
          id: "trans-ceo-approve",
          fromStateId: "state-ceo-approval",
          toStateId: "state-approved",
          actionName: "APPROVE_CEO",
          permissions: [{ id: "perm-5", role: "CEO" }],
          conditions: [],
          actions: [
            {
              id: "action-5",
              type: "send_email",
              config: { recipient: "AUDITOR", subject: "CEO Approved Audit Plan" }
            },
            {
              id: "action-6",
              type: "create_log",
              config: { message: "CEO approval granted" }
            }
          ]
        },
        {
          id: "trans-reject-hiar",
          fromStateId: "state-submitted",
          toStateId: "state-rejected",
          actionName: "REJECT",
          permissions: [
            { id: "perm-6", role: "HIAR" },
            { id: "perm-7", role: "CEO" }
          ],
          conditions: [],
          actions: [
            {
              id: "action-7",
              type: "send_email",
              config: { recipient: "AUDITOR", subject: "Audit Plan Rejected" }
            }
          ]
        }
      ],
      entryConditions: []
    };

    addWorkflow(sampleWorkflow);
    toast.success("Sample workflow loaded successfully!");
  };

  const createSampleEntities = () => {
    const workflow = workflows.find((w) => w.entityType === "AUDIT_PLAN");
    if (!workflow) {
      toast.error("Please load a workflow first!");
      return;
    }

    const initialState = workflow.states.find((s) => s.isInitial);
    if (!initialState) {
      toast.error("Workflow has no initial state!");
      return;
    }

    // Create low-budget audit plan
    const lowBudgetPlan: WorkflowEntity = {
      id: `entity-plan-low-${Date.now()}`,
      type: "AUDIT_PLAN",
      name: "Q1 2025 IT Audit",
      currentState: initialState.name,
      currentStateId: initialState.id,
      data: {
        id: `entity-plan-low-${Date.now()}`,
        name: "Q1 2025 IT Audit",
        budget: 8500,
        year: 2025,
        department: "IT",
        description: "Quarterly IT systems audit"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: []
    };

    // Create high-budget audit plan
    const highBudgetPlan: WorkflowEntity = {
      id: `entity-plan-high-${Date.now() + 1}`,
      type: "AUDIT_PLAN",
      name: "Annual Financial Audit 2025",
      currentState: initialState.name,
      currentStateId: initialState.id,
      data: {
        id: `entity-plan-high-${Date.now() + 1}`,
        name: "Annual Financial Audit 2025",
        budget: 25000,
        year: 2025,
        department: "Finance",
        description: "Annual comprehensive financial audit"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: []
    };

    addEntity(lowBudgetPlan);
    addEntity(highBudgetPlan);
    toast.success("Created 2 sample audit plans!");
  };

  const triggerWorkflowActions = () => {
    if (entities.length === 0) {
      toast.error("Please create sample entities first!");
      return;
    }

    const workflow = workflows.find((w) => w.entityType === "AUDIT_PLAN");
    if (!workflow) {
      toast.error("Workflow not found!");
      return;
    }

    // Find the submit transition
    const submitTransition = workflow.transitions.find((t) => t.actionName === "SUBMIT");
    if (!submitTransition) {
      toast.error("Submit transition not found!");
      return;
    }

    // Create tasks for each entity in Draft state
    const draftEntities = entities.filter((e) => e.currentState === "Draft");

    draftEntities.forEach((entity) => {
      const requiredRole = submitTransition.permissions[0]?.role;
      if (!requiredRole) return;

      // Import mock user here to avoid circular deps
      import("@/lib/data/mock-users").then(({ getRandomUserByRole }) => {
        const assignedUser = getRandomUserByRole(requiredRole);
        if (!assignedUser) return;

        const task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          workflowId: workflow.id,
          workflowName: workflow.name,
          transitionId: submitTransition.id,
          actionName: submitTransition.actionName,
          entityType: workflow.entityType,
          entityId: entity.id,
          entityName: entity.name,
          assignedUserId: assignedUser.id,
          assignedUserName: `${assignedUser.first_name} ${assignedUser.last_name}`,
          assignedUserEmail: assignedUser.email,
          requiredRole: requiredRole,
          status: "PENDING" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            currentState: entity.currentState,
            targetState: "Submitted",
            entityData: entity.data
          }
        };

        addTask(task);
      });
    });

    toast.success(`Created tasks for ${draftEntities.length} draft entities!`);
  };

  const clearAllData = () => {
    clearWorkflows();
    clearEntities();
    clearTasks();
    toast.success("All simulation data cleared!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Simulation</CardTitle>
        <CardDescription>
          Load sample data and simulate end-to-end workflow execution with task assignment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Step 1: Load Workflow</h4>
            <Button onClick={loadSampleWorkflow} className="w-full gap-2">
              <Database className="h-4 w-4" />
              Load Sample Workflow
            </Button>
            <p className="text-xs text-muted-foreground">
              Loads an Audit Plan approval workflow with HIAR and CEO approvals
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Step 2: Create Entities</h4>
            <Button onClick={createSampleEntities} variant="secondary" className="w-full gap-2">
              <Play className="h-4 w-4" />
              Create Sample Audit Plans
            </Button>
            <p className="text-xs text-muted-foreground">
              Creates 2 audit plans: one low-budget ($8,500) and one high-budget ($25,000)
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Step 3: Generate Tasks</h4>
            <Button onClick={triggerWorkflowActions} variant="secondary" className="w-full gap-2">
              <Play className="h-4 w-4" />
              Create Tasks for Draft Plans
            </Button>
            <p className="text-xs text-muted-foreground">
              Creates SUBMIT tasks assigned to AUDITOR role users
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Clear All Data</h4>
            <Button onClick={clearAllData} variant="destructive" className="w-full gap-2">
              <Trash2 className="h-4 w-4" />
              Clear All Simulation Data
            </Button>
            <p className="text-xs text-muted-foreground">
              Removes all workflows, entities, and tasks from storage
            </p>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">Current Data Summary:</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Workflows:</span>{" "}
              <span className="font-medium">{workflows.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Entities:</span>{" "}
              <span className="font-medium">{entities.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tasks:</span>{" "}
              <span className="font-medium">{tasks.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-sm mb-2">How to Test:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>Load the sample workflow using the button above</li>
            <li>Create sample audit plans (entities)</li>
            <li>Generate tasks for the draft plans</li>
            <li>Navigate to Tasks page to see assigned tasks</li>
            <li>Approve/reject tasks and watch the workflow progress</li>
            <li>Observe how budget conditions route to HIAR vs CEO</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
