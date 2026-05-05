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
import { useCreateRiskMatrixMutation } from "@/hooks/use-config-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";


type CreateRiskMatrixDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function CreateRiskMatrixDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateRiskMatrixDialogProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_default: false
  });

  const { mutate: createMatrix, isPending } = useCreateRiskMatrixMutation({
    onSuccess: () => {
      setFormData({ name: "", description: "", is_default: false });
      onOpenChange(false);
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_create")) return;

    if (!formData.name.trim()) {
      return;
    }

    createMatrix(formData);
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
            <DialogTitle>Create Risk Matrix</DialogTitle>
            <DialogDescription>Add a new risk assessment matrix configuration</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Input
              label="Matrix Name"
              required
              id="name"
              placeholder="e.g., Financial Risk Matrix"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isPending}
            />

            <Textarea
              label="Description"
              id="description"
              placeholder="Describe the purpose of this matrix"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isPending}
            />

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
              {isPending ? "Creating..." : "Create Matrix"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
