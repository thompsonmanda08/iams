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

interface TasksTableProps {
  tasks: Task[];
}

export function TasksTable({ tasks }: TasksTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"APPROVE" | "REJECT" | null>(null);

  const handleAction = (task: Task, action: "APPROVE" | "REJECT") => {
    setSelectedTask(task);
    setSelectedAction(action);
    setActionDialogOpen(true);
  };

  const handleReassign = (task: Task) => {
    setSelectedTask(task);
    setReassignDialogOpen(true);
  };

  const getStatusBadge = (status: Task["status"]) => {
    const statusConfig = {
      PENDING: { label: "Pending", variant: "outline" as const },
      IN_PROGRESS: { label: "In Progress", variant: "default" as const },
      COMPLETED: { label: "Completed", variant: "default" as const },
      REJECTED: { label: "Rejected", variant: "destructive" as const },
      REASSIGNED: { label: "Reassigned", variant: "secondary" as const }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEntityTypeBadge = (entityType: Task["entityType"]) => {
    const typeConfig = {
      RISK: { label: "Risk", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
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
      }
    };

    const config = typeConfig[entityType];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (tasks.length === 0) {
    return (
      <div className="border-border bg-muted/50 flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
          <p className="text-muted-foreground mb-4 mt-2 text-sm">
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
              <TableHead>Task</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{task.actionName.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground text-xs">{task.workflowName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{task.entityName}</span>
                    <span className="text-muted-foreground text-xs">ID: {task.entityId}</span>
                  </div>
                </TableCell>
                <TableCell>{getEntityTypeBadge(task.entityType)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{task.assignedUserName}</span>
                    <span className="text-muted-foreground text-xs">{task.assignedUserEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{task.requiredRole}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {task.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleAction(task, "APPROVE")}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleAction(task, "REJECT")}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <DropdownMenu>
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
                        </DropdownMenu>
                      </>
                    )}
                    {task.status === "COMPLETED" && (
                      <span className="text-muted-foreground text-sm">
                        Completed by {task.completedByUserName}
                      </span>
                    )}
                    {task.status === "REJECTED" && (
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
