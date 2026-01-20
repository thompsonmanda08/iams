"use client";

import { useEffect } from "react";
import { useReportStore } from "@/store/report-store";
import {
  ReportBuilder,
  type ReportEntity,
  type ReportEntityType
} from "@/components/reports/report-builder";
import type { ReportContent, ReportStatus } from "@/lib/types/report-types";
import { mergeReportWithTemplate } from "@/lib/config/report-template-merger";

interface ReportDetailsClientProps {
  reportId: string;
  initialReport: ReportContent;
  reportStatus: ReportStatus;
  entity: ReportEntity;
  entityType: ReportEntityType;
}

export function ReportDetailsClient({
  reportId,
  initialReport,
  reportStatus,
  entity,
  entityType
}: ReportDetailsClientProps) {
  const { setReport, setEntityId, setEntityType } = useReportStore();

  // Initialize the store with intelligently merged report data
  useEffect(() => {
    if (initialReport) {
      // Use the smart template merger to preserve user edits while filling gaps
      const mergedReport = mergeReportWithTemplate(initialReport, entity.management_standard, {
        id: reportId, // Use the actual database report ID from the URL
        title: initialReport.title,
        created_at: initialReport.created_at,
        updated_at: initialReport.updated_at,
        status: reportStatus // Use the actual report status from the database record
      });

      // Ensure the report_id and status are set correctly from the database
      mergedReport.report_id = reportId;
      mergedReport.status = reportStatus;

      setReport(mergedReport);

      // Set the entity ID and type in the store
      if (entity.id) {
        setEntityId(entity.id);
        setEntityType(entityType);
      }
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
    setEntityType
  ]);

  // Show ReportBuilder with read-only type since entity is already determined
  return <ReportBuilder entity={entity} entityType={entityType} readOnlyType />;
}
