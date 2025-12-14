"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  useApproveFindingActionEvidenceMutation,
  useRejectFindingActionEvidenceMutation
} from "@/hooks/use-finding-actions-queries";
import type { FindingActionEvidence } from "@/lib/types/audit-types";

interface ReviewEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionId: string;
  evidence: FindingActionEvidence[];
}

export function ReviewEvidenceDialog({
  open,
  onOpenChange,
  actionId,
  evidence
}: ReviewEvidenceDialogProps) {
  const [formData, setFormData] = useState({
    evidence_id: "",
    review_status: "APPROVED" as "APPROVED" | "REJECTED",
    comments: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const approveMutation = useApproveFindingActionEvidenceMutation();
  const rejectMutation = useRejectFindingActionEvidenceMutation();

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

    const mutation = formData.review_status === "APPROVED" ? approveMutation : rejectMutation;

    mutation.mutate(
      {
        evidence_id: formData.evidence_id,
        comments: formData.comments || undefined
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Evidence</DialogTitle>
          <DialogDescription>
            Review and approve or reject submitted evidence
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Evidence Selection */}
          <div className="space-y-2">
            <Label htmlFor="evidence_select">
              Select Evidence <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.evidence_id} onValueChange={(value) => handleInputChange("evidence_id", value)}>
              <SelectTrigger className={errors.evidence_id ? "border-red-500" : ""}>
                <SelectValue placeholder="Select evidence..." />
              </SelectTrigger>
              <SelectContent>
                {evidence.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.evidence_file_name || item.evidence_summary || `Evidence #${item.id.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.evidence_id && <p className="text-sm text-red-500">{errors.evidence_id}</p>}
          </div>

          {/* Review Status */}
          <div className="space-y-2">
            <Label className={errors.review_status ? "text-red-500" : ""}>
              Review Status <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.review_status}
              onValueChange={(value) => handleInputChange("review_status", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="APPROVED" id="approved" />
                <Label htmlFor="approved" className="font-normal cursor-pointer">
                  Approve
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="REJECTED" id="rejected" />
                <Label htmlFor="rejected" className="font-normal cursor-pointer">
                  Reject
                </Label>
              </div>
            </RadioGroup>
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
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {(approveMutation.isPending || rejectMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {formData.review_status === "APPROVED" ? "Approve" : "Reject"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
