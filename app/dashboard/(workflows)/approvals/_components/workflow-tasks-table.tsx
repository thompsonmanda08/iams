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
import type { WorkflowTask } from "@/lib/types/task";
import type { EntityType } from "@/lib/types/entity-preview-types";
import { TaskActionDialog } from "./task-action-dialog";
import { WorkflowTaskReassignDialog } from "./workflow-task-reassign-dialog";
import { EntityPreviewDialog } from "./entity-preview-dialog";
import { formatDistanceToNow } from "date-fns";
import { getStatusLabel } from "@/lib/statuses";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/status-badge";
import NextLink from "next/link";
import { getEntityDetailRoute, normalizeEntityType } from "@/lib/utils/entity-preview-utils";
import { formatDateTime } from "@/lib/utils/date-format";

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

  const getEntityRoute = (task: WorkflowTask) => {
    const entityType = task.instance?.entity_type || "";
    const entityId = task.instance?.entity_id || task.entity?.entity_id || "";
    const normalizedType = normalizeEntityType(entityType);
    return getEntityDetailRoute(normalizedType, entityId, {
      ...task.entity,
      original_entity_type: entityType
    });
  };

  const renderEntityContext = (task: WorkflowTask) => {
    const entityType = task.instance?.entity_type || "";

    if (entityType === "FINDINGS" || entityType === "FINDING") {
      if (task.entity?.audit_plan_name) {
        const route = task.entity?.audit_plan_id
          ? `/dashboard/audit/plans/engagement/${task.entity.audit_plan_id}`
          : null;
        return route ? (
          <NextLink
            href={route}
            className="text-primary hover:underline text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {task.entity.audit_plan_name}
          </NextLink>
        ) : (
          <span className="text-sm">{task.entity.audit_plan_name}</span>
        );
      }
      return <span className="text-muted-foreground text-sm">-</span>;
    }

    if (entityType === "BUDGET" || entityType === "ANNUAL_AUDIT_PLAN") {
      return task.entity?.year ? (
        <span className="text-sm font-medium">{task.entity.year}</span>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    }

    if (entityType === "UNIVERSE" || entityType === "AUDIT_UNIVERSE") {
      const universeName = task.entity?.universe_name || task.entity?.entity_name;
      const universeId = task.instance?.entity_id || task.entity?.entity_id;
      if (universeName) {
        return universeId ? (
          <NextLink
            href={`/dashboard/audit/universe/${universeId}`}
            className="text-primary hover:underline text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {universeName}
          </NextLink>
        ) : (
          <span className="text-sm">{universeName}</span>
        );
      }
      return <span className="text-muted-foreground text-sm">-</span>;
    }

    return <span className="text-muted-foreground text-sm">-</span>;
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

  if (!tasks?.length) {
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
                  CONTEXT
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Additional context about this entity (e.g., parent plan, year)
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
                  {(() => {
                    const route = getEntityRoute(task);
                    const name = task.entity?.entity_name || task.entity?.title || "Unknown";
                    return route ? (
                      <NextLink
                        href={route}
                        className="text-primary hover:underline text-base font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {name}
                      </NextLink>
                    ) : (
                      <p className="text-base font-semibold">{name}</p>
                    );
                  })()}
                </TableCell>
                {/* ENTITY TYPE */}
                <TableCell>{getEntityTypeBadge(task.instance?.entity_type || "")}</TableCell>
                {/* CONTEXT */}
                <TableCell>{renderEntityContext(task)}</TableCell>
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
                      <span>Assigned on: {formatDateTime(task.created_at)}</span>
                      {task.completed_at && (
                        <>
                          <br />
                          <span>Completed on: {formatDateTime(task.completed_at)}</span>
                          {task.completed_by_name && (
                            <>
                              <br />
                              <span>By: {task.completed_by_name}</span>
                            </>
                          )}
                        </>
                      )}
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
