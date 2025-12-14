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
import { CheckCircle, XCircle, UserCog, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/lib/types/task";
import { TaskActionDialog } from "./task-action-dialog";
import { TaskReassignDialog } from "./task-reassign-dialog";
import { formatDistanceToNow } from "date-fns";
import { getStatusLabel } from "@/lib/statuses";
import { StatusBadge } from "@/components/status-badge";

interface TasksTableProps {
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
}

export function TasksTable({ tasks, onTaskSelect }: TasksTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"APPROVE" | "REJECT" | null>(null);

  const handleAction = (task: Task, action: "APPROVE" | "REJECT", e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedTask(task);
    setSelectedAction(action);
    setActionDialogOpen(true);
  };

  const handleReassign = (task: Task, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedTask(task);
    setReassignDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      DRAFT: "outline",
      PENDING: "outline",
      IN_REVIEW: "default",
      REVIEW: "default",
      APPROVED: "default",
      REJECTED: "destructive",
      COMPLETED: "default",
      ON_HOLD: "secondary",
      OPEN: "default",
      CLOSED: "destructive",
      ARCHIVED: "outline"
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

  if (tasks.length === 0) {
    return (
      <div className="border-border bg-muted/50 flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
          <p className="text-muted-foreground mt-2 mb-4 text-sm">
            There are no workflow tasks available at the moment.
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
              <TableHead>Entity Name/Title</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Workflow State</TableHead>
              <TableHead>Task Status</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.instance.id}
                onClick={() => onTaskSelect?.(task)}
                className="hover:bg-muted/50 cursor-pointer transition-colors">
                {/* NAME */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{task.entity_name}</span>
                    <span className="text-muted-foreground text-[9px]">
                      ID: {task.instance.entity_id}
                    </span>
                  </div>
                </TableCell>
                {/* TYPE */}
                <TableCell>{getEntityTypeBadge(task.instance.entity_type)}</TableCell>

                {/* STATE/STAGE */}
                <TableCell>{getStatusBadge(task.instance.status)}</TableCell>
                <TableCell>
                  <StatusBadge status={String(task.entity?.status || "IN_REVIEW")} />
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(task.instance.created_at), { addSuffix: true })}
                  </span>
                </TableCell>

                {/* ACTION BUTTONS */}
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    {task.entity?.status === "IN_REVIEW" && !task.instance.is_finialized && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-green-100 bg-green-50 text-green-500 hover:bg-green-100 hover:text-green-600"
                          onClick={(e) => handleAction(task, "APPROVE", e)}>
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                          onClick={(e) => handleAction(task, "REJECT", e)}>
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        {/* <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleReassign(task)}>
                              <UserCog className="mr-2 h-4 w-4" />
                              Reassign Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu> */}
                      </>
                    )}

                    {(task.entity?.status === "COMPLETED" ||
                      task.entity?.status === "APPROVED") && (
                      <span className="text-muted-foreground text-sm">
                        {/* Completed by {task.instance.created_by_name || "Workflow User"} */}
                        N/A
                      </span>
                    )}

                    {(task.entity?.status === "REJECTED" || task.entity?.status === "DRAFT") && (
                      <span className="text-muted-foreground text-sm">No actions available</span>
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
          <TaskActionDialog
            task={selectedTask}
            action={selectedAction}
            open={actionDialogOpen}
            onOpenChange={setActionDialogOpen}
          />
          <TaskReassignDialog
            task={selectedTask}
            open={reassignDialogOpen}
            onOpenChange={setReassignDialogOpen}
          />
        </>
      )}
    </>
  );
}
