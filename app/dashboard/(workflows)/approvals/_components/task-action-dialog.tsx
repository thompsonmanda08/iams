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
import { approveTask, rejectTask } from "@/app/_actions/task-actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface TaskActionDialogProps {
  task: Task;
  action: "APPROVE" | "REJECT" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskActionDialog({ task, action, open, onOpenChange }: TaskActionDialogProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!action) return;
    if (action === "REJECT" && !comment.trim()) {
      toast.error("Comment is required when rejecting a task");
      return;
    }

    setIsSubmitting(true);

    try {
      let response;

      if (action === "APPROVE") {
        response = await approveTask(task.instance.id, comment);
      } else if (action === "REJECT") {
        response = await rejectTask(task.instance.id, comment);
      }

      if (response?.success) {
        toast.success(response.message || `Task ${action.toLowerCase()}ed successfully!`);
        onOpenChange(false);
        setComment("");
        router.refresh();
      } else {
        toast.error(response?.message || `Failed to ${action.toLowerCase()} task`);
      }
    } catch (error: any) {
      toast.error(error?.message || `An error occurred while ${action?.toLowerCase()}ing the task`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionConfig = {
    APPROVE: {
      title: "Approve Task",
      description:
        "You are about to approve this task. This action will move the workflow forward.",
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

        <div className="grid gap-4 py-4">
          {/* Task Details */}
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs font-semibold">Type:</span>
                <Badge variant={"secondary"} className="font-medium">
                  {task.instance.entity_type.replace(/_/g, " ")}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground text-xs font-semibold">Entity:</span>
                <h4 className="font-medium">{task.entity_name}</h4>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs font-semibold">Status:</span>
                <Badge variant={"info"} className="font-medium">
                  {task.instance.status}
                </Badge>
              </div>

              <div>
                <span className="text-muted-foreground text-xs font-semibold">Last Updated</span>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(task.instance.updated_at), { addSuffix: true })}
                </p>
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
            isLoading={isSubmitting}>
            <>
              <Icon className="mr-2 h-4 w-4" />
              {config.buttonText}
            </>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
