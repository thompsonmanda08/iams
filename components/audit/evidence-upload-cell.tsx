"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileText, X, ExternalLink } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { notify } from "@/lib/utils";

interface EvidenceUploadCellProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

/** Compact file upload with preview — reusable across grids and dialogs */
export function EvidenceUploadCell({ value, onChange, disabled }: EvidenceUploadCellProps) {
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadFile(file);
      if (response?.success) {
        onChange(response.data?.file_url || "");
        notify({ type: "success", description: "File uploaded successfully" });
      } else {
        notify({ type: "error", description: response?.message || "Upload failed" });
      }
    } catch {
      notify({ type: "error", description: "An error occurred while uploading" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function getFileName(url: string) {
    try {
      const parts = url.split("/");
      return decodeURIComponent(parts[parts.length - 1]) || "file";
    } catch {
      return "file";
    }
  }

  function isImage(url: string) {
    return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url);
  }

  if (uploading) {
    return <Spinner className="text-primary size-4" />;
  }

  if (value) {
    const fileName = getFileName(value);
    return (
      <>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex max-w-30 items-center gap-1 truncate text-xs text-blue-600 hover:underline">
            <FileText className="h-3 w-3 shrink-0" />
            {fileName}
          </button>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
            title="Open in new tab">
            <ExternalLink className="h-3 w-3" />
          </a>
          {!disabled && (
            <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => onChange("")}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="flex h-[90vh] w-[92vw] max-w-5xl! flex-col gap-0 overflow-hidden p-0">
            <DialogHeader className="shrink-0 flex-row items-center justify-between border-b px-4 py-3">
              <DialogTitle className="max-w-[80%] truncate text-sm font-medium">
                {fileName}
              </DialogTitle>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground mr-6"
                title="Open in new tab">
                <ExternalLink className="h-4 w-4" />
              </a>
            </DialogHeader>
            <div className="min-h-0 flex-1">
              {isImage(value) ? (
                <div className="bg-muted/30 flex h-full items-center justify-center overflow-auto p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt={fileName}
                    className="max-h-full max-w-full rounded object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <object data={value} type="application/pdf" className="h-full w-full">
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                    <FileText className="text-muted-foreground h-12 w-12" />
                    <p className="text-muted-foreground text-sm">
                      Preview is not available for this file.
                    </p>
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <ExternalLink className="h-4 w-4" />
                      Open file directly
                    </a>
                  </div>
                </object>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <Button
        size="sm"
        variant="ghost"
        className="h-7 gap-1 text-xs"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}>
        <Upload className="h-3 w-3" />
        Upload
      </Button>
    </>
  );
}
