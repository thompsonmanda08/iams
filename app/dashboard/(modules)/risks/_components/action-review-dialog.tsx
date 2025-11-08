"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ActionDefinition } from "@/app/_actions/risk-module-actions";

interface ActionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionDefinition: ActionDefinition;
}

type ReviewDecision = "APPROVE" | "REQUEST_CHANGES";

const INITIAL_FORM_DATA = {
  reviewer_feedback: "",
  assessment_decision: "APPROVE" as ReviewDecision,
  risk_assessment_score: 0
};

// Risk assessment options
const RISK_ASSESSMENT_OPTIONS = [
  { id: "1", name: "1 - Very Low Risk" },
  { id: "2", name: "2 - Low Risk" },
  { id: "3", name: "3 - Medium Risk" },
  { id: "4", name: "4 - High Risk" },
  { id: "5", name: "5 - Very High Risk" }
];

const DECISION_OPTIONS = [
  { id: "APPROVE", name: "Approve" },
  { id: "REQUEST_CHANGES", name: "Request Changes" }
];

export function ActionReviewDialog({
  open,
  onOpenChange,
  actionDefinition
}: ActionReviewDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<{
    reviewer_feedback?: string;
    assessment_decision?: string;
    risk_assessment_score?: string;
  }>({});

  const { action, execution } = actionDefinition;

  const validateStep = (currentStep: 1 | 2) => {
    const newErrors: typeof errors = {};

    if (currentStep === 1) {
      if (!formData.reviewer_feedback.trim()) {
        newErrors.reviewer_feedback = "Feedback is required";
      }

      if (!formData.assessment_decision) {
        newErrors.assessment_decision = "Please select a decision";
      }
    } else if (currentStep === 2) {
      if (!formData.risk_assessment_score) {
        newErrors.risk_assessment_score = "Risk assessment score is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  // Mutation for submitting review
  const submitReviewMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // TODO: Replace with actual server action call
      // const response = await submitActionReview({
      //   action_id: action.id,
      //   execution_id: execution?.id,
      //   reviewer_feedback: data.reviewer_feedback,
      //   assessment_decision: data.assessment_decision,
      //   risk_assessment_score: parseInt(data.risk_assessment_score as any)
      // });
      // return response;

      // Mock response
      return {
        success: true,
        message: "Review submitted successfully",
        data: {}
      };
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Review submitted successfully");
        setFormData(INITIAL_FORM_DATA);
        setStep(1);
        onOpenChange(false);
        router.refresh();
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    },
    onError: (error) => {
      toast.error("An error occurred while submitting review");
      console.error("Error submitting review:", error);
    }
  });

  const handleSubmit = () => {
    if (validateStep(2)) {
      submitReviewMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Review Action Submission
          </DialogTitle>
          <DialogDescription>
            Review the action submission for:{" "}
            <span className="font-semibold">{action.instructions.slice(0, 50)}...</span>
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
              step >= 1
                ? "bg-blue-600 text-white"
                : "border-2 border-gray-300 text-gray-600"
            }`}>
            1
          </div>
          <div
            className={`h-1 w-12 transition-all ${
              step >= 2 ? "bg-blue-600" : "bg-gray-300"
            }`}></div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
              step >= 2
                ? "bg-blue-600 text-white"
                : "border-2 border-gray-300 text-gray-600"
            }`}>
            2
          </div>
        </div>

        <div className="space-y-6 py-4">
          {step === 1 ? (
            <>
              {/* Step 1: Review & Decision */}
              <div className="space-y-4">
                {/* Evidence Summary */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Evidence Submitted
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                        {execution?.evidence_description}
                      </p>
                    </div>
                    {execution?.evidence_file_name && (
                      <div>
                        <p className="text-xs text-gray-600">File attached:</p>
                        <p className="text-sm font-medium text-gray-900">
                          {execution.evidence_file_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviewer Feedback */}
                <Textarea
                  id="reviewer_feedback"
                  label="Reviewer Feedback / Comments"
                  placeholder="Provide feedback on the submitted evidence and action taken..."
                  value={formData.reviewer_feedback}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      reviewer_feedback: e.target.value
                    }));
                    if (errors.reviewer_feedback) {
                      setErrors((prev) => ({
                        ...prev,
                        reviewer_feedback: undefined
                      }));
                    }
                  }}
                  rows={4}
                  className="resize-none"
                  showLimit={true}
                  maxLength={500}
                  descriptionText="Provide your feedback and comments on the submitted evidence."
                  isInvalid={!!errors.reviewer_feedback}
                  errorText={errors.reviewer_feedback}
                  required
                />

                {/* Review Decision */}
                <SearchSelectField
                  label="Review Decision"
                  placeholder="Select your decision"
                  options={DECISION_OPTIONS}
                  value={formData.assessment_decision}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      assessment_decision: value as ReviewDecision
                    }));
                    if (errors.assessment_decision) {
                      setErrors((prev) => ({
                        ...prev,
                        assessment_decision: undefined
                      }));
                    }
                  }}
                  listItemName="name"
                  isInvalid={!!errors.assessment_decision}
                  errorText={errors.assessment_decision}
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Risk Assessment */}
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Residual Risk Assessment
                      </p>
                      <p className="mt-1 text-xs text-amber-800">
                        Based on the submitted evidence, assess the residual risk level
                        after this action has been taken.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment Score */}
                <SearchSelectField
                  label="Risk Assessment Score"
                  placeholder="Select risk level"
                  options={RISK_ASSESSMENT_OPTIONS}
                  value={String(formData.risk_assessment_score)}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      risk_assessment_score: parseInt(value)
                    }));
                    if (errors.risk_assessment_score) {
                      setErrors((prev) => ({
                        ...prev,
                        risk_assessment_score: undefined
                      }));
                    }
                  }}
                  listItemName="name"
                  isInvalid={!!errors.risk_assessment_score}
                  errorText={errors.risk_assessment_score}
                  required
                />

                {/* Decision Summary */}
                <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">Review Summary</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Decision:</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {formData.assessment_decision === "APPROVE"
                          ? "Approve"
                          : "Request Changes"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Risk Level:</span>
                      <Badge className="bg-green-100 text-green-800">
                        {formData.risk_assessment_score > 0
                          ? `${formData.risk_assessment_score} - ${
                              RISK_ASSESSMENT_OPTIONS[
                                formData.risk_assessment_score - 1
                              ]?.name.split(" - ")[1]
                            }`
                          : "Not set"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitReviewMutation.isPending}>
              Cancel
            </Button>

            <div className="flex gap-2">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={submitReviewMutation.isPending}
                  className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}

              {step === 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={submitReviewMutation.isPending}
                  className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  isLoading={submitReviewMutation.isPending}
                  disabled={submitReviewMutation.isPending}
                  className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Review
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
