"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useUpdateRiskMatrixMutation } from "@/hooks/use-config-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";


type RiskMatrix = {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
};

type EditRiskMatrixDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrix: RiskMatrix;
  onSuccess: () => void;
};

export function EditRiskMatrixDialog({
  open,
  onOpenChange,
  matrix,
  onSuccess
}: EditRiskMatrixDialogProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const [formData, setFormData] = useState({
    name: matrix.name,
    description: matrix.description,
    is_default: matrix.is_default,
    is_active: matrix.is_active
  });

  const { mutate: updateMatrix, isPending } = useUpdateRiskMatrixMutation({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_edit")) return;

    if (!formData.name.trim()) {
      return;
    }

    updateMatrix({ id: matrix.id, data: formData });
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
            <DialogTitle>Edit Risk Matrix</DialogTitle>
            <DialogDescription>Update risk matrix configuration</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Matrix Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Financial Risk Matrix"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this matrix"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_default: checked as boolean })
                }
                disabled={isPending}
              />
              <Label htmlFor="is_default" className="text-sm font-normal">
                Set as default matrix
              </Label>
            </div>
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
              {isPending ? "Updating..." : "Update Matrix"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
