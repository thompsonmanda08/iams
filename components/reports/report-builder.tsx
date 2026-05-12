"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Save, Download, FileText, Eye, Send, Loader2, Menu, GitBranch } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useReportStore } from "@/store/report-store";
import { useReportFetching } from "@/hooks/use-report-queries";
import { SectionEditor } from "./section-editor";
import { AddSectionModal } from "./add-section-modal";
import { AddSectionButton } from "./add-section-button";
import { TableOfContents } from "./table-of-contents";
import { PDFPreviewModal } from "./pdf-preview-modal";
import { SnapshotVersionDialog } from "./snapshot-version-dialog";
import { PDFDocument } from "./pdf-react/pdf-document";
import { SelectField } from "@/components/ui/select-field";
import { useSetActiveVersion } from "@/hooks/use-report-queries";
import { ensureVersionedShape } from "@/lib/config/ensure-versioned-shape";
import { ConfirmationModal } from "@/components/confirmation-modal";
import type {
  ReportSection,
  TableColumn,
  DataSource,
  DynamicSectionData,
  ReportField,
  ReportType,
  ReportEntityType,
  WidgetInstance,
  WidgetType
} from "@/lib/types/report-types";
import { StatusBadge } from "../status-badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Badge } from "../ui/badge";
import { CreateReportDialog } from "@/app/dashboard/(modules)/reports/_components/create-report-dialog";
import { Button } from "../ui/button";
import { PermissionButton } from "@/components/ui/permission-button";
import { MODULE_CODES } from "@/lib/constants/module-codes";
import CustomAlert from "../ui/custom-alert";
import { ReportBuilderSkeleton } from "./report-builder-skeleton";
import { getDataSourceData } from "@/app/_actions/reports-actions";
import { transformWidgetData } from "@/hooks/shared/use-widget-data";
import { notify } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { formatDate } from "@/lib/utils/date-format";

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
    generalFindings,
    generalFindingsConfig,
    workpaperMetadata,
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
    toggleTableManualOverride,
    changeManagementStandard
  } = useReportStore();

  const isGeneralFramework = report?.management_standard?.toUpperCase() === "GENERAL";

  // Pass the entity ID and type for findings fetching
  const entityIdForFetching = entityType === "audit_plan" ? entity.id : undefined;
  const { saveReport, isSaving, publishReport, isPublishing } = useReportFetching(
    entityIdForFetching,
    entityType
  );

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingReportType, setPendingReportType] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [retryingWidget, setRetryingWidget] = useState<{
    sectionId: string;
    widgetId: string;
  } | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<number | null>(null);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const setActiveVersionMutation = useSetActiveVersion(report?.report_id || "");

  const versions = useMemo(() => {
    if (!report) return [];
    const normalized = ensureVersionedShape(report);
    return [...(normalized.versions ?? [])].sort((a, b) => b.version_number - a.version_number);
  }, [report]);

  const activeVersionNumber = report?.current_version_number;

  const versionOptions = useMemo(
    () =>
      versions.map((v) => {
        const labelPart = v.label ? ` · ${v.label}` : "";
        const ago = formatDistanceToNow(new Date(v.snapshotted_at), { addSuffix: true });
        return {
          id: String(v.version_number),
          value: String(v.version_number),
          label: `v${v.version_number}${labelPart} · ${v.status} · ${ago}`
        };
      }),
    [versions]
  );

  // Auto-fetch data for template widgets that have a data_source_id but empty data.
  // Runs once when the report first loads. Falls back to template defaults on error.
  const hasAutoFetched = useRef(false);
  useEffect(() => {
    if (!report || hasAutoFetched.current) return;

    const widgetsToFetch: Array<{
      sectionId: string;
      widget: WidgetInstance;
    }> = [];

    for (const section of report.sections || []) {
      for (const widget of section.widgets || []) {
        if (!widget.data?.data_source_id) continue;
        // Skip manual-entry widgets — their data is user-authored, not server-fetched
        if (widget.data.data_source_id === "manual") continue;
        // Skip data-source widgets that the user has overridden manually
        if (widget.data.is_manual_override) continue;
        // Check if widget data is empty (template placeholder)
        const d = widget.data;
        const isEmpty =
          (d.slices && d.slices.length === 0) ||
          (d.rows && d.rows.length === 0) ||
          (d.categories && d.categories.length === 0);
        if (isEmpty) {
          widgetsToFetch.push({ sectionId: section.section_id, widget });
        }
      }
    }

    if (widgetsToFetch.length === 0) return;
    hasAutoFetched.current = true;

    // Fetch all in parallel; failures are silently ignored (template defaults remain)
    widgetsToFetch.forEach(async ({ sectionId, widget }) => {
      try {
        const result = await getDataSourceData(
          widget.data.data_source_id,
          widget.widget_type as
            | "pie_chart"
            | "bar_chart"
            | "table"
            | "line_chart"
            | "area_chart"
            | "risk_objective_mapping",
          entity.id,
          entityType
        );
        if (result.success && result.data) {
          const transformed = transformWidgetData(
            result.data,
            widget.widget_type,
            widget.data.data_source_id,
            widget.data.title
          );
          updateWidgetData(sectionId, widget.instance_id, transformed);
        } else if (!result.success) {
          console.warn(
            `[report-builder] Auto-fetch failed for widget ${widget.instance_id} (${widget.data.data_source_id}): ${result.message}`
          );
          notify({
            description: `Could not load data for "${widget.data.title || widget.widget_type}". Use the retry button to try again.`,
            type: "warning"
          });
        }
      } catch (error: any) {
        console.error(
          `[report-builder] Auto-fetch error for widget ${widget.instance_id}:`,
          error
        );
        notify({
          description: `Could not load data for "${widget.data.title || widget.widget_type}". ${error?.message || "Network error"}`,
          type: "error"
        });
      }
    });
  }, [report, entity.id, entityType, updateWidgetData]);

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
        console.log(
          "🔍 [handleWidgetDataSourceChange] No data source selected, switching to manual mode"
        );
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
        notify({ description: "Fetching data...", type: "info" });
        console.log("🔍 [handleWidgetDataSourceChange] Fetching data from API...");

        const widgetType = widget.widget_type as
          | "pie_chart"
          | "bar_chart"
          | "table"
          | "metric_card"
          | "line_chart"
          | "area_chart"
          | "risk_objective_mapping";

        const result = await getDataSourceData(dataSource.id, widgetType, entity.id, entityType);

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

        // Update the widget with fetched data (clear manual override if any)
        console.log("🔍 [handleWidgetDataSourceChange] Updating widget data in store...");
        updateWidgetData(sectionId, widgetId, { ...transformedData, is_manual_override: false });

        notify({ description: "Data loaded successfully", type: "success" });
        console.log("✅ [handleWidgetDataSourceChange] Data source change completed successfully");
      } catch (error: any) {
        console.error("❌ [handleWidgetDataSourceChange] Failed to fetch widget data:", error);
        notify({ description: error.message || "Failed to fetch data", type: "error" });

        // Still update the data source reference even if fetch fails
        updateWidgetDataSource(sectionId, widgetId, dataSource);
      }
    },
    [report, entity.id, updateWidgetData, updateWidgetDataSource]
  );

  // Handle widget type change with real data fetching
  const handleWidgetTypeChange = useCallback(
    async (sectionId: string, widgetId: string, newType: WidgetType) => {
      console.log("🔍 [handleWidgetTypeChange] Widget type change triggered:", {
        sectionId,
        widgetId,
        newType
      });

      // Find the widget to get its current data source
      const section = report?.sections.find((s) => s.section_id === sectionId);
      const widget = section?.widgets.find((w) => w.instance_id === widgetId);

      if (!widget) {
        console.error("❌ [handleWidgetTypeChange] Widget not found");
        return;
      }

      console.log("🔍 [handleWidgetTypeChange] Current widget:", {
        currentType: widget.widget_type,
        dataSourceId: widget.data?.data_source_id
      });

      // If widget has a data source, fetch new data for the new type
      if (widget.data?.data_source_id) {
        try {
          notify({ description: "Changing widget type and fetching data...", type: "info" });
          console.log("🔍 [handleWidgetTypeChange] Fetching data for new type...");

          const widgetType = newType as
            | "pie_chart"
            | "bar_chart"
            | "table"
            | "metric_card"
            | "line_chart"
            | "area_chart"
            | "risk_objective_mapping";

          const result = await getDataSourceData(
            widget.data.data_source_id,
            widgetType,
            entity.id,
            entityType
          );

          if (!result.success) {
            throw new Error(result.message || "Failed to fetch data");
          }

          // Transform the data to the new widget format
          console.log("🔍 [handleWidgetTypeChange] Transforming data for new type...");
          const transformedData = transformWidgetData(
            result.data,
            newType,
            widget.data.data_source_id,
            widget.data.title
          );

          console.log("🔍 [handleWidgetTypeChange] Updating widget with new type and data...");
          updateWidget(sectionId, widgetId, {
            widget_type: newType,
            data: transformedData
          });

          notify({ description: "Widget type changed successfully", type: "success" });
          console.log("✅ [handleWidgetTypeChange] Widget type change completed successfully");
        } catch (error: any) {
          console.error("❌ [handleWidgetTypeChange] Failed:", error);
          notify({ description: error.message || "Failed to change widget type", type: "error" });
        }
      } else {
        // No data source, just change the type without fetching data
        console.log("🔍 [handleWidgetTypeChange] No data source, just changing type");
        updateWidget(sectionId, widgetId, {
          widget_type: newType
        });
        notify({ description: "Widget type changed", type: "success" });
      }
    },
    [report, entity.id, updateWidget, entityType]
  );

  // Handle widget data retry
  const handleRetryWidget = useCallback(
    async (sectionId: string, widgetId: string) => {
      console.log("🔄 [handleRetryWidget] Retry triggered:", { sectionId, widgetId });
      setRetryingWidget({ sectionId, widgetId });

      // Find the widget
      const section = report?.sections.find((s) => s.section_id === sectionId);
      const widget = section?.widgets.find((w) => w.instance_id === widgetId);

      if (!widget || !widget.data.data_source_id) {
        console.error("❌ [handleRetryWidget] Widget not found or no data source");
        notify({ description: "Cannot retry: widget has no data source", type: "error" });
        setRetryingWidget(null);
        return;
      }

      try {
        notify({ description: "Retrying data fetch...", type: "info" });

        const widgetType = widget.widget_type as
          | "pie_chart"
          | "bar_chart"
          | "table"
          | "metric_card"
          | "line_chart"
          | "area_chart"
          | "risk_objective_mapping";

        const result = await getDataSourceData(
          widget.data.data_source_id,
          widgetType,
          entity.id,
          entityType
        );

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch data");
        }

        // Transform and update widget data
        const transformedData = transformWidgetData(
          result.data,
          widget.widget_type,
          widget.data.data_source_id,
          widget.data.title
        );

        updateWidgetData(sectionId, widgetId, transformedData);
        notify({ description: "Data loaded successfully", type: "success" });
        console.log("✅ [handleRetryWidget] Retry successful");
      } catch (error: any) {
        console.error("❌ [handleRetryWidget] Retry failed:", error);
        notify({ description: error.message || "Failed to fetch data", type: "error" });
      } finally {
        setRetryingWidget(null);
      }
    },
    [report, entity.id, entityType, updateWidgetData]
  );

  // Handle toggling manual override on a data-source-backed table
  const handleToggleTableManualOverride = useCallback(
    async (sectionId: string, widgetId: string, enabled: boolean) => {
      if (enabled) {
        // Enable manual edit — data stays as-is, just flip the flag
        toggleTableManualOverride(sectionId, widgetId, true);
      } else {
        // Revert: re-fetch original data from the data source
        const section = report?.sections.find((s) => s.section_id === sectionId);
        const widget = section?.widgets.find((w) => w.instance_id === widgetId);

        if (!widget || !widget.data?.data_source_id || widget.data.data_source_id === "manual") {
          toggleTableManualOverride(sectionId, widgetId, false);
          return;
        }

        try {
          notify({ description: "Reverting to data source...", type: "info" });

          const result = await getDataSourceData(
            widget.data.data_source_id,
            widget.widget_type as "table",
            entity.id,
            entityType
          );

          if (!result.success) {
            throw new Error(result.message || "Failed to fetch data");
          }

          const transformedData = transformWidgetData(
            result.data,
            widget.widget_type,
            widget.data.data_source_id,
            widget.data.title
          );

          updateWidgetData(sectionId, widgetId, {
            ...transformedData,
            is_manual_override: false
          });

          notify({ description: "Reverted to data source", type: "success" });
        } catch (error: any) {
          console.error("Failed to revert table:", error);
          notify({ description: error.message || "Failed to revert", type: "error" });
        }
      }
    },
    [report, entity.id, entityType, toggleTableManualOverride, updateWidgetData]
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
      const blob = await pdf(<PDFDocument report={report} findings={findings} generalFindings={generalFindings} generalFindingsConfig={generalFindingsConfig} workpaperMetadata={workpaperMetadata} />).toBlob();

      if (blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const reportName = (entity.title || report?.title || "audit-report").replace(/[^a-z0-9]/gi, "-").toLowerCase();
      a.download = `${reportName}.pdf`;
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
      // Mutation onSuccess already invalidates the report queries which triggers a refetch.
      // No router.refresh() needed — that double-fetched and caused layout thrash.
    }
  };

  // Handle publish
  const handlePublish = () => {
    if (report) {
      publishReport(report.report_id);
      // Mutation onSuccess handles cache invalidation — no manual refresh needed.
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
    return <ReportBuilderSkeleton />;
  }

  if (!report) {
    return (
      <div className="text-muted-foreground flex h-96 flex-col items-center justify-center">
        <FileText className="text-muted-foreground mb-4 h-12 w-12" />
        <p>No report available. Click &quot;Save Draft&quot; to create one.</p>
        <CreateReportDialog />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border bg-background sticky top-0 z-30 border-b pt-2 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>Report Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <TableOfContents
                    sections={report.sections || []}
                    onItemClick={(id) => {
                      scrollToSection(id);
                      setMobileSidebarOpen(false);
                    }}
                  />
                  <AddSectionButton variant="sidebar" />

                  {/* Report Info */}
                  <div className="border-border bg-card rounded-lg border p-4">
                    <h3 className="text-foreground mb-3 text-sm font-semibold">Report Details</h3>
                    <div className="space-y-2 text-sm">
                      {readOnlyType ? (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Type:</span>
                          <p className="text-foreground font-medium">
                            {reportTypeOptions.find((opt) => opt.value === getReportTypeValue())
                              ?.label || getReportTypeValue()}
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
                        <span className="text-muted-foreground">Source {getEntityLabel()}:</span>
                        <p className="text-foreground font-medium">{entity.title || "-"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Status:</span>
                        <StatusBadge status={report.status as string} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Sections:</span>
                        <p className="text-foreground font-medium">{report.sections?.length || 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Version:</span>
                        <Badge variant={"default"} className="font-medium">
                          {report.version}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Section Type Legend */}
                  <div className="border-border bg-card rounded-lg border p-4">
                    <h3 className="text-foreground mb-3 text-sm font-semibold">Section Types</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/30" />
                        <span className="text-muted-foreground">Cover Page</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30" />
                        <span className="text-muted-foreground">Text Content</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30" />
                        <span className="text-muted-foreground">Text + Widgets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30" />
                        <span className="text-muted-foreground">Findings Selector</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/30" />
                        <span className="text-muted-foreground">Compliance Findings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950/30" />
                        <span className="text-muted-foreground">Dynamic Form</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <h2 className="text-foreground text-lg font-semibold">Report Builder</h2>
              <p className="text-muted-foreground text-sm">
                {entity.title ? ` ${entity.title}` : report.title || "Untitled Report"}
                {entity.ref_no && (
                  <span className="text-muted-foreground ml-2 text-xs">({entity.ref_no})</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2">
            {report.status !== "PUBLISHED" && (
              <PermissionButton
                moduleCode={MODULE_CODES.AUDIT_REPORTS}
                action="can_edit"
                variant={"outline"}
                size="icon"
                onClick={handleSave}
                disabled={isSaving}
                isLoading={isSaving}
                className="sm:w-auto sm:px-3"
                title="Save Draft">
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline md:hidden">Save</span>
                <span className="hidden md:inline">Save Draft</span>
              </PermissionButton>
            )}
            {report.status !== "PUBLISHED" && report.report_id && (
              <PermissionButton
                moduleCode={MODULE_CODES.AUDIT_REPORTS}
                action="can_edit"
                variant={"outline"}
                size="icon"
                onClick={() => setShowSnapshotDialog(true)}
                className="sm:w-auto sm:px-3"
                title="Save as new version">
                <GitBranch className="h-4 w-4" />
                <span className="hidden sm:inline md:hidden">Version</span>
                <span className="hidden md:inline">Save as Version</span>
              </PermissionButton>
            )}
            <Button
              variant={"outline"}
              size="icon"
              onClick={() => setShowPreview(true)}
              className="border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 sm:w-auto sm:px-3"
              title="Preview">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <PermissionButton
              moduleCode={MODULE_CODES.AUDIT_REPORTS}
              action="can_export"
              onClick={exportToPDF}
              disabled={isExporting}
              isLoading={isExporting}
              size="icon"
              className="sm:w-auto sm:px-3"
              title="Export PDF">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline md:hidden">Export</span>
              <span className="hidden md:inline">Export PDF</span>
            </PermissionButton>
            {report.status !== "PUBLISHED" && (
              <PermissionButton
                moduleCode={MODULE_CODES.AUDIT_REPORTS}
                action="can_edit"
                onClick={handlePublish}
                disabled={isPublishing}
                isLoading={isPublishing}
                size="icon"
                className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 sm:w-auto sm:px-3"
                title="Submit for Approval">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline md:hidden">Submit</span>
                <span className="hidden md:inline">Submit for Approval</span>
              </PermissionButton>
            )}
          </div>
        </div>

        {exportError && (
          <CustomAlert type="error" title="Export Error" message={exportError} className="mt-2" />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 py-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Hidden on mobile, shown on large screens */}
          <div className="sticky top-20 hidden space-y-4 self-start lg:col-span-3 lg:block">
            {/* Sections: TOC + add button + collapsible legend */}
            <div className="border-border bg-card rounded-lg border p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="text-foreground text-sm font-semibold">Sections</h3>
                <span className="text-muted-foreground font-mono text-xs">
                  {report.sections?.length || 0}
                </span>
              </div>
              <TableOfContents sections={report.sections || []} onItemClick={scrollToSection} />
              <div className="mt-3">
                <AddSectionButton variant="sidebar" />
              </div>
              <details className="border-border group mt-3 border-t pt-3">
                <summary className="text-muted-foreground hover:text-foreground cursor-pointer list-none text-xs transition-colors select-none">
                  <span className="inline-flex items-center gap-1">
                    <span className="transition-transform group-open:rotate-90">›</span>
                    Section Types
                  </span>
                </summary>
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/30" />
                    <span className="text-muted-foreground">Cover Page</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30" />
                    <span className="text-muted-foreground">Text</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30" />
                    <span className="text-muted-foreground">Text + Widgets</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30" />
                    <span className="text-muted-foreground">Findings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/30" />
                    <span className="text-muted-foreground">Compliance</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950/30" />
                    <span className="text-muted-foreground">Dynamic Form</span>
                  </div>
                </div>
              </details>
            </div>

            {/* Identity */}
            <div className="border-border bg-card rounded-lg border p-4">
              <h3 className="text-foreground mb-3 text-sm font-semibold">Report</h3>
              <div className="space-y-3 text-sm">
                {readOnlyType ? (
                  <div>
                    <span className="text-muted-foreground text-xs">Type</span>
                    <p className="text-foreground mt-0.5 font-medium">
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
                <div>
                  <span className="text-muted-foreground text-xs">Source {getEntityLabel()}</span>
                  <p
                    className="text-foreground mt-0.5 truncate font-medium"
                    title={entity.title || "-"}>
                    {entity.title || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Workspace: active version + authorship */}
            <div className="border-border bg-card rounded-lg border p-4">
              <h3 className="text-foreground mb-3 text-sm font-semibold">Workspace</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Active Version</span>
                  {versions.length === 0 ? (
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={"default"} className="font-medium">
                        {report.version}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        first save creates v1
                      </span>
                    </div>
                  ) : (
                    <>
                      <SelectField
                        value={String(activeVersionNumber ?? versions[0]?.version_number ?? 1)}
                        onValueChange={(value) => {
                          const next = Number(value);
                          if (next === activeVersionNumber) return;
                          setPendingSwitch(next);
                          setSwitchDialogOpen(true);
                        }}
                        options={versionOptions}
                        placeholder="Select version"
                        isDisabled={setActiveVersionMutation.isPending}
                        classNames={{ wrapper: "mt-1" }}
                      />
                      {(() => {
                        const active = versions.find(
                          (v) => v.version_number === activeVersionNumber
                        );
                        if (!active) return null;
                        const lastEdit =
                          active.edit_log[active.edit_log.length - 1]?.edited_at ??
                          active.snapshotted_at;
                        return (
                          <div className="text-muted-foreground mt-1.5 flex items-center gap-2 text-xs">
                            <StatusBadge status={active.status} size="sm" />
                            <span>
                              edited{" "}
                              {formatDistanceToNow(new Date(lastEdit), { addSuffix: true })}
                            </span>
                          </div>
                        );
                      })()}
                      {versions.length > 1 && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {versions.length} versions
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="border-border space-y-1.5 border-t pt-3 text-xs">
                  <p>
                    <span className="text-muted-foreground">Created</span>{" "}
                    <span className="text-foreground font-medium">
                      {formatDate(report?.created_at || new Date())}
                    </span>
                    {report.created_by && (
                      <span className="text-muted-foreground"> · {report.created_by.name}</span>
                    )}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Modified</span>{" "}
                    <span className="text-foreground font-medium">
                      {report?.updated_at
                        ? formatDistanceToNow(report?.updated_at || new Date(), {
                            addSuffix: true
                          })
                        : "--"}
                    </span>
                    {report.updated_by && (
                      <span className="text-muted-foreground"> · {report.updated_by.name}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="col-span-12 space-y-4 lg:col-span-9">
            {(report.sections || [])
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
                  onShowSubHeaderChange={(show_sub_header) =>
                    updateSection(section.section_id, { show_sub_header })
                  }
                  onContentChange={(content) => updateSection(section.section_id, { content })}
                  onOrientationChange={(page_orientation) =>
                    updateSection(section.section_id, { page_orientation })
                  }
                  onFindingsSelectionChange={(selected_finding_ids) =>
                    updateSection(section.section_id, { selected_finding_ids })
                  }
                  generalFindings={generalFindings}
                  generalFindingsConfig={generalFindingsConfig}
                  isGeneralFramework={isGeneralFramework}
                  workpaperMetadata={workpaperMetadata}
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
                  onWidgetTypeChange={(widgetId, newType) =>
                    handleWidgetTypeChange(section.section_id, widgetId, newType)
                  }
                  // Widget CRUD operations
                  onAddWidget={(widget: WidgetInstance) => addWidget(section.section_id, widget)}
                  onRemoveWidget={(widgetId: string) => removeWidget(section.section_id, widgetId)}
                  onUpdateWidget={(widgetId: string, updates: Partial<WidgetInstance>) =>
                    updateWidget(section.section_id, widgetId, updates)
                  }
                  onRetryWidget={(widgetId: string) =>
                    handleRetryWidget(section.section_id, widgetId)
                  }
                  onToggleTableManualOverride={(widgetId, enabled) =>
                    handleToggleTableManualOverride(section.section_id, widgetId, enabled)
                  }
                  retryingWidgetId={
                    retryingWidget?.sectionId === section.section_id
                      ? retryingWidget.widgetId
                      : null
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
        existingSections={report.sections || []}
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

      {/* Save as Version Dialog */}
      {report.report_id && (
        <SnapshotVersionDialog
          reportId={report.report_id}
          open={showSnapshotDialog}
          onOpenChange={setShowSnapshotDialog}
        />
      )}

      {/* Confirm Active Version Switch */}
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
}
