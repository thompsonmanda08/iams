"use server";

import { ReportContent, FindingSummary, DataSource } from "./types";
import { AVAILABLE_DATA_SOURCES, MOCK_FINDINGS } from "./constants";

// In a real app, these would fetch from DB
// For now, we return mock data with a slight delay to simulate network

export async function fetchInitialReport(): Promise<ReportContent> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return a fresh copy of the initial report
  // We can't import INITIAL_REPORT from page.tsx easily if it's client side or huge.
  // I will recreate a basic structure or move INITIAL_REPORT to constants/utils if needed.
  // For now, I'll return a basic structure.

  return {
    report_id: "rep-2025-001",
    organization_id: "org-001",
    report_type: "general_audit",
    title: "Internal Audit Assessment Report",
    version: "1.0",
    created_at: new Date().toISOString().split("T")[0],
    updated_at: new Date().toISOString().split("T")[0],
    management_standard: "General",
    branding: {
      primary_color: "#1a365d",
      secondary_color: "#2563eb",
      font_family: "Inter"
    },
    sections: [
      {
        section_id: "sec-cover",
        section_type: "cover_page",
        order: 0,
        header: "Cover Page",
        content: JSON.stringify({
          report_title: "Internal Audit Assessment Report",
          report_date: "January 14, 2025",
          organization: {
            name: "Infratel Corporation",
            tagline: "Secure. Reliable. Connected.",
            logo_url: "/images/infratel-logo.png"
          },
          author: {
            name: "Internal Audit Team",
            title: "Risk & Compliance",
            certification: "CIA, CISA"
          }
        }),
        include_in_toc: false,
        toc_level: 1,
        widgets: []
      },
      {
        section_id: "sec-exec-summary",
        section_type: "text_only",
        order: 1,
        header: "Executive Summary",
        sub_header: "Overview",
        content:
          "The internal audit of the Financial Systems has been completed. The overall control environment is rated as 'Satisfactory', although some improvements are required in the user access management area. Key strengths include robust backup procedures and clear segregation of duties in the payments process.",
        include_in_toc: true,
        toc_level: 1,
        widgets: []
      },
      {
        section_id: "sec-ratings",
        section_type: "text_with_widgets",
        order: 2,
        header: "Audit Ratings",
        sub_header: "Risk Distribution",
        content:
          "The following chart illustrates the distribution of risk ratings across the identified findings. The majority of issues are low or medium risk, with two high-risk findings related to access control.",
        include_in_toc: true,
        toc_level: 1,
        widgets: [
          {
            instance_id: "widget-rating-chart",
            widget_type: "pie_chart",
            order: 0,
            data: {
              title: "Findings by Severity",
              slices: [
                { label: "High", value: 2, color: "#ef4444" },
                { label: "Medium", value: 5, color: "#f59e0b" },
                { label: "Low", value: 8, color: "#10b981" }
              ]
            }
          }
        ]
      },
      {
        section_id: "sec-findings",
        section_type: "findings_selector",
        order: 3,
        header: "Detailed Findings",
        sub_header: "Observations",
        content: "",
        include_in_toc: true,
        toc_level: 1,
        selected_finding_ids: ["f-001", "f-002"],
        widgets: [
          {
            instance_id: "widget-findings-table",
            widget_type: "table",
            order: 0,
            data: {
              title: "Key Findings",
              columns: [
                { key: "reference", header: "Ref" },
                { key: "title", header: "Finding" },
                { key: "severity", header: "Severity" },
                { key: "status", header: "Status" }
              ],
              rows: [],
              data_source_id: "findings_list",
              is_configurable: true
            }
          }
        ]
      },
      {
        section_id: "sec-conclusion",
        section_type: "text_only",
        order: 4,
        header: "Conclusion",
        sub_header: "Final Remarks",
        content:
          "Management has agreed to the recommendations and a follow-up audit will be scheduled for Q2 2025.",
        include_in_toc: true,
        toc_level: 1,
        widgets: []
      }
    ]
  };
}

export async function fetchFindings(auditPlanId?: string): Promise<FindingSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_FINDINGS;
}

export async function fetchDataSources(): Promise<DataSource[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return AVAILABLE_DATA_SOURCES;
}

export async function saveReport(report: ReportContent): Promise<{ success: boolean; id: string }> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log("Server Action: Saving report", report.title);
  return { success: true, id: report.report_id };
}
