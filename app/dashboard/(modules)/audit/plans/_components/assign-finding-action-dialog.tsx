"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { useUsers } from "@/hooks/use-users-query-data";
import { useCreateFindingActionMutation } from "@/hooks/use-finding-actions-queries";
import type { WorkpaperFinding } from "@/lib/types/audit-types";
import { Loader2 } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { notify } from "@/lib/utils";

interface AssignFindingActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finding: WorkpaperFinding | null;
  auditPlanStatus: string;
}

export function AssignFindingActionDialog({
  open,
  onOpenChange,
  finding,
  auditPlanStatus
}: AssignFindingActionDialogProps) {
  const { checkPermission } = usePermissions();
  // Only allow if audit plan is COMPLETED, APPROVED, or REJECTED
  const canAssignAction =
    auditPlanStatus === "COMPLETED" ||
    auditPlanStatus === "APPROVED" ||
    auditPlanStatus === "REJECTED";

  const [formData, setFormData] = useState({
    action_description: "",
    assigned_to: "",
    reviewer_id: "",
    due_date: null as Date | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch users
  const { data: usersResponse, isLoading: isLoadingUsers } = useUsers({
    page_size: 100,
    page: 1
  });

  const users = usersResponse?.data?.data || [];

  // Transform users for SearchSelectField
  const userOptions = useMemo(() => {
    return users.map((user: any) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name} - ${user.role?.name || user.email}`
    }));
  }, [users]);

  const createActionMutation = useCreateFindingActionMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.action_description.trim()) {
      newErrors.action_description = "Action description is required";
    }
    if (!formData.assigned_to) {
      newErrors.assigned_to = "Please select an assignee";
    }
    if (!formData.reviewer_id) {
      newErrors.reviewer_id = "Please select a reviewer";
    }
    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!checkPermission("AUDIT_PLANS", "can_assign")) {
      notify({ type: "error", description: "You do not have permission to assign actions" });
      return;
    }
    if (!finding) {
      notify({ type: "error", description: "No finding selected" });
      return;
    }
    if (!canAssignAction) {
      notify({
        type: "error",
        description: `Cannot assign actions while audit plan is "${auditPlanStatus}". Plan must be Completed, Approved, or Rejected.`
      });
      return;
    }
    if (!validateForm()) {
      return;
    }

    // Format due_date as YYYY-MM-DD
    const dueDate = formData.due_date!;
    const formattedDueDate = dueDate.toISOString().split("T")[0];

    createActionMutation.mutate(
      {
        finding_id: finding.id,
        action_description: formData.action_description,
        assigned_to: formData.assigned_to,
        reviewer_id: formData.reviewer_id,
        due_date: formattedDueDate,
        ...(finding.framework === "GENERAL" && { framework_type: "GENERAL" })
      },
      {
        onSuccess: () => {
          // Reset form
          setFormData({
            action_description: "",
            assigned_to: "",
            reviewer_id: "",
            due_date: null
          });
          setErrors({});
          onOpenChange(false);
        }
      }
    );
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Action to Finding</DialogTitle>
          <DialogDescription>
            Assign a remediation action to{" "}
            {finding?.category?.display_name || finding?.category_name || "this finding"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Description */}
          <div className="space-y-2">
            <Textarea
              id="action_description"
              label="Action Description "
              required
              placeholder="Describe the remediation action required..."
              value={formData.action_description}
              onChange={(e) => handleInputChange("action_description", e.target.value)}
              className={errors.action_description ? "border-red-500" : ""}
              rows={4}
            />
            {errors.action_description && (
              <p className="text-sm text-red-500">{errors.action_description}</p>
            )}
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <SearchSelectField
              label="Assign To"
              placeholder="Select user to assign action..."
              options={userOptions}
              value={formData.assigned_to}
              onValueChange={(value) => handleInputChange("assigned_to", value)}
              isLoading={isLoadingUsers}
              required
              isInvalid={!!errors.assigned_to}
              errorText={errors.assigned_to}
            />
          </div>

          {/* Reviewer */}
          <div className="space-y-2">
            <SearchSelectField
              label="Reviewer"
              placeholder="Select reviewer..."
              options={userOptions}
              value={formData.reviewer_id}
              onValueChange={(value) => handleInputChange("reviewer_id", value)}
              isLoading={isLoadingUsers}
              required
              isInvalid={!!errors.reviewer_id}
              errorText={errors.reviewer_id}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <DatePicker
              label="Due Date"
              value={formData.due_date || undefined}
              onValueChange={(date) => handleInputChange("due_date", date)}
              required
              isInvalid={!!errors.due_date}
              errorText={errors.due_date}
              minDate={new Date()}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createActionMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createActionMutation.isPending}>
              {createActionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Action
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
