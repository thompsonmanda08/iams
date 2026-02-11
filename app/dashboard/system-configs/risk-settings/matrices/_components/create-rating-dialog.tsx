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
import { createRating } from "@/app/_actions/config-actions";
import { ColorPicker } from "@/components/color-picker";

type CreateRatingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrixId: string;
  matrix_id?: string;
  onSuccess: () => void;
};

export function CreateRatingDialog({
  open,
  onOpenChange,
  matrixId,
  onSuccess
}: CreateRatingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    min_score: 1,
    max_score: 5,
    color_hex: "#FFFFFF",
    description: "",
    matrix_id: matrixId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Rating name is required");
      return;
    }

    if (formData.min_score >= formData.max_score) {
      toast.error("Min score must be less than max score");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createRating(matrixId, formData);
      if (response.success) {
        toast.success("Rating level created successfully");
        setFormData({
          name: "",
          min_score: 1,
          max_score: 5,
          color_hex: "#FFFF00",
          description: "",
          matrix_id: matrixId
        });
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message || "Failed to create rating level");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
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
            <DialogTitle>Add Rating Level</DialogTitle>
            <DialogDescription>Define a new risk rating level</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Low, Medium, High"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_score">
                  Min Score <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="min_score"
                  type="number"
                  min="1"
                  value={formData.min_score}
                  onChange={(e) =>
                    setFormData({ ...formData, min_score: parseInt(e.target.value) || 1 })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_score">
                  Max Score <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="max_score"
                  type="number"
                  min="1"
                  value={formData.max_score}
                  onChange={(e) =>
                    setFormData({ ...formData, max_score: parseInt(e.target.value) || 1 })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>
                Color <span className="text-destructive">*</span>
              </Label>
              <ColorPicker
                value={formData.color_hex}
                onChange={(color) => setFormData({ ...formData, color_hex: color })}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this rating level"
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
              {isLoading ? "Creating..." : "Create Rating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
