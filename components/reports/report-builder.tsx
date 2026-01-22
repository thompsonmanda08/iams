"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Download, FileText, Eye, Send, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useReportStore } from "@/store/report-store";
import { useReportFetching } from "@/hooks/use-report-queries";
import { SectionEditor } from "./section-editor";
import { AddSectionModal } from "./add-section-modal";
import { AddSectionButton } from "./add-section-button";
import { TableOfContents } from "./table-of-contents";
import { PDFPreviewModal } from "./pdf-preview-modal";
import { PDFDocument } from "./pdf-react/pdf-document";
import { SelectField } from "@/components/ui/select-field";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type {
  ReportSection,
  TableColumn,
  DataSource,
  DynamicSectionData,
  ReportField,
  ReportType,
  ReportEntityType,
  WidgetInstance
} from "@/lib/types/report-types";
import { StatusBadge } from "../status-badge";
import { Badge } from "../ui/badge";
import { CreateReportDialog } from "@/app/dashboard/(modules)/reports/_components/create-report-dialog";
import { Button } from "../ui/button";
import CustomAlert from "../ui/custom-alert";
import Loader from "../ui/loader";
import { getDataSourceData } from "@/app/_actions/reports-actions";
import { transformWidgetData } from "@/hooks/shared/use-widget-data";
import { toast } from "sonner";

// Re-export for convenience
export type { ReportEntityType };

/**
 * Generic entity interface for report generation
 * Can be an audit plan, risk register, or other supported entity
 */
export interface ReportEntity {
  id: string;
  title: string;
  description?: string;
  status?: string;
  ref_no?: string;
  management_standard?: string;
  // Allow additional fields from the source entity
  [key: string]: any;
}

interface ReportBuilderProps {
  /**
   * The entity to generate a report for
   * Can be an audit plan, risk register, or other supported entity
   */
  entity: ReportEntity;
  /**
   * The type of entity - determines the report template and data sources
   */
  entityType: ReportEntityType;
  /**
   * Optional default report type to use
   */
  defaultReportType?: ReportType;
  /**
   * When true, disables the report type selector (used on entity details pages
   * where the management standard/report type is already determined)
   */
  readOnlyType?: boolean;
}

/**
 * Get default report type options based on entity type
 */
const getReportTypeOptionsForEntity = (entityType: ReportEntityType) => {
  switch (entityType) {
    case "audit_plan":
      return [
        { value: "GENERAL", label: "General Internal Audit" },
        { value: "ISO 27001", label: "ISO 27001 Compliance" },
        { value: "FOLLOW-UP", label: "Audit Follow-up" }
      ];
    case "risk_register":
      return [{ value: "RISK ASSESSMENT", label: "Risk Assessment Report" }];
    case "followup":
      return [{ value: "FOLLOW-UP", label: "Follow-up Report" }];
    case "compliance":
      return [{ value: "ISO 27001", label: "ISO 27001 Compliance Report" }];
    default:
      return [
        { value: "GENERAL", label: "General Internal Audit" },
        { value: "ISO 27001", label: "ISO 27001 Compliance" },
        { value: "RISK ASSESSMENT", label: "Risk Assessment" },
        { value: "FOLLOW-UP", label: "Audit Follow-up" }
      ];
  }
};

