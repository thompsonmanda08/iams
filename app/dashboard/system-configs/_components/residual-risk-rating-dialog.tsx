"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createResidualRiskRating, updateResidualRiskRating } from "@/app/_actions/config-actions";
import { SelectField } from "@/components/ui/select-field";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

type ResidualRiskRating = {
  id: string;
  name: string;
  condition: string;
  description: string;
  value: number;
  created_at: string;
  updated_at: string;
};

type ResidualRiskRatingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  rating?: ResidualRiskRating | null;
};

export function ResidualRiskRatingDialog({
  open,
  onOpenChange,
  onSuccess,
  rating
}: ResidualRiskRatingDialogProps) {
  const { checkPermission, hasPermission } = usePermissions();
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

  const isEditMode = !!rating;

  useEffect(() => {
    if (open && rating) {
      setFormData({
        name: rating.name,
        description: rating.description,
        value: rating.value,
        condition: rating.condition
      });
    } else if (!open) {
      setFormData({ name: "", description: "", value: 1, condition: "" });
    }
  }, [open, rating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, isEditMode ? "can_edit" : "can_create")) return;

    if (!formData.name.trim()) {
      notify({ description: "Residual risk rating name is required", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const result = isEditMode
        ? await updateResidualRiskRating(rating.id, formData)
        : await createResidualRiskRating(formData);

      if (result.success) {
        notify({ description: `Residual risk rating ${isEditMode ? "updated" : "created"} successfully`, type: "success" });
        setFormData({ name: "", description: "", value: 1, condition: "" });
        onOpenChange(false);
        onSuccess();
      } else {
        notify({
          description: result.message || `Failed to ${isEditMode ? "update" : "create"} residual risk rating`,
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
      name: "Low",
      value: "Low"
    },
    {
      name: "Medium",
      value: "Medium"
    },
    {
      name: "High",
      value: "High"
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
              {isEditMode ? "Edit Residual Risk Rating" : "Create Residual Risk Rating"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update residual risk rating" : "Add a new residual risk rating"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <SelectField
              label="Rating Name"
              required
              value={formData.name}
              onValueChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Select rating name"
              options={option_names as any}
              className="w-full"
              disabled={isLoading}
            />

            <Input
              label="Rating Value"
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
              disabled={isLoading}
            />

            <Textarea
              label="Description"
              id="description"
              placeholder="Describe this residual risk rating"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
            />
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
                : `${isEditMode ? "Update" : "Create"} Rating`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
