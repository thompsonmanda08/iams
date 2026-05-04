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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { Task } from "@/lib/types/task";
import { UserCog, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUsersWithRole, useReassignTaskMutation } from "@/hooks/use-task-mutations";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

interface TaskReassignDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskReassignDialog({ task, open, onOpenChange }: TaskReassignDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [comment, setComment] = useState("");
  const { checkPermission, hasPermission } = usePermissions();

  // Query hook for fetching users
  const { data: users = [], isLoading: isLoadingUsers } = useUsersWithRole(
    open ? task.requiredRole : undefined
  );

  // Mutation hook for reassigning task
  const { mutate: reassign, isPending: isSubmitting } = useReassignTaskMutation({
    onSuccess: () => {
      onOpenChange(false);
      setSelectedUserId("");
      setComment("");
    }
  });

  const handleSubmit = () => {
    if (!checkPermission(MODULE_CODES.WORKFLOW_CONFIG, "can_assign")) return;
    if (!selectedUserId) {
      return;
    }

    reassign({
      taskId: task.instance.id,
      userId: selectedUserId,
      comment: comment || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-[525px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-blue-600" />
            <DialogTitle>Reassign Task</DialogTitle>
          </div>
          <DialogDescription>
            Reassign this task to another user with the required role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Task Details */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Entity:</span>
                <p className="font-medium">{task.entity_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium">{task.instance.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Workflow ID:</span>
                <p className="font-medium">{task.instance.workflow_id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Entity Type:</span>
                <p className="font-medium">{task.instance.entity_type.replace(/_/g, " ")}</p>
              </div>
            </div>
          </div>

          {/* Role Filter Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Select a user to reassign this task to.
            </AlertDescription>
          </Alert>

          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user">
              Select User <span className="text-red-500">*</span>
            </Label>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No users found with the {task.requiredRole} role. Please contact an administrator.
                </AlertDescription>
              </Alert>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="text-muted-foreground text-xs">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Comment Field */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add a reason for reassignment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedUserId("");
              setComment("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedUserId || users.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reassigning...
              </>
            ) : (
              <>
                <UserCog className="mr-2 h-4 w-4" />
                Reassign Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
