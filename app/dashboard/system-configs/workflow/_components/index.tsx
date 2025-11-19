"use client";
import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  WorkflowIcon,
  Edit2,
  GitBranch,
  MessageCircleQuestionMark,
  Settings
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkflowEditor from "./workflow-editor";
import { CreateWorkflowDialog } from "./create-workflow-dialog";
import PageHeader from "@/components/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWorkflows } from "@/hooks/use-workflow-query-data";
import { WorkflowItem } from "@/lib/types/workflow";
import { Badge } from "@/components/ui/badge";
import { notify } from "@/lib/utils";

interface WorkflowClientProps {
  initialWorkflows: WorkflowItem[];
}

const WorkflowClient = ({ initialWorkflows }: WorkflowClientProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  // const { deleteWorkflow: deleteWorkflowMutation } = useWorkflowMutations();

  // Use TanStack Query to manage workflow list with initial data
  const { data: workflowsData, refetch } = useWorkflows(initialWorkflows);
  const workflows: WorkflowItem[] = (workflowsData as WorkflowItem[]) || [];

  const handleEdit = (workflowId: string) => {
    setEditingWorkflowId(workflowId);
    setIsEditing(true);
  };

  const handleNew = () => {
    setIsCreateDialogOpen(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    setEditingWorkflowId(null);
  };

  const handleDelete = (workflowId: string) => {
    setWorkflowToDelete(workflowId);
    setIsDeleteDialogOpen(true);
  };


  const workflowBeingDeleted = useMemo(
    () => workflows?.find((w) => w.id === workflowToDelete),
    [workflowToDelete, workflows]
  );

  const handleConfirmDelete = async () => {
    if (true) {
      return notify({
        title: "Maintenance Mode",
        description: "This action is not allowed at the moment.",
        type: "warning"
      });
    }
    // if (workflowToDelete) {
    //   setIsDeletingLoading(true);
    //   try {
    //     await deleteWorkflowMutation(workflowToDelete);
    //     setIsDeleteDialogOpen(false);
    //     setWorkflowToDelete(null);
    //     refetch();
    //   } finally {
    //     setIsDeletingLoading(false);
    //   }
    // }
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  return isEditing ? (
    <WorkflowEditor onBack={handleBack} workflowId={editingWorkflowId} allWorkflows={workflows} />
  ) : (
    <div className="">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Workflow Setup"
              description="Configure and manage your workflow processes"
              Icon={WorkflowIcon}
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
        {!workflows || workflows.length <= 0 ? (
          <>
            <EmptyWorkflowList onCreateWorkflow={handleNew} />
          </>
        ) : (
          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
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

        {workflows && workflows.length > 4 ? (
          <Popover>
            <PopoverTrigger className="bg-primary text-primary-foreground absolute right-8 bottom-8 z-10 grid aspect-square h-16! max-h-none! w-16 place-items-center rounded-full p-0! shadow-xl">
              <MessageCircleQuestionMark className="h-8 w-8" strokeWidth={1.5} />
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-none border-none bg-transparent">
              <QuickStartGuide />
            </PopoverContent>
          </Popover>
        ) : (
          <QuickStartGuide />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
              <AlertDialogDescription>
                {workflowBeingDeleted
                  ? `You are about to permanently delete the workflow "${workflowBeingDeleted.name}". All states, transitions, and configuration data will be lost. This action cannot be undone.`
                  : "This action cannot be undone. This will permanently delete the workflow and all its associated data."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setWorkflowToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeletingLoading}
                className="bg-destructive hover:bg-destructive/90 text-white">
                Delete Workflow
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create Workflow Dialog */}
        <CreateWorkflowDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleCreateSuccess}
          existingWorkflows={workflows}
        />
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
  workflow: WorkflowItem;
  onEdit: (workflowId: string) => void;
  onDelete: (workflowId: string) => void;
}) {
  return (
    <Card
      key={workflow.id}
      className="group border-muted bg-card relative overflow-hidden rounded-xl border p-0 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Top accent bar */}
      <div className="from-primary dark:from-accent/50 dark:to-primary/50 via-primary/80 to-secondary/60 absolute top-0 right-0 left-0 h-1 bg-linear-to-r"></div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex flex-1 items-start gap-3">
            <div className="bg-primary dark:bg-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors">
              <WorkflowIcon className="text-primary-foreground dark:text-foreground/50 h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground mb-1 line-clamp-2 max-w-xs leading-5 font-semibold">
                {workflow.name}
              </h3>
              <div className="flex gap-2">
                <Badge
                  variant={"outline"}
                  className="dark:text-foreground/60 text-xs font-medium tracking-wider text-slate-500 uppercase">
                  {workflow.trigger_type}
                </Badge>{" "}
                <Badge variant={"success"} className=" ">
                  {workflow?.is_active || true ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-5 h-px bg-linear-to-r from-slate-200 to-slate-100"></div>

        {/* Stats grid */}

        {/* Action buttons */}
        <div className="flex items-start justify-between gap-2">
          <div className="grid gap-2">
            <Badge variant={"info"} className="px-2 py-1 text-base">
              {workflow?.state_count || "0"} State{Number(workflow?.state_count) > 1 ? "s" : ""}
            </Badge>
            <Badge variant={"warning"} className="px-2 py-1 text-base">
              {workflow?.transitions_count || "0"} Transition
              {Number(workflow?.transitions_count) > 1 ? "s" : ""}
            </Badge>
          </div>
          <div className="grid gap-2">
            <Button
              variant={"outline"}
              size={"sm"}
              className="border-primary/20 bg-primary/5 text-primary flex-1 border"
              onClick={() => onEdit(workflow.id)}>
              <Settings className="h-4 w-4" />
              Update
            </Button>
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => onDelete(workflow.id)}
              className="flex-1 border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
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
