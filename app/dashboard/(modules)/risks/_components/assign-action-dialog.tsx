"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { MultiSelectField } from "@/components/ui/multi-select-field";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { useTeamMembers } from "@/hooks/use-users-query-data";
import { createRiskAction } from "@/app/_actions/risk-module-actions";
import { QUERY_KEYS } from "@/lib/constants";

// Type for Risk from risks-table
type Risk = {
  id: string;
  title: string;
  status: string;
  [key: string]: any;
};

export type AssignActionFormData = {
  instructions: string;
  executor_id: string;
  reviewer_id: string;
  due_date?: string;
};

const INIT_FORM_DATA: AssignActionFormData = {
  instructions: "",
  executor_id: "",
  reviewer_id: "",
  due_date: ""
};

interface AssignActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk: Risk;
  registerId: string;
  onActionAssigned?: () => void;
}

export function AssignActionDialog({
  open,
  onOpenChange,
  risk,
  registerId,
  onActionAssigned
}: AssignActionDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersResponse, isLoading: isLoadingUsers } = useTeamMembers({
    page_size: 100,
    page: 1
    // is_active: true
  });

  const users = usersResponse?.data?.data || [];

  const [formData, setFormData] = useState<AssignActionFormData>(INIT_FORM_DATA);

  const [errors, setErrors] = useState<{
    instructions?: string;
    executor_id?: string;
    reviewer_id?: string;
    due_date?: string;
  }>({});

  // Transform users for SearchSelectField (needs id, name, title, value)
  const user_options = useMemo(() => {
    return users.map((user: any) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name} - ${user.role?.name || user.email}`
    }));
  }, [users]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.instructions.trim()) {
      newErrors.instructions = "Action description is required";
    }

    if (!formData.executor_id.trim()) {
      newErrors.executor_id = "Please select an action owner";
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

  // Mutation for creating risk action
  const createActionMutation = useMutation({
    mutationFn: createRiskAction,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Action assigned successfully");

        // Reset form
        setFormData(INIT_FORM_DATA);

        onOpenChange(false);
        router.refresh();
        onActionAssigned?.();

        // Optionally invalidate related queries
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RISKS] });
      } else {
        toast.error(response.message || "Failed to assign action");
      }
    },
    onError: (error) => {
      toast.error("Failed to assign action");
      console.error("Error assigning action:", error);
    }
  });

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    createActionMutation.mutate({
      risk_id: risk.id,
      instructions: formData.instructions,
      executer_id: formData.executor_id, //!! Assign action owner - possible spelling error
      reviewer_id: formData.reviewer_id,
      due_date: formData.due_date
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Action to Risk
          </DialogTitle>
          <DialogDescription>
            Assign action owners and reviewers for risk:{" "}
            <span className="font-semibold">{risk.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {/* Action Owners / Executors */}
          <div className="space-y-2">
            <SearchSelectField
              label="Action Owners / Executors (Who will execute the action)"
              placeholder={"Search and select action owner"}
              isLoading={isLoadingUsers}
              options={user_options}
              value={formData.executor_id}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  executor_id: value
                }));
                if (errors.executor_id) {
                  setErrors((prev) => ({ ...prev, executor_id: undefined }));
                }
              }}
              listItemName="name"
              disabled={createActionMutation.isPending || isLoadingUsers}
              isInvalid={!!errors.executor_id}
              errorText={errors.executor_id}
              required
            />
          </div>

          {/* Reviewer - Single Select */}
          <SearchSelectField
            label="Assign Reviewer (Who can review the action)"
            placeholder={isLoadingUsers ? "Loading users..." : "Search and select a reviewer"}
            value={formData.reviewer_id}
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                reviewer_id: value
              }));
              if (errors.reviewer_id) {
                setErrors((prev) => ({ ...prev, reviewer_id: undefined }));
              }
            }}
            options={user_options}
            listItemName="name"
            isDisabled={createActionMutation.isPending || isLoadingUsers}
            isLoading={isLoadingUsers}
            isInvalid={!!errors.reviewer_id}
            errorText={errors.reviewer_id}
            required
          />
          {/* Due Date */}
          <DatePicker
            label="Due Date"
            name="due_date"
            value={formData.due_date ? (new Date(formData.due_date || "") as any) : undefined}
            onValueChange={(date) => {
              setFormData((prev) => ({
                ...prev,
                due_date: date?.toISOString()
              }));
              if (errors.due_date) {
                setErrors((prev) => ({ ...prev, due_date: undefined }));
              }
            }}
            minDate={new Date()}
            isDisabled={createActionMutation.isPending}
            isInvalid={!!errors.due_date}
            errorText={errors.due_date}
            required
          />
          {/* Action Description / Instructions */}
          <Textarea
            id="instructions"
            name="instructions"
            label="Action Description / Instructions"
            placeholder="Describe what action should be taken to mitigate this risk. Be specific about what needs to be done, when, and why..."
            value={formData.instructions}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                instructions: e.target.value
              }));
              if (errors.instructions) {
                setErrors((prev) => ({ ...prev, instructions: undefined }));
              }
            }}
            rows={4}
            className="resize-none"
            disabled={createActionMutation.isPending}
            required
            isInvalid={Boolean(!!errors.instructions)}
            errorText={errors.instructions}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={() => onOpenChange(false)}
            disabled={createActionMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            isLoading={createActionMutation.isPending}
            disabled={createActionMutation.isPending}
            className="gap-2">
            <UserPlus className="h-4 w-4" />
            Assign Action
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
