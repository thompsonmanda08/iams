"use client";

import { useState } from "react";
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
import { createScale } from "@/app/_actions/config-actions";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

type CreateScaleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrixId: string;
  matrix_id?: string;
  scaleType: "LIKELIHOOD" | "IMPACT";
  onSuccess: () => void;
};

export function CreateScaleDialog({
  open,
  onOpenChange,
  matrixId,
  scaleType,
  onSuccess
}: CreateScaleDialogProps) {
  const { checkPermission } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    level: 1,
    name: "",
    description: "",
    matrix_id: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_create")) return;

    if (!formData.name.trim()) {
      notify({ description: "Scale name is required", type: "error" });
      return;
    }

    if (formData.level < 1 || formData.level > 10) {
      notify({ description: "Level must be between 1 and 10", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await createScale(matrixId, {
        scale_type: scaleType,
        level: formData.level,
        name: formData.name,
        description: formData.description,
        matrix_id: matrixId
      });
      if (response.success) {
        notify({ description: response.message || "Scale created successfully", type: "success" });
        setFormData({ level: 1, name: "", description: "", matrix_id: matrixId });
        onOpenChange(false);
        onSuccess();
      } else {
        notify({ description: response.message || "Failed to create scale", type: "error" });
      }
    } catch (error) {
      notify({ description: "An unexpected error occurred", type: "error" });
    } finally {
      setIsLoading(false);
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
              Add {scaleType === "LIKELIHOOD" ? "Likelihood" : "Impact"} Level
            </DialogTitle>
            <DialogDescription>Define a new scale level</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="level">
                Level <span className="text-destructive">*</span>
              </Label>
              <Input
                id="level"
                type="number"
                min="1"
                placeholder="e.g., 1, 2, 3..."
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Very High, Almost Certain"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe when this level applies"
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
              {isLoading ? "Creating..." : "Create Level"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
