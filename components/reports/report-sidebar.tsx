import { useMemo, useState } from "react";
import { Check, GitBranch } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useReportStore } from "@/store/report-store";
import { TableOfContents } from "./table-of-contents";
import { AddSectionButton } from "./add-section-button";
import { SelectField } from "@/components/ui/select-field";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { useSetActiveVersion } from "@/hooks/use-report-queries";
import { ensureVersionedShape } from "@/lib/config/ensure-versioned-shape";

interface ReportSidebarProps {
  reportId: string;
}

export const ReportSidebar = ({ reportId }: ReportSidebarProps) => {
  const { report, setAddSectionModalOpen, changeManagementStandard } = useReportStore();
  const [pendingReportType, setPendingReportType] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<number | null>(null);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const setActiveVersionMutation = useSetActiveVersion(reportId);

  const versions = useMemo(() => {
    if (!report) return [];
    const normalized = ensureVersionedShape(report);
    return [...(normalized.versions ?? [])].sort((a, b) => b.version_number - a.version_number);
  }, [report]);

  const activeVersionNumber = report?.current_version_number;

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
            <span className="text-gray-500">Generated Date:</span>
            <p className="font-medium text-gray-900">{report.created_at || "—"}</p>
          </div>
          <div>
            <span className="text-gray-500">Last Modified:</span>
            <p className="font-medium text-gray-900">{report.updated_at || "—"}</p>
          </div>
          <div>
            <span className="text-gray-500">Sections:</span>
            <p className="font-medium text-gray-900">{report.sections.length}</p>
          </div>
          <div>
            <span className="text-gray-500">Active Version:</span>
            {versions.length === 0 ? (
              <p className="mt-0.5 font-medium text-gray-900">
                {report.version || "1.0"}
                <span className="ml-2 text-xs text-gray-500">— first save creates v1</span>
              </p>
            ) : (
              <Select
                value={String(activeVersionNumber ?? versions[0]?.version_number ?? 1)}
                onValueChange={(value) => {
                  const next = Number(value);
                  if (next === activeVersionNumber) return;
                  setPendingSwitch(next);
                  setSwitchDialogOpen(true);
                }}
                disabled={setActiveVersionMutation.isPending}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.version_number} value={String(v.version_number)}>
                      <span className="flex items-center gap-2">
                        {v.version_number === activeVersionNumber ? (
                          <Check className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <GitBranch className="h-3.5 w-3.5 text-gray-400" />
                        )}
                        <span className="font-mono text-xs">v{v.version_number}</span>
                        {v.label && <span className="truncate text-xs text-gray-600">— {v.label}</span>}
                        <StatusBadge status={v.status} size="sm" />
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(v.snapshotted_at), { addSuffix: true })}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {versions.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {versions.length} version{versions.length === 1 ? "" : "s"} · v{activeVersionNumber} active
              </p>
            )}
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
      <ConfirmationModal
        open={switchDialogOpen}
        title="Switch active version?"
        description={`Switch the editor to v${pendingSwitch}? Save any unsaved edits to v${activeVersionNumber} first to avoid losing them.`}
        type="default"
        onOpenChange={(open) => {
          if (!open) {
            setPendingSwitch(null);
            setSwitchDialogOpen(false);
          }
        }}
        onConfirm={() => {
          if (pendingSwitch !== null) {
            setActiveVersionMutation.mutate(pendingSwitch);
          }
          setPendingSwitch(null);
          setSwitchDialogOpen(false);
        }}
        isLoading={setActiveVersionMutation.isPending}
      />
    </div>
  );
};
