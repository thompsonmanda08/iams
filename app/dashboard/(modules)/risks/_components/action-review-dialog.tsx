"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { submitActionReview, updateRiskStepTwo } from "@/app/_actions/risk-module-actions";
import type { ActionDefinition } from "@/app/_actions/risk-module-actions";
import type { StepTwoData } from "@/lib/types/risk-type";
import { QUERY_KEYS } from "@/lib/constants";
import { useRiskMatrices, useEffectivenessLevels } from "@/hooks/use-risk-query-data";
import type { RiskMatrix } from "@/lib/types/risk-type";
import { RiskSlider } from "./risk-slider";
import { RiskScoreDisplay } from "./risk-score-display";

interface ActionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionDefinition: ActionDefinition;
}

type ReviewDecision = "APPROVE" | "REQUEST_CHANGES";

interface ReviewFormData {
  remarks: string;
  assessment_decision: ReviewDecision;
  risk_matrix_id: string;
  residual_likelihood: number;
  residual_impact: number;
  existing_controls: string;
  control_effectiveness: number;
}

const INITIAL_FORM_DATA: ReviewFormData = {
  remarks: "",
  assessment_decision: "APPROVE" as ReviewDecision,
  risk_matrix_id: "",
  residual_likelihood: 0,
  residual_impact: 0,
  existing_controls: "",
  control_effectiveness: 0
};

