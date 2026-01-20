"use client";

import React, { useState, useEffect } from "react";
import { Download, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument } from "./pdf-react/pdf-document";
import { useReportStore } from "@/store/report-store";
import { MOCK_FINDINGS } from "@/components/reports/report-mock-constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Loader from "../ui/loader";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  reportTitle
}) => {
  const { report } = useReportStore();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  useEffect(() => {
    if (isOpen && !pdfUrl && report) {
      loadPDF();
    }

    // Cleanup
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, report]);

  const loadPDF = async () => {
    if (!report) {
      setError("No report data available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Generating PDF with report:", report.title);
      console.log("Findings count:", MOCK_FINDINGS.length);

      // Generate PDF directly on client side
      const blob = await pdf(<PDFDocument report={report} findings={MOCK_FINDINGS} />).toBlob();

      console.log("PDF blob generated, size:", blob.size);

      if (blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      // Create blob URL for react-pdf
      const url = URL.createObjectURL(blob);
      console.log("PDF URL created:", url);
      setPdfUrl(url);
    } catch (err) {
      console.error("PDF preview error:", err);
      setError(err instanceof Error ? err.message : "Failed to load PDF preview");
    } finally {
      setIsLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    console.log(`PDF loaded successfully with ${numPages} pages`);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setError(`Failed to load PDF: ${error.message}`);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${reportTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[90vh] max-h-[90vh] max-w-7xl! gap-0 p-0" hideCloseButton>
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between border-b px-6 py-4">
          <div>
            <DialogTitle className="text-xl">PDF Preview</DialogTitle>
            <DialogDescription>{reportTitle}</DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            {pdfUrl && numPages > 0 && (
              <>
                {/* Zoom Controls */}
                <div className="bg-background flex items-center gap-1 rounded-lg border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                    className="h-8 w-8 rounded-r-none">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-muted-foreground px-2 text-sm">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={zoomIn}
                    disabled={scale >= 2.0}
                    className="h-8 w-8 rounded-l-none">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1 rounded-lg border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="h-8 w-8 rounded-r-none">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-muted-foreground px-2 text-sm">
                    {pageNumber} / {numPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="h-8 w-8 rounded-l-none">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Download Button */}
                <Button onClick={downloadPDF} size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="bg-muted h-[calc(90vh-73px)] overflow-auto">
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="flex h-96 items-center justify-center">
                <Loader loadingText="Loading report..." classNames={{ spinner: "w-16 h-16" }} />
              </div>
            </div>
          )}

          {error && (
            <div className="flex h-full items-center justify-center">
              <div className="bg-destructive/10 max-w-md rounded-lg p-6 text-center">
                <div className="bg-destructive/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <X className="text-destructive h-6 w-6" />
                </div>
                <h3 className="text-destructive mb-2 text-lg font-semibold">Preview Failed</h3>
                <p className="text-destructive/80 text-sm">{error}</p>
                <Button onClick={loadPDF} variant="destructive" size="sm" className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {pdfUrl && !isLoading && !error && (
            <div className="flex justify-center p-4">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex h-96 items-center justify-center">
                    <Loader loadingText="Loading report..." classNames={{ spinner: "w-16 h-16" }} />
                  </div>
                }>
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                />
              </Document>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
