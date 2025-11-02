"use client";
import { useState } from "react";
import { Plus, Trash2, Workflow, Edit2, CheckCircle2, Settings, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkflowEditor from "./workflow-editor";
import PageHeader from "@/components/page-header";
import { useWorkflowMutations } from "@/lib/hooks/use-workflow-mutations";
import { useQuery } from "@tanstack/react-query";
import { listWorkflows } from "@/app/_actions/workflow-actions";
import { WorkflowListItem } from "@/lib/types/workflow";
import Link from "next/link";

interface WorkflowClientProps {
  initialWorkflows: WorkflowListItem[];
}

const WorkflowClient = ({ initialWorkflows }: WorkflowClientProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const { deleteWorkflow: deleteWorkflowMutation } = useWorkflowMutations();

  // Use TanStack Query to manage workflow list with initial data
  const { data: workflowsData } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const response = await listWorkflows();
      return response.success ? response.data?.data : [];
    },
    initialData: initialWorkflows,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const workflows: WorkflowListItem[] = (workflowsData as WorkflowListItem[]) || [];

  const handleEdit = (workflowId: string) => {
    setEditingWorkflowId(workflowId);
    setIsEditing(true);
  };

  const handleNew = () => {
    setEditingWorkflowId(null);
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    setEditingWorkflowId(null);
  };

  const handleDelete = async (workflowId: string) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      await deleteWorkflowMutation(workflowId);
    }
  };

  return isEditing ? (
    <WorkflowEditor onBack={handleBack} workflowId={editingWorkflowId} />
  ) : (
    <div className="">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Workflow Setup"
              description="Configure and manage your workflow processes"
              Icon={Workflow}
            />
            <div className="flex gap-2">
              <Button onClick={handleNew} className="gap-2">
                <Plus className="h-4 w-4" />
                New Workflow
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6 p-6">
        {/* Saved Workflows */}
        {!workflows || workflows.length < 0 ? (
          <>
            <EmptyWorkflowList onCreateWorkflow={handleNew} />
          </>
        ) : (
          <div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        <QuickStartGuide />
      </div>
    </div>
  );
};

export default WorkflowClient;

function QuickStartGuide() {
  return (
    <Card className="from-canvas to-canvas/50 border-primary/10 mt-8 bg-linear-to-br">
      <CardHeader>
        <div className="mb-2 flex items-center gap-3">
          <div className="from-primary to-primary/40 h-1 w-12 rounded-full bg-linear-to-r" />
          <CardTitle className="text-xl">Quick Start Guide</CardTitle>
        </div>
        <CardDescription>Initialize and deploy production-ready workflows</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {[
            {
              step: "01",
              action: "INITIALIZE",
              description:
                "Create a new workflow and select the entity type (Risk, Audit Plan, etc.)"
            },
            {
              step: "02",
              action: "DEFINE STATES",
              description:
                "Add states to define the steps in your process (Draft, Submitted, Approved)"
            },
            {
              step: "03",
              action: "CONFIGURE",
              description:
                "Connect states with transitions and configure permissions, conditions, and actions"
            },
            {
              step: "04",
              action: "ACTIVATE",
              description:
                "Define entry triggers to automatically start workflows when entities are created"
            }
          ].map((item) => (
            <div
              key={item.step}
              className="group border-border/50 bg-background/50 hover:border-primary/20 hover:bg-background flex gap-4 rounded-lg border p-4 transition-all duration-200">
              <div className="shrink-0">
                <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-lg border">
                  <span className="text-primary font-mono text-sm font-bold">{item.step}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-primary/80 mb-1 font-mono text-sm font-semibold">
                  {item.action}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowCard({
  workflow,
  onEdit,
  onDelete
}: {
  workflow: WorkflowListItem;
  onEdit: (workflowId: string) => void;
  onDelete: (workflowId: string) => void;
}) {
  return (
    <Card
      key={workflow.id}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Top accent bar */}
      <div className="from-primary via-primary/80 to-secondary/60 absolute top-0 right-0 left-0 h-1 bg-linear-to-r"></div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex flex-1 items-start gap-3">
            <div className="bg-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors">
              <Workflow className="text-primary-foreground h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold text-slate-900">{workflow.name}</h3>
              <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                {workflow.entity_type}
              </p>
            </div>
          </div>
          {
            // (workflow.status || workflow?.isActive || true) &&
            <CheckCircle2 className="ml-2 h-6 w-6 shrink-0 text-emerald-500" />
          }
        </div>

        {/* Divider */}
        <div className="mb-5 h-px bg-linear-to-r from-slate-200 to-slate-100"></div>

        {/* Stats grid */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 p-3 text-center transition-colors hover:bg-blue-50">
            <p className="mb-1.5 text-xs font-medium text-slate-600">States</p>
            <p className="text-2xl font-bold text-slate-900">{workflow?.states_count || "N/A"}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center transition-colors hover:bg-blue-50">
            <p className="mb-1.5 text-xs font-medium text-slate-600">Transitions</p>
            <p className="text-2xl font-bold text-slate-900">
              {workflow?.transitions_count || "N/A"}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3 text-center transition-colors hover:bg-emerald-100">
            <p className="mb-1.5 text-xs font-medium text-emerald-600">Status</p>
            <p className="text-sm font-bold text-emerald-700">
              {workflow?.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={"outline"}
              className="border-primary/20 bg-primary/5 text-primary flex-1 border"
              onClick={() => onEdit(workflow.id)}>
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <Link
              href={`/dashboard/system-configs/workflow/admin?workflow_id=${workflow.id}`}
              className="flex-1">
              <Button
                variant={"outline"}
                className="w-full border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100">
                <Settings className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>
          <Button
            variant={"outline"}
            onClick={() => onDelete(workflow.id)}
            className="w-full border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}

function EmptyWorkflowList({ onCreateWorkflow }: { onCreateWorkflow: () => void }) {
  return (
    <Card className="bg-canvas/50 border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-8 py-8">
        <div className="relative mb-4">
          <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
          <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
            <GitBranch className="text-primary h-16 w-16" strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="text-foreground mb-2 text-2xl font-semibold">No Workflows Configured</h3>
        <p className="text-muted-foreground mb-8 max-w-md text-center">
          Initialize your first workflow to begin automating state transitions and approval
          processes
        </p>

        <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
          <div className="bg-canvas border-border rounded-lg border p-4 text-center">
            <div className="text-primary mb-1 font-mono">DEFINE</div>
            <div className="text-muted-foreground">States & Transitions</div>
          </div>
          <div className="bg-canvas border-border rounded-lg border p-4 text-center">
            <div className="text-primary mb-1 font-mono">CONFIGURE</div>
            <div className="text-muted-foreground">Rules & Permissions</div>
          </div>
          <div className="bg-canvas border-border rounded-lg border p-4 text-center">
            <div className="text-primary mb-1 font-mono">DEPLOY</div>
            <div className="text-muted-foreground">Activate Workflow</div>
          </div>
        </div>

        <Button size="lg" onClick={onCreateWorkflow} className="gap-2">
          <Plus className="h-5 w-5" />
          Initialize New Workflow
        </Button>
      </CardContent>
    </Card>
  );
}
