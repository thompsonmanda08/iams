import type { ReportSection, SectionType, ReportType } from "@/lib/types/report-types";

export type ReportTemplateType = "GENERAL" | "ISO 27001" | "COSO" | "COBIT" | "NISIT" | "RISK ASSESSMENT" | "FOLLOW-UP";

export interface ReportTemplate {
  name: string;
  type: ReportType;
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
        order: 0,
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
          order: 0,
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
    // In your template file (templates.ts or similar), update the section creation:

createSection("exec_summary", "text_with_widgets",
   2, "Executive Summary",
    "Risk Profile Overview", "",
[
  {
    instance_id: "risk_dashboard_appetite_bar",
    widget_type: "bar_chart",
    order: 0,
    data: {
      title: "Risk Dashboard - Against Appetite",
      categories: [],
      series: [],
      orientation: "horizontal",
      show_values: true,
      data_source_id: "risks_by_appetitie_status"
    }
  },
   {
          instance_id: "corporate_risk",
          widget_type: "pie_chart",
          order: 1,
          data: {
            title: "Corporate Risk Profile - April 2025",
            slices: [],
            data_source_id: "risks_by_corporate_profile"
          }
        },
   {
          instance_id: "closure_status",
          widget_type: "pie_chart",
          order: 2,
          data: {
            title: "Closure Status",
            slices: [],
            data_source_id: "risks_by_closure_status"
          }
        },
    {
    instance_id: "risks_by_department_distribution",
    widget_type: "bar_chart",
    order: 0,
    data: {
      title: "Risk Distribution by Department",
      categories: [],
      series: [],
      orientation: "horizontal",
      show_values: true,
      data_source_id: "risks_by_department_distribution"
    }
  },
]
),
createSection("strategic_objective", "text_only", 3, "INFRATEL Strategic Objective", "Risk Strategic Objective"),
 createSection("mapping_strategic_objective", "text_with_widgets",
   4, "Mapping Of Key Risks Against Strategic Objectives",
    "Strategic risks and Objectives", "",
[
  {
    instance_id: "map_risks_table_to_strategic_objective",
    widget_type: "risk_objective_mapping",
    order: 0,
    data: {
      title: "Mapping Of Key Risks Against Strategic Objectives",
      subtitle: "Strategic risks and Objectives",
    
    
    objectives: [
      { id: "so-1", label: "Strategic Objective 1", shortLabel: "SO1" },
      { id: "so-2", label: "Strategic Objective 2", shortLabel: "SO2" },
      { id: "so-3", label: "Strategic Objective 3", shortLabel: "SO3" },
      { id: "so-4", label: "Strategic Objective 4", shortLabel: "SO4" }
    ],
    risks: [
      {
        id: "risk-1",
        number: 1,
        description: "Cybersecurity threats and data breaches",
        mappedObjectives: ["so-1", "so-3"]
      },
      {
        id: "risk-2",
        number: 2,
        description: "Regulatory compliance and legal risks",
        mappedObjectives: ["so-2", "so-4"]
      },
      {
        id: "risk-3",
        number: 3,
        description: "Supply chain disruptions",
        mappedObjectives: ["so-1", "so-2", "so-3"]
      },
      {
        id: "risk-4",
        number: 4,
        description: "Market competition and technological changes",
        mappedObjectives: ["so-1", "so-4"]
      },
      {
        id: "risk-5",
        number: 5,
        description: "Talent retention and workforce challenges",
        mappedObjectives: ["so-2", "so-3"]
      }
    ],
    data_source_id: "map_risks_table_to_objective",
    }
  }
]
),
    createSection(
      "risk_charts",
      "text_with_widgets",
      5,
      "Risks Dashboard",
      "Shows a summary of the risk profile above the set risk appetite of INFRATEL Corporation.",
      "Breakdown of risks by severity and category.",
      [
         {
          instance_id: "top_risks_table",
          widget_type: "table",
          order: 0,
          data: {
            title: "Risks Above Appetite",
            columns: [
              { key: "Risk Category", header: "Risk" },
              { key: "SN", header: "SN" },
              { key: "Key Risk", header: "Key" },
              { key: "Mitigation", header: "Mitigation" },
              { key: "Dept's Risk Register", header: "Register" },
              { key: "Status", header: "Status" },
              { key: "Inherent Risk", header: "Inherent" },
              { key: "Residual Risk", header: "Residual" },
              { key: "Risk Magnitude Rating", header: "Rating" },
              { key: "Risk Appetite", header: "Appetite" },
              { key: "Implementation Timeline", header: "Timeline" },
              { key: "Executive Ownership", header: "Owner" },
            ],
            rows: [],
            data_source_id: "risks_above_appetite"
          }
        }
      ]
    ),
    createSection(
      "risk_register",
      "text_with_widgets",
      6,
      "Summary Of Detailed Risk Registers",
      "Detailed Risk Register",
      "Risks requiring immediate management attention.",
      [
        {
          instance_id: "top_risks_table",
          widget_type: "table",
          order: 0,
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
    createSection("conclusion", "text_only", 7, "Conclusion", "Final Remarks")
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
        order: 0,
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
          order: 0,
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
  GENERAL: GENERAL_AUDIT_TEMPLATE,
  "ISO 27001": ISO_AUDIT_TEMPLATE,
  COSO: ISO_AUDIT_TEMPLATE,
  COBIT: ISO_AUDIT_TEMPLATE,
  NISIT: ISO_AUDIT_TEMPLATE,
  "RISK ASSESSMENT": RISK_REPORT_TEMPLATE,
  "FOLLOW-UP": FOLLOW_UP_TEMPLATE
};

/**
 * Normalize a management standard string to match a template key.
 * Handles variations like "ISO/IEC 27001:2022" -> "ISO 27001"
 */
export function normalizeManagementStandard(standard: string | undefined | null): string {
  if (!standard) return "GENERAL";

  const upperStandard = standard.toUpperCase();

  // Check for ISO variants (ISO 27001, ISO/IEC 27001:2022, etc.)
  if (upperStandard.startsWith("ISO")) {
    return "ISO 27001";
  }

  // Return uppercase version for other standards
  return upperStandard;
}

/**
 * Get the appropriate report template for a given management standard.
 * Falls back to GENERAL template if not found.
 */
export function getTemplateForStandard(standard: string | undefined | null): ReportTemplate {
  const normalizedKey = normalizeManagementStandard(standard);
  return REPORT_TEMPLATES[normalizedKey] || REPORT_TEMPLATES["GENERAL"];
}
