"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useCreateFindingActionEvidenceMutation } from "@/hooks/use-finding-actions-queries";

interface SubmitEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionId: string;
}

export function SubmitEvidenceDialog({
  open,
  onOpenChange,
  actionId
}: SubmitEvidenceDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file_link: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createEvidenceMutation = useCreateFindingActionEvidenceMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.file_link.trim()) {
      newErrors.file_link = "File link is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    createEvidenceMutation.mutate(
      {
        finding_action_id: actionId,
        title: formData.title,
        description: formData.description || undefined,
        file_link: formData.file_link || undefined
      },
      {
        onSuccess: () => {
          // Reset form
          setFormData({
            title: "",
            description: "",
            file_link: ""
          });
          setErrors({});
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Evidence</DialogTitle>
          <DialogDescription>
            Upload evidence to demonstrate progress on this action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="evidence_title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="evidence_title"
              placeholder="e.g., Policy Document, Test Results..."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="evidence_description">Description</Label>
            <Textarea
              id="evidence_description"
              placeholder="Describe the evidence or findings..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* File Link */}
          <div className="space-y-2">
            <Label htmlFor="evidence_file">
              File Link <span className="text-red-500">*</span>
            </Label>
            <Input
              id="evidence_file"
              placeholder="https://example.com/file"
              type="url"
              value={formData.file_link}
              onChange={(e) => handleInputChange("file_link", e.target.value)}
              className={errors.file_link ? "border-red-500" : ""}
            />
            {errors.file_link && <p className="text-sm text-red-500">{errors.file_link}</p>}
            {!errors.file_link && (
              <p className="text-muted-foreground text-xs">
                Provide a URL to the evidence file or document
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createEvidenceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createEvidenceMutation.isPending}
            >
              {createEvidenceMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Evidence
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
