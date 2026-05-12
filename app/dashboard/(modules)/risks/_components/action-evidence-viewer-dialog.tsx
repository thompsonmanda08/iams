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
import { formatDateTime } from "@/lib/utils/date-format";
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
          <div className="border-border bg-muted/50 rounded-lg border-l-4 border-l-blue-500 p-4 dark:border-l-blue-400">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-foreground text-sm font-semibold">Submission Status</p>
                <StatusBadge status={execution.status} />
              </div>
              {execution.submitted_at && (
                <div>
                  <p className="text-muted-foreground text-xs">Submitted on</p>
                  <p className="text-foreground text-sm font-medium">
                    {formatDateTime(execution.submitted_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Description */}
          <div className="space-y-2">
            <p className="text-foreground text-sm font-semibold">Action Taken / Description</p>
            <div className="border-border bg-muted/40 rounded-lg border p-4">
              <p className="text-foreground text-sm whitespace-pre-wrap">
                {execution.evidence_description}
              </p>
            </div>
          </div>

          {/* Evidence File */}
          {hasFile && (
            <div className="space-y-2">
              <p className="text-foreground text-sm font-semibold">Evidence File</p>
              <div className="border-border rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(execution.evidence_file_type)}
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {execution.evidence_file_name}
                      </p>
                      <p className="text-muted-foreground text-xs">
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
            <div className="border-border bg-muted/40 rounded-lg border p-4">
              <p className="text-muted-foreground text-center text-sm">
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
