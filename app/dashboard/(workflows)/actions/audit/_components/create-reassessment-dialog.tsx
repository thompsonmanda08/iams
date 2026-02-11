"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useCreateFindingReassessmentMutation } from "@/hooks/use-finding-actions-queries";

interface CreateReassessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  findingId: string;
  actionId: string;
}

const SEVERITY_LEVELS = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" }
];

export function CreateReassessmentDialog({
  open,
  onOpenChange,
  findingId,
  actionId
}: CreateReassessmentDialogProps) {
  const [formData, setFormData] = useState({
    compliance_status: "Compliant" as "Compliant" | "Non-Compliant" | "Partial",
    auditor_comments: "",
    new_severity: "",
    new_recommendation: "",
    compliance_percentage: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createReassessmentMutation = useCreateFindingReassessmentMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.compliance_status) {
      newErrors.compliance_status = "Please select a compliance status";
    }
    if (!formData.auditor_comments.trim()) {
      newErrors.auditor_comments = "Auditor comments are required";
    }

    // New recommendation required for non-compliant or partial
    if (
      (formData.compliance_status === "Non-Compliant" || formData.compliance_status === "Partial") &&
      !formData.new_recommendation.trim()
    ) {
      newErrors.new_recommendation = "Recommendation is required when non-compliant or partial";
    }

    if (
      formData.compliance_status === "Partial" &&
      (!formData.compliance_percentage ||
        isNaN(Number(formData.compliance_percentage)) ||
        Number(formData.compliance_percentage) < 0 ||
        Number(formData.compliance_percentage) > 100)
    ) {
      newErrors.compliance_percentage = "Valid percentage required (0-100)";
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

    createReassessmentMutation.mutate(
      {
        finding_id: findingId,
        finding_action_id: actionId,
        compliance_status: formData.compliance_status,
        auditor_comments: formData.auditor_comments,
        new_severity: formData.new_severity || undefined,
        new_recommendation: formData.new_recommendation || undefined,
        compliance_percentage: formData.compliance_percentage
          ? Number(formData.compliance_percentage)
          : undefined
      },
      {
        onSuccess: () => {
          // Reset form
          setFormData({
            compliance_status: "Compliant",
            auditor_comments: "",
            new_severity: "",
            new_recommendation: "",
            compliance_percentage: ""
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
        className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Reassessment</DialogTitle>
          <DialogDescription>
            Document the reassessment of this finding based on submitted evidence
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Compliance Status */}
          <div className="space-y-2">
            <Label className={errors.compliance_status ? "text-red-500" : ""}>
              Compliance Status <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.compliance_status}
              onValueChange={(value) =>
                handleInputChange("compliance_status", value)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Compliant" id="compliant" />
                <Label htmlFor="compliant" className="font-normal cursor-pointer">
                  Compliant
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Non-Compliant" id="non-compliant" />
                <Label htmlFor="non-compliant" className="font-normal cursor-pointer">
                  Non-Compliant
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Partial" id="partial" />
                <Label htmlFor="partial" className="font-normal cursor-pointer">
                  Partially Compliant
                </Label>
              </div>
            </RadioGroup>
            {errors.compliance_status && (
              <p className="text-sm text-red-500">{errors.compliance_status}</p>
            )}
          </div>

          {/* Auditor Comments */}
          <div className="space-y-2">
            <Label htmlFor="auditor_comments">
              Auditor Comments <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="auditor_comments"
              placeholder="Provide detailed comments on the reassessment..."
              value={formData.auditor_comments}
              onChange={(e) => handleInputChange("auditor_comments", e.target.value)}
              rows={4}
              className={errors.auditor_comments ? "border-red-500" : ""}
            />
            {errors.auditor_comments && (
              <p className="text-sm text-red-500">{errors.auditor_comments}</p>
            )}
          </div>

          {/* New Severity (if non-compliant) */}
          {formData.compliance_status === "Non-Compliant" && (
            <div className="space-y-2">
              <Label htmlFor="new_severity">New Severity</Label>
              <Select
                value={formData.new_severity}
                onValueChange={(value) => handleInputChange("new_severity", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity level..." />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Update severity if findings remain after remediation
              </p>
            </div>
          )}

          {/* New Recommendation (if non-compliant or partial) */}
          {(formData.compliance_status === "Non-Compliant" || formData.compliance_status === "Partial") && (
            <div className="space-y-2">
              <Label htmlFor="new_recommendation" className={errors.new_recommendation ? "text-red-500" : ""}>
                New Recommendation <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="new_recommendation"
                placeholder="Provide new recommendations for remediation..."
                value={formData.new_recommendation}
                onChange={(e) => handleInputChange("new_recommendation", e.target.value)}
                rows={3}
                className={errors.new_recommendation ? "border-red-500" : ""}
              />
              {errors.new_recommendation && (
                <p className="text-sm text-red-500">{errors.new_recommendation}</p>
              )}
            </div>
          )}

          {/* Compliance Percentage (if partial) */}
          {formData.compliance_status === "Partial" && (
            <div className="space-y-2">
              <Label htmlFor="compliance_percentage">
                Compliance Percentage <span className="text-red-500">*</span>
              </Label>
              <Input
                id="compliance_percentage"
                type="number"
                placeholder="Enter percentage (0-100)..."
                value={formData.compliance_percentage}
                onChange={(e) => handleInputChange("compliance_percentage", e.target.value)}
                min="0"
                max="100"
                className={errors.compliance_percentage ? "border-red-500" : ""}
              />
              {errors.compliance_percentage && (
                <p className="text-sm text-red-500">{errors.compliance_percentage}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createReassessmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createReassessmentMutation.isPending}
            >
              {createReassessmentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Reassessment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
