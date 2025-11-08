"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { submitActionFindings } from "@/app/_actions/risk-module-actions";
import type { Risk, ActionFindingsInput } from "@/app/_actions/risk-module-actions";

interface ActionFindingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk: Risk;
  actionOwnerId: string;
}

export function ActionFindingsDialog({
  open,
  onOpenChange,
  risk,
  actionOwnerId
}: ActionFindingsDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    evidence_notes: "",
    evidence_file_name: ""
  });
  const [fileSelected, setFileSelected] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileSelected(true);
      setFormData((prev) => ({
        ...prev,
        evidence_file_name: file.name
      }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.description.trim()) {
      toast.error("Please provide an action description");
      return;
    }

    setIsSubmitting(true);
    try {
      const input: ActionFindingsInput = {
        risk_id: risk.id,
        action_owner_id: actionOwnerId,
        description: formData.description,
        evidence_notes: formData.evidence_notes || undefined,
        evidence_file_name: fileSelected ? formData.evidence_file_name : undefined
      };

      const response = await submitActionFindings(input);

      if (response.success) {
        toast.success(response.message || "Action findings submitted successfully");
        setFormData({
          description: "",
          evidence_notes: "",
          evidence_file_name: ""
        });
        setFileSelected(false);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to submit action findings");
      }
    } catch (error) {
      toast.error("An error occurred while submitting findings");
      console.error("Error submitting findings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Action Findings
          </DialogTitle>
          <DialogDescription>
            Document the actions taken to mitigate the risk: {risk.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Risk Information - Read Only */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Risk Title</p>
                <p className="text-sm text-gray-900">{risk.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Risk Description</p>
                <p className="text-sm text-gray-900">{risk.description}</p>
              </div>
            </div>
          </div>

          {/* Action Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Action Taken / Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the action(s) taken to mitigate this risk. What was done and when?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Evidence Notes */}
          <div className="space-y-2">
            <Label htmlFor="evidence_notes" className="text-sm font-semibold">
              Evidence / Supporting Notes
            </Label>
            <Textarea
              id="evidence_notes"
              placeholder="Add any supporting notes, references, or additional context about the evidence..."
              value={formData.evidence_notes}
              onChange={(e) => setFormData({ ...formData, evidence_notes: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="evidence_file" className="text-sm font-semibold">
              Attach Evidence (Optional)
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  id="evidence_file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xlsx,.jpg,.png"
                  className="cursor-pointer"
                  disabled={isSubmitting}
                />
              </div>
              {fileSelected && (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-green-50 border border-green-200">
                  <Upload className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    {formData.evidence_file_name}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Accepted formats: PDF, DOC, DOCX, XLSX, JPG, PNG (Max 5MB)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.description.trim()}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Submit Findings
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
