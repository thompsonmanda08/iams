"use client";

import { useState } from "react";
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
import type { Task } from "@/lib/types/task";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTaskStore } from "@/lib/stores/task-store";
import { useEntityStore } from "@/lib/stores/entity-store";
import { useWorkflowStore } from "@/lib/stores/workflow-store";
import { WorkflowExecutor } from "@/lib/utils/workflow-executor";

interface TaskActionDialogProps {
  task: Task;
  action: "APPROVE" | "REJECT" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskActionDialog({ task, action, open, onOpenChange }: TaskActionDialogProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { approveTask: approveTaskStore, rejectTask: rejectTaskStore, addTask } = useTaskStore();
  const { getWorkflow } = useWorkflowStore();
  const { getEntity, transitionEntity } = useEntityStore();

  const handleSubmit = () => {
    if (!action) return;
    if (action === "REJECT" && !comment.trim()) {
      toast.error("Comment is required when rejecting a task");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate current user (in real app, get from auth)
      const currentUser = {
        id: "user-current",
        name: "Current User",
        role: task.requiredRole
      };

      if (action === "APPROVE") {
        // Mark task as completed
        approveTaskStore(task.id, currentUser.id, currentUser.name, comment);

        // Get workflow and entity
        const workflow = getWorkflow(task.workflowId);
        const entity = getEntity(task.entityId);

        if (workflow && entity) {
          // Execute workflow transition
          const executor = new WorkflowExecutor(workflow);
          const result = executor.executeTransition(task.actionName, entity.currentStateId, {
            userId: currentUser.id,
            userRole: currentUser.role,
            entityData: entity.data
          });

          if (result.success && result.newState) {
            // Find new state ID
            const newStateObj = workflow.states.find((s) => s.name === result.newState);
            if (newStateObj) {
              // Update entity state
              transitionEntity(
                entity.id,
                result.newState,
                newStateObj.id,
                task.actionName,
                currentUser.name,
                comment
              );

              // Create new tasks
              if (result.tasksCreated && result.tasksCreated.length > 0) {
                result.tasksCreated.forEach((newTask) => addTask(newTask));
                toast.success(
                  `Task approved! ${result.tasksCreated.length} new task(s) created.`
                );
              } else {
                toast.success("Task approved successfully!");
              }
            }
          } else {
            toast.error(result.error || "Failed to execute workflow transition");
          }
        }
      } else if (action === "REJECT") {
        // Mark task as rejected
        rejectTaskStore(task.id, currentUser.id, currentUser.name, comment);
        toast.success("Task rejected successfully!");
      }

      onOpenChange(false);
      setComment("");
    } catch (error) {
      toast.error(`An error occurred while ${action?.toLowerCase()}ing the task`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionConfig = {
    APPROVE: {
      title: "Approve Task",
      description: "You are about to approve this task. This action will move the workflow forward.",
      icon: CheckCircle,
      iconColor: "text-green-600",
      buttonText: "Approve",
      buttonVariant: "default" as const
    },
    REJECT: {
      title: "Reject Task",
      description: "You are about to reject this task. This action may require additional steps.",
      icon: XCircle,
      iconColor: "text-red-600",
      buttonText: "Reject",
      buttonVariant: "destructive" as const
    }
  };

  const config = action ? actionConfig[action] : actionConfig.APPROVE;
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Task Details */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Workflow:</span>
                <p className="font-medium">{task.workflowName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Action:</span>
                <p className="font-medium">{task.actionName.replace(/_/g, " ")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Entity:</span>
                <p className="font-medium">{task.entityName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium">{task.entityType.replace(/_/g, " ")}</p>
              </div>
            </div>
          </div>

          {/* Comment Field */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Comment {action === "REJECT" && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="comment"
              placeholder={`Add a comment for this ${action?.toLowerCase()}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            {action === "REJECT" && !comment && (
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
            variant={config.buttonVariant}
            onClick={handleSubmit}
            disabled={isSubmitting || (action === "REJECT" && !comment.trim())}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon className="mr-2 h-4 w-4" />
                {config.buttonText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
