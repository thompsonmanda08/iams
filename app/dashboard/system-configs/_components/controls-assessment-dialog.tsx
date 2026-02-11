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
import { Textarea } from "@/components/ui/textarea";
import type { ControlsAssessmentGuide } from "./report-guide-detail";

interface ControlsAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: ControlsAssessmentGuide;
  mode: "create" | "edit";
}

export function ControlsAssessmentDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode
}: ControlsAssessmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    control_name: "",
    assessment_desc: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        control_name: initialData.control_name,
        assessment_desc: initialData.assessment_desc
      });
    } else {
      setFormData({
        control_name: "",
        assessment_desc: ""
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.control_name.trim()) {
      alert("Please enter a control name");
      return;
    }
    if (!formData.assessment_desc.trim()) {
      alert("Please enter an assessment description");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ ...formData, guide_type: "CONTROLS_ASSESSMENT_GUIDE" });
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
            {mode === "create" ? "Add Controls Assessment Guide" : "Edit Controls Assessment Guide"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new controls assessment guideline"
              : "Update the controls assessment guideline"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Control Name"
            required
            id="control_name"
            placeholder="e.g., Access Control, Data Encryption"
            value={formData.control_name}
            onChange={(e) => setFormData({ ...formData, control_name: e.target.value })}
            disabled={isLoading}
          />

          <Textarea
            label="Assessment Description"
            required
            id="assessment_desc"
            placeholder="Describe how this control should be assessed..."
            value={formData.assessment_desc}
            onChange={(e) => setFormData({ ...formData, assessment_desc: e.target.value })}
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
                  ? "Create Guide"
                  : "Update Guide"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
