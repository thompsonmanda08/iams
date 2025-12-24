"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye, Info, Repeat2 } from "lucide-react";
import type { Task } from "@/lib/types/task";
import type { EntityType } from "@/lib/types/entity-preview-types";
import { TaskActionDialog } from "./task-action-dialog";
import { WorkflowTaskReassignDialog } from "./workflow-task-reassign-dialog";
import { EntityPreviewDialog } from "./entity-preview-dialog";
import { formatDistanceToNow } from "date-fns";
import { getStatusLabel } from "@/lib/statuses";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/status-badge";

interface WorkflowTask {
  id: string;
  instance_id: string;
  organization_id?: string;
  required_role_id?: string;
  required_role_name?: string;
  assigned_to_user_id: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "REASSIGNED" | "APPROVED";
  created_at: string;
  updated_at: string;
  instance: {
    id?: string;
    workflow_id?: string;
    organization_id?: string;
    entity_type: string;
    entity_id?: string;
    status: string;
    is_finalized?: boolean;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
  };
  entity: {
    entity_id?: string;
    entity_name?: string;
    entity_type?: string;
    id?: string;
    status?: string;
    title?: string;
  };
}

interface WorkflowTasksTableProps {
  tasks: WorkflowTask[];
  onTaskSelect?: (task: WorkflowTask) => void;
  isLoading?: boolean;
}

/**
 * WorkflowTasksTable
 *
 * Displays a table of workflow tasks assigned to the current user
 * Shows task information, current state, and available actions
 * Users can complete, reject, or reassign tasks to themselves or others
 *
 * Naming: This table is specifically for USER-ASSIGNED WORKFLOW TASKS
 * NOT for all workflow instances (see WorkflowInstancesTable for that)
 */
export function WorkflowTasksTable({ tasks, onTaskSelect, isLoading }: WorkflowTasksTableProps) {
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"APPROVED" | "REJECTED" | null>(null);

  const handleQuickPreview = (task: WorkflowTask, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedTask(task);
    setSelectedAction(null); // Preview-only, no action
    setPreviewDialogOpen(true);
  };

  const handleQuickAction = (
    task: WorkflowTask,
    action: "APPROVED" | "REJECTED",
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setSelectedTask(task);
    setSelectedAction(action);
    setPreviewDialogOpen(true); // Show preview before action
  };

  const handleProceedToAction = () => {
    setPreviewDialogOpen(false);
    if (selectedAction && selectedTask) {
      setActionDialogOpen(true); // Open TaskActionDialog
    }
  };

  const handleTaskReassign = (task: WorkflowTask, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedTask(task);
    setReassignDialogOpen(true);
  };

  const getTaskStatusBadge = (status: string) => {
    const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "outline",
      IN_PROGRESS: "default",
      COMPLETED: "default",
      REJECTED: "destructive",
      REASSIGNED: "secondary"
    };

    const label = getStatusLabel(status);
    const variant = statusVariants[status] || "outline";

    return <Badge variant={variant}>{label}</Badge>;
  };

  const getEntityTypeBadge = (entityType: string) => {
    const typeConfig: Record<string, { label: string; className: string }> = {
      RISK: {
        label: "Risk",
        className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      },
      AUDIT_PLAN: {
        label: "Audit Plan",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      },
      FINDING: {
        label: "Finding",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      },
      FINDINGS: {
        label: "Finding",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      },
      RECOMMENDATION: {
        label: "Recommendation",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      },
      BUDGET: {
        label: "Budget",
        className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      },
      UNIVERSE: {
        label: "Audit Universe",
        className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
      },
      AUDIT_UNIVERSE: {
        label: "Audit Universe",
        className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
      },
      AUDIT_CLOSURE: {
        label: "Audit Closure",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      },
      ANNUAL_AUDIT_PLAN: {
        label: "Annual Audit Plan",
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
      }
    };

    const config = typeConfig[entityType] || {
      label: entityType,
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-8">
        <div className="flex items-center justify-center">
          <div className="border-t-primary h-8 w-8 animate-spin rounded-full border-4 border-gray-300"></div>
          <span className="text-muted-foreground ml-4">Loading your workflow tasks...</span>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="border-border bg-muted/50 flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <CheckCircle className="text-muted-foreground/40 h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">No workflow tasks assigned</h3>
          <p className="text-muted-foreground mt-2 mb-4 text-sm">
            Great! You have no pending workflow tasks at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-1">
                  ENTITY NAME
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      The name of the document or record requiring approval
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  ENTITY TYPE
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      The category or classification of this entity
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  WORKFLOW STATE
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Current stage in the workflow process
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  TASK STATUS
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Current status of your assigned task
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  ASSIGNED DATE
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      When this task was assigned to you
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                onClick={() => onTaskSelect?.(task)}
                className="hover:bg-muted/50 cursor-pointer transition-colors">
                {/* ENTITY NAME */}
                <TableCell>
                  <p className="text-base font-semibold">
                    {task.entity?.entity_name || task.entity?.title || "Unknown"}
                  </p>
                </TableCell>
                {/* ENTITY TYPE */}
                <TableCell>{getEntityTypeBadge(task.instance?.entity_type || "")}</TableCell>
                {/* WORKFLOW STATE */}
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline">{task.instance?.status || "Unknown"}</Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Current position in workflow: {task.instance?.status || "Unknown"}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                {/* TASK STATUS */}
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <StatusBadge status={task.status} />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Status: {getStatusLabel(task.status)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                {/* ASSIGNED DATE */}
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground cursor-help text-sm">
                        {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Assigned on: {new Date(task.created_at).toLocaleString()}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    {/* Quick Preview button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={(e) => handleQuickPreview(task, e)}
                      title="Preview entity details before approving">
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>

                    {/* Approve/Reject buttons - only for PENDING tasks */}
                    {task.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-green-100 bg-green-50 text-green-500 hover:bg-green-100 hover:text-green-600"
                          onClick={(e) => handleQuickAction(task, "APPROVED", e)}
                          title="Preview and approve this task">
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                          onClick={(e) => handleQuickAction(task, "REJECTED", e)}
                          title="Preview and reject this task">
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}

                    {/* Reassign button - for any status except REASSIGNED */}
                    {task.status !== "REASSIGNED" && task.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-blue-100 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600"
                        onClick={(e) => handleTaskReassign(task, e)}
                        title="Reassign this task to another user">
                        <Repeat2 className="h-4 w-4" />
                        Reassign
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedTask && (
        <>
          <EntityPreviewDialog
            open={previewDialogOpen}
            onOpenChange={setPreviewDialogOpen}
            entityId={selectedTask.instance?.entity_id || selectedTask.entity?.entity_id || ""}
            entityType={(selectedTask.instance?.entity_type || "") as EntityType}
            entityName={selectedTask.entity?.entity_name || selectedTask.entity?.title || "Unknown"}
            initialData={selectedTask.entity as any}
            action={selectedAction}
            onProceed={handleProceedToAction}
          />
          <TaskActionDialog
            task={selectedTask}
            action={selectedAction}
            open={actionDialogOpen}
            onOpenChange={setActionDialogOpen}
          />
          <WorkflowTaskReassignDialog
            task={selectedTask}
            open={reassignDialogOpen}
            onOpenChange={setReassignDialogOpen}
          />
        </>
      )}
    </TooltipProvider>
  );
}
