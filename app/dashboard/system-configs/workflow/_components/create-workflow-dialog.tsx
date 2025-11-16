"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select-field";
import { createWorkflow } from "@/app/_actions/workflow-actions";
import { WorkflowTriggerType } from "@/lib/types/workflow";
import { WORKFLOW_TRIGGER_TYPES } from "@/lib/constants";
import { notify } from "@/lib/utils";

interface CreateWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateWorkflowDialog({ open, onOpenChange, onSuccess }: CreateWorkflowDialogProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    trigger_type: "" as WorkflowTriggerType,
    description: ""
  });

  // TanStack Query Mutation
  const { mutate: createWorkflowMutate, isPending: isLoading } = useMutation({
    mutationFn: async (data: {
      name: string;
      trigger_type: WorkflowTriggerType;
      description?: string;
    }) => {
      // Validation
      if (!data.name.trim()) {
        const msg = "Workflow name is required";
        notify({
          title: "Validation Error",
          description: msg,
          type: "error"
        });
        throw new Error(msg);
      }

      if (!data.trigger_type) {
        const msg = "Entity Trigger Type is required";
        notify({
          title: "Validation Error",
          description: msg,
          type: "error"
        });
        throw new Error(msg);
      }

      // Execute API call
      const response = await createWorkflow({
        name: data.name,
        trigger_type: data.trigger_type,
        description: data.description || "No description provided"
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create workflow");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Success notification
      notify({
        title: "Success",
        description: "Workflow created successfully",
        type: "success"
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Revalidate and refresh
      router.refresh();
    },
    onError: (error) => {
      // Error notification
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      notify({
        title: "Error",
        description: errorMessage,
        type: "error"
      });
      console.error("Error creating workflow:", error);
    }
  });

  const triggerOptions = useMemo(
    () =>
      WORKFLOW_TRIGGER_TYPES.map((trigger) => ({
        id: trigger,
        name: trigger.replace(/_/g, " "),
        value: trigger
      })),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Execute mutation with form data
    createWorkflowMutate(
      {
        name: formData.name,
        trigger_type: formData.trigger_type,
        description: formData.description || undefined
      },
      {
        onSuccess: () => {
          // Reset form and close dialog on success
          setFormData({
            name: "",
            trigger_type: "" as WorkflowTriggerType,
            description: ""
          });
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Configure a new workflow by providing the required information. You can add states and
            transitions after creation by clicking the Edit button.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input
            name="name"
            label="Workflow Name"
            required
            placeholder="Enter workflow name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          <SelectField
            label="Trigger Type"
            placeholder="-- Select trigger type --"
            className="w-full"
            value={formData.trigger_type}
            onValueChange={(value) => handleSelectChange("trigger_type", value)}
            options={triggerOptions}
            isDisabled={isLoading}
            descriptionText="Select when this workflow should be triggered"
          />
          <Textarea
            name="description"
            label="Description"
            placeholder="Enter workflow description (optional)"
            value={formData.description}
            onChange={handleInputChange}
            disabled={isLoading}
            rows={3}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} isLoading={isLoading}>
              Create Workflow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
