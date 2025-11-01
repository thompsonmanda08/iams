"use client";
import { useState } from "react";
import { Plus, Trash2, Workflow, Edit2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkflowEditor from "./workflow-editor";
import PageHeader from "@/components/page-header";
import { WorkflowSimulator } from "./workflow-simulator";
import { useWorkflowStore } from "@/lib/stores/workflow-store";
import { useWorkflowMutations } from "@/lib/hooks/use-workflow-mutations";

const WorkflowClient = ({ initialData }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const { workflows } = useWorkflowStore();
  const { deleteWorkflow: deleteWorkflowMutation } = useWorkflowMutations();

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
        {/* Workflow Simulator */}
        <WorkflowSimulator />

        {/* Saved Workflows */}
        {workflows.length > 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">Saved Workflows</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workflows.map((workflow) => (
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
                          <h3 className="truncate text-lg font-semibold text-slate-900">
                            {workflow.name}
                          </h3>
                          <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                            {workflow.entityType}
                          </p>
                        </div>
                      </div>
                      {
                        // (workflow.status || workflow?.is_active || true) &&
                        <CheckCircle2 className="ml-2 h-6 w-6 shrink-0 text-emerald-500" />
                      }
                    </div>

                    {/* Divider */}
                    <div className="mb-5 h-px bg-gradient-to-r from-slate-200 to-slate-100"></div>

                    {/* Stats grid */}
                    <div className="mb-5 grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-slate-50 p-3 text-center transition-colors hover:bg-blue-50">
                        <p className="mb-1.5 text-xs font-medium text-slate-600">States</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {workflow.states.length}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 text-center transition-colors hover:bg-blue-50">
                        <p className="mb-1.5 text-xs font-medium text-slate-600">Transitions</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {workflow.transitions.length}
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-3 text-center transition-colors hover:bg-emerald-100">
                        <p className="mb-1.5 text-xs font-medium text-emerald-600">Status</p>
                        <p className="text-sm font-bold text-emerald-700">
                          {
                            // workflow.status || workflow?.is_active ||
                            true ? "Active" : "Inactive"
                          }
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={"outline"}
                        className="border-primary/20 bg-primary/5 text-primary flex-1 border"
                        onClick={() => handleEdit(workflow.id)}>
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant={"outline"}
                        onClick={() => handleDelete(workflow.id)}
                        className="flex-1 border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Get started with workflow configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary font-semibold">1.</span>
                <span>
                  Create a new workflow and select the entity type (Risk, Audit Plan, etc.)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">2.</span>
                <span>
                  Add states to define the steps in your process (Draft, Submitted, Approved)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">3.</span>
                <span>
                  Connect states with transitions and configure permissions, conditions, and actions
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">4.</span>
                <span>
                  Define entry triggers to automatically start workflows when entities are created
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowClient;
