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
import { updateScale } from "@/app/_actions/config-actions";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

type Scale = {
  id: string;
  scale_type: "LIKELIHOOD" | "IMPACT";
  level: number;
  name: string;
  description: string;
  matrix_id?: string;
};

type EditScaleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scale: Scale;
  onSuccess: () => void;
};

export function EditScaleDialog({ open, onOpenChange, scale, onSuccess }: EditScaleDialogProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: scale.name,
    description: scale.description,
    matrix_id: scale.matrix_id
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_edit")) return;

    if (!formData.name.trim()) {
      notify({ description: "Scale name is required", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateScale(scale.id, formData);
      if (response.success) {
        notify({ description: "Scale updated successfully", type: "success" });
        onOpenChange(false);
        onSuccess();
      } else {
        notify({ description: response.message || "Failed to update scale", type: "error" });
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
            <DialogTitle>Edit Scale Level {scale.level}</DialogTitle>
            <DialogDescription>Update scale level details</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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
              {isLoading ? "Updating..." : "Update Level"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