export function ReportBuilder({
  entity,
  entityType,
  defaultReportType,
  readOnlyType = false
}: ReportBuilderProps) {
  const router = useRouter();

  const {
    report,
    findings,
    isLoading,
    expandedSections,
    isAddSectionModalOpen,
    setAddSectionModalOpen,
    addSection,
    updateSection,
    deleteSection,
    toggleSection,
    moveSection,
    handleDragStart,
    handleDrop,
    // Widget CRUD actions
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetColumns,
    updateWidgetRows,
    updateWidgetData,
    updateWidgetDataSource,
    changeManagementStandard
  } = useReportStore();

  // Pass the entity ID based on entity type
  const entityIdForFetching = entityType === "audit_plan" ? entity.id : undefined;
  const { saveReport, isSaving, publishReport, isPublishing } =
    useReportFetching(entityIdForFetching);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingReportType, setPendingReportType] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Handle data source change with real data fetching
  const handleWidgetDataSourceChange = useCallback(
    async (sectionId: string, widgetId: string, dataSource: DataSource | null) => {
      console.log("🔍 [handleWidgetDataSourceChange] Data source change triggered:", {
        sectionId,
        widgetId,
        dataSourceId: dataSource?.id,
        dataSourceName: dataSource?.name
      });

      // If no data source selected (manual mode), just update the reference
      if (!dataSource) {
        console.log("🔍 [handleWidgetDataSourceChange] No data source selected, switching to manual mode");
        updateWidgetDataSource(sectionId, widgetId, null);
        return;
      }

      // Find the widget to get its type
      const section = report?.sections.find((s) => s.section_id === sectionId);
      const widget = section?.widgets.find((w) => w.instance_id === widgetId);

      console.log("🔍 [handleWidgetDataSourceChange] Widget found:", {
        widgetId: widget?.instance_id,
        widgetType: widget?.widget_type,
        currentDataSourceId: widget?.data?.data_source_id
      });

      if (!widget) {
        console.error("❌ [handleWidgetDataSourceChange] Widget not found");
        return;
      }

      try {
        // Fetch real data from the API
        toast.loading("Fetching data...", { id: "fetch-data" });
        console.log("🔍 [handleWidgetDataSourceChange] Fetching data from API...");

        const widgetType = widget.widget_type as
          | "pie_chart"
          | "bar_chart"
          | "table"
          | "metric_card"
          | "line_chart"
          | "area_chart"
          | "risk_objective_mapping";

        const result = await getDataSourceData(dataSource.id, widgetType, entity.id);

        console.log("🔍 [handleWidgetDataSourceChange] Fetch result:", {
          success: result.success,
          hasData: !!result.data,
          dataType: typeof result.data
        });

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch data");
        }

        // Transform the data to widget format
        console.log("🔍 [handleWidgetDataSourceChange] Transforming data...");
        const transformedData = transformWidgetData(
          result.data,
          widget.widget_type,
          dataSource.id,
          dataSource.name
        );

        console.log("🔍 [handleWidgetDataSourceChange] Transformed data:", {
          title: transformedData.title,
          dataSourceId: transformedData.data_source_id,
          keys: Object.keys(transformedData)
        });

        // Update the widget with fetched data
        console.log("🔍 [handleWidgetDataSourceChange] Updating widget data in store...");
        updateWidgetData(sectionId, widgetId, transformedData);

        toast.success("Data loaded successfully", { id: "fetch-data" });
        console.log("✅ [handleWidgetDataSourceChange] Data source change completed successfully");
      } catch (error: any) {
        console.error("❌ [handleWidgetDataSourceChange] Failed to fetch widget data:", error);
        toast.error(error.message || "Failed to fetch data", { id: "fetch-data" });

        // Still update the data source reference even if fetch fails
        updateWidgetDataSource(sectionId, widgetId, dataSource);
      }
    },
    [report, entity.id, updateWidgetData, updateWidgetDataSource]
  );

  // Scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!report) return;
    setIsExporting(true);
    setExportError(null);

    try {
      const blob = await pdf(<PDFDocument report={report} findings={findings} />).toBlob();

      if (blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report?.title?.replace(/[^a-z0-9]/gi, "-")?.toLowerCase()}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      setExportError(error instanceof Error ? error.message : "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle save
  // Note: entity_id and entity_type are now handled separately by the saveReport action
  // and are retrieved from the store, not added to the ReportContent object
  const handleSave = () => {
    if (report) {
      saveReport(report);
      // Refresh after save completes (handled by mutation's onSuccess)
      setTimeout(() => router.refresh(), 1000);
    }
  };

  // Handle publish
  const handlePublish = () => {
    if (report) {
      publishReport(report.report_id);
      // Refresh after publish completes (handled by mutation's onSuccess)
      setTimeout(() => router.refresh(), 1000);
    }
  };

  // Get report type value for select
  const getReportTypeValue = () => {
    if (!report) {
      // Return default based on entity type
      switch (entityType) {
        case "risk_register":
          return "RISK ASSESSMENT";
        case "followup":
          return "FOLLOW-UP";
        case "compliance":
          return "ISO 27001";
        default:
          return "GENERAL";
      }
    }
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

  const reportTypeOptions = getReportTypeOptionsForEntity(entityType);

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

  // Entity-specific labels
  const getEntityLabel = () => {
    switch (entityType) {
      case "audit_plan":
        return "Audit Plan";
      case "risk_register":
        return "Risk Register";
      case "followup":
        return "Follow-up";
      case "compliance":
        return "Compliance Assessment";
      default:
        return "Entity";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader loadingText="Loading report..." classNames={{ spinner: "w-16 h-16" }} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-gray-500">
        <FileText className="mb-4 h-12 w-12 text-gray-400" />
        <p>No report available. Click &quot;Save Draft&quot; to create one.</p>
        <CreateReportDialog />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Report Builder</h2>
            <p className="text-sm text-gray-500">
              {entity.title ? ` ${entity.title}` : report.title || "Untitled Report"}
              {entity.ref_no && (
                <span className="text-muted-foreground ml-2 text-xs">({entity.ref_no})</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {report.status !== "PUBLISHED" && (
              <Button
                variant={"outline"}
                onClick={handleSave}
                disabled={isSaving}
                isLoading={isSaving}>
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
            )}
            <Button
              variant={"outline"}
              onClick={() => setShowPreview(true)}
              className="text-primary-700 text-primary flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm transition-colors hover:bg-blue-100">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            {report.status !== "PUBLISHED" && (
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                isLoading={isPublishing}
                variant={"secondary"}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700 disabled:opacity-50">
                <Send className="h-4 w-4" />
                Submit for Approval
              </Button>
            )}
            <Button onClick={exportToPDF} disabled={isExporting} isLoading={isExporting}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {exportError && (
          <CustomAlert type="error" title="Export Error" message={exportError} className="mt-2" />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 py-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 space-y-4 lg:col-span-3">
            <TableOfContents sections={report.sections} onItemClick={scrollToSection} />

            {/* Report Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Report Details</h3>
              <div className="space-y-2 text-sm">
                {readOnlyType ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium text-gray-900">
                      {reportTypeOptions.find((opt) => opt.value === getReportTypeValue())?.label ||
                        getReportTypeValue()}
                    </p>
                  </div>
                ) : (
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
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Source {getEntityLabel()}:</span>
                  <p className="font-medium text-gray-900">{entity.title || "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Status:</span>
                  <StatusBadge status={report.status as string} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Sections:</span>
                  <p className="font-medium text-gray-900">{report.sections.length}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Version:</span>
                  <Badge variant={"default"} className="font-medium">
                    {report.version}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Section Type Legend */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Section Types</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-green-300 bg-green-50 font-medium" />
                  <span className="text-gray-600">Text Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-blue-300 bg-blue-50 font-medium" />
                  <span className="text-gray-600">Text + Widgets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-amber-300 bg-amber-50 font-medium" />
                  <span className="text-gray-600">Findings Selector</span>
                </div>
              </div>
            </div>

            <AddSectionButton variant="sidebar" />
          </div>

          {/* Main Editor */}
          <div className="col-span-12 space-y-4 lg:col-span-9">
            {report.sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <SectionEditor
                  key={section.section_id}
                  section={section}
                  findings={findings}
                  isExpanded={expandedSections[section.section_id] ?? false}
                  onToggle={() => toggleSection(section.section_id)}
                  onHeaderChange={(header) => updateSection(section.section_id, { header })}
                  onSubHeaderChange={(sub_header) =>
                    updateSection(section.section_id, { sub_header })
                  }
                  onContentChange={(content) => updateSection(section.section_id, { content })}
                  onFindingsSelectionChange={(selected_finding_ids) =>
                    updateSection(section.section_id, { selected_finding_ids })
                  }
                  onFieldValuesChange={(field_values: DynamicSectionData) =>
                    updateSection(section.section_id, { field_values })
                  }
                  onSchemaChange={(fields: ReportField[]) =>
                    updateSection(section.section_id, { fields })
                  }
                  onWidgetColumnsChange={(widgetId, columns: TableColumn[]) =>
                    updateWidgetColumns(section.section_id, widgetId, columns)
                  }
                  onWidgetRowsChange={(widgetId, rows) =>
                    updateWidgetRows(section.section_id, widgetId, rows)
                  }
                  onWidgetDataSourceChange={(widgetId, dataSource: DataSource | null) =>
                    handleWidgetDataSourceChange(section.section_id, widgetId, dataSource)
                  }
                  onWidgetDataChange={(widgetId, data) =>
                    updateWidgetData(section.section_id, widgetId, data)
                  }
                  // Widget CRUD operations
                  onAddWidget={(widget: WidgetInstance) =>
                    addWidget(section.section_id, widget)
                  }
                  onRemoveWidget={(widgetId: string) =>
                    removeWidget(section.section_id, widgetId)
                  }
                  onUpdateWidget={(widgetId: string, updates: Partial<WidgetInstance>) =>
                    updateWidget(section.section_id, widgetId, updates)
                  }
                  // Entity context for data source filtering
                  entityId={entity.id}
                  entityType={entityType}
                  onMove={(direction) => moveSection(index, direction)}
                  onDelete={() => deleteSection(section.section_id)}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    handleDragStart(section.section_id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(section.section_id);
                  }}
                />
              ))}

            {/* Add Section Button at bottom */}
            <AddSectionButton variant="main" />
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionModalOpen}
        onClose={() => setAddSectionModalOpen(false)}
        onAdd={addSection}
        existingSectionsCount={report.sections.length}
      />

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        reportId={report.report_id}
        reportTitle={report.title}
      />

      {/* Confirm Report Type Change */}
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
}
