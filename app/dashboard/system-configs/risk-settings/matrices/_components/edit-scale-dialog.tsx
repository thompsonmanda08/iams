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
import { toast } from "sonner";
import { updateScale } from "@/app/_actions/config-actions";

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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: scale.name,
    description: scale.description,
    matrix_id: scale.matrix_id
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Scale name is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateScale(scale.id, formData);
      if (response.success) {
        toast.success("Scale updated successfully");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message || "Failed to update scale");
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
