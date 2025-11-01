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
import { toast } from "sonner";
import { updateRiskMatrix } from "@/app/_actions/config-actions";


type RiskMatrix = {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: matrix.name,
    description: matrix.description,
    is_default: matrix.is_default
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Matrix name is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateRiskMatrix(matrix.id, formData);
      if (response.success) {
        toast.success("Risk matrix updated successfully");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message || "Failed to update risk matrix");
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_default: checked as boolean })
                }
                disabled={isLoading}
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
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Matrix"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