export function ActionReviewDialog({
  open,
  onOpenChange,
  actionDefinition
}: ActionReviewDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [selectedMatrix, setSelectedMatrix] = useState<RiskMatrix | null>(null);
  const [errors, setErrors] = useState<{
    remarks?: string;
    assessment_decision?: string;
    risk_matrix_id?: string;
    existing_controls?: string;
    control_effectiveness?: string;
  }>({});

  const { action, execution } = actionDefinition;

  // Fetch risk matrices using custom hook
  const { data: riskMatrices = [], isLoading: loadingMatrices } = useRiskMatrices(open);

  // Fetch effectiveness levels using custom hook
  const { data: controls = [], isLoading: loadingControls } = useEffectivenessLevels(open);

  const getLikelihoodRange = () => ({
    min: selectedMatrix?.likelihood_min || 0,
    max: selectedMatrix?.likelihood_max || 0
  });

  const getImpactRange = () => ({
    min: selectedMatrix?.impact_min || 0,
    max: selectedMatrix?.impact_max || 0
  });

  const likelihoodRange = getLikelihoodRange();
  const impactRange = getImpactRange();
  const residualScore = formData.residual_likelihood * formData.residual_impact;

  const controlsOptions = useMemo(() => {
    return controls.map((ctrl: any) => ({
      name: `${ctrl.value} - ${ctrl.name}`,
      id: ctrl.value.toString()
    }));
  }, [controls]);

  const handleMatrixChange = (matrixId: string) => {
    const matrix = riskMatrices.find((m) => m.id === matrixId);
    if (matrix) {
      setSelectedMatrix(matrix);
      const midLikelihood = Math.ceil(
        ((matrix.likelihood_min ?? 1) + (matrix.likelihood_max ?? 5)) / 2
      );
      const midImpact = Math.ceil(((matrix.impact_min ?? 1) + (matrix.impact_max ?? 5)) / 2);

      setFormData((prev) => ({
        ...prev,
        risk_matrix_id: matrixId,
        residual_likelihood: midLikelihood,
        residual_impact: midImpact
      }));
    }
  };

  const validateStep = (currentStep: 1 | 2) => {
    const newErrors: typeof errors = {};

    if (currentStep === 1) {
      if (!formData.remarks.trim()) {
        newErrors.remarks = "Feedback is required";
      }

      if (!formData.assessment_decision) {
        newErrors.assessment_decision = "Please select a decision";
      }
    } else if (currentStep === 2) {
      if (!formData.risk_matrix_id) {
        newErrors.risk_matrix_id = "Risk matrix is required";
      }
      if (!formData.control_effectiveness) {
        newErrors.control_effectiveness = "Control effectiveness is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      // Submit Step 1 review to API - Step 2 will only be shown after success
      submitReviewMutation.mutate();
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  // Get the risk ID from actionDefinition (needed for updateRiskStepTwo)
  const riskId = actionDefinition.action?.risk_id;

  // Mutation for submitting Step 1 review (approval/feedback)
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await submitActionReview({
        task_id: action.id,
        execution_id: execution?.id || "",
        approval_status: "COMPLETE",
        remarks: formData.remarks
      });
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Review step 1 submitted");
        // Continue to Step 2 for risk assessment
        setStep(2);
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    },
    onError: (error) => {
      toast.error("An error occurred while submitting review");
      console.error("Error submitting review:", error);
    }
  });

  // Mutation for submitting Step 2 risk assessment
  const updateRiskMutation = useMutation({
    mutationFn: async () => {
      if (!riskId) {
        throw new Error("Risk ID is required");
      }

      const stepTwoData: StepTwoData = {
        risk_matrix_id: formData.risk_matrix_id,
        inherent_likelihood: formData.residual_likelihood,
        inherent_impact: formData.residual_impact,
        existing_controls: formData.existing_controls,
        control_effectiveness: formData.control_effectiveness
      };

      const response = await updateRiskStepTwo(riskId, stepTwoData);
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Risk assessment updated and review completed");
        setFormData(INITIAL_FORM_DATA);
        setStep(1);
        onOpenChange(false);
        router.refresh();
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIONS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTION_LOGS] });
      } else {
        toast.error(response.message || "Failed to update risk assessment");
      }
    },
    onError: (error) => {
      toast.error("An error occurred while updating risk assessment");
      console.error("Error updating risk:", error);
    }
  });

  const handleSubmit = () => {
    if (validateStep(2)) {
      updateRiskMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90svh]! max-w-2xl! flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Review Action Submission
            </DialogTitle>
            <DialogDescription>
              Step {step} of {2}: {step === 1 ? "Review & Decision" : "Risk Assessment"}
              <br />
              <span className="text-muted-foreground text-xs sm:text-sm">
                {step === 1
                  ? "Please review the submitted evidence and provide your decision."
                  : "Please provide a risk assessment score."}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div>
            <div className="flex gap-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all ${index + 1 <= step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            {step === 1 ? (
              <>
                {/* Step 1: Review & Decision */}
                <div className="space-y-4">
                  {/* Reviewer Feedback */}
                  <Textarea
                    id="remarks"
                    label="Reviewer Feedback / Comments"
                    placeholder="Provide feedback on the submitted evidence and action taken..."
                    value={formData.remarks}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        remarks: e.target.value
                      }));
                      if (errors.remarks) {
                        setErrors((prev) => ({
                          ...prev,
                          remarks: undefined
                        }));
                      }
                    }}
                    rows={4}
                    className="resize-none"
                    showLimit={true}
                    maxLength={500}
                    descriptionText="Provide your feedback and comments on the submitted evidence."
                    isInvalid={!!errors.remarks}
                    errorText={errors.remarks}
                    required
                  />
                  {/* Evidence Summary */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Evidence Submitted</p>
                        <p className="mt-1 text-sm whitespace-pre-wrap text-gray-900">
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
                </div>
              </>
            ) : (
              <>
                {/* Step 2: Residual Risk Assessment */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          Residual Risk Assessment
                        </p>
                        <p className="mt-1 text-xs text-amber-800">
                          Based on the submitted evidence, assess the residual risk after this
                          action has been taken. Update the risk matrix and control effectiveness.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Residual Risk Assessment</h3>

                    {/* Risk Matrix Selection */}
                    <SearchSelectField
                      label="Risk Matrix"
                      required
                      placeholder="Select risk matrix"
                      options={riskMatrices}
                      value={formData.risk_matrix_id}
                      onValueChange={handleMatrixChange}
                      isLoading={loadingMatrices}
                      isDisabled={updateRiskMutation.isPending || loadingMatrices}
                      classNames={{ wrapper: "max-w-full" }}
                      isInvalid={!!errors.risk_matrix_id}
                      errorText={errors.risk_matrix_id}
                      descriptionText={
                        selectedMatrix
                          ? `Likelihood: ${selectedMatrix.likelihood_min || 1}-${
                              selectedMatrix.likelihood_max || 5
                            }, Impact: ${selectedMatrix.impact_min || 1}-${selectedMatrix.impact_max || 5}`
                          : "Select a matrix to define risk assessment ranges"
                      }
                    />

                    {/* Likelihood and Impact Sliders */}
                    <div className="grid grid-cols-2 gap-4">
                      <RiskSlider
                        id="residual_likelihood"
                        label="Likelihood"
                        value={formData.residual_likelihood}
                        min={likelihoodRange.min}
                        max={likelihoodRange.max}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, residual_likelihood: value }))
                        }
                        disabled={updateRiskMutation.isPending || !formData.risk_matrix_id}
                        minLabel="Rare"
                        maxLabel="Almost Certain"
                      />
                      <RiskSlider
                        id="residual_impact"
                        label="Impact"
                        value={formData.residual_impact}
                        min={impactRange.min}
                        max={impactRange.max}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, residual_impact: value }))
                        }
                        disabled={updateRiskMutation.isPending || !formData.risk_matrix_id}
                        minLabel="Insignificant"
                        maxLabel="Catastrophic"
                      />
                    </div>

                    {/* Residual Score Display */}
                    <RiskScoreDisplay
                      score={residualScore}
                      likelihood={formData.residual_likelihood}
                      impact={formData.residual_impact}
                      label="Residual"
                    />
                  </div>

                  {/* Existing Controls and Control Effectiveness */}
                  <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Control Assessment</h3>

                    <div className="grid gap-2">
                      <Label htmlFor="existing_controls">Existing Controls</Label>
                      <Textarea
                        id="existing_controls"
                        placeholder="Describe current controls in place (optional)"
                        rows={3}
                        value={formData.existing_controls}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            existing_controls: e.target.value
                          }))
                        }
                        disabled={updateRiskMutation.isPending}
                      />
                    </div>

                    <SearchSelectField
                      label="Control Effectiveness"
                      required
                      placeholder="Select control effectiveness"
                      options={controlsOptions}
                      value={String(formData.control_effectiveness)}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          control_effectiveness: parseInt(val)
                        }))
                      }
                      isLoading={loadingControls}
                      isDisabled={updateRiskMutation.isPending || loadingControls}
                      isInvalid={!!errors.control_effectiveness}
                      errorText={errors.control_effectiveness}
                      classNames={{ wrapper: "max-w-full" }}
                    />
                  </div>

                  {/* Review Summary */}
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
                        <span className="text-gray-600">Residual Score:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {residualScore > 0 ? residualScore : "Not set"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="border-t bg-white">
          <div className="flex w-full items-center justify-between py-4">
            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={submitReviewMutation.isPending || updateRiskMutation.isPending}
                className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => onOpenChange(false)}
                disabled={submitReviewMutation.isPending || updateRiskMutation.isPending}>
                Cancel
              </Button>

              {step === 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  isLoading={submitReviewMutation.isPending}
                  disabled={submitReviewMutation.isPending}
                  className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  isLoading={updateRiskMutation.isPending}
                  disabled={updateRiskMutation.isPending}
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
