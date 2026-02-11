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
import type { RiskFindingGrading } from "./report-guide-detail";

interface RiskFindingGradingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: RiskFindingGrading;
  mode: "create" | "edit";
}

export function RiskFindingGradingDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode
}: RiskFindingGradingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    issue_rating: "",
    term_rating: "",
    symbol: "",
    color_hex: "#FF0000",
    description: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        issue_rating: initialData.issue_rating,
        term_rating: initialData.term_rating,
        symbol: initialData.symbol,
        color_hex: initialData.color_hex,
        description: initialData.description
      });
    } else {
      setFormData({
        issue_rating: "",
        term_rating: "",
        symbol: "",
        color_hex: "#FF0000",
        description: ""
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.issue_rating.trim()) {
      alert("Please enter an issue rating");
      return;
    }
    if (!formData.term_rating.trim()) {
      alert("Please enter a term rating");
      return;
    }
    if (!formData.symbol.trim()) {
      alert("Please enter a symbol");
      return;
    }
    if (!formData.color_hex) {
      alert("Please select a color");
      return;
    }
    if (!formData.description.trim()) {
      alert("Please enter a description");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        ...formData,
        guide_type: "RISK_FINDINGS_GRADING"
      });
      onOpenChange(false);
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
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Risk Finding Grade" : "Edit Risk Finding Grade"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new risk finding severity level and grade"
              : "Update the risk finding severity level and grade"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Issue Rating"
            required
            id="issue_rating"
            placeholder="e.g., Critical, High, Medium"
            value={formData.issue_rating}
            onChange={(e) => setFormData({ ...formData, issue_rating: e.target.value })}
            disabled={isLoading}
          />

          <Input
            label="Term Rating"
            required
            id="term_rating"
            placeholder="e.g., HIGH, MEDIUM, LOW"
            value={formData.term_rating}
            onChange={(e) => setFormData({ ...formData, term_rating: e.target.value })}
            disabled={isLoading}
          />

          <Input
            label="Symbol"
            required
            id="symbol"
            placeholder="e.g., H, M, L"
            maxLength={2}
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <ColorPicker
              value={formData.color_hex}
              onChange={(color) => setFormData({ ...formData, color_hex: color })}
            />
          </div>

          <Textarea
            label="Description"
            required
            id="description"
            placeholder="Describe this risk finding grade..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isLoading}
            rows={4}
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
                  ? "Create Grade"
                  : "Update Grade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
