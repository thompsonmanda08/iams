"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useReassignWorkflowTaskMutation } from "@/hooks/use-workflow-tasks";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/app/_actions/user-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import { id } from "date-fns/locale";
import { SearchSelectField } from "@/components/ui/search-select-field";

interface WorkflowTask {
  id: string;
  instance_id: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "REASSIGNED";
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

interface WorkflowTaskReassignDialogProps {
  task: WorkflowTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * WorkflowTaskReassignDialog
 *
 * Dialog for reassigning workflow tasks to another user
 * Allows users to select a target user and add remarks about the reassignment
 *
 * Naming: Specific to WORKFLOW TASKS (not workflow instances)
 */
export function WorkflowTaskReassignDialog({
  task,
  open,
  onOpenChange
}: WorkflowTaskReassignDialogProps) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [remarks, setRemarks] = useState("");

  const reassignTaskMutation = useReassignWorkflowTaskMutation();

  // Fetch available users for reassignment
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ["users-for-reassignment"],
    queryFn: async () => {
      const response = await getUsers({ page: 1, page_size: 100 });
      return response.success ? response.data : [];
    },
    enabled: open
  });

  const availableUsers = usersResponse?.data || [];

  const handleReassignTask = async () => {
    if (!task || !selectedUserId) return;

    reassignTaskMutation.mutate(
      {
        taskId: task.id,
        assignedToUserId: selectedUserId,
        remarks: remarks || undefined
      },
      {
        onSuccess: () => {
          setSelectedUserId("");
          setRemarks("");
          onOpenChange(false);
          router.refresh();
        }
      }
    );
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reassign Workflow Task</DialogTitle>
            <DialogDescription>
              Select a user to reassign this workflow task to. The task will be transferred from
              your queue to theirs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* TASK DETAILS */}
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                Task Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Entity Name */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">
                      Entity Name:
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help text-blue-500" />
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
                        <Info className="h-3.5 w-3.5 cursor-help text-blue-500" />
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
                    <span className="text-muted-foreground text-xs font-semibold">
                      Workflow Status:
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help text-blue-500" />
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
                    <span className="text-muted-foreground text-xs font-semibold">
                      Task Status:
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help text-blue-500" />
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

                {/* Last Updated */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">
                      Last Updated:
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help text-blue-500" />
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

                {/* Created */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Created:</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help text-blue-500" />
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

            {/* USER SELECTION */}
            <div className="space-y-2">
              <SearchSelectField
                label="Reassign To"
                required
                id="reassign-user"
                className="w-full max-w-none"
                placeholder="-- Select User --"
                onModal={true}
                classNames={{
                  wrapper: "max-w-none"
                }}
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                options={availableUsers.map((user: any) => {
                  return {
                    id: user.id,
                    name: `${user.first_name} ${user.last_name} - [ ${user.role?.name || user?.role || user?.email} ]`
                  };
                })}
              />
            </div>

            {/* REMARKS */}
            <div className="space-y-2">
              <Textarea
                id="reassign-remarks"
                label="Remarks (Optional)"
                placeholder="Add any notes about this reassignment (e.g., reason, urgency, special instructions)..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleReassignTask}
              disabled={reassignTaskMutation.isPending || !selectedUserId}
              isLoading={reassignTaskMutation.isPending}
              loadingText="Reassigning...">
              Reassign Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
