"use client";

import { Download, FileText, File, Image as ImageIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Execution } from "@/app/_actions/risk-module-actions";
import { StatusBadge } from "@/components/status-badge";

interface ActionEvidenceViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  execution: Execution;
}

// Helper function to get file icon based on file type
const getFileIcon = (fileType?: string | null) => {
  if (!fileType) return <FileText className="h-5 w-5" />;

  const lowerType = fileType.toLowerCase();

  if (lowerType.includes("pdf")) {
    return <FileText className="h-5 w-5 text-red-500" />;
  } else if (
    lowerType.includes("image") ||
    lowerType.includes("png") ||
    lowerType.includes("jpg") ||
    lowerType.includes("jpeg")
  ) {
    return <ImageIcon className="h-5 w-5 text-blue-500" />;
  } else if (
    lowerType.includes("word") ||
    lowerType.includes("document") ||
    lowerType.includes("docx")
  ) {
    return <FileText className="h-5 w-5 text-blue-600" />;
  }

  return <File className="h-5 w-5" />;
};

export function ActionEvidenceViewerDialog({
  open,
  onOpenChange,
  execution
}: ActionEvidenceViewerDialogProps) {
  const hasFile = execution.evidence_file_url;

  const handleDownload = () => {
    if (execution.evidence_file_url) {
      window.open(execution.evidence_file_url, "_blank");
    }
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
            View Evidence
          </DialogTitle>
          <DialogDescription>Review the evidence submitted for this action</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Submission Status */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Submission Status</p>
                <StatusBadge status={execution.status} />
              </div>
              {execution.submitted_at && (
                <div>
                  <p className="text-xs text-gray-600">Submitted on</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(execution.submitted_at), "MMM dd, yyyy h:mm a")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Description */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Action Taken / Description</p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm whitespace-pre-wrap text-gray-900">
                {execution.evidence_description}
              </p>
            </div>
          </div>

          {/* Evidence File */}
          {hasFile && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Evidence File</p>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(execution.evidence_file_type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {execution.evidence_file_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {execution.evidence_file_type || "File"}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!hasFile && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-center text-sm text-gray-600">
                No file attached to this submission
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <Button type="button" variant="destructive" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
