// Report Types - Shared across the application

import { StandardStatus } from "../statuses";

export type ReportType = "general_audit" | "compliance_audit" | "risk" | "followup";
export type ReportStatus = StandardStatus | "PUBLISHED" | "ARCHIVED";
export type SectionType =
  | "cover_page"
  | "text_only"
  | "text_with_widgets"
  | "findings_selector"
  | "compliance_findings"
  | "dynamic_form";
export type WidgetType =
  | "table"
  | "pie_chart"
  | "bar_chart"
  | "line_chart"
  | "area_chart"
  | "metric_card"
  | "text_block"
  | "risk_objective_mapping";

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
}

export interface TableWidgetData {
  title: string;
  columns: TableColumn[];
  rows: Record<string, any>[];
  is_configurable?: boolean;
  data_source_id?: string;
  is_manual_override?: boolean;
}

export interface PieChartSlice {
  label: string;
  value: number;
  color: string;
}

export interface PieChartWidgetData {
  title: string;
  slices: PieChartSlice[];
  data_source_id?: string;
}

export interface BarChartCategory {
  label: string;
  series: {
    label: string;
    value: number;
    color: string;
  }[];
}

export interface BarChartWidgetData {
  title: string;
  categories: BarChartCategory[];
  orientation: "horizontal" | "vertical";
  show_values: boolean;
  data_source_id?: string;
}

export interface WidgetInstance {
  instance_id: string;
  widget_type: WidgetType;
  order: number;
  data: TableWidgetData | PieChartWidgetData | BarChartWidgetData | any;
}

export interface FindingSummary {
  id: string;
  reference_code: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: string;
  category_name?: string;
  is_selected: boolean;
  clause_number?: string;
  clause?: string;
  clause_description?: string;
  observation?: string;
  recommendation?: string | null;
  management_response?: string | null;
  action_plan?: string | null;
  responsible_person?: string | null;
  due_date?: string | null;
  conformity_status?: "CONFORMITY" | "NON_CONFORMITY" | "PARTIAL_CONFORMITY" | null;
  is_conformity?: boolean;
  compliance_status?: string;
  compliance_percentage?: number;
  evidence_links?: string | null;
  evidence_summary?: string | null;
  framework?: string;
  category?: {
    id: string;
    working_paper_id: string;
    template_category_id: string;
    name: string;
    sort_order: number;
    organization_id: string | null;
    clause?: string;
    description?: string;
  };
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

/** General finding as returned from the general workpaper findings API */
export interface GeneralFindingSummary {
  id: string;
  columns: { key: string; value: any }[];
  keys: { key: string; value: any }[];
  audit_observation?: string;
  audit_comments?: string;
  evidence?: string;
  status: string;
  created_at?: string;
}

/** Config describing the dynamic column/key structure for general findings */
export interface GeneralFindingsConfig {
  columns: { key: string; name: string; type: string; description?: string }[];
  keys: { key: string; name: string; type: string; description?: string }[];
}

export interface ReportSection {
  section_id: string;
  section_type: SectionType;
  order: number;
  include_in_toc: boolean;
  toc_level: 1 | 2 | 3;
  header: string;
  sub_header?: string;
  /** Render sub_header in the PDF / preview. Defaults to true when sub_header is set. */
  show_sub_header?: boolean;
  content?: string;
  widgets: WidgetInstance[];
  selected_finding_ids?: string[];
  fields?: ReportField[];
  field_values?: DynamicSectionData;
  parent_section_id?: string | null;
  /** Page orientation for PDF rendering. undefined = auto-detect from content. */
  page_orientation?: "portrait" | "landscape";
}

export interface SectionTreeNode extends ReportSection {
  children: SectionTreeNode[];
  depth: number;
}

export interface ReportBranding {
  primary_color: string;
  secondary_color: string;
  font_family: string;
}

// Entity type for reports (determines which entity the report is linked to)
export type ReportEntityType = "audit_plan" | "risk_register" | "followup" | "compliance";

export interface ReportUserRef {
  user_id: string;
  name: string;
  email: string;
  role?: string;
}

export interface ReportContent {
  report_id: string;
  report_type: ReportType;
  title: string;
  version: string;
  status?: ReportStatus;
  management_standard?: string;
  branding: ReportBranding;
  sections: ReportSection[];
  created_at?: string;
  updated_at?: string;
  created_by?: ReportUserRef;
  updated_by?: ReportUserRef;
}

/**
 * Full report record returned from API endpoints (getReport, getReports)
 * This is the complete report entity including entity references stored in DB
 */
export interface ReportRecord {
  id: string;
  title: string;
  report_type: ReportType;
  entity_type: ReportEntityType;
  entity_id: string;
  report_content?: ReportContent;
  status?: ReportStatus;
  description?: string;
  pdf_url?: string;
  /** Report content with sections, branding, etc. */
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  created_by_user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  category: "audit" | "risk" | "compliance" | "custom";
  compatible_widgets: WidgetType[];
  requires_entity: boolean;
  entity_type?: "audit_plan" | "risk_register";
  sample_data: any;
}

// Dynamic Form Field Definitions
export type ReportFieldType =
  | "text"
  | "textarea"
  | "date"
  | "select"
  | "checkbox"
  | "radio"
  | "number";

export interface ReportFieldOption {
  label: string;
  value: string | number;
}

export interface ReportField {
  id: string;
  name: string;
  label: string;
  type: ReportFieldType;
  required: boolean;
  placeholder?: string;
  options?: ReportFieldOption[];
  defaultValue?: any;
  validationRegex?: string;
  helperText?: string;
}

export interface DynamicSectionSchema {
  fields: ReportField[];
}

export interface DynamicSectionData {
  [fieldId: string]: any;
}

// API Response types for reports
export interface ReportListItem {
  id: string;
  report_id: string;
  title: string;
  report_type: ReportType;
  status: ReportStatus;
  version: string;
  created_at: string;
  updated_at: string;

  created_by?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  updated_by?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  // Entity reference
  entity_id: string;
  entity_type: ReportEntityType;
  // Related entity details (populated by backend joins)
  entity?: {
    id: string;
    title: string;
    ref_no?: string;
  };
}

export interface ReportsPaginatedResponse {
  data: ReportListItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
