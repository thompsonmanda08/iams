"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "@/store/session-store";
import {
  FileText,
  Download,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit2,
  Save,
  Plus,
  Trash2,
  GripVertical,
  PieChart,
  Table2,
  List,
  Check,
  X,
  Settings2
} from "lucide-react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type ReportType = "internal_audit" | "iso_audit" | "risk" | "followup";
type SectionType = "cover_page" | "text_only" | "text_with_widgets" | "findings_selector";
type WidgetType = "table" | "pie_chart";

interface TableColumn {
  key: string;
  header: string;
  width?: string;
}

interface TableWidgetData {
  title: string;
  columns: TableColumn[];
  rows: Record<string, any>[];
  is_configurable?: boolean;
}

interface PieChartSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartWidgetData {
  title: string;
  slices: PieChartSlice[];
}

interface WidgetInstance {
  instance_id: string;
  widget_type: WidgetType;
  order: number;
  data: TableWidgetData | PieChartWidgetData;
}

interface FindingSummary {
  id: string;
  reference_code: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: string;
  category_name?: string;
  is_selected: boolean;
}

interface ReportSection {
  section_id: string;
  section_type: SectionType;
  order: number;
  include_in_toc: boolean;
  toc_level: 1 | 2 | 3;
  header: string;
  sub_header?: string;
  content?: string;
  widgets: WidgetInstance[];
  selected_finding_ids?: string[];
}

interface ReportBranding {
  primary_color: string;
  secondary_color: string;
  font_family: string;
}

interface ReportContent {
  title: string;
  version: string;
  created_at: string;
  branding: ReportBranding;
  sections: ReportSection[];
}

// ============================================================================
// DATA SOURCE DEFINITIONS
// ============================================================================

/**
 * Represents a data source that can populate widgets
 * The backend validates if the data structure is compatible with the widget type
 */
interface DataSource {
  id: string;
  name: string;
  description: string;
  category: "audit" | "risk" | "compliance" | "custom";
  /** Which widget types can use this data source */
  compatible_widgets: WidgetType[];
  /** Sample data structure for preview */
  sample_data: any;
  /** Whether this requires an entity_id (audit plan, risk register) */
  requires_entity: boolean;
}

/**
 * Available data sources from the system
 * In production, these would be fetched from the backend API
 */
const AVAILABLE_DATA_SOURCES: DataSource[] = [
  {
    id: "findings_by_severity",
    name: "Findings by Severity",
    description: "Distribution of audit findings grouped by severity level",
    category: "audit",
    compatible_widgets: ["pie_chart", "table"],
    requires_entity: true,
    sample_data: {
      pie_chart: [
        { label: "High", value: 2, color: "#ef4444" },
        { label: "Medium", value: 3, color: "#f59e0b" },
        { label: "Low", value: 1, color: "#22c55e" }
      ],
      table: {
        columns: ["Severity", "Count", "Percentage"],
        rows: [
          { severity: "High", count: 2, percentage: "33%" },
          { severity: "Medium", count: 3, percentage: "50%" },
          { severity: "Low", count: 1, percentage: "17%" }
        ]
      }
    }
  },
  {
    id: "findings_by_status",
    name: "Findings by Status",
    description: "Distribution of findings by their current status",
    category: "audit",
    compatible_widgets: ["pie_chart", "table"],
    requires_entity: true,
    sample_data: {
      pie_chart: [
        { label: "Open", value: 3, color: "#ef4444" },
        { label: "In Progress", value: 2, color: "#3b82f6" },
        { label: "Closed", value: 5, color: "#22c55e" }
      ]
    }
  },
  {
    id: "findings_list",
    name: "Findings List",
    description: "Complete list of audit findings with details",
    category: "audit",
    compatible_widgets: ["table"],
    requires_entity: true,
    sample_data: {
      columns: ["Reference", "Title", "Severity", "Status", "Recommendation"],
      rows: []
    }
  },
  {
    id: "risks_by_rating",
    name: "Risks by Rating",
    description: "Distribution of risks by inherent risk rating",
    category: "risk",
    compatible_widgets: ["pie_chart", "table"],
    requires_entity: true,
    sample_data: {
      pie_chart: [
        { label: "Critical", value: 2, color: "#7c3aed" },
        { label: "High", value: 5, color: "#ef4444" },
        { label: "Medium", value: 8, color: "#f59e0b" },
        { label: "Low", value: 3, color: "#22c55e" }
      ]
    }
  },
  {
    id: "risks_above_appetite",
    name: "Risks Above Appetite",
    description: "List of risks that exceed the organization's risk appetite",
    category: "risk",
    compatible_widgets: ["table"],
    requires_entity: true,
    sample_data: {
      columns: ["Risk Title", "Category", "Residual Score", "Risk Owner", "Treatment Status"],
      rows: []
    }
  },
  {
    id: "control_compliance",
    name: "Control Compliance Status",
    description: "Compliance status of controls against framework",
    category: "compliance",
    compatible_widgets: ["pie_chart", "table"],
    requires_entity: false,
    sample_data: {
      pie_chart: [
        { label: "Conforming", value: 85, color: "#22c55e" },
        { label: "Partial", value: 10, color: "#f59e0b" },
        { label: "Non-Conforming", value: 5, color: "#ef4444" }
      ]
    }
  },
  {
    id: "audit_team",
    name: "Audit Team",
    description: "List of audit team members and their roles",
    category: "audit",
    compatible_widgets: ["table"],
    requires_entity: true,
    sample_data: {
      columns: ["Name", "Role", "Certification"],
      rows: [
        { name: "John Doe", role: "Lead Auditor", certification: "CISA" },
        { name: "Jane Smith", role: "Auditor", certification: "ISO 27001 LA" }
      ]
    }
  },
  {
    id: "custom_table",
    name: "Custom Table",
    description: "Create your own table with custom columns",
    category: "custom",
    compatible_widgets: ["table"],
    requires_entity: false,
    sample_data: {
      columns: ["Column 1", "Column 2"],
      rows: []
    }
  },
  {
    id: "custom_chart",
    name: "Custom Chart Data",
    description: "Create your own pie chart with custom values",
    category: "custom",
    compatible_widgets: ["pie_chart"],
    requires_entity: false,
    sample_data: {
      pie_chart: [
        { label: "Category A", value: 50, color: "#3b82f6" },
        { label: "Category B", value: 50, color: "#f59e0b" }
      ]
    }
  }
];

