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
import { updateRating } from "@/app/_actions/config-actions";
import { ColorPicker } from "@/components/color-picker";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

type Rating = {
  id: string;
  name: string;
  min_score: number;
  max_score: number;
  color_hex: string;
  description: string;
  matrix_id?: string;
};

type EditRatingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rating: Rating;
  onSuccess: () => void;
};

export function EditRatingDialog({ open, onOpenChange, rating, onSuccess }: EditRatingDialogProps) {
  const { checkPermission, hasPermission } = usePermissions();
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

    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_edit")) return;

    if (!formData.name.trim()) {
      notify({ description: "Rating name is required", type: "error" });
      return;
    }

    if (formData.min_score >= formData.max_score) {
      notify({ description: "Min score must be less than max score", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateRating(rating.id, formData);
      if (response.success) {
        notify({ description: "Rating level updated successfully", type: "success" });
        onOpenChange(false);
        onSuccess();
      } else {
        notify({ description: response.message || "Failed to update rating level", type: "error" });
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
            <DialogTitle>Edit Rating Level</DialogTitle>
            <DialogDescription>Update risk rating level details</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Input
              label="Name"
              required
              id="name"
              placeholder="e.g., Low, Medium, High"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Score"
                required
                id="min_score"
                type="number"
                min="1"
                value={formData.min_score}
                onChange={(e) =>
                  setFormData({ ...formData, min_score: parseInt(e.target.value) || 1 })
                }
                disabled={isLoading}
              />
              <Input
                label="Max Score"
                required
                id="max_score"
                type="number"
                min="1"
                max="25"
                value={formData.max_score}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value) || 1;
                  setFormData({ ...formData, max_score: Math.min(parsed, 25) });
                }}
                disabled={isLoading}
              />
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

            <Textarea
              label="Description"
              id="description"
              placeholder="Describe this rating level"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              loadingText="Saving...">
              Update Rating
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
