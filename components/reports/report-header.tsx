import React, { useState } from "react";
import { Save, Download, FileText, Eye } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useReportStore } from "@/store/report-store";
import { PDFPreviewModal } from "./pdf-preview-modal";
import { PDFDocument } from "./pdf-react/pdf-document";
import { MOCK_FINDINGS } from "@/components/reports/report-mock-constants";

export const ReportHeader = () => {
  const { report } = useReportStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!report) return null;

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      console.log("Exporting PDF for report:", report.title);
      console.log("Report data:", report);
      console.log("Findings count:", MOCK_FINDINGS.length);

      // Generate PDF directly on client side
      const blob = await pdf(<PDFDocument report={report} findings={MOCK_FINDINGS} />).toBlob();

      console.log("PDF blob generated, size:", blob.size);

      if (blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("PDF download initiated successfully");
    } catch (error) {
      console.error("Export error:", error);
      setExportError(error instanceof Error ? error.message : "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportReport = () => {
    console.log("Exporting report:", JSON.stringify(report, null, 2));
    alert("Report JSON export - see console for output");
  };

  const saveReport = () => {
    console.log("Saving report:", JSON.stringify(report, null, 2));
    alert("Report saved! See console for JSON output.");
  };

  return (
    <>
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Report Builder</h1>
              <p className="mt-1 text-sm text-gray-500">
                {report.title} • Version {report.version}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveReport}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50">
                <Download className="h-4 w-4" />
                Export JSON
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-100">
                <Eye className="h-4 w-4" />
                Preview PDF
              </button>
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                <FileText className="h-4 w-4" />
                {isExporting ? "Generating PDF..." : "Export PDF"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {exportError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-800">
                <strong>Export Error:</strong> {exportError}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        reportId={report.report_id}
        reportTitle={report.title}
      />
    </>
  );
};