// ============================================================================
// MOCK DATA - FINDINGS
// ============================================================================

const MOCK_FINDINGS: FindingSummary[] = [
  {
    id: "F-001",
    reference_code: "F-2025-001",
    title: "Inadequate Access Control Reviews",
    severity: "high",
    status: "OPEN",
    category_name: "A.9 Access Control",
    is_selected: true
  },
  {
    id: "F-002",
    reference_code: "F-2025-002",
    title: "Missing Backup Verification Procedures",
    severity: "medium",
    status: "IN_PROGRESS",
    category_name: "A.12 Operations Security",
    is_selected: true
  },
  {
    id: "F-003",
    reference_code: "F-2025-003",
    title: "Weak Password Policy Enforcement",
    severity: "high",
    status: "OPEN",
    category_name: "A.9 Access Control",
    is_selected: false
  },
  {
    id: "F-004",
    reference_code: "F-2025-004",
    title: "Outdated Security Awareness Training",
    severity: "low",
    status: "CLOSED",
    category_name: "A.7 Human Resource Security",
    is_selected: true
  },
  {
    id: "F-005",
    reference_code: "F-2025-005",
    title: "Incomplete Asset Inventory",
    severity: "medium",
    status: "OPEN",
    category_name: "A.8 Asset Management",
    is_selected: false
  }
];

// ============================================================================
// MOCK DATA - INITIAL REPORT
// ============================================================================

const INITIAL_REPORT: ReportContent = {
  title: "Internal Audit Assessment Report",
  version: "1.0",
  created_at: "2025-01-14",
  branding: {
    primary_color: "#1a365d",
    secondary_color: "#2563eb",
    font_family: "Inter"
  },
  sections: [
    {
      section_id: "cover",
      section_type: "cover_page",
      order: 1,
      include_in_toc: false,
      toc_level: 1,
      header: "Cover Page",
      content: JSON.stringify({
        report_title: "Internal Audit Assessment Report",
        report_date: "January 2025",
        organization: {
          name: "INFRATEL Corporation",
          tagline: "A member of the IDC Group of Companies",
          logo_url: "/images/infratel-logo.png"
        },
        author: {
          name: "Mwenya S. Zulu",
          certification: "CISA",
          title: "Head of Internal Audit & Risk"
        }
      }),
      widgets: [
        {
          instance_id: "widget-cover-table",
          widget_type: "table",
          order: 1,
          data: {
            title: "Document Control",
            is_configurable: true,
            columns: [
              { key: "action", header: "Action" },
              { key: "name_role", header: "Name/Role" },
              { key: "signature", header: "Signature" },
              { key: "date", header: "Date" }
            ],
            rows: [
              {
                action: "Prepared by",
                name_role: "Alex Maka (Senior IS Auditor)",
                signature: "",
                date: "2025-01-14"
              },
              {
                action: "Reviewed by",
                name_role: "Mwenya Zulu (Head Internal Audit & Risk)",
                signature: "",
                date: "2025-01-14"
              },
              {
                action: "Approved by",
                name_role: "Dr. Evans Silavwe (CEO)",
                signature: "",
                date: "2025-01-14"
              }
            ]
          } as TableWidgetData
        }
      ]
    },
    {
      section_id: "exec-summary",
      section_type: "text_with_widgets",
      order: 2,
      include_in_toc: true,
      toc_level: 1,
      header: "Executive Summary",
      sub_header: "Q4 2024 Overview",
      content:
        "The audit assessed the Information Security Management System (ISMS) against ISO/IEC 27001:2022. The organization demonstrates overall conformity, with minor non-conformities noted.",
      widgets: [
        {
          instance_id: "widget-1",
          widget_type: "pie_chart",
          order: 1,
          data: {
            title: "Finding Severity Distribution",
            slices: [
              { label: "High", value: 2, color: "#ef4444" },
              { label: "Medium", value: 2, color: "#f59e0b" },
              { label: "Low", value: 1, color: "#22c55e" }
            ]
          } as PieChartWidgetData
        }
      ]
    },
    {
      section_id: "introduction",
      section_type: "text_only",
      order: 3,
      include_in_toc: true,
      toc_level: 1,
      header: "Introduction",
      sub_header: "Background",
      content:
        "This internal audit was conducted as part of the annual audit plan to evaluate the effectiveness of controls within the Human Capital & Administration department.",
      widgets: []
    },
    {
      section_id: "objectives",
      section_type: "text_only",
      order: 4,
      include_in_toc: true,
      toc_level: 2,
      header: "Audit Objectives",
      content:
        "1. To assess compliance with ISO/IEC 27001:2022 requirements\n2. To evaluate the effectiveness of existing controls\n3. To identify areas for improvement",
      widgets: []
    },
    {
      section_id: "scope",
      section_type: "text_only",
      order: 5,
      include_in_toc: true,
      toc_level: 2,
      header: "Audit Scope",
      content:
        "The audit covered all ISMS processes within the Human Capital & Administration department for the period Q1-Q4 2024.",
      widgets: []
    },
    {
      section_id: "findings",
      section_type: "findings_selector",
      order: 6,
      include_in_toc: true,
      toc_level: 1,
      header: "Detailed Findings",
      sub_header: "Audit Observations",
      widgets: [
        {
          instance_id: "widget-findings-table",
          widget_type: "table",
          order: 1,
          data: {
            title: "Audit Findings",
            is_configurable: true,
            columns: [
              { key: "reference", header: "Reference" },
              { key: "title", header: "Finding" },
              { key: "severity", header: "Severity" },
              { key: "status", header: "Status" },
              { key: "recommendation", header: "Recommendation" }
            ],
            rows: []
          } as TableWidgetData
        }
      ],
      selected_finding_ids: ["F-001", "F-002", "F-004"]
    },
    {
      section_id: "conclusion",
      section_type: "text_only",
      order: 7,
      include_in_toc: true,
      toc_level: 1,
      header: "Conclusion",
      sub_header: "Recommendations",
      content:
        "Based on the findings, the overall audit rating is: Needs Improvement. Management should address identified non-conformities within the committed timelines.",
      widgets: []
    }
  ]
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    critical: "bg-purple-100 text-purple-800 border-purple-200",
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-green-100 text-green-800 border-green-200"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[severity] || "bg-gray-100 text-gray-800"}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    OPEN: "bg-red-50 text-red-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    CLOSED: "bg-green-50 text-green-700"
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-50 text-gray-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
};

