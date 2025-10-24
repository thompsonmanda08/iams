"use client";

import { useCallback } from "react";
import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, FileText, Image as ImageIcon, File } from "lucide-react";
import type { EvidenceInput, EvidenceType } from "@/lib/types/audit-types";

interface EvidenceUploadProps {
  evidence: EvidenceInput[];
  onEvidenceChange: (evidence: EvidenceInput[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

const EVIDENCE_TYPES: EvidenceType[] = ["Policy", "Screenshot", "Minutes", "Report", "Other"];

const ACCEPTED_FILE_TYPES = ".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.zip";

export function EvidenceUpload({
  evidence,
  onEvidenceChange,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
}: EvidenceUploadProps) {
  // File upload hook
  const [fileState, fileActions] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    accept: ACCEPTED_FILE_TYPES,
    onFilesAdded: (addedFiles) => {
      // Convert uploaded files to EvidenceInput
      const newEvidence: EvidenceInput[] = addedFiles.map((fileWithPreview) => {
        const file = fileWithPreview.file as File;
        return {
          id: fileWithPreview.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          evidenceType: "Other", // Default type
          file,
        };
      });
      onEvidenceChange([...evidence, ...newEvidence]);
    },
  });

  // Update evidence type
  const updateEvidenceType = useCallback(
    (id: string, evidenceType: EvidenceType) => {
      const updated = evidence.map((ev) =>
        ev.id === id ? { ...ev, evidenceType } : ev
      );
      onEvidenceChange(updated);
    },
    [evidence, onEvidenceChange]
  );

  // Remove evidence
  const removeEvidence = useCallback(
    (id: string) => {
      const filtered = evidence.filter((ev) => ev.id !== id);
      onEvidenceChange(filtered);
      fileActions.removeFile(id);
    },
    [evidence, onEvidenceChange, fileActions]
  );

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    }
    if (fileType.includes("pdf")) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Evidence Upload</Label>
        <p className="text-sm text-muted-foreground">
          Upload supporting documents (PDF, DOCX, XLSX, PNG, JPG, ZIP)
        </p>
      </div>

      {/* Drop zone */}
      <Card
        className={`border-2 border-dashed p-6 transition-colors ${
          fileState.isDragging
            ? "border-primary bg-primary/5"
            : "border-slate-300 hover:border-slate-400"
        }`}
        onDragEnter={fileActions.handleDragEnter}
        onDragLeave={fileActions.handleDragLeave}
        onDragOver={fileActions.handleDragOver}
        onDrop={fileActions.handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="rounded-full bg-slate-100 p-3">
            <Upload className="h-6 w-6 text-slate-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum {maxFiles} files, up to {formatBytes(maxSize)} each
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

      {/* Error messages */}
      {fileState.errors.length > 0 && (
        <div className="rounded-lg bg-destructive/10 p-3">
          {fileState.errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Evidence list */}
      {evidence.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Uploaded Evidence ({evidence.length})
          </Label>
          <div className="space-y-2">
            {evidence.map((ev) => (
              <Card key={ev.id} className="p-3">
                <div className="flex items-center gap-3">
                  {/* File icon */}
                  <div className="flex-shrink-0 text-slate-600">
                    {getFileIcon(ev.fileType)}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ev.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(ev.fileSize)}
                    </p>
                  </div>

                  {/* Evidence type selector */}
                  <div className="flex-shrink-0 w-32">
                    <Select
                      value={ev.evidenceType}
                      onValueChange={(value) =>
                        updateEvidenceType(ev.id, value as EvidenceType)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVIDENCE_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="text-xs">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0"
                    onClick={() => removeEvidence(ev.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
