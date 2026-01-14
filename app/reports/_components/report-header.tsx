import React from "react";
import { Save, Download } from "lucide-react";
import { useReportStore } from "../store";

export const ReportHeader = () => {
  const { report } = useReportStore();

  if (!report) return null;

  const exportReport = () => {
    console.log("Exporting report:", JSON.stringify(report, null, 2));
    alert("Report export functionality - see console for JSON output");
  };

  const saveReport = () => {
    console.log("Saving report:", JSON.stringify(report, null, 2));
    alert("Report saved! See console for JSON output.");
  };

  return (
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
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