// ============================================================================
// TABLE OF CONTENTS COMPONENT
// ============================================================================

interface TOCProps {
  sections: ReportSection[];
  onItemClick: (sectionId: string) => void;
}

const TableOfContents = ({ sections, onItemClick }: TOCProps) => {
  const tocItems = sections
    .filter((s) => s.include_in_toc && s.header)
    .sort((a, b) => a.order - b.order);

  let mainCounter = 0;
  let subCounter = 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <List className="h-4 w-4" />
        Table of Contents
      </h3>
      <nav className="space-y-1">
        {tocItems.map((section) => {
          let label = "";
          if (section.toc_level === 1) {
            mainCounter++;
            subCounter = 0;
            label = `${mainCounter}.`;
          } else if (section.toc_level === 2) {
            subCounter++;
            label = `${mainCounter}.${subCounter}`;
          } else {
            label = "•";
          }

          return (
            <button
              key={section.section_id}
              onClick={() => onItemClick(section.section_id)}
              className={`block w-full text-left text-sm transition-colors hover:text-blue-600 ${
                section.toc_level === 1
                  ? "font-medium text-gray-900"
                  : section.toc_level === 2
                    ? "pl-4 text-gray-700"
                    : "pl-8 text-gray-600"
              }`}>
              <span className="mr-2 text-gray-400">{label}</span>
              {section.header}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// ============================================================================
// PIE CHART COMPONENT
// ============================================================================

interface PieChartWidgetProps {
  data: PieChartWidgetData;
  dataSourceId?: string;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  onDataChange?: (data: PieChartWidgetData) => void;
  showDataSourcePicker?: boolean;
}

const PieChartWidget = ({
  data,
  dataSourceId,
  onDataSourceChange,
  onDataChange,
  showDataSourcePicker = true
}: PieChartWidgetProps) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const total = data.slices.reduce((sum, slice) => sum + slice.value, 0);

  const addSlice = () => {
    if (!onDataChange) return;
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#ec4899"];
    const nextColor = colors[data.slices.length % colors.length];
    onDataChange({
      ...data,
      slices: [...data.slices, { label: `New Category`, value: 10, color: nextColor }]
    });
  };

  const removeSlice = (index: number) => {
    if (!onDataChange) return;
    onDataChange({
      ...data,
      slices: data.slices.filter((_, i) => i !== index)
    });
  };

  const updateSlice = (index: number, updates: Partial<PieChartSlice>) => {
    if (!onDataChange) return;
    onDataChange({
      ...data,
      slices: data.slices.map((slice, i) => (i === index ? { ...slice, ...updates } : slice))
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <PieChart className="h-4 w-4 text-blue-600" />
          {data.title}
        </h4>
        <div className="flex items-center gap-2">
          {showDataSourcePicker && onDataSourceChange && (
            <WidgetDataSourcePicker
              widgetType="pie_chart"
              currentDataSourceId={dataSourceId}
              onDataSourceChange={onDataSourceChange}
            />
          )}
          {!dataSourceId && onDataChange && (
            <button
              onClick={() => setIsConfiguring(!isConfiguring)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                isConfiguring ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
              }`}>
              <Edit2 className="h-3 w-3" />
              {isConfiguring ? "Done" : "Configure Slices"}
            </button>
          )}
        </div>
      </div>

      {isConfiguring && (
        <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3">
          <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Configure Data Slices
          </div>
          <div className="space-y-2">
            {data.slices.map((slice, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="color"
                  value={slice.color}
                  onChange={(e) => updateSlice(i, { color: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={slice.label}
                  onChange={(e) => updateSlice(i, { label: e.target.value })}
                  placeholder="Label"
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={slice.value}
                  onChange={(e) => updateSlice(i, { value: Number(e.target.value) })}
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
                <button onClick={() => removeSlice(i)} className="text-gray-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addSlice}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-dashed border-gray-300 py-1.5 text-xs font-medium text-gray-500 transition-all hover:border-purple-400 hover:bg-white hover:text-purple-600">
            <Plus className="h-3 w-3" />
            Add New Slice
          </button>
        </div>
      )}

      <div className="flex items-center gap-6">
        {/* Simple pie representation */}
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 32 32" className="h-full w-full -rotate-90">
            {(() => {
              let cumulativePercent = 0;
              return data.slices.map((slice, i) => {
                const percent = (slice.value / total) * 100;
                const strokeDasharray = `${percent} ${100 - percent}`;
                const strokeDashoffset = -cumulativePercent;
                cumulativePercent += percent;

                return (
                  <circle
                    key={i}
                    cx="16"
                    cy="16"
                    r="12"
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dasharray 0.3s" }}
                  />
                );
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{total}</span>
          </div>
        </div>
        {/* Legend */}
        <div className="space-y-2">
          {data.slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded" style={{ backgroundColor: slice.color }} />
              <span className="text-gray-600">{slice.label}</span>
              <span className="font-medium text-gray-900">({slice.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CONFIGURABLE TABLE COMPONENT
// ============================================================================

interface ConfigurableTableProps {
  data: TableWidgetData;
  dataSourceId?: string;
  onColumnsChange?: (columns: TableColumn[]) => void;
  onRowsChange?: (rows: Record<string, any>[]) => void;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  showDataSourcePicker?: boolean;
}

const ConfigurableTable = ({
  data,
  dataSourceId,
  onColumnsChange,
  onRowsChange,
  onDataSourceChange,
  showDataSourcePicker = true
}: ConfigurableTableProps) => {
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [newColumnHeader, setNewColumnHeader] = useState("");

  const addColumn = () => {
    if (!newColumnHeader.trim() || !onColumnsChange) return;
    const newKey = newColumnHeader.toLowerCase().replace(/\s+/g, "_");
    onColumnsChange([...data.columns, { key: newKey, header: newColumnHeader }]);
    setNewColumnHeader("");
  };

  const removeColumn = (keyToRemove: string) => {
    if (!onColumnsChange) return;
    onColumnsChange(data.columns.filter((col) => col.key !== keyToRemove));
  };

  const addRow = () => {
    if (!onRowsChange) return;
    const newRow = data.columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});
    onRowsChange([...data.rows, newRow]);
  };

  const removeRow = (index: number) => {
    if (!onRowsChange) return;
    onRowsChange(data.rows.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex: number, key: string, value: any) => {
    if (!onRowsChange) return;
    onRowsChange(data.rows.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row)));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Table2 className="h-4 w-4 text-blue-600" />
          {data.title}
        </h4>
        <div className="flex items-center gap-2">
          {showDataSourcePicker && onDataSourceChange && (
            <WidgetDataSourcePicker
              widgetType="table"
              currentDataSourceId={dataSourceId}
              onDataSourceChange={onDataSourceChange}
            />
          )}
          {data.is_configurable && (
            <button
              onClick={() => setIsEditingColumns(!isEditingColumns)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                isEditingColumns ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              }`}>
              <Settings2 className="h-3 w-3" />
              {isEditingColumns ? "Done" : "Configure Columns"}
            </button>
          )}
          {!dataSourceId && onRowsChange && (
            <button
              onClick={addRow}
              className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100">
              <Plus className="h-3 w-3" />
              Add Row
            </button>
          )}
        </div>
      </div>

      {isEditingColumns && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="mb-2 text-xs font-medium text-gray-600">Current Columns:</div>
          <div className="mb-3 flex flex-wrap gap-2">
            {data.columns.map((col) => (
              <span
                key={col.key}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm shadow-sm">
                <GripVertical className="h-3 w-3 cursor-move text-gray-400" />
                {col.header}
                <button
                  onClick={() => removeColumn(col.key)}
                  className="ml-1 text-gray-400 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newColumnHeader}
              onChange={(e) => setNewColumnHeader(e.target.value)}
              placeholder="New column header..."
              className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={addColumn}
              disabled={!newColumnHeader.trim()}
              className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {data.columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  {col.header}
                </th>
              ))}
              {!dataSourceId && onRowsChange && <th className="w-10 px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={data.columns.length} className="px-4 py-8 text-center text-gray-500">
                  No data available. Select findings to populate this table.
                </td>
              </tr>
            ) : (
              data.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="group hover:bg-gray-50/50">
                  {data.columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {!dataSourceId && onRowsChange ? (
                        <input
                          type="text"
                          value={row[col.key] || ""}
                          onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                          className="w-full border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:outline-none"
                          placeholder="..."
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {col.key === "severity" ? (
                            <SeverityBadge severity={row[col.key]} />
                          ) : col.key === "status" ? (
                            <StatusBadge status={row[col.key]} />
                          ) : (
                            row[col.key] || "-"
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  {!dataSourceId && onRowsChange && (
                    <td className="px-4 py-3 text-right opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// WIDGET DATA SOURCE PICKER COMPONENT
// ============================================================================

interface WidgetDataSourcePickerProps {
  widgetType: WidgetType;
  currentDataSourceId?: string;
  onDataSourceChange: (dataSource: DataSource | null) => void;
}

const WidgetDataSourcePicker = ({
  widgetType,
  currentDataSourceId,
  onDataSourceChange
}: WidgetDataSourcePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter data sources compatible with this widget type
  const compatibleSources = AVAILABLE_DATA_SOURCES.filter((ds) =>
    ds.compatible_widgets.includes(widgetType)
  );

  const filteredSources =
    selectedCategory === "all"
      ? compatibleSources
      : compatibleSources.filter((ds) => ds.category === selectedCategory);

  const currentSource = compatibleSources.find((ds) => ds.id === currentDataSourceId);

  const categories = Array.from(new Set(compatibleSources.map((ds) => ds.category)));

  const categoryLabels: Record<string, string> = {
    audit: "Audit Data",
    risk: "Risk Data",
    compliance: "Compliance",
    custom: "Custom Entry"
  };

  const categoryColors: Record<string, string> = {
    audit: "bg-blue-100 text-blue-700",
    risk: "bg-red-100 text-red-700",
    compliance: "bg-green-100 text-green-700",
    custom: "bg-purple-100 text-purple-700"
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-50">
        <Settings2 className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">
          {currentSource ? currentSource.name : "Select Data Source"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 p-3">
            <p className="mb-2 text-xs font-medium text-gray-500">
              Select data source for {widgetType === "pie_chart" ? "Pie Chart" : "Table"}
            </p>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`rounded px-2 py-1 text-xs font-medium ${
                  selectedCategory === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    selectedCategory === cat
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {categoryLabels[cat] || cat}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {/* Option to use custom/manual entry */}
            <button
              onClick={() => {
                onDataSourceChange(null);
                setIsOpen(false);
              }}
              className={`mb-1 w-full rounded-lg p-3 text-left transition-colors ${
                !currentDataSourceId ? "border border-blue-200 bg-blue-50" : "hover:bg-gray-50"
              }`}>
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-gray-900">Manual Entry</span>
                <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
                  Custom
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Enter your own data manually</p>
            </button>

            <div className="my-2 border-t border-gray-100" />

            {filteredSources.map((source) => (
              <button
                key={source.id}
                onClick={() => {
                  onDataSourceChange(source);
                  setIsOpen(false);
                }}
                className={`mb-1 w-full rounded-lg p-3 text-left transition-colors ${
                  currentDataSourceId === source.id
                    ? "border border-blue-200 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}>
                <div className="flex items-center gap-2">
                  {source.category === "audit" && <FileText className="h-4 w-4 text-blue-500" />}
                  {source.category === "risk" && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {source.category === "compliance" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {source.category === "custom" && <Edit2 className="h-4 w-4 text-purple-500" />}
                  <span className="font-medium text-gray-900">{source.name}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${categoryColors[source.category]}`}>
                    {categoryLabels[source.category]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{source.description}</p>
                {source.requires_entity && (
                  <p className="mt-1 text-xs text-amber-600">
                    ⚠ Requires linked audit plan or risk register
                  </p>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full rounded bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FINDINGS SELECTOR COMPONENT
// ============================================================================

interface FindingsSelectorProps {
  findings: FindingSummary[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const FindingsSelector = ({ findings, selectedIds, onSelectionChange }: FindingsSelectorProps) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const filteredFindings =
    filterSeverity === "all" ? findings : findings.filter((f) => f.severity === filterSeverity);

  const toggleFinding = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    onSelectionChange(filteredFindings.map((f) => f.id));
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-4">
          <h4 className="text-sm font-semibold text-gray-900">Select Findings for Report</h4>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {selectedIds.length} of {findings.length} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm">
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={selectAll}
            className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">
            Deselect All
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredFindings.map((finding) => {
          const isSelected = selectedIds.includes(finding.id);
          return (
            <div
              key={finding.id}
              onClick={() => toggleFinding(finding.id)}
              className={`flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors ${
                isSelected ? "bg-blue-50" : "hover:bg-gray-50"
              }`}>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                  isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                }`}>
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-500">{finding.reference_code}</span>
                  <span className="font-medium text-gray-900">{finding.title}</span>
                </div>
                {finding.category_name && (
                  <p className="mt-0.5 text-xs text-gray-500">{finding.category_name}</p>
                )}
              </div>
              <SeverityBadge severity={finding.severity} />
              <StatusBadge status={finding.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// COVER PAGE EDITOR COMPONENT
// ============================================================================

interface CoverPageData {
  report_title: string;
  report_date: string;
  organization: {
    name: string;
    logo_url?: string;
    tagline?: string;
  };
  author?: {
    name: string;
    certification?: string;
    title?: string;
  };
}

const CoverPageEditor = ({
  data,
  onChange
}: {
  data: string;
  onChange: (data: string) => void;
}) => {
  const parsedData: CoverPageData = useMemo(() => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch (e) {
      return {
        report_title: "",
        report_date: "",
        organization: { name: "", tagline: "" },
        author: { name: "", certification: "" }
      };
    }
  }, [data]);

  const updateField = (path: string, value: string) => {
    const newData = { ...parsedData };
    const keys = path.split(".");
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(JSON.stringify(newData));
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Logo URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={parsedData.organization.logo_url || ""}
              onChange={(e) => updateField("organization.logo_url", e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="https://..."
            />
            {parsedData.organization.logo_url && (
              <div className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 bg-white p-1">
                <img
                  src={parsedData.organization.logo_url}
                  alt="Logo Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Report Title</label>
          <input
            type="text"
            value={parsedData.report_title}
            onChange={(e) => updateField("report_title", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Report Date</label>
          <input
            type="text"
            value={parsedData.report_date}
            onChange={(e) => updateField("report_date", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Organization Details
          </h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-600">Name</label>
              <input
                type="text"
                value={parsedData.organization.name}
                onChange={(e) => updateField("organization.name", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">Tagline</label>
              <input
                type="text"
                value={parsedData.organization.tagline}
                onChange={(e) => updateField("organization.tagline", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Author Details
          </h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-600">Name</label>
              <input
                type="text"
                value={parsedData.author?.name}
                onChange={(e) => updateField("author.name", e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">Certification</label>
                <input
                  type="text"
                  value={parsedData.author?.certification}
                  onChange={(e) => updateField("author.certification", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">Job Title</label>
                <input
                  type="text"
                  value={parsedData.author?.title || ""}
                  onChange={(e) => updateField("author.title", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SECTION EDITOR COMPONENT
// ============================================================================

interface SectionEditorProps {
  section: ReportSection;
  findings?: FindingSummary[];
  isExpanded: boolean;
  onToggle: () => void;
  onHeaderChange: (header: string) => void;
  onSubHeaderChange: (subHeader: string) => void;
  onContentChange: (content: string) => void;
  onFindingsSelectionChange?: (selectedIds: string[]) => void;
  onWidgetColumnsChange?: (widgetId: string, columns: TableColumn[]) => void;
  onWidgetRowsChange?: (widgetId: string, rows: Record<string, any>[]) => void;
  onWidgetDataSourceChange?: (widgetId: string, dataSource: DataSource | null) => void;
  onWidgetDataChange?: (widgetId: string, data: any) => void;
}

const SectionEditor = ({
  section,
  findings = [],
  isExpanded,
  onToggle,
  onHeaderChange,
  onSubHeaderChange,
  onContentChange,
  onFindingsSelectionChange,
  onWidgetColumnsChange,
  onWidgetRowsChange,
  onWidgetDataSourceChange,
  onWidgetDataChange
}: SectionEditorProps) => {
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  const sectionTypeStyles: Record<SectionType, { bg: string; border: string; icon: any }> = {
    cover_page: { bg: "bg-purple-50", border: "border-purple-300", icon: FileText },
    text_only: { bg: "bg-green-50", border: "border-green-300", icon: Edit2 },
    text_with_widgets: { bg: "bg-blue-50", border: "border-blue-300", icon: PieChart },
    findings_selector: { bg: "bg-amber-50", border: "border-amber-300", icon: AlertCircle }
  };

  const style = sectionTypeStyles[section.section_type];
  const Icon = style.icon;

  // Build table rows from selected findings
  const tableRows = useMemo(() => {
    if (section.section_type !== "findings_selector") return [];
    const selectedIds = section.selected_finding_ids || [];
    return findings
      .filter((f) => selectedIds.includes(f.id))
      .map((f) => ({
        reference: f.reference_code,
        title: f.title,
        severity: f.severity,
        status: f.status,
        recommendation: "Management should address this finding."
      }));
  }, [section, findings]);

  return (
    <div id={section.section_id} className={`border-l-4 ${style.bg} ${style.border} scroll-mt-4`}>
      <button
        onClick={onToggle}
        className="hover:bg-opacity-80 flex w-full items-center justify-between px-6 py-4 transition-colors">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-gray-700" />
          <div className="text-left">
            {isEditingHeader ? (
              <input
                type="text"
                value={section.header}
                onChange={(e) => onHeaderChange(e.target.value)}
                onBlur={() => setIsEditingHeader(false)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="rounded border border-gray-300 px-2 py-1 text-lg font-semibold"
              />
            ) : (
              <h3
                className="text-lg font-semibold text-gray-900"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingHeader(true);
                }}>
                {section.header}
              </h3>
            )}
            {section.sub_header && <p className="text-sm text-gray-600">{section.sub_header}</p>}
          </div>
          <span className="bg-opacity-60 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-600">
            {section.section_type.replace("_", " ")}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 px-6 pb-6">
          {section.section_type === "cover_page" && (
            <CoverPageEditor data={section.content || "{}"} onChange={onContentChange} />
          )}

          {/* Text content for text sections */}
          {(section.section_type === "text_only" ||
            section.section_type === "text_with_widgets") && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={section.content || ""}
                onChange={(e) => onContentChange(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter section content..."
              />
            </div>
          )}

          {/* Findings Selector for findings_selector sections */}
          {section.section_type === "findings_selector" && (
            <FindingsSelector
              findings={findings}
              selectedIds={section.selected_finding_ids || []}
              onSelectionChange={onFindingsSelectionChange || (() => {})}
            />
          )}

          {/* Render Widgets */}
          {section.widgets.map((widget) => (
            <div key={widget.instance_id}>
              {widget.widget_type === "pie_chart" && (
                <PieChartWidget
                  data={widget.data as PieChartWidgetData}
                  dataSourceId={(widget.data as any).data_source_id}
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
              )}
              {widget.widget_type === "table" && (
                <ConfigurableTable
                  data={{
                    ...(widget.data as TableWidgetData),
                    rows:
                      (widget.data as any).data_source_id &&
                      (widget.data as any).data_source_id !== "findings_list"
                        ? (widget.data as TableWidgetData).rows
                        : section.section_type === "findings_selector"
                          ? tableRows
                          : (widget.data as TableWidgetData).rows
                  }}
                  dataSourceId={(widget.data as any).data_source_id}
                  onDataSourceChange={
                    onWidgetDataSourceChange
                      ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                      : undefined
                  }
                  onColumnsChange={
                    onWidgetColumnsChange
                      ? (cols) => onWidgetColumnsChange(widget.instance_id, cols)
                      : undefined
                  }
                  onRowsChange={
                    onWidgetRowsChange
                      ? (rows) => onWidgetRowsChange(widget.instance_id, rows)
                      : undefined
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ADD SECTION MODAL COMPONENT
// ============================================================================

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (section: ReportSection) => void;
  existingSectionsCount: number;
}

const AddSectionModal = ({
  isOpen,
  onClose,
  onAdd,
  existingSectionsCount
}: AddSectionModalProps) => {
  const [sectionType, setSectionType] = useState<SectionType>("text_only");
  const [header, setHeader] = useState("");
  const [subHeader, setSubHeader] = useState("");
  const [includeInToc, setIncludeInToc] = useState(true);
  const [tocLevel, setTocLevel] = useState<1 | 2 | 3>(1);
  const [addTable, setAddTable] = useState(false);
  const [addPieChart, setAddPieChart] = useState(false);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([
    { key: "column_1", header: "Column 1" },
    { key: "column_2", header: "Column 2" }
  ]);
  const [newColumnHeader, setNewColumnHeader] = useState("");

  const addColumn = () => {
    if (!newColumnHeader.trim()) return;
    const key = newColumnHeader.toLowerCase().replace(/\s+/g, "_");
    setTableColumns([...tableColumns, { key, header: newColumnHeader }]);
    setNewColumnHeader("");
  };

  const removeColumn = (key: string) => {
    setTableColumns(tableColumns.filter((c) => c.key !== key));
  };

  const handleSubmit = () => {
    if (!header.trim()) return;

    const widgets: WidgetInstance[] = [];

    if (
      sectionType === "text_with_widgets" ||
      sectionType === "findings_selector" ||
      sectionType === "cover_page"
    ) {
      if (
        addTable ||
        sectionType === "findings_selector" ||
        (sectionType === "cover_page" && addTable)
      ) {
        widgets.push({
          instance_id: `widget-table-${Date.now()}`,
          widget_type: "table",
          order: 1,
          data: {
            title: "Data Table",
            is_configurable: true,
            columns: tableColumns,
            rows: []
          } as TableWidgetData
        });
      }

      if (addPieChart) {
        widgets.push({
          instance_id: `widget-chart-${Date.now()}`,
          widget_type: "pie_chart",
          order: 2,
          data: {
            title: "Chart",
            slices: [
              { label: "Category A", value: 40, color: "#3b82f6" },
              { label: "Category B", value: 30, color: "#10b981" },
              { label: "Category C", value: 30, color: "#f59e0b" }
            ]
          } as PieChartWidgetData
        });
      }
    }

    const newSection: ReportSection = {
      section_id: `section-${Date.now()}`,
      section_type: sectionType,
      order: existingSectionsCount + 1,
      include_in_toc: includeInToc,
      toc_level: tocLevel,
      header: header.trim(),
      sub_header: subHeader.trim() || undefined,
      content: "",
      widgets,
      selected_finding_ids: sectionType === "findings_selector" ? [] : undefined
    };

    onAdd(newSection);

    // Reset form
    setSectionType("text_only");
    setHeader("");
    setSubHeader("");
    setIncludeInToc(true);
    setTocLevel(1);
    setAddTable(false);
    setAddPieChart(false);
    setTableColumns([
      { key: "column_1", header: "Column 1" },
      { key: "column_2", header: "Column 2" }
    ]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Add New Section</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Section Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Section Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  type: "cover_page" as SectionType,
                  label: "Cover Page",
                  icon: FileText,
                  desc: "Draft the report cover"
                },
                {
                  type: "text_only" as SectionType,
                  label: "Text Only",
                  icon: Edit2,
                  desc: "Simple text content"
                },
                {
                  type: "text_with_widgets" as SectionType,
                  label: "Text + Widgets",
                  icon: PieChart,
                  desc: "Text with tables/charts"
                },
                {
                  type: "findings_selector" as SectionType,
                  label: "Findings",
                  icon: AlertCircle,
                  desc: "Select findings to include"
                }
              ].map(({ type, label, icon: Icon, desc }) => (
                <button
                  key={type}
                  onClick={() => setSectionType(type)}
                  className={`rounded-lg border-2 p-4 text-left transition-colors ${
                    sectionType === type
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <Icon
                    className={`mb-2 h-5 w-5 ${sectionType === type ? "text-blue-600" : "text-gray-400"}`}
                  />
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Section Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              placeholder="e.g., Executive Summary, Recommendations..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Sub-header */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Sub-title (Optional)
            </label>
            <input
              type="text"
              value={subHeader}
              onChange={(e) => setSubHeader(e.target.value)}
              placeholder="e.g., Q4 2024 Overview..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* TOC Settings */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeInToc}
                onChange={(e) => setIncludeInToc(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">Include in Table of Contents</span>
            </label>
            {includeInToc && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Level:</span>
                <select
                  value={tocLevel}
                  onChange={(e) => setTocLevel(Number(e.target.value) as 1 | 2 | 3)}
                  className="rounded border border-gray-300 px-2 py-1 text-sm">
                  <option value={1}>1 (Main)</option>
                  <option value={2}>2 (Sub)</option>
                  <option value={3}>3 (Sub-sub)</option>
                </select>
              </div>
            )}
          </div>

          {/* Widget Options (for text_with_widgets or cover_page) */}
          {(sectionType === "text_with_widgets" || sectionType === "cover_page") && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-medium text-gray-700">Add Widgets</h4>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addTable}
                    onChange={(e) => setAddTable(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <Table2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Data Table</span>
                </label>
                {sectionType !== "cover_page" && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addPieChart}
                      onChange={(e) => setAddPieChart(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <PieChart className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Pie Chart</span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Configure Table Columns */}
          {(addTable || sectionType === "findings_selector") && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-medium text-gray-700">Configure Table Columns</h4>
              <div className="mb-3 flex flex-wrap gap-2">
                {tableColumns.map((col) => (
                  <span
                    key={col.key}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm shadow-sm">
                    {col.header}
                    <button
                      onClick={() => removeColumn(col.key)}
                      className="ml-1 text-gray-400 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColumnHeader}
                  onChange={(e) => setNewColumnHeader(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addColumn()}
                  placeholder="New column header..."
                  className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={addColumn}
                  disabled={!newColumnHeader.trim()}
                  className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!header.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AuditReportSystem = () => {
  const { session } = useSession();
  const [report, setReport] = useState<ReportContent>(INITIAL_REPORT);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "exec-summary": true
  });
  const [findings] = useState<FindingSummary[]>(MOCK_FINDINGS);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Auto-populate organization logo from session
  useEffect(() => {
    const logoToUse = session?.logo_url || "/images/infratel-logo.png";

    setReport((prev) => {
      const hasCover = prev.sections.find((s) => s.section_type === "cover_page");
      if (!hasCover) return prev;

      return {
        ...prev,
        sections: prev.sections.map((section) => {
          if (section.section_type !== "cover_page") return section;

          try {
            const content = JSON.parse(section.content || "{}");
            // Only update if it's currently a placeholder or empty
            const currentLogo = content.organization?.logo_url;
            if (
              currentLogo &&
              !currentLogo.includes("placeholder") &&
              currentLogo !== "/images/infratel-logo.png"
            ) {
              return section;
            }

            return {
              ...section,
              content: JSON.stringify({
                ...content,
                organization: {
                  ...(content.organization || {}),
                  logo_url: logoToUse
                }
              })
            };
          } catch (e) {
            return section;
          }
        })
      };
    });
  }, [session?.logo_url]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
    }
  };

  const updateSection = useCallback((sectionId: string, updates: Partial<ReportSection>) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.section_id === sectionId ? { ...s, ...updates } : s))
    }));
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.section_id !== sectionId)
    }));
  }, []);

  const addSection = useCallback((newSection: ReportSection) => {
    setReport((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setExpandedSections((prev) => ({ ...prev, [newSection.section_id]: true }));
  }, []);

  const updateWidgetColumns = useCallback(
    (sectionId: string, widgetId: string, columns: TableColumn[]) => {
      setReport((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.section_id !== sectionId) return s;
          return {
            ...s,
            widgets: s.widgets.map((w) => {
              if (w.instance_id !== widgetId) return w;
              return { ...w, data: { ...w.data, columns } };
            })
          };
        })
      }));
    },
    []
  );

  const updateWidgetRows = useCallback(
    (sectionId: string, widgetId: string, rows: Record<string, any>[]) => {
      setReport((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.section_id !== sectionId) return s;
          return {
            ...s,
            widgets: s.widgets.map((w) => {
              if (w.instance_id !== widgetId) return w;
              return { ...w, data: { ...w.data, rows } };
            })
          };
        })
      }));
    },
    []
  );

  const updateWidgetData = useCallback((sectionId: string, widgetId: string, data: any) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.section_id !== sectionId) return s;
        return {
          ...s,
          widgets: s.widgets.map((w) => {
            if (w.instance_id !== widgetId) return w;
            return { ...w, data: { ...w.data, ...data } };
          })
        };
      })
    }));
  }, []);

  const updateWidgetDataSource = useCallback(
    (sectionId: string, widgetId: string, dataSource: DataSource | null) => {
      setReport((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.section_id !== sectionId) return s;
          return {
            ...s,
            widgets: s.widgets.map((w) => {
              if (w.instance_id !== widgetId) return w;

              const newData = { ...w.data } as any;
              if (dataSource) {
                newData.data_source_id = dataSource.id;
                // Populate sample data based on widget type
                if (w.widget_type === "table") {
                  const sampleTable = dataSource.sample_data.table || dataSource.sample_data;
                  const rawColumns = sampleTable.columns || [];

                  // Ensure columns are objects { key, header }
                  newData.columns = rawColumns.map((col: any) => {
                    if (typeof col === "string") {
                      return { key: col.toLowerCase().replace(/\s+/g, "_"), header: col };
                    }
                    return col;
                  });

                  newData.rows = sampleTable.rows || [];
                } else if (w.widget_type === "pie_chart") {
                  newData.slices = dataSource.sample_data.pie_chart || [];
                }
              } else {
                delete newData.data_source_id;
              }

              return { ...w, data: newData };
            })
          };
        })
      }));
    },
    []
  );

  const exportReport = () => {
    console.log("Exporting report:", JSON.stringify(report, null, 2));
    alert("Report export functionality - see console for JSON output");
  };

  const saveReport = () => {
    console.log("Saving report:", JSON.stringify(report, null, 2));
    alert("Report saved! See console for JSON output.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - TOC */}
          <div className="col-span-3 space-y-4">
            <TableOfContents sections={report.sections} onItemClick={scrollToSection} />

            {/* Report Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Report Details</h3>
              <div className="space-y-2 text-sm">
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
            <button
              onClick={() => setShowAddSectionModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600">
              <Plus className="h-4 w-4" />
              Add Section
            </button>
          </div>

          {/* Main Content - Report Sections */}
          <div className="col-span-9">
            <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
              {report.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <SectionEditor
                    key={section.section_id}
                    section={section}
                    findings={findings}
                    isExpanded={!!expandedSections[section.section_id]}
                    onToggle={() => toggleSection(section.section_id)}
                    onHeaderChange={(header) => updateSection(section.section_id, { header })}
                    onSubHeaderChange={(sub_header) =>
                      updateSection(section.section_id, { sub_header })
                    }
                    onContentChange={(content) => updateSection(section.section_id, { content })}
                    onFindingsSelectionChange={(selectedIds) =>
                      updateSection(section.section_id, { selected_finding_ids: selectedIds })
                    }
                    onWidgetColumnsChange={(widgetId, columns) =>
                      updateWidgetColumns(section.section_id, widgetId, columns)
                    }
                    onWidgetRowsChange={(widgetId, rows) =>
                      updateWidgetRows(section.section_id, widgetId, rows)
                    }
                    onWidgetDataSourceChange={(widgetId, dataSource) =>
                      updateWidgetDataSource(section.section_id, widgetId, dataSource)
                    }
                    onWidgetDataChange={(widgetId, data) =>
                      updateWidgetData(section.section_id, widgetId, data)
                    }
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={showAddSectionModal}
        onClose={() => setShowAddSectionModal(false)}
        onAdd={addSection}
        existingSectionsCount={report.sections.length}
      />
    </div>
  );
};

export default AuditReportSystem;
