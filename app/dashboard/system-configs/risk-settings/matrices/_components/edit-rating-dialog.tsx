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
import { updateRating } from "@/app/_actions/config-actions";
import { ColorPicker } from "@/components/color-picker";

type Rating = {
  id: string;
  name: string;
  min_score: number;
  max_score: number;
  color_hex: string;
  description: string;
  matrix_id: string;
};

type EditRatingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rating: Rating;
  onSuccess: () => void;
};

export function EditRatingDialog({ open, onOpenChange, rating, onSuccess }: EditRatingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: rating.name,
    min_score: rating.min_score,
    max_score: rating.max_score,
    color_hex: rating.color_hex,
    description: rating.description,
    matrix_id: rating.matrix_id
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
      const response = await updateRating(rating.id, formData);
      if (response.success) {
        toast.success("Rating level updated successfully");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message || "Failed to update rating level");
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
            <DialogTitle>Edit Rating Level</DialogTitle>
            <DialogDescription>Update risk rating level details</DialogDescription>
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
              {isLoading ? "Updating..." : "Update Rating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
