"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { assessActionFindings } from "@/app/_actions/risk-module-actions";
import type { ActionFindings, AssessActionFindingsInput } from "@/app/_actions/risk-module-actions";

interface ActionAssessmentFormProps {
  findings: ActionFindings;
  reviewerId: string;
  onAssessmentComplete?: () => void;
}

export function ActionAssessmentForm({
  findings,
  reviewerId,
  onAssessmentComplete
}: ActionAssessmentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    assessment_score: [5],
    reviewer_feedback: "",
    decision: "APPROVE" as "APPROVE" | "REQUEST_CHANGES"
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.reviewer_feedback.trim()) {
      toast.error("Please provide feedback for your assessment");
      return;
    }

    setIsSubmitting(true);
    try {
      const input: AssessActionFindingsInput = {
        reviewer_id: reviewerId,
        assessment_score: formData.assessment_score[0],
        reviewer_feedback: formData.reviewer_feedback,
        decision: formData.decision
      };

      const response = await assessActionFindings(findings.id, input);

      if (response.success) {
        toast.success(
          response.message ||
            `Action assessment completed - ${formData.decision === "APPROVE" ? "Approved" : "Revision requested"}`
        );
        setFormData({
          assessment_score: [5],
          reviewer_feedback: "",
          decision: "APPROVE"
        });
        router.refresh();
        onAssessmentComplete?.();
      } else {
        toast.error(response.message || "Failed to submit assessment");
      }
    } catch (error) {
      toast.error("An error occurred while submitting assessment");
      console.error("Error submitting assessment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 border-blue-200 bg-blue-50/50">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">Assess Action Findings</h3>
      </div>

      {/* Assessment Score */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Effectiveness Score: {formData.assessment_score[0]}/10</Label>
        <Slider
          min={0}
          max={10}
          step={1}
          value={formData.assessment_score}
          onValueChange={(value) => setFormData({ ...formData, assessment_score: value })}
          disabled={isSubmitting}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>Not Effective</span>
          <span>Highly Effective</span>
        </div>
      </div>

      {/* Decision */}
      <div className="space-y-2">
        <Label htmlFor="decision" className="text-sm font-semibold">
          Decision *
        </Label>
        <Select
          value={formData.decision}
          onValueChange={(value) =>
            setFormData({ ...formData, decision: value as "APPROVE" | "REQUEST_CHANGES" })
          }
          disabled={isSubmitting}
        >
          <SelectTrigger id="decision">
            <SelectValue placeholder="Select decision" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="APPROVE">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Approve - Action is effective
              </div>
            </SelectItem>
            <SelectItem value="REQUEST_CHANGES">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                Request Changes - More action needed
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback" className="text-sm font-semibold">
          Assessment Feedback *
        </Label>
        <Textarea
          id="feedback"
          placeholder="Provide detailed feedback on the action taken, effectiveness of controls, and any recommendations for further improvement..."
          value={formData.reviewer_feedback}
          onChange={(e) => setFormData({ ...formData, reviewer_feedback: e.target.value })}
          rows={5}
          className="resize-none"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500">
          {formData.reviewer_feedback.length}/500 characters
        </p>
      </div>

      {/* Decision Summary */}
      {formData.decision && (
        <div
          className={`p-4 rounded-lg border-2 ${
            formData.decision === "APPROVE"
              ? "bg-green-50 border-green-200"
              : "bg-orange-50 border-orange-200"
          }`}
        >
          <p className="text-sm font-semibold mb-1">
            {formData.decision === "APPROVE"
              ? "✓ Action will be APPROVED"
              : "⚠ Action will be flagged for REVISION"}
          </p>
          <p className="text-xs text-gray-700">
            {formData.decision === "APPROVE"
              ? "This action will be marked as completed and contribute to risk mitigation."
              : "The action owner will be notified to provide additional evidence or take further action."}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.reviewer_feedback.trim()}
          className="gap-2 flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Assessment...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Submit Assessment
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
