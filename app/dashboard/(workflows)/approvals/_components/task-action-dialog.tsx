"use client";

import { useState } from "react";
import { notify } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useCompleteWorkflowTaskMutation } from "@/hooks/use-task-mutations";
import { usePermissions } from "@/hooks/use-permissions";

interface WorkflowTask {
  id: string;
  instance_id: string;
  required_role_name?: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "REASSIGNED";
  created_at: string;
  updated_at: string;
  instance: {
    entity_type: string;
    status: string;
    id?: string;
    workflow_id?: string;
    organization_id?: string;
    entity_id?: string;
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

interface TaskActionDialogProps {
  task: WorkflowTask | null;
  action: "APPROVED" | "REJECTED" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskActionDialog({ task, action, open, onOpenChange }: TaskActionDialogProps) {
  const [comment, setComment] = useState("");
  const { checkPermission } = usePermissions();

  const { mutate: completeTask, isPending: isSubmitting } = useCompleteWorkflowTaskMutation({
    onSuccess: () => {
      onOpenChange(false);
      setComment("");
    }
  });

  if (!task || !action) return null;

  const isApproving = action === "APPROVED";
  const Icon = isApproving ? CheckCircle : XCircle;
  const iconColor = isApproving ? "text-green-600" : "text-red-600";
  const buttonVariant = isApproving ? "default" : "destructive" as const;
  const actionLabel = isApproving ? "Approve" : "Reject";

  const handleSubmit = () => {
    if (!checkPermission("WORKFLOW_CONFIG", "can_approve")) return;
    if (action === "REJECTED" && !comment.trim()) {
      notify({ description: "Comment is required when rejecting a task", type: "error" });
      return;
    }

    completeTask({
      taskId: task.id,
      action,
      comment: comment || undefined
    });
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${iconColor}`} />
              <DialogTitle>{actionLabel} Task</DialogTitle>
            </div>
            <DialogDescription>
              You are about to {actionLabel.toLowerCase()} this task. Please review the details and add any remarks.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Task Details */}
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Task Details</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Entity Name */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Entity Name:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        The name or title of the document/record requiring approval
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">
                    {task?.entity?.entity_name || task?.entity?.title || "Unknown"}
                  </p>
                </div>

                {/* Entity Type */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Type:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        The category or classification of this entity
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Badge variant="secondary" className="w-fit font-medium">
                    {task?.instance?.entity_type?.replace(/_/g, " ") || "Unknown"}
                  </Badge>
                </div>

                {/* Workflow Status */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Workflow Status:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Current status in the workflow process
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Badge variant="outline" className="w-fit font-medium">
                    {task?.instance?.status || "Unknown"}
                  </Badge>
                </div>

                {/* Task Status */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Task Status:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Current status of your assigned task
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Badge variant="outline" className="w-fit font-medium">
                    {task?.status || "Unknown"}
                  </Badge>
                </div>

                {/* Required Role */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Required Role:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        The role/position required to approve this task
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {task?.required_role_name || "Unknown"}
                  </p>
                </div>

                {/* Assigned To */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Assigned To:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Person assigned to this task
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {task?.assigned_to_name || "Unknown"}
                  </p>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1 col-span-2">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Email:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Contact email for the assigned user
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                    {task?.assigned_to_email || "Unknown"}
                  </p>
                </div>

                {/* Last Updated */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Last Updated:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        When this task was last updated
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {task?.updated_at
                      ? formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })
                      : "Unknown"}
                  </p>
                </div>

                {/* Created At */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Created:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        When this task was created
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {task?.created_at
                      ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true })
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* Comment Field */}
            <div className="space-y-2">
              <Label htmlFor="comment" className="flex items-center gap-2">
                <span>
                  Remarks {action === "REJECTED" && <span className="text-red-500">*</span>}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    {action === "APPROVED"
                      ? "Optional: Add comments or approval notes for future reference"
                      : "Required: Explain the reason for rejection"}
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Textarea
                id="comment"
                placeholder={
                  action === "APPROVED"
                    ? "Optional: Add any comments or approval notes..."
                    : "Required: Explain why you are rejecting this task..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              {action === "REJECTED" && !comment && (
                <p className="text-muted-foreground text-xs">
                  A comment is required when rejecting a task
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant={buttonVariant}
              onClick={handleSubmit}
              disabled={isSubmitting || (action === "REJECTED" && !comment.trim())}
              isLoading={isSubmitting}>
              <Icon className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
