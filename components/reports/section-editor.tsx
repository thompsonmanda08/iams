import React, { useState, useMemo } from "react";
import {
  FileText,
  Edit2,
  PieChart,
  AlertCircle,
  GripVertical,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import {
  ReportSection,
  FindingSummary,
  TableColumn,
  DataSource,
  SectionType,
  DynamicSectionData,
  ReportField
} from "@/lib/types/report-types";
import { CoverPageEditor } from "./cover-page-editor";
import { FindingsSelector } from "./findings-selector";
import { PieChartWidget } from "./pie-chart-widget";
import { ConfigurableTable } from "./configurable-table";
import { DynamicSection } from "./dynamic-section";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { BarChartWidget } from "./bar-chart-widget";
import { RiskObjectiveMappingTable } from "./risk-objective-mapping-table";

interface SectionEditorProps {
  section: ReportSection;
  findings?: FindingSummary[];
  isExpanded: boolean;
  onToggle: () => void;
  onHeaderChange: (header: string) => void;
  onSubHeaderChange: (subHeader: string) => void;
  onContentChange: (content: string) => void;
  onFindingsSelectionChange?: (selectedIds: string[]) => void;
  onFieldValuesChange?: (fieldValues: DynamicSectionData) => void;
  onSchemaChange?: (fields: ReportField[]) => void; // New Prop
  onWidgetColumnsChange?: (widgetId: string, columns: TableColumn[]) => void;
  onWidgetRowsChange?: (widgetId: string, rows: Record<string, any>[]) => void;
  onWidgetDataSourceChange?: (widgetId: string, dataSource: DataSource | null) => void;
  onWidgetDataChange?: (widgetId: string, data: any) => void;
  onMove?: (direction: "up" | "down") => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const SectionEditor = ({
  section,
  findings = [],
  isExpanded,
  onToggle,
  onHeaderChange,
  onSubHeaderChange,
  onContentChange,
  onFindingsSelectionChange,
  onFieldValuesChange,
  onSchemaChange,
  onWidgetColumnsChange,
  onWidgetRowsChange,
  onWidgetDataSourceChange,
  onWidgetDataChange,
  onMove,
  onDelete,
  onDragStart,
  onDrop
}: SectionEditorProps) => {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getTypeStyles = (type: SectionType) => {
    switch (type) {
      case "cover_page":
        return { bg: "bg-purple-50", border: "border-purple-300", icon: FileText };
      case "text_only":
        return { bg: "bg-green-50", border: "border-green-300", icon: Edit2 };
      case "text_with_widgets":
        return { bg: "bg-blue-50", border: "border-blue-300", icon: PieChart };
      case "findings_selector":
        return { bg: "bg-amber-50", border: "border-amber-300", icon: AlertCircle };
      case "compliance_findings":
        return { bg: "bg-indigo-50", border: "border-indigo-300", icon: CheckCircle };
      case "dynamic_form":
        return { bg: "bg-cyan-50", border: "border-cyan-300", icon: FileText }; // New style
      default:
        return { bg: "bg-gray-50", border: "border-gray-300", icon: FileText };
    }
  };

  const style = getTypeStyles(section.section_type);
  const Icon = style.icon;

  const validFindings = findings || [];

  // Group findings by conformity_status for compliance sections
  const groupedFindingsByType = useMemo(() => {
    if (
      section.section_type !== "findings_selector" &&
      section.section_type !== "compliance_findings"
    ) {
      return {};
    }

    const selectedIds = section.selected_finding_ids || [];
    const selectedFindings = validFindings.filter((f) => selectedIds.includes(f.id));

    const groups: Record<string, FindingSummary[]> = {};
    selectedFindings.forEach((finding) => {
      const type = finding.conformity_status || "Other";
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(finding);
    });

    return groups;
  }, [section.section_type, section.selected_finding_ids, validFindings]);

  return (
    <div
      id={section.section_id}
      className={`rounded-lg border-t border-r border-b border-l-4 border-gray-200 ${style.bg} ${style.border} transition-all duration-200`}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={onDrop}>
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing">
            <GripVertical className="h-5 w-5" />
          </div>
          <Icon className="h-5 w-5 text-gray-600" />
          <div className="flex flex-col">
            {isEditingHeader ? (
              <input
                type="text"
                value={section.header}
                onChange={(e) => onHeaderChange(e.target.value)}
                onBlur={() => setIsEditingHeader(false)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="rounded border border-gray-300 px-2 py-0.5 text-sm font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            ) : (
              <h3
                className="text-sm font-semibold text-gray-900"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingHeader(true);
                }}>
                {section.header}
              </h3>
            )}
            <span className="text-xs text-gray-500">
              {section.sub_header || section.section_type.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onMove && (
            <div className="mr-2 flex gap-1 border-r border-gray-300 pr-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove("up");
                }}
                className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm">
                <ChevronDown className="h-4 w-4 rotate-180" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove("down");
                }}
                className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="mr-2 rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="space-y-6">
            {/* Header Editing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">
                  Header
                </label>
                <input
                  type="text"
                  value={section.header}
                  onChange={(e) => onHeaderChange(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">
                  Sub-Header
                </label>
                <input
                  type="text"
                  value={section.sub_header}
                  onChange={(e) => onSubHeaderChange(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Content Logic */}
            {section.section_type === "cover_page" && (
              <CoverPageEditor data={section.content || "{}"} onChange={onContentChange} />
            )}

            {section.section_type === "dynamic_form" && (
              <DynamicSection
                section={section}
                onChange={onFieldValuesChange || (() => {})}
                onSchemaChange={onSchemaChange}
              />
            )}

            {(section.section_type === "text_only" ||
              section.section_type === "text_with_widgets") && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 uppercase">
                  Content
                </label>
                <textarea
                  value={section.content}
                  onChange={(e) => onContentChange(e.target.value)}
                  rows={4}
                  className="focus:blue-500 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:outline-none"
                  placeholder="Enter text content..."
                />
              </div>
            )}

            {(section.section_type === "findings_selector" ||
              section.section_type === "compliance_findings") && (
              <FindingsSelector
                findings={validFindings}
                selectedIds={section.selected_finding_ids || []}
                onSelectionChange={onFindingsSelectionChange || (() => {})}
              />
            )}

            {section.widgets && section.widgets.length > 0 && (
              <div className="space-y-4">
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Widgets
                  </h4>
                  <div className="space-y-6">
                    {section.widgets.map((widget) => {
                      if (widget.widget_type === "pie_chart") {
                        return (
                          <PieChartWidget
                            key={widget.instance_id}
                            data={widget.data as any}
                            dataSourceId={widget.data.data_source_id}
                            onDataSourceChange={
                              onWidgetDataSourceChange
                                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                                : undefined
                            }
                            onDataChange={
                              onWidgetDataChange
                                ? (data) => onWidgetDataChange(widget.instance_id, data)
                                : undefined
                            }
                          />
                        );
                      }
                      if (widget.widget_type === "bar_chart") {
                        return (
                          <BarChartWidget
                            key={widget.instance_id}
                            data={widget.data as any}
                            dataSourceId={widget.data.data_source_id}
                            onDataSourceChange={
                              onWidgetDataSourceChange
                                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                                : undefined
                            }
                            onDataChange={
                              onWidgetDataChange
                                ? (data) => onWidgetDataChange(widget.instance_id, data)
                                : undefined
                            }
                          />
                        );
                      }
                      if (widget.widget_type === "table") {
                        // Logic to merge manual rows with finding rows if needed
                        const isFindingsTable =
                          (section.section_type === "findings_selector" ||
                            section.section_type === "compliance_findings") &&
                          !widget.data.data_source_id;

                        const displayData = isFindingsTable
                          ? {
                              ...widget.data,
                              rows: validFindings
                                .filter((f) => (section.selected_finding_ids || []).includes(f.id))
                                .map((f) => ({
                                  reference: f.reference_code,
                                  title: f.title,
                                  severity: f.severity,
                                  status: f.status,
                                  clause: f.clause_number || f.clause || "",
                                  observation: f.observation || ""
                                }))
                            }
                          : widget.data;

                        return (
                          <ConfigurableTable
                            key={widget.instance_id}
                            data={displayData as any}
                            dataSourceId={widget.data.data_source_id}
                            onRowsChange={
                              onWidgetRowsChange
                                ? (rows) => onWidgetRowsChange(widget.instance_id, rows)
                                : undefined
                            }
                            onColumnsChange={
                              onWidgetColumnsChange
                                ? (cols) => onWidgetColumnsChange(widget.instance_id, cols)
                                : undefined
                            }
                            onDataSourceChange={
                              onWidgetDataSourceChange
                                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                                : undefined
                            }
                          />
                        );
                      }
                      if (widget.widget_type === "risk_objective_mapping") {
                        return (
                          <RiskObjectiveMappingTable
                            key={widget.instance_id}
                            title={widget.data.title}
                            subtitle={widget.data.subtitle}
                            objectives={widget.data.objectives}
                            risks={widget.data.risks}
                            className="w-full"
                            showNumbers={true}
                            checkmarkColor="text-green-500"
                            headerBgColor="bg-slate-800"
                            onDataSourceChange={
                              onWidgetDataSourceChange
                                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                                : undefined
                            }
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Auto-generated tables for each finding type in compliance sections */}
            {(section.section_type === "findings_selector" ||
              section.section_type === "compliance_findings") &&
              Object.keys(groupedFindingsByType).length > 0 && (
                <div className="space-y-6 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Findings by Type
                  </h4>
                  {Object.entries(groupedFindingsByType).map(([conformityStatus, typeFindings]) => {
                    // Determine styling based on conformity status
                    const isConformity = conformityStatus === "CONFORMITY";
                    const isPartialConformity = conformityStatus === "PARTIAL_CONFORMITY";
                    const isNonConformity = conformityStatus === "NON_CONFORMITY";

                    // Display labels
                    const getDisplayLabel = () => {
                      if (isConformity) return "Conformity";
                      if (isPartialConformity) return "Minor Non-Conformity";
                      if (isNonConformity) return "Major Non-Conformity";
                      return conformityStatus;
                    };

                    const getIcon = () => {
                      if (isConformity) return CheckCircle2;
                      if (isPartialConformity) return AlertTriangle;
                      if (isNonConformity) return XCircle;
                      return AlertCircle;
                    };

                    const getColors = () => {
                      if (isConformity)
                        return {
                          bg: "bg-green-50",
                          border: "border-green-200",
                          iconColor: "text-green-600",
                          headerBg: "bg-green-100/50",
                          headerText: "text-green-900"
                        };
                      if (isPartialConformity)
                        return {
                          bg: "bg-amber-50",
                          border: "border-amber-200",
                          iconColor: "text-amber-600",
                          headerBg: "bg-amber-100/50",
                          headerText: "text-amber-900"
                        };
                      if (isNonConformity)
                        return {
                          bg: "bg-red-50",
                          border: "border-red-200",
                          iconColor: "text-red-600",
                          headerBg: "bg-red-100/50",
                          headerText: "text-red-900"
                        };
                      return {
                        bg: "bg-gray-50",
                        border: "border-gray-200",
                        iconColor: "text-gray-600",
                        headerBg: "bg-gray-100/50",
                        headerText: "text-gray-900"
                      };
                    };

                    const Icon = getIcon();
                    const colors = getColors();
                    const displayLabel = getDisplayLabel();

                    return (
                      <div
                        key={`${section.section_id}-${conformityStatus}`}
                        className={`overflow-hidden rounded-lg border ${colors.border} ${colors.bg}`}>
                        {/* Custom Header */}
                        <div className={`flex items-center gap-2 px-4 py-3 ${colors.headerBg}`}>
                          <Icon className={`h-5 w-5 ${colors.iconColor}`} />
                          <h5 className={`text-sm font-semibold ${colors.headerText}`}>
                            {displayLabel}
                          </h5>
                          <span className="ml-auto text-xs text-gray-500">
                            {typeFindings.length} {typeFindings.length === 1 ? "item" : "items"}
                          </span>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto bg-white">
                          <table className="w-full">
                            <thead>
                              <tr className={`border-b ${colors.border}`}>
                                <th className="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                  Reference
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                  Clause
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                  Finding
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                  Observation
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {typeFindings.map((f) => (
                                <tr key={f.id} className="hover:bg-gray-50/50">
                                  <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                    {f.reference_code}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {f.clause_number || f.clause || "N/A"}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {f.title}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {f.observation || "No observation provided"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Section"
          description={`Are you sure you want to delete the section "${section.header}"? This action cannot be undone.`}
          onConfirm={() => {
            onDelete();
            setShowDeleteDialog(false);
          }}
        />
      )}
    </div>
  );
};
