import React from "react";
import { Plus } from "lucide-react";
import { useReportStore } from "../store";
import { TableOfContents } from "./table-of-contents";
import { AddSectionButton } from "./add-section-button";

export const ReportSidebar = () => {
  const { report, setAddSectionModalOpen, changeManagementStandard } = useReportStore();

  if (!report) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="col-span-12 space-y-4 lg:col-span-3">
      <TableOfContents sections={report.sections} onItemClick={scrollToSection} />

      {/* Report Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Report Details</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="block text-xs text-gray-400 uppercase">Type</span>
            <select
              className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none"
              value={
                report.report_type === "compliance_audit"
                  ? "ISO 27001"
                  : report.report_type === "risk"
                    ? "Risk Assessment"
                    : report.report_type === "followup"
                      ? "Follow-up"
                      : "General"
              }
              onChange={(e) => {
                if (
                  window.confirm(
                    "Changing the report type will reset the sections to the default template. Continue?"
                  )
                ) {
                  changeManagementStandard(e.target.value);
                }
              }}>
              <option value="General">General Internal Audit</option>
              <option value="ISO 27001">ISO 27001 Compliance</option>
              <option value="Risk Assessment">Risk Assessment</option>
              <option value="Follow-up">Audit Follow-up</option>
            </select>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>
            <p className="font-medium text-gray-900">{report.created_at}</p>
          </div>
          <div>
            <span className="text-gray-500">Sections:</span>
            <p className="font-medium text-gray-900">{report.sections.length}</p>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <p className="font-medium text-blue-600">Draft</p>
          </div>
        </div>
      </div>

      {/* Section Type Legend */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Section Types</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-green-300 bg-green-50" />
            <span className="text-gray-600">Text Content</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-blue-300 bg-blue-50" />
            <span className="text-gray-600">Text + Widgets</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-amber-300 bg-amber-50" />
            <span className="text-gray-600">Findings Selector</span>
          </div>
        </div>
      </div>

      {/* Add Section Button moved to Sidebar */}
      <AddSectionButton variant="sidebar" />
    </div>
  );
};
