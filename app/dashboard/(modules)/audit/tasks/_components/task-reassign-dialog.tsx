"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { UserCog, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { reassignTask } from "@/app/_actions/task-actions";
import { getUsers } from "@/app/_actions/user-actions";
import { useRouter } from "next/navigation";

interface TaskReassignDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskReassignDialog({ task, open, onOpenChange }: TaskReassignDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      // Load users from API
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await getUsers({ role: task.requiredRole });
      if (response.success) {
        setUsers(response.data || []);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      toast.error("Error loading users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user to reassign the task to");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await reassignTask(task.id, selectedUserId, comment);

      if (response.success) {
        toast.success(response.message || "Task reassigned successfully");
        onOpenChange(false);
        setSelectedUserId("");
        setComment("");
        router.refresh();
      } else {
        toast.error(response.message || "Failed to reassign task");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred while reassigning the task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
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
                <span className="text-muted-foreground">Workflow:</span>
                <p className="font-medium">{task.workflowName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Action:</span>
                <p className="font-medium">{task.actionName.replace(/_/g, " ")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Current Assignee:</span>
                <p className="font-medium">{task.assignedUserName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Required Role:</span>
                <p className="font-medium">{task.requiredRole}</p>
              </div>
            </div>
          </div>

          {/* Role Filter Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only users with the <strong>{task.requiredRole}</strong> role are shown below.
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
