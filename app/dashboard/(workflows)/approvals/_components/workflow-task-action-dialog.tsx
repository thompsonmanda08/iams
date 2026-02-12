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
import { useCompleteWorkflowTaskMutation } from "@/hooks/use-workflow-tasks";
import { usePermissions } from "@/hooks/use-permissions";

interface WorkflowTask {
  id: string;
  instance_id: string;
  entity_name: string;
  entity_type: string;
  workflow_state: string;
}

interface WorkflowTaskActionDialogProps {
  task: WorkflowTask | null;
  action: "APPROVED" | "REJECTED" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * WorkflowTaskActionDialog
 *
 * Dialog for completing workflow tasks with approval or rejection
 * Allows users to add remarks/comments explaining their decision
 *
 * Naming: Specific to WORKFLOW TASKS (not workflow instances)
 */
export function WorkflowTaskActionDialog({
  task,
  action,
  open,
  onOpenChange
}: WorkflowTaskActionDialogProps) {
  const router = useRouter();
  const [remarks, setRemarks] = useState("");
  const completeTaskMutation = useCompleteWorkflowTaskMutation();
  const { checkPermission } = usePermissions();

  const handleCompleteTask = async () => {
    if (!checkPermission("WORKFLOW_CONFIG", "can_approve")) return;
    if (!task || !action) return;

    completeTaskMutation.mutate(
      {
        taskId: task.id,
        action,
        remarks: remarks || undefined
      },
      {
        onSuccess: () => {
          setRemarks("");
          onOpenChange(false);
          router.refresh();
        }
      }
    );
  };

  const actionLabel = action === "APPROVED" ? "Approve" : "Reject";
  const actionColor = action === "APPROVED" ? "green" : "red";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {actionLabel} Workflow Task
          </DialogTitle>
          <DialogDescription>
            You are about to {actionLabel.toLowerCase()} this workflow task. Please review the
            details and add any remarks.
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
            <div>
              <Label className="text-muted-foreground text-xs font-medium uppercase">
                Workflow State
              </Label>
              <p className="mt-1 font-semibold">{task?.workflow_state}</p>
            </div>
          </div>

          {/* REMARKS */}
          <div className="space-y-2">
            <Label htmlFor="remarks" className="text-sm font-medium">
              Remarks {action === "REJECTED" && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="remarks"
              placeholder={
                action === "APPROVED"
                  ? "Optional: Add any comments or approval notes..."
                  : "Required: Explain why you are rejecting this task..."
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-[100px]"
            />
            {action === "REJECTED" && remarks.length === 0 && (
              <p className="text-xs text-amber-600">
                It is recommended to provide a reason when rejecting a task
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className={`gap-2 ${
              actionColor === "green"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            onClick={handleCompleteTask}
            disabled={completeTaskMutation.isPending}
            isLoading={completeTaskMutation.isPending}
          >
            {completeTaskMutation.isPending ? "Processing..." : actionLabel} Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
