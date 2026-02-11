"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  useReviewFindingActionEvidenceMutation,
  useUpdateFindingActionReviewMutation
} from "@/hooks/use-finding-actions-queries";
import type { FindingActionEvidence, FindingActionReview } from "@/lib/types/audit-types";
import { SearchSelectField } from "@/components/ui/search-select-field";

interface ReviewEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionId: string;
  evidence: FindingActionEvidence[];
  editingReview?: FindingActionReview | null;
}

export function ReviewEvidenceDialog({
  open,
  onOpenChange,
  actionId,
  evidence,
  editingReview
}: ReviewEvidenceDialogProps) {
  const [formData, setFormData] = useState({
    evidence_id: editingReview?.finding_action_evidence_id || "",
    review_status:
      (editingReview?.review_status as "APPROVED" | "REJECTED") ||
      ("APPROVED" as "APPROVED" | "REJECTED"),
    comments: editingReview?.review_comments || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useReviewFindingActionEvidenceMutation();
  const updateMutation = useUpdateFindingActionReviewMutation();

  // Determine if we're in edit mode
  const isEditing = !!editingReview;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.evidence_id) {
      newErrors.evidence_id = "Please select evidence to review";
    }
    if (!formData.review_status) {
      newErrors.review_status = "Please select a review status";
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

    let mutation = isEditing && editingReview ? updateMutation : createMutation;

    // Create Or Update a review
    mutation.mutate(
      {
        evidence_id: formData.evidence_id,
        action_id: actionId,
        status: formData.review_status,
        comments: String(formData.comments || "")
      },
      {
        onSuccess: () => {
          // Reset form
          setFormData({
            evidence_id: "",
            review_status: "APPROVED",
            comments: ""
          });
          setErrors({});
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Update Review" : "Review Evidence"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your review of the submitted evidence"
              : "Review and approve or reject submitted evidence"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Evidence Selection - Disabled when editing */}
          <SearchSelectField
            label="Select Evidence"
            value={formData.evidence_id}
            onValueChange={(value) => handleInputChange("evidence_id", value)}
            options={evidence.map((item, index) => ({
              id: item.id,
              name: item?.title || `Evidence #${index + 1}`
            }))}
            placeholder="-- Select Evidence --"
            isInvalid={!!errors.evidence_id}
            errorText={errors.evidence_id}
            required
            disabled={isEditing}
          />

          {/* Review Status */}
          <div className="space-y-2">
            <Label className={errors.review_status ? "text-red-500" : ""}>
              Review Status <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.review_status === "APPROVED" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleInputChange("review_status", "APPROVED")}>
                Approve
              </Button>
              <Button
                type="button"
                variant={formData.review_status === "REJECTED" ? "destructive" : "outline"}
                className="flex-1"
                onClick={() => handleInputChange("review_status", "REJECTED")}>
                Reject
              </Button>
            </div>
            {errors.review_status && <p className="text-sm text-red-500">{errors.review_status}</p>}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="review_comments">Comments</Label>
            <Textarea
              id="review_comments"
              placeholder="Provide feedback on the evidence..."
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending || updateMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant={formData.review_status === "REJECTED" ? "destructive" : "default"}
              disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing
                ? "Update Review"
                : formData.review_status === "APPROVED"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
