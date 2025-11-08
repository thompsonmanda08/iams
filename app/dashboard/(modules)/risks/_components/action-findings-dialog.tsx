"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import UploadField, { ACCEPTABLE_FILE_TYPES } from "@/components/ui/file-dropzone";
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
  const queryClient = useQueryClient();
  const uploadFieldRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    description: "",
    evidence_notes: ""
  });
  const [evidenceFile, setEvidenceFile] = useState<File | undefined>(undefined);

  const handleFileChange = (file: File | undefined) => {
    setEvidenceFile(file);
  };

  // Mutation for submitting action findings
  const submitFindingsMutation = useMutation({
    mutationFn: submitActionFindings,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Action findings submitted successfully");
        setFormData({
          description: "",
          evidence_notes: ""
        });
        setEvidenceFile(undefined);
        uploadFieldRef.current?.clear();
        onOpenChange(false);
        router.refresh();

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["risks"] });
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      } else {
        toast.error(response.message || "Failed to submit action findings");
      }
    },
    onError: (error) => {
      toast.error("An error occurred while submitting findings");
      console.error("Error submitting findings:", error);
    }
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.description.trim()) {
      toast.error("Please provide an action description");
      return;
    }

    const input: ActionFindingsInput = {
      risk_id: risk.id,
      action_owner_id: actionOwnerId,
      description: formData.description,
      evidence_notes: formData.evidence_notes || undefined,
      evidence_file_name: evidenceFile ? evidenceFile.name : undefined
    };

    submitFindingsMutation.mutate(input);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Action Findings
          </DialogTitle>
          <DialogDescription>Document the actions taken to mitigate the risk</DialogDescription>
        </DialogHeader>

        <div className="py- space-y-4 pb-4">
          {/* Risk Information - Read Only */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-semibold text-gray-700">Risk Title</p>
                <p className="text-xs text-gray-900">{risk.title}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Risk Description</p>
                <p className="text-xs text-gray-900">{risk.description}</p>
              </div>
            </div>
          </div>

          {/* Action Description */}
          <Textarea
            id="description"
            label="  Action Taken / Description"
            placeholder="What was done and when?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="resize-none"
            showLimit={true}
            maxLength={500}
            descriptionText="Describe the action(s) taken to mitigate this risk."
          />

          {/* Evidence Notes */}
          <Textarea
            id="evidence_notes"
            label="Evidence / Supporting Notes"
            placeholder="References, or additional context about the evidence..."
            value={formData.evidence_notes}
            onChange={(e) => setFormData({ ...formData, evidence_notes: e.target.value })}
            rows={3}
            showLimit={true}
            maxLength={500}
            descriptionText="Any supporting notes or references related to the evidence."
            className="resize-none"
          />

          {/* File Upload using UploadField */}
          <UploadField
            label="Attach Evidence (Optional)"
            isLoading={submitFindingsMutation.isPending}
            required={false}
            handleFile={handleFileChange}
            acceptedFiles={{
              ...ACCEPTABLE_FILE_TYPES.pdf,
              ...ACCEPTABLE_FILE_TYPES.word,
              ...ACCEPTABLE_FILE_TYPES.images
            }}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onOpenChange(false)}
            disabled={submitFindingsMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            isLoading={submitFindingsMutation.isPending}
            disabled={submitFindingsMutation.isPending || !formData.description.trim()}
            className="gap-2">
            <Upload className="h-4 w-4" />
            Submit Findings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
