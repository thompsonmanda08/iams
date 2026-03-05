"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { notify } from "@/lib/utils";
import { createRiskAppetiteStatus, updateRiskAppetiteStatus } from "@/app/_actions/config-actions";
import { SelectField } from "@/components/ui/select-field";

type RiskAppetiteStatus = {
  id: string;
  name: string;
  condition: string;
  description: string;
  value: number;
  created_at: string;
  updated_at: string;
};

type RiskAppetiteStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  appetite?: RiskAppetiteStatus | null;
};

export function RiskAppetiteStatusDialog({
  open,
  onOpenChange,
  onSuccess,
  appetite
}: RiskAppetiteStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    value: number;
    condition: string;
  }>({
    name: "",
    description: "",
    value: 1,
    condition: ""
  });

  const isEditMode = !!appetite;

  useEffect(() => {
    if (open && appetite) {
      setFormData({
        name: appetite.name,
        description: appetite.description,
        value: appetite.value,
        condition: appetite.condition
      });
    } else if (!open) {
      setFormData({ name: "", description: "", value: 1, condition: "" });
    }
  }, [open, appetite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify({ description: "Risk appetite status name is required", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const result = isEditMode
        ? await updateRiskAppetiteStatus(appetite.id, formData)
        : await createRiskAppetiteStatus(formData);

      if (result.success) {
        notify({ description: `Risk appetite status ${isEditMode ? "updated" : "created"} successfully`, type: "success" });
        setFormData({ name: "", description: "", value: 1, condition: "" });
        onOpenChange(false);
        onSuccess();
      } else {
        notify({
          description: result.message || `Failed to ${isEditMode ? "update" : "create"} risk appetite status`,
          type: "error"
        });
      }
    } catch (error) {
      notify({ description: "An unexpected error occurred", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };
  const options = [
    {
      name: "Greater Than",
      value: ">"
    },
    {
      name: "Less Than",
      value: "<"
    },
    {
      name: "Greater Than OR Equal To",
      value: ">="
    },
    {
      name: "Less Than OR Equal To",
      value: "<="
    },
    {
      name: "Equals",
      value: "="
    }
  ];
  const option_names = [
    {
      name: "Below",
      value: "Below"
    },
    {
      name: "Within",
      value: "Within"
    },
    {
      name: "Above",
      value: "Above"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Risk Appetite Status" : "Create Risk Appetite Status"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update risk appetite status" : "Add a new risk appetite status"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <SelectField
              label="Risk Appetite Name"
              required
              value={formData.name}
              onValueChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Select risk appetite name"
              options={option_names as any}
              className="w-full"
            />

            <Input
              label="Risk Appetite Value"
              required
              id="value"
              type="number"
              min="1"
              placeholder="e.g., 1, 2, 3..."
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 1 })}
              disabled={isLoading}
            />

            <SelectField
              label="Condition"
              required
              value={formData.condition}
              onValueChange={(value) => setFormData({ ...formData, condition: value })}
              placeholder="Select condition"
              options={options as any}
              className="w-full"
            />

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this risk appetite status"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? `${isEditMode ? "Updating" : "Creating"}...`
                : `${isEditMode ? "Update" : "Create"} Appetite`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
