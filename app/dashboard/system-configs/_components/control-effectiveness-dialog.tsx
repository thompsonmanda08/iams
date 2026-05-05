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
import { useCreateEffectivenessLevelMutation, useUpdateEffectivenessLevelMutation } from "@/hooks/use-config-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

type ControlEffectiveness = {
  id: string;
  name: string;
  description: string;
  value: number;
  created_at: string;
  updated_at: string;
};

type ControlEffectivenessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  control?: ControlEffectiveness | null;
};

export function ControlEffectivenessDialog({
  open,
  onOpenChange,
  onSuccess,
  control
}: ControlEffectivenessDialogProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    value: number;
  }>({
    name: "",
    description: "",
    value: 1
  });

  const isEditMode = !!control;

  const { mutate: createEffectiveness, isPending: isCreatePending } = useCreateEffectivenessLevelMutation({
    onSuccess: () => {
      setFormData({ name: "", description: "", value: 1 });
      onOpenChange(false);
      onSuccess();
    }
  });

  const { mutate: updateEffectiveness, isPending: isUpdatePending } = useUpdateEffectivenessLevelMutation({
    onSuccess: () => {
      setFormData({ name: "", description: "", value: 1 });
      onOpenChange(false);
      onSuccess();
    }
  });

  const isPending = isCreatePending || isUpdatePending;

  useEffect(() => {
    if (open && control) {
      setFormData({
        name: control.name,
        description: control.description,
        value: control.value
      });
    } else if (!open) {
      setFormData({ name: "", description: "", value: 1 });
    }
  }, [open, control]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, isEditMode ? "can_edit" : "can_create")) return;

    if (!formData.name.trim()) {
      return;
    }

    if (isEditMode) {
      updateEffectiveness({ id: control.id, data: formData });
    } else {
      createEffectiveness(formData);
    }
  };

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
              {isEditMode ? "Edit Control Effectiveness" : "Create Control Effectiveness"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update control effectiveness level"
                : "Add a new control effectiveness level"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Input
              label="Control Effectiveness Name"
              required
              id="name"
              placeholder="e.g., Highly Effective, Effective, Partially Effective"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isPending}
            />
            <Input
              label="Control Effectiveness Value"
              required
              id="value"
              type="number"
              min="1"
              placeholder="e.g., 1, 2, 3..."
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 1 })}
              disabled={isPending}
            />

            <Textarea
              label="Description"
              id="description"
              placeholder="Describe this control effectiveness level"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? `${isEditMode ? "Updating" : "Creating"}...`
                : `${isEditMode ? "Update" : "Create"} Control Effectiveness`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
