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
import { createScale } from "@/app/_actions/config-actions";

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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    level: 1,
    name: "",
    description: "",
    matrix_id: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Scale name is required");
      return;
    }

    if (formData.level < 1 || formData.level > 10) {
      toast.error("Level must be between 1 and 10");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createScale(matrixId, {
        scale_type: scaleType,
        level: formData.level,
        name: formData.name,
        description: formData.description,
        matrix_id: matrixId,
        
      });
      if (response.success) {
        toast.success(response.message || "Scale created successfully");
        setFormData({ level: 1, name: "", description: "", matrix_id: matrixId });
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message || "Failed to create scale");
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
                max="10"
                placeholder="e.g., 1, 2, 3..."
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                disabled={isLoading}
              />
              <p className="text-muted-foreground text-xs">Level must be between 1 and 10</p>
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
