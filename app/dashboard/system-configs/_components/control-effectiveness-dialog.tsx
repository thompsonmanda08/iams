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
import { toast } from "sonner";
import { createEffectivenessLevel, updateEffectivenessLevel } from "@/app/_actions/config-actions";

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
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Control effectiveness name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = isEditMode
        ? await updateEffectivenessLevel(control.id, formData)
        : await createEffectivenessLevel(formData);

      if (result.success) {
        toast.success(`Control effectiveness ${isEditMode ? "updated" : "created"} successfully`);
        setFormData({ name: "", description: "", value: 1 });
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(
          result.message || `Failed to ${isEditMode ? "update" : "create"} control effectiveness`
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
            <div className="grid gap-2">
              <Label htmlFor="name">
                Control Effectiveness Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Highly Effective, Effective, Partially Effective"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">
                Control Effectiveness Value <span className="text-destructive">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                min="1"
                placeholder="e.g., 1, 2, 3..."
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 1 })}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this control effectiveness level"
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
                : `${isEditMode ? "Update" : "Create"} Control Effectiveness`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
