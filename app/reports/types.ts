
export type ReportType = "general_audit" | "compliance_audit" | "risk" | "followup";
export type SectionType =
  | "cover_page"
  | "text_only"
  | "text_with_widgets"
  | "findings_selector"
  | "compliance_findings"
  | "dynamic_form";
export type WidgetType = "table" | "pie_chart" | "bar_chart" | "line_chart" | "text_block";

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

export interface WidgetInstance {
  instance_id: string;
  widget_type: WidgetType;
  order: number;
  data: TableWidgetData | PieChartWidgetData;
}

export interface FindingSummary {
  id: string;
  reference_code: string; // Maps to finding_number
  title: string; // Maps to category_name or a custom title field
  severity: "critical" | "high" | "medium" | "low";
  status: string; // "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  category_name?: string;
  is_selected: boolean; // Frontend state for report selection

  // ISO 27001 / Compliance fields
  clause_number?: string; // Primary field from workpapers (e.g., "9.2.1")
  clause?: string; // Alias for clause_number for backward compatibility
  clause_description?: string;
  finding_type?: "Conformity" | "Minor Non-Conformity" | "Major Non-Conformity" | "OFI";
  observation?: string; // Maps to workings_and_test_results or conclusion

  // Additional workpaper fields
  recommendation?: string | null;
  management_response?: string | null;
  action_plan?: string | null;
  responsible_person?: string | null;
  due_date?: string | null;

  // Conformity assessment
  conformity_status?: "CONFORMITY" | "NON_CONFORMITY" | "PARTIAL_CONFORMITY" | null;
  is_conformity?: boolean;
  compliance_status?: string;
  compliance_percentage?: number;

  // Evidence
  evidence_links?: string | null;
  evidence_summary?: string | null;

  // Framework info
  framework?: string; // ISO27001, COSO, COBIT, NIST, GENERAL, CUSTOM

  // Category relationship (from workpaper)
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

  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ReportSection {
  section_id: string;
  section_type: SectionType;
  order: number;
  include_in_toc: boolean;
  toc_level: 1 | 2 | 3;
  header: string;
  sub_header?: string;
  content?: string; // Legacy/Text content
  widgets: WidgetInstance[];
  selected_finding_ids?: string[];

  // New for Phase 2: Dynamic Forms
  fields?: ReportField[]; // The schema for the form
  field_values?: DynamicSectionData; // The actual user input
}

export interface ReportBranding {
  primary_color: string;
  secondary_color: string;
  font_family: string;
}

export interface ReportContent {
  report_id: string;
  organization_id: string;
  report_type: ReportType;
  title: string;
  version: string;
  created_at: string;
  updated_at: string;
  branding: ReportBranding;
  sections: ReportSection[];
  management_standard?: string;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  category: "audit" | "risk" | "compliance" | "custom";
  compatible_widgets: WidgetType[];
  requires_entity: boolean;
  sample_data: any;
}

// ============================================================================
// DYNAMIC FORM FIELD DEFINITIONS (Phase 2)
// ============================================================================

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
  options?: ReportFieldOption[]; // For select, radio
  defaultValue?: any;
  validationRegex?: string;
  helperText?: string;
}

/**
 * Defines the structure of a dynamic form section
 * Not the content itself, but the schema.
 */
export interface DynamicSectionSchema {
  fields: ReportField[];
}

/**
 * The content stored for a dynamic section
 * Maps field IDs to their values.
 */
export interface DynamicSectionData {
  [fieldId: string]: any;
}
