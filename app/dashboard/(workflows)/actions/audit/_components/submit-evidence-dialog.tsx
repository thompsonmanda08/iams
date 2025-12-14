"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import UploadField, { ACCEPTABLE_FILE_TYPES } from "@/components/ui/file-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Loader2, Link2 } from "lucide-react";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { useCreateFindingActionEvidenceMutation } from "@/hooks/use-finding-actions-queries";
import { Input } from "@/components/ui/input";

interface SubmitEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionId: string;
}

type EvidenceSubmissionType = "file" | "link";

interface EvidencePayload {
  finding_action_id: string;
  title: string;
  description: string;
  evidence_summary: string;
  file_link: string;
}

export function SubmitEvidenceDialog({ open, onOpenChange, actionId }: SubmitEvidenceDialogProps) {
  const [submissionType, setSubmissionType] = useState<EvidenceSubmissionType>("file");
  const [uploadedFile, setUploadedFile] = useState<{ file: File; url: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payload, setPayload] = useState<EvidencePayload>({
    finding_action_id: actionId,
    title: "",
    description: "",
    evidence_summary: "",
    file_link: ""
  });

  const createEvidenceMutation = useCreateFindingActionEvidenceMutation();

  const updatePayload = (field: keyof EvidencePayload, value: string) => {
    setPayload((prev) => {
      const updated = { ...prev, [field]: value };
      // Keep evidence_summary in sync with description
      if (field === "description") {
        updated.evidence_summary = value || updated.title;
      }
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!payload.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (submissionType === "file") {
      if (!uploadedFile) {
        newErrors.file = "Please upload a file";
      }
    } else {
      if (!payload.file_link.trim()) {
        newErrors.fileLink = "Please provide a link";
      } else {
        // Basic URL validation
        try {
          new URL(payload.file_link);
        } catch {
          newErrors.fileLink = "Please provide a valid URL";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (file) {
      try {
        setUploading(true);
        // Upload file to PocketBase
        const response = await uploadFile(file);

        if (response.success && response.data?.file_url) {
          setUploadedFile({ file, url: response.data.file_url });
          updatePayload("file_link", response.data.file_url);

          // Clear file error when file is added
          const newErrors = { ...errors };
          delete newErrors.file;
          setErrors(newErrors);
        } else {
          throw new Error(response.message || "Failed to upload file");
        }
      } catch (error) {
        console.error("File upload failed:", error);
        setErrors({
          file: "Failed to upload file. Please try again."
        });
      } finally {
        setUploading(false);
      }
    } else {
      setUploadedFile(null);
      updatePayload("file_link", "");
    }
  };

  const resetForm = () => {
    setPayload({
      finding_action_id: actionId,
      title: "",
      description: "",
      evidence_summary: "",
      file_link: ""
    });
    setUploadedFile(null);
    setSubmissionType("file");
    setErrors({});
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Ensure evidence_summary is set
    const finalPayload = {
      ...payload,
      evidence_summary: payload.description.trim() || payload.title
    };

    createEvidenceMutation.mutate(finalPayload, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      }
    });
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Submit Evidence</DialogTitle>
          <DialogDescription>
            Upload supporting documents or provide a link to demonstrate progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <Input
            id="evidence_title"
            type="text"
            label="Title"
            required
            placeholder="e.g., Policy Document, Test Results..."
            value={payload.title}
            onChange={(e) => updatePayload("title", e.target.value)}
            className={`w-full rounded-md border px-3 py-2 text-sm ${
              errors.title ? "border-red-500" : "border-input"
            }`}
            isInvalid={!!errors.title}
            errorText={errors.title}
          />

          {/* Description */}
          <Textarea
            id="evidence_description"
            label="Description"
            placeholder="Describe the evidence or findings..."
            value={payload.description}
            onChange={(e) => updatePayload("description", e.target.value)}
            rows={3}
          />

          {/* Submission Type Selector */}
          <div className="space-y-2">
            <Label>
              Evidence Type <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={submissionType === "file" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSubmissionType("file");
                  const newErrors = { ...errors };
                  delete newErrors.fileLink;
                  delete newErrors.file;
                  setErrors(newErrors);
                }}
                className="gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Upload File
              </Button>
              <Button
                type="button"
                variant={submissionType === "link" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSubmissionType("link");
                  const newErrors = { ...errors };
                  delete newErrors.file;
                  delete newErrors.fileLink;
                  setErrors(newErrors);
                }}
                className="gap-2">
                <Link2 className="h-4 w-4" />
                Provide Link
              </Button>
            </div>
          </div>

          {/* File Upload Option */}
          {submissionType === "file" && (
            <div className="space-y-2">
              {!uploadedFile ? (
                <UploadField
                  label="Evidence File"
                  isLoading={uploading}
                  required
                  handleFile={handleFileUpload}
                  acceptedFiles={{
                    ...ACCEPTABLE_FILE_TYPES.pdf,
                    ...ACCEPTABLE_FILE_TYPES.word,
                    ...ACCEPTABLE_FILE_TYPES.images,
                    ...ACCEPTABLE_FILE_TYPES.excel
                  }}
                />
              ) : (
                <div className="space-y-2">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center gap-3">
                      <svg
                        className="h-5 w-5 shrink-0 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-green-900">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-green-700">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileUpload(undefined)}
                        disabled={uploading}
                        className="shrink-0 text-green-600 hover:text-green-700 disabled:opacity-50">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileUpload(undefined)}
                    disabled={uploading}
                    className="w-full">
                    Change File
                  </Button>
                </div>
              )}

              {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
            </div>
          )}

          {/* Link Option */}
          {submissionType === "link" && (
            <div className="space-y-2">
              <Label htmlFor="evidence_link">
                Evidence Link <span className="text-red-500">*</span>
              </Label>
              <input
                id="evidence_link"
                type="url"
                placeholder="e.g., https://example.com/evidence or https://drive.google.com/file/..."
                value={payload.file_link}
                onChange={(e) => updatePayload("file_link", e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm ${
                  errors.fileLink ? "border-red-500" : "border-input"
                }`}
              />
              {errors.fileLink && <p className="text-sm text-red-500">{errors.fileLink}</p>}
              <p className="text-muted-foreground text-xs">
                Provide a URL to an external document, Google Drive file, or other resource
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createEvidenceMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createEvidenceMutation.isPending}>
              {createEvidenceMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Evidence
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
