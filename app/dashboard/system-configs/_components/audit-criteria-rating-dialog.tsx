"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "@/components/color-picker";
import type { AuditCriteriaRating } from "./report-guide-detail";

interface AuditCriteriaRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: AuditCriteriaRating;
  mode: "create" | "edit";
}

export function AuditCriteriaRatingDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode
}: AuditCriteriaRatingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: "",
    criteria_desc: "",
    color_hex: "#00FF00"
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        rating: initialData.rating,
        criteria_desc: initialData.criteria_desc,
        color_hex: initialData.color_hex
      });
    } else {
      setFormData({
        rating: "",
        criteria_desc: "",
        color_hex: "#00FF00"
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rating.trim()) {
      alert("Please enter a rating");
      return;
    }
    if (!formData.criteria_desc.trim()) {
      alert("Please enter criteria description");
      return;
    }
    if (!formData.color_hex) {
      alert("Please select a color");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ ...formData, guide_type: "AUDIT_CRITERIA_RATING" });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Audit Criteria Rating" : "Edit Audit Criteria Rating"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new audit findings rating criteria"
              : "Update the audit findings rating criteria"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Rating"
            required
            id="rating"
            placeholder="e.g., Satisfactory, Needs Improvement"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <Label htmlFor="color">Color *</Label>
            <ColorPicker
              value={formData.color_hex}
              onChange={(color) => setFormData({ ...formData, color_hex: color })}
            />
          </div>

          <Textarea
            label="Criteria Description"
            required
            id="criteria_desc"
            placeholder="Describe the audit criteria for this rating..."
            value={formData.criteria_desc}
            onChange={(e) => setFormData({ ...formData, criteria_desc: e.target.value })}
            disabled={isLoading}
            rows={6}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Rating"
                  : "Update Rating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
