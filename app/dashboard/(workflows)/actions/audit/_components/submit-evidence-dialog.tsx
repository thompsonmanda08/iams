"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Loader2, Upload, X, FileText, File as FileIcon } from "lucide-react";
import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";
import { useCreateFindingActionEvidenceMutation } from "@/hooks/use-finding-actions-queries";

interface SubmitEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionId: string;
}

export function SubmitEvidenceDialog({
  open,
  onOpenChange,
  actionId
}: SubmitEvidenceDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createEvidenceMutation = useCreateFindingActionEvidenceMutation();

  // File upload hook - single file mode
  const [fileState, fileActions] = useFileUpload({
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: ".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.gif,.zip,.txt,.csv",
    onFilesAdded: () => {
      // Clear file error when new file is added
      if (errors.file) {
        const newErrors = { ...errors };
        delete newErrors.file;
        setErrors(newErrors);
      }
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (fileState.files.length === 0) {
      newErrors.file = "Please upload a file";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const uploadedFile = fileState.files[0];
    if (!uploadedFile || !(uploadedFile.file instanceof File)) {
      setErrors({ file: "Invalid file selected" });
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("finding_action_id", actionId);
    formData.append("title", title);
    if (description.trim()) {
      formData.append("description", description);
    }
    formData.append("file", uploadedFile.file);

    createEvidenceMutation.mutate(formData as any, {
      onSuccess: () => {
        // Reset form
        setTitle("");
        setDescription("");
        setErrors({});
        fileActions.clearFiles();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Evidence</DialogTitle>
          <DialogDescription>
            Upload supporting documents to demonstrate progress on this action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="evidence_title">
              Title <span className="text-red-500">*</span>
            </Label>
            <input
              id="evidence_title"
              type="text"
              placeholder="e.g., Policy Document, Test Results..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                errors.title ? "border-red-500" : "border-input"
              }`}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="evidence_description">Description</Label>
            <Textarea
              id="evidence_description"
              placeholder="Describe the evidence or findings..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>
              Evidence File <span className="text-red-500">*</span>
            </Label>
            <Card
              className={`border-2 border-dashed p-4 transition-colors cursor-pointer ${
                fileState.isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-300 hover:border-slate-400"
              } ${errors.file ? "border-red-500" : ""}`}
              onDragEnter={fileActions.handleDragEnter}
              onDragLeave={fileActions.handleDragLeave}
              onDragOver={fileActions.handleDragOver}
              onDrop={fileActions.handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <Upload className="h-6 w-6 text-slate-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Drag and drop file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOCX, XLSX, PNG, JPG, ZIP (max 10MB)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fileActions.openFileDialog}
                >
                  Browse Files
                </Button>
                <input {...fileActions.getInputProps()} className="hidden" />
              </div>
            </Card>

            {/* File errors */}
            {fileState.errors.length > 0 && (
              <div className="rounded-lg bg-destructive/10 p-3">
                {fileState.errors.map((error, idx) => (
                  <p key={idx} className="text-sm text-destructive">
                    {error}
                  </p>
                ))}
              </div>
            )}

            {/* Uploaded file display */}
            {fileState.files.length > 0 && (
              <Card className="bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <FileIcon className="h-4 w-4 shrink-0 text-slate-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileState.files[0].file instanceof File
                        ? fileState.files[0].file.name
                        : fileState.files[0].file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fileState.files[0].file instanceof File
                        ? formatBytes(fileState.files[0].file.size)
                        : formatBytes(fileState.files[0].file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={() => fileActions.removeFile(fileState.files[0].id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}

            {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createEvidenceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createEvidenceMutation.isPending}
            >
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
