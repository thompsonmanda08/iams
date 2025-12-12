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
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import type { Task } from "@/lib/types/task";
import { WorkflowTaskActionDialog } from "./workflow-task-action-dialog";
import { WorkflowTaskReassignDialog } from "./workflow-task-reassign-dialog";
import { formatDistanceToNow } from "date-fns";
import { getStatusLabel } from "@/lib/statuses";

interface WorkflowTask {
  id: string;
  instance_id: string;
  workflow_id: string;
  assigned_to_user_id: string;
  assigned_to_user_name?: string;
  entity_id: string;
  entity_name: string;
  entity_type: string;
  workflow_state: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "REASSIGNED";
  created_at: string;
  updated_at: string;
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
  const [selectedAction, setSelectedAction] = useState<"APPROVED" | "REJECTED" | null>(null);

  const handleTaskAction = (
    task: WorkflowTask,
    action: "APPROVED" | "REJECTED",
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setSelectedTask(task);
    setSelectedAction(action);
    setActionDialogOpen(true);
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
      RECOMMENDATION: {
        label: "Recommendation",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      },
      BUDGET: {
        label: "Budget",
        className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      },
      CONTRACT: {
        label: "Contract",
        className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
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
    <>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Entity Name</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Workflow State</TableHead>
              <TableHead>Task Status</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                onClick={() => onTaskSelect?.(task)}
                className="hover:bg-muted/50 cursor-pointer transition-colors">
                {/* TASK ID */}
                <TableCell>
                  <span className="font-mono text-sm">{task.id.slice(0, 8)}...</span>
                </TableCell>
                {/* ENTITY NAME */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{task.entity_name}</span>
                    <span className="text-muted-foreground text-[9px]">ID: {task.entity_id}</span>
                  </div>
                </TableCell>
                {/* ENTITY TYPE */}
                <TableCell>{getEntityTypeBadge(task.entity_type)}</TableCell>
                {/* WORKFLOW STATE */}
                <TableCell>
                  <Badge variant="outline">{task.workflow_state}</Badge>
                </TableCell>
                {/* TASK STATUS */}
                <TableCell>{getTaskStatusBadge(task.status)}</TableCell>
                {/* ASSIGNED DATE */}
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                  </span>
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    {task.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-green-100 bg-green-50 text-green-500 hover:bg-green-100 hover:text-green-600"
                          onClick={(e) => handleTaskAction(task, "APPROVED", e)}
                          title="Complete and approve this task">
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                          onClick={(e) => handleTaskAction(task, "REJECTED", e)}
                          title="Complete and reject this task">
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-blue-100 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600"
                          onClick={(e) => handleTaskReassign(task, e)}
                          title="Reassign this task to another user">
                          <ArrowRight className="h-4 w-4" />
                          Reassign
                        </Button>
                      </>
                    )}

                    {task.status === "COMPLETED" && (
                      <span className="text-muted-foreground text-sm">Task completed</span>
                    )}

                    {task.status === "REJECTED" && (
                      <span className="text-muted-foreground text-sm">Task rejected</span>
                    )}

                    {task.status === "REASSIGNED" && (
                      <span className="text-muted-foreground text-sm">Task reassigned</span>
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
          <WorkflowTaskActionDialog
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
    </>
  );
}
