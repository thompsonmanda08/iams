"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

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
  const [submittingStatus, setSubmittingStatus] = useState<"APPROVED" | "REJECTED" | null>(null);

  const createMutation = useReviewFindingActionEvidenceMutation();
  const updateMutation = useUpdateFindingActionReviewMutation();

  // Determine if we're in edit mode
  const isEditing = !!editingReview;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.evidence_id) {
      newErrors.evidence_id = "Please select evidence to review";
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

  const handleSubmit = (status: "APPROVED" | "REJECTED") => {
    if (!validateForm()) {
      return;
    }

    setSubmittingStatus(status);
    let mutation = isEditing && editingReview ? updateMutation : createMutation;

    // Create Or Update a review
    mutation.mutate(
      {
        evidence_id: formData.evidence_id,
        action_id: actionId,
        status,
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
          setSubmittingStatus(null);
          setErrors({});
          onOpenChange(false);
        },
        onError: () => {
          setSubmittingStatus(null);
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
              // name: item?.evidence_summary || item?.evidence_file_name || `Evidence #${index + 1}`
              name: `Evidence #${index + 1}`
            }))}
            placeholder="-- Select Evidence --"
            isInvalid={!!errors.evidence_id}
            errorText={errors.evidence_id}
            required
            disabled={isEditing}
          />

          {/* Comments */}
          <Textarea
            id="review_comments"
            label="Comments"
            placeholder="Provide feedback on the evidence..."
            value={formData.comments}
            onChange={(e) => handleInputChange("comments", e.target.value)}
            rows={3}
          />

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleSubmit("REJECTED")}
              disabled={createMutation.isPending || updateMutation.isPending}>
              {submittingStatus === "REJECTED" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleSubmit("APPROVED")}
              disabled={createMutation.isPending || updateMutation.isPending}>
              {submittingStatus === "APPROVED" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
