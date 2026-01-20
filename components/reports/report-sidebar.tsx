import { useReportStore } from "@/store/report-store";
import { TableOfContents } from "./table-of-contents";
import { AddSectionButton } from "./add-section-button";
import { SelectField } from "@/components/ui/select-field";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { useState } from "react";

export const ReportSidebar = () => {
  const { report, setAddSectionModalOpen, changeManagementStandard } = useReportStore();
  const [pendingReportType, setPendingReportType] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (!report) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleConfirmChangeReportType = () => {
    if (!pendingReportType) return;
    changeManagementStandard(pendingReportType);
    setPendingReportType(null);
    setConfirmDialogOpen(false);
  };

  const handleCancelChangeReportType = () => {
    setPendingReportType(null);
    setConfirmDialogOpen(false);
  };

  const getReportTypeValue = () => {
    switch (report.report_type) {
      case "compliance_audit":
        return "ISO 27001";
      case "risk":
        return "RISK ASSESSMENT";
      case "followup":
        return "FOLLOW-UP";
      case "general_audit":
      default:
        return "GENERAL";
    }
  };

  const reportTypeOptions = [
    { value: "GENERAL", label: "General Internal Audit" },
    { value: "ISO 27001", label: "ISO 27001 Compliance" },
    { value: "RISK ASSESSMENT", label: "Risk Assessment" },
    { value: "FOLLOW-UP", label: "Audit Follow-up" }
  ];

  return (
    <div className="col-span-12 space-y-4 lg:col-span-3">
      <TableOfContents sections={report.sections} onItemClick={scrollToSection} />

      {/* Report Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Report Details</h3>
        <div className="space-y-3 text-sm">
          <SelectField
            label="Type"
            value={getReportTypeValue()}
            placeholder="Select report type..."
            onValueChange={(value) => {
              if (value === getReportTypeValue()) return;
              setPendingReportType(value);
              setConfirmDialogOpen(true);
            }}
            options={reportTypeOptions as any}
            className="min-w-full"
          />
          <div>
            <span className="text-gray-500">Created:</span>
            <p className="font-medium text-gray-900">{report.created_at}</p>
          </div>
          <div>
            <span className="text-gray-500">Sections:</span>
            <p className="font-medium text-gray-900">{report.sections.length}</p>
          </div>
          <div>
            <span className="text-gray-500">Version:</span>
            <p className="font-medium text-gray-900">{report.version || "1.0"}</p>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <p className="font-medium text-blue-600">{report.status || "Draft"}</p>
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

      <ConfirmationModal
        open={confirmDialogOpen}
        title="Change Report Type"
        description="Changing the report type will reset the sections to the default template. Continue?"
        onOpenChange={(open) => {
          if (!open) handleCancelChangeReportType();
        }}
        onConfirm={handleConfirmChangeReportType}
        type="close"
      />
    </div>
  );
};
