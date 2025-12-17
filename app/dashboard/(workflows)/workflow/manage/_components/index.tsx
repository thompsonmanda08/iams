"use client";
import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  WorkflowIcon,
  GitBranch,
  MessageCircleQuestionMark,
  Settings2,
  Pencil,
  View
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkflowEditor from "./workflow-editor";
import { CreateWorkflowDialog } from "./create-workflow-dialog";
import PageHeader from "@/components/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWorkflows } from "@/hooks/use-workflow-query-data";
import { WorkflowItem } from "@/lib/types/workflow";
import { notify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  getWorkflowDetails,
  getWorkflowStates,
  getWorkflowTransitions
} from "@/app/_actions/workflow-actions";
import { QUERY_KEYS } from "@/lib/constants";

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

      <div className="container mx-auto space-y-6 p-6 px-4">
        {/* Saved Workflows */}
        {!workflows || workflows.length <= 0 ? (
          <>
            <EmptyWorkflowList onCreateWorkflow={handleNew} />
          </>
        ) : (
          <div>
            {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]"> */}
            <div className="grid grid-cols-1 gap-4">
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch workflow states and transitions when preview opens
  const { data: workflowData, isLoading: isLoadingPreview } = useQuery({
    queryKey: [QUERY_KEYS.WORKFLOWS, workflow.id, "preview"],
    queryFn: async () => {
      const [details, states, transitions] = await Promise.all([
        getWorkflowDetails(workflow.id),
        getWorkflowStates(workflow.id),
        getWorkflowTransitions(workflow.id)
      ]);

      if (!details.success || !states.success || !transitions.success) {
        throw new Error("Failed to load workflow details");
      }

      return {
        states: states.data || [],
        transitions: transitions.data || []
      };
    },
    enabled: isPreviewOpen, // Only fetch when preview is opened
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  const triggerTypeColor = {
    universe_creation: {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900/30"
    },
    audit_plan: {
      bg: "bg-purple-100 dark:bg-purple-900/20",
      text: "text-purple-700 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-900/30"
    },
    findings: {
      bg: "bg-orange-100 dark:bg-orange-900/20",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-900/30"
    },
    budget_creation: {
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-900/30"
    }
  }[workflow.trigger_type?.toLowerCase()] || {
    bg: "bg-slate-100 dark:bg-slate-900/20",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-900/30"
  };

  return (
    <div className="group bg-card flex flex-col overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md lg:flex-row lg:items-center dark:border-slate-800 dark:hover:border-slate-700">
      {/* Left gradient border */}
      <div className="h-1 w-full shrink-0 bg-linear-to-r from-blue-500 to-blue-400 transition-all duration-300 group-hover:h-1.5 lg:h-20 lg:w-1 lg:bg-linear-to-b lg:group-hover:w-1.5"></div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        {/* Left section: Icon, Name, and Trigger Type */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10 dark:bg-blue-900/20">
            <GitBranch className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
          </div>

          <div className="min-w-0">
            <h3 className="min-w-xs truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600 sm:text-base dark:text-slate-100 dark:group-hover:text-blue-400">
              {workflow.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                className={`rounded-full px-2 py-0.5 text-xs font-medium sm:px-2.5 ${triggerTypeColor.bg} ${triggerTypeColor.text} border ${triggerTypeColor.border} shrink-0`}>
                {workflow.trigger_type?.replace(/_/g, " ") || "Manual"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right section: Stats and Actions */}
        <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-end lg:gap-8">
          {/* States */}
          <div className="min-w-fit text-center">
            <div className="mb-0.5 text-xs font-medium tracking-wide text-slate-600 uppercase sm:mb-1 dark:text-slate-400">
              Stages
            </div>
            <div className="text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100">
              {Number(workflow?.state_count) - 1 || "0"}
            </div>
          </div>

          {/* Transitions */}
          <div className="min-w-fit text-center">
            <div className="mb-0.5 text-xs font-medium tracking-wide text-slate-600 uppercase sm:mb-1 dark:text-slate-400">
              <span className="hidden sm:inline">REQUIRED APPROVALS</span>
              <span className="sm:hidden">APPROVALS</span>
            </div>
            <div className="text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100">
              {workflow?.transitions_count || "0"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={() => setIsPreviewOpen(true)}
              size="sm"
              variant="outline"
              className="border-slate-200 p-0 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 sm:w-auto dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400">
              <View className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </Button>
            <Button onClick={() => onEdit(workflow.id)} size="sm">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            {/* <Button
              onClick={() => onDelete(workflow.id)}
              size="sm"
              variant="outline"
              className="h-8 w-8 border-red-100 p-0 text-red-600 hover:border-red-200 hover:bg-red-50 sm:h-9 sm:w-auto sm:px-3 dark:border-red-900/30 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-900/20">
              <Trash2 className="h-4 w-4" /> Delete
            </Button> */}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{workflow.name}</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {workflow.description || "No description provided"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Workflow Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Trigger Type
                </div>
                <Badge
                  className={`mt-1 rounded-full px-2.5 py-1 text-xs font-medium ${triggerTypeColor.bg} ${triggerTypeColor.text} border ${triggerTypeColor.border}`}>
                  {workflow.trigger_type?.replace(/_/g, " ") || "Manual"}
                </Badge>
              </div>

              {/* <div>
                <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Status
                </div>
                <Badge
                  className={`mt-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                  {workflow.is_active ? "Active" : "Inactive"}
                </Badge>
              </div> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/20">
              <div className="text-center">
                <div className="text-xs font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-400">
                  Stages
                </div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {Number(workflow?.state_count) - 1 || "0"}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-400">
                  Transitions
                </div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {workflow?.transitions_count || "0"}
                </div>
              </div>
            </div>

            {/* States and Transitions Preview */}
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="mb-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Workflow Stages
                </h4>
                <div className="space-y-2">
                  {isLoadingPreview ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Loading states...</p>
                  ) : workflowData?.states && workflowData.states.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {workflowData.states.map((state: any) => (
                        <div
                          key={state.id}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                            state.is_initial
                              ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                              : state.is_final
                                ? "border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950/30 dark:text-green-300"
                                : "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400"
                          }`}>
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              state.is_initial
                                ? "bg-amber-500"
                                : state.is_final
                                  ? "bg-green-500"
                                  : "bg-slate-400 dark:bg-slate-600"
                            }`}></span>
                          {state.state_name || state.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">No states defined</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Transitions
                </h4>
                {isLoadingPreview ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Loading transitions...
                  </p>
                ) : workflowData?.transitions && workflowData.transitions.length > 0 ? (
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {workflowData.transitions
                      .map((transition: any) => {
                        let transitionLabel =
                          transition.transition_name || transition.action_name || "";

                        // If no explicit transition name, try to construct from state names
                        if (!transitionLabel && workflowData.states) {
                          const fromState = workflowData.states?.find(
                            (s: any) => s.id === transition.from_state_id
                          );
                          const toState = workflowData.states?.find(
                            (s: any) => s.id === transition.to_state_id
                          );
                          const fromStateName = fromState?.state_name || fromState?.name || "";
                          const toStateName = toState?.state_name || toState?.name || "";

                          // Try from_status/to_status if state lookup fails
                          if (!fromStateName || !toStateName) {
                            const fromStatus = transition.from_status;
                            const toStatus = transition.to_status;
                            if (fromStatus && toStatus) {
                              const normalizedFromStatus = fromStatus
                                .toUpperCase()
                                .replace(/\s+/g, "_");
                              const normalizedToStatus = toStatus
                                .toUpperCase()
                                .replace(/\s+/g, "_");
                              transitionLabel = `${normalizedFromStatus} → ${normalizedToStatus}`;
                            }
                          } else if (fromStateName && toStateName) {
                            transitionLabel = `${fromStateName} → ${toStateName}`;
                          }
                        }

                        // Default fallback
                        if (!transitionLabel) {
                          transitionLabel = `Transition ${transition.id?.slice(0, 4)}`;
                        }

                        return (
                          <div
                            key={transition.id}
                            className="flex items-center justify-between rounded bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-900/20 dark:text-slate-400">
                            <span className="flex min-w-0 flex-1 items-center gap-2">
                              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-blue-400 dark:bg-blue-600"></span>
                              <span className="truncate">{transitionLabel}</span>
                            </span>
                            <svg
                              className="mx-2 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-blue-400 dark:bg-blue-600"></span>
                          </div>
                        );
                      })
                      .reverse()}
                  </div>
                ) : (
                  <div className="border-muted text-muted-foreground flex items-center justify-center border-dashed p-12 text-xs">
                    No transitions defined
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-semibold text-slate-600 dark:text-slate-400">Created</div>
                  <div className="mt-1 text-slate-900 dark:text-slate-300">
                    {workflow.created_at
                      ? new Date(workflow.created_at).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-600 dark:text-slate-400">Updated</div>
                  <div className="mt-1 text-slate-900 dark:text-slate-300">
                    {workflow.updated_at
                      ? new Date(workflow.updated_at).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button onClick={() => setIsPreviewOpen(false)} variant="outline">
              Close
            </Button>
            <Button
              onClick={() => {
                setIsPreviewOpen(false);
                onEdit(workflow.id);
              }}>
              <Pencil className="h-4 w-4" />
              Edit Workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
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
