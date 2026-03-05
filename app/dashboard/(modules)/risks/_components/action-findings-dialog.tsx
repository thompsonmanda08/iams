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
import { submitActionFindings } from "@/app/_actions/risk-module-actions";
import type { Risk, ActionFindingsInput } from "@/app/_actions/risk-module-actions";
import { notify } from "@/lib/utils";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { QUERY_KEYS } from "@/lib/constants";
import { usePermissions } from "@/hooks/use-permissions";

interface ActionFindingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionId: string;
  taskId: string;
  actionTitle?: string;
  riskTitle?: string;
}

export function ActionFindingsDialog({
  open,
  onOpenChange,
  actionId,
  taskId,
  actionTitle,
  riskTitle
}: ActionFindingsDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { checkPermission } = usePermissions();
  const uploadFieldRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    evidence_description: "",
    evidence_file_url: null as string | null,
    evidence_file_name: null as string | null,
    evidence_file_type: null as string | null
  });

  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(file: File) {
    setUploading(true);

    if (!file?.name?.trim() || !file?.type || !file?.size) {
      notify({
        type: "error",
        description: "Please select a valid file type to upload."
      });
      setUploading(false);
      return;
    }

    try {
      const response = await uploadFile(file);

      if (response?.success) {
        notify({
          type: "success",
          description: "File uploaded successfully!"
        });
        setFormData((prev) => ({
          ...prev,
          evidence_file_url: response?.data?.file_url || null,
          evidence_file_name: response?.data?.file_name || file.name,
          evidence_file_type: file.type
        }));
      } else {
        notify({
          type: "error",
          description: response?.message || "Failed to upload file."
        });
      }
    } catch (error) {
      notify({
        type: "error",
        description: "An error occurred while uploading the file."
      });
    } finally {
      setUploading(false);
    }
  }

  // Mutation for submitting action findings
  const submitFindingsMutation = useMutation({
    mutationFn: submitActionFindings,
    onSuccess: (response) => {
      if (response.success) {
        notify({ description: "Action findings submitted successfully", type: "success" });
        setFormData({
          evidence_description: "",
          evidence_file_url: null,
          evidence_file_name: null,
          evidence_file_type: null
        });
        uploadFieldRef.current?.clear();
        onOpenChange(false);
        router.refresh();

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIONS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTION_LOGS] });
      } else {
        notify({ description: response.message || "Failed to submit action findings", type: "error" });
      }
    },
    onError: (error) => {
      notify({ description: "An error occurred while submitting findings", type: "error" });
      notify({ description: error.message || "Failed to submit action findings", type: "error" });
      console.error("Error submitting findings:", error);
    }
  });

  const handleSubmit = async () => {
    if (!checkPermission("RISK_ACTIONS", "can_create")) return;

    // Validation
    if (!formData.evidence_description.trim()) {
      notify({ description: "Please provide evidence description", type: "error" });
      return;
    }

    // Submit action findings with proper API structure
    const input: ActionFindingsInput = {
      action_id: actionId,
      task_id: taskId,
      ...formData
    };

    submitFindingsMutation.mutate(input);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Action Findings
          </DialogTitle>
          <DialogDescription>Document the actions taken to mitigate the risk</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pb-4">
          {/* Action Information - Read Only */}
          {(actionTitle || riskTitle) && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="space-y-2">
                {riskTitle && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Risk: <span className="text-xs font-normal text-gray-900">{riskTitle}</span>
                    </p>
                  </div>
                )}
                {actionTitle && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Action:{" "}
                      <span className="text-xs font-normal text-gray-900">{actionTitle}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evidence Description */}
          <Textarea
            id="evidence_description"
            label="Evidence Description"
            placeholder="Describe the evidence and how the action was completed..."
            value={formData.evidence_description}
            onChange={(e) => setFormData({ ...formData, evidence_description: e.target.value })}
            rows={5}
            className="resize-none"
            showLimit={true}
            maxLength={500}
            descriptionText="Provide detailed description of the evidence and mitigation actions taken."
          />

          {/* File Upload using UploadField */}
          <UploadField
            label="Attach Evidence (Optional)"
            isLoading={uploading}
            required={false}
            handleFile={async (file) => {
              if (file) {
                await handleFileUpload(file as File);
              } else {
                // Clear the file when X is clicked
                setFormData((prev) => ({
                  ...prev,
                  evidence_file_url: null,
                  evidence_file_name: null,
                  evidence_file_type: null
                }));
              }
            }}
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
            disabled={submitFindingsMutation.isPending || !formData.evidence_description.trim()}
            className="gap-2">
            <Upload className="h-4 w-4" />
            Submit Findings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
