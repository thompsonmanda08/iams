import React, { useState, useEffect } from "react";
import { X, Download, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument } from "./pdf-react/pdf-document";
import { useReportStore } from "../store";
import { MOCK_FINDINGS } from "../constants";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

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

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative h-[90vh] w-[90vw] max-w-7xl rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">PDF Preview</h2>
            <p className="text-sm text-gray-500">{reportTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {pdfUrl && numPages > 0 && (
              <>
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white">
                  <button
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                    className="rounded-l-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="px-2 text-sm text-gray-700">{Math.round(scale * 100)}%</span>
                  <button
                    onClick={zoomIn}
                    disabled={scale >= 2.0}
                    className="rounded-r-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white">
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="rounded-l-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2 text-sm text-gray-700">
                    {pageNumber} / {numPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="rounded-r-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(90vh-73px)] overflow-auto bg-gray-100">
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                <p className="mt-4 text-sm text-gray-600">Generating PDF preview...</p>
                <p className="mt-2 text-xs text-gray-500">This may take a few seconds</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md rounded-lg bg-red-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-red-900">Preview Failed</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={loadPDF}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
                  Try Again
                </button>
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
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
      </div>
    </div>
  );
};
