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

interface WorkflowTask {
  id: string;
  instance_id: string;
  entity_name: string;
  entity_type: string;
  workflow_state: string;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reassign Workflow Task</DialogTitle>
          <DialogDescription>
            Select a user to reassign this workflow task to. The task will be transferred from
            your queue to theirs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* TASK DETAILS */}
          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <div>
              <Label className="text-muted-foreground text-xs font-medium uppercase">
                Entity Name
              </Label>
              <p className="mt-1 font-semibold">{task?.entity_name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs font-medium uppercase">
                Entity Type
              </Label>
              <p className="mt-1 font-semibold">{task?.entity_type}</p>
            </div>
          </div>

          {/* USER SELECTION */}
          <div className="space-y-2">
            <Label htmlFor="reassign-user" className="text-sm font-medium">
              Reassign To <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="reassign-user">
                <SelectValue placeholder="Select a user to reassign this task to" />
              </SelectTrigger>
              <SelectContent>
                {usersLoading ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Loading users...
                  </div>
                ) : availableUsers.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    No users available
                  </div>
                ) : (
                  availableUsers.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* REMARKS */}
          <div className="space-y-2">
            <Label htmlFor="reassign-remarks" className="text-sm font-medium">
              Remarks (Optional)
            </Label>
            <Textarea
              id="reassign-remarks"
              placeholder="Add any notes about this reassignment (e.g., reason, urgency, special instructions)..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-[80px]"
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
          >
            {reassignTaskMutation.isPending ? "Reassigning..." : "Reassign Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
