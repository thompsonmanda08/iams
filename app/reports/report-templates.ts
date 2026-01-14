import { ReportSection, SectionType, ReportType } from "./types";

// Re-defining structures using new types
export type ReportTemplateType = "General" | "ISO 27001" | "Risk Assessment" | "Follow-up";

export interface ReportTemplate {
  name: string;
  type: ReportType; // Changed from ReportTemplateType to ReportType for consistency with system
  description: string;
  default_sections: ReportSection[];
}

const createSection = (
  id: string,
  type: SectionType,
  order: number,
  header: string,
  sub_header?: string,
  content: string = "",
  widgets: any[] = [],
  fields: any[] = []
): ReportSection => ({
  section_id: id,
  section_type: type,
  order,
  header,
  sub_header,
  content,
  widgets,
  fields,
  field_values: fields.length > 0 ? {} : undefined,
  include_in_toc: type !== "cover_page",
  toc_level: 1
});

// 1. General Internal Audit Template
export const GENERAL_AUDIT_TEMPLATE: ReportTemplate = {
  name: "General Internal Audit",
  type: "general_audit",
  description: "Standard internal audit report with executive summary and findings.",
  default_sections: [
    createSection("cover", "cover_page", 1, "Cover Page"),
    createSection("exec_summary", "text_only", 2, "Executive Summary", "Overview"),
    createSection("background", "text_only", 3, "Introduction", "Background & Context"),
    createSection("objectives", "text_only", 4, "Audit Objectives", "Scope & Goals"),
    createSection("methodology", "text_only", 5, "Methodology", "Approach"),
    createSection("findings", "findings_selector", 6, "Detailed Findings", "Observations", "", [
      {
        instance_id: "findings_table",
        widget_type: "table",
        data: {
          title: "Audit Observations",
          columns: [
            { key: "reference", header: "Ref" },
            { key: "title", header: "Finding" },
            { key: "severity", header: "Severity" },
            { key: "status", header: "Status" },
            { key: "recommendation", header: "Recommendation" }
          ],
          rows: [],
          data_source_id: "findings_list"
        }
      }
    ]),
    createSection("conclusion", "text_only", 7, "Conclusion", "Final Remarks")
  ]
};

// 2. ISO 27001 Compliance Template
export const ISO_AUDIT_TEMPLATE: ReportTemplate = {
  name: "ISO 27001 Compliance Report",
  type: "compliance_audit",
  description: "Compliance report focused on ISO 27001 conformities and non-conformities.",
  default_sections: [
    createSection("cover", "cover_page", 1, "Cover Page"),
    createSection("exec_summary", "text_only", 2, "Executive Summary", "Compliance Status"),
    createSection("scope", "text_only", 3, "Audit Scope", "ISMS Scope"),
    createSection(
      "compliance_summary",
      "text_with_widgets",
      4,
      "Compliance Overview",
      "Dashboard",
      "",
      [
        {
          instance_id: "compliance_chart",
          widget_type: "pie_chart",
          data: {
            title: "Control Compliance Status",
            slices: [],
            data_source_id: "control_compliance"
          }
        }
      ]
    ),
    createSection(
      "iso_findings",
      "compliance_findings",
      5,
      "Compliance Findings",
      "Conformities & NCs"
    ),
    createSection("recommendations", "text_only", 6, "Recommendations", "Corrective Actions")
  ]
};

// 3. Risk Assessment Report
export const RISK_REPORT_TEMPLATE: ReportTemplate = {
  name: "Risk Assessment Report",
  type: "risk",
  description: "Report focusing on risk profiles, ratings, and treatment plans.",
  default_sections: [
    createSection("cover", "cover_page", 1, "Risk Report"),
    createSection("exec_summary", "text_only", 2, "Executive Summary", "Risk Profile Overview"),
    createSection(
      "risk_charts",
      "text_with_widgets",
      3,
      "Risk Analysis",
      "Visual Distribution",
      "Breakdown of risks by severity and category.",
      [
        {
          instance_id: "risk_severity_chart",
          widget_type: "pie_chart",
          data: {
            title: "Risks by Severity",
            slices: [],
            data_source_id: "risks_by_rating"
          }
        }
      ]
    ),
    createSection(
      "risk_register",
      "text_with_widgets",
      4,
      "Key Risks",
      "Above Appetite",
      "Risks requiring immediate management attention.",
      [
        {
          instance_id: "top_risks_table",
          widget_type: "table",
          data: {
            title: "Risks Above Appetite",
            columns: [
              { key: "Risk Title", header: "Risk" },
              { key: "Residual Score", header: "Score" },
              { key: "Risk Owner", header: "Owner" },
              { key: "Treatment Status", header: "Treatment" }
            ],
            rows: [],
            data_source_id: "risks_above_appetite"
          }
        }
      ]
    ),
    createSection("mitigation", "text_only", 5, "Mitigation Strategy", "Treatment Plan")
  ]
};

// 4. Audit Follow-up Log
export const FOLLOW_UP_TEMPLATE: ReportTemplate = {
  name: "Audit Follow-up Log",
  type: "followup",
  description: "Log of previous audit findings and their current closure status.",
  default_sections: [
    createSection("cover", "cover_page", 1, "Follow-up Log"),
    createSection("status_summary", "text_with_widgets", 2, "Status Overview", "Progress", "", [
      {
        instance_id: "status_pie_chart",
        widget_type: "pie_chart",
        data: {
          title: "Findings Closure Status",
          slices: [],
          data_source_id: "findings_by_status"
        }
      }
    ]),
    createSection(
      "open_findings",
      "text_with_widgets",
      3,
      "Open Findings Details",
      "Outstanding Items",
      "The following findings remain open or in progress.",
      [
        {
          instance_id: "followup_table",
          widget_type: "table",
          data: {
            title: "Follow-up Log",
            columns: [
              { key: "reference", header: "Ref" },
              { key: "title", header: "Finding" },
              { key: "status", header: "Current Status" },
              { key: "management_comment", header: "Management Update" }
            ],
            rows: [],
            data_source_id: "findings_list"
          }
        }
      ]
    ),
    createSection("conclusion", "text_only", 4, "Closure Statement", "Verification")
  ]
};

export const REPORT_TEMPLATES: Record<string, ReportTemplate> = {
  General: GENERAL_AUDIT_TEMPLATE,
  "ISO 27001": ISO_AUDIT_TEMPLATE,
  "Risk Assessment": RISK_REPORT_TEMPLATE,
  "Follow-up": FOLLOW_UP_TEMPLATE
};
