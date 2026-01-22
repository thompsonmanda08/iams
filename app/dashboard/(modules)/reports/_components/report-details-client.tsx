"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useReportStore } from "@/store/report-store";
import {
  ReportBuilder,
  type ReportEntity,
  type ReportEntityType
} from "@/components/reports/report-builder";
import type { ReportContent, ReportStatus } from "@/lib/types/report-types";
import { mergeReportWithTemplate } from "@/lib/config/report-template-merger";
import { getDataSourceData } from "@/app/_actions/reports-actions";
import { populateRiskWidgets } from "@/lib/utils/report-utils";

interface ReportDetailsClientProps {
  reportId: string;
  initialReport: ReportContent;
  reportStatus: ReportStatus;
  entity: ReportEntity;
  entityType: ReportEntityType;
}

// Custom hook to fetch risk widget data
const useRiskWidgetData = (entityId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: ["riskWidgetData", entityId],
    queryFn: async () => {
      console.log("Fetching risk data sources for widget population...");
      console.log("Entity ID:", entityId);

      const [appetiteRes, closureRes, profileRes, departmentRes] = await Promise.all([
        getDataSourceData("risks_by_appetitie_status", "bar_chart"),
        getDataSourceData("risks_by_closure_status", "pie_chart"),
        getDataSourceData("risks_by_corporate_profile", "pie_chart"),
        getDataSourceData("risks_by_department_distribution", "bar_chart")
      ]);

      console.log("Risk widget data sources fetched:", {
        appetiteRes,
        closureRes,
        profileRes,
        departmentRes
      });

      // Check if all requests were successful
      if (
        !appetiteRes.success ||
        !closureRes.success ||
        !profileRes.success ||
        !departmentRes.success
      ) {
        console.warn("Failed to fetch some risk data sources");
        throw new Error("Failed to fetch some risk data sources");
      }

      return { appetiteRes, closureRes, profileRes, departmentRes };
    },
    enabled: enabled && !!entityId,
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export function ReportDetailsClient({
  reportId,
  initialReport,
  reportStatus,
  entity,
  entityType
}: ReportDetailsClientProps) {
  const { setReport, setEntityId, setEntityType } = useReportStore();

  // Fetch risk widget data if this is a risk report
  const isRiskReport = initialReport?.report_type === "risk";
  const { data: riskData, isLoading } = useRiskWidgetData(entity.id, isRiskReport);

  // Initialize the store with merged report and populate widgets
  useEffect(() => {
    if (!initialReport) return;

    // Use the smart template merger to preserve user edits while filling gaps
    let mergedReport = mergeReportWithTemplate(initialReport, entity.management_standard, {
      id: reportId,
      title: initialReport.title,
      created_at: initialReport.created_at,
      updated_at: initialReport.updated_at,
      status: reportStatus
    });

    // Ensure the report_id and status are set correctly from the database
    mergedReport.report_id = reportId;
    mergedReport.status = reportStatus;

    // Populate risk widgets if we have the data
    if (isRiskReport && riskData) {
      try {
        const widgetDataMap = {
          risk_dashboard_appetite_bar: {
            sectionId: "exec_summary",
            type: "bar_chart" as const,
            data: riskData.appetiteRes.data
          },
          closure_status: {
            sectionId: "exec_summary",
            type: "pie_chart" as const,
            data: riskData.closureRes.data
          },
          corporate_risk: {
            sectionId: "exec_summary",
            type: "pie_chart" as const,
            data: riskData.profileRes.data
          },
          risks_by_department_distribution: {
            sectionId: "exec_summary",
            type: "bar_chart" as const,
            data: riskData.departmentRes.data
          }
        };

        const updatedSections = populateRiskWidgets(mergedReport.sections || [], widgetDataMap);
        mergedReport.sections = updatedSections;

        console.log("Risk widgets populated successfully");
      } catch (error) {
        console.error("Error populating risk widgets:", error);
        // Continue with unmodified report if population fails
      }
    }

    setReport(mergedReport);

    // Set the entity ID and type in the store
    if (entity.id) {
      setEntityId(entity.id);
      setEntityType(entityType);
    }
  }, [
    reportId,
    reportStatus,
    initialReport,
    entity.id,
    entity.management_standard,
    entityType,
    setReport,
    setEntityId,
    setEntityType,
    isRiskReport,
    riskData
  ]);

  // Show ReportBuilder with read-only type since entity is already determined
  return <ReportBuilder entity={entity} entityType={entityType} readOnlyType />;
}
