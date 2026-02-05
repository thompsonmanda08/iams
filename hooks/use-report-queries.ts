"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useReportStore } from "@/store/report-store";
import {
  fetchInitialReport,
  fetchFindingsForReport,
  getDataSources,
  saveReport as saveReportAction,
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  publishReport,
  fetchWidgetData as fetchWidgetDataAction,
  getReportByEntityId
} from "@/app/_actions/reports-actions";
import type { ReportContent, ReportEntityType, ReportRecord } from "@/lib/types/report-types";
import { QUERY_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import { en } from "zod/v4/locales";

// Extend QUERY_KEYS if not already present
const REPORT_QUERY_KEYS = {
  ...QUERY_KEYS,
  REPORTS: "reports",
  REPORT: "report",
  REPORT_FINDINGS: "report-findings",
  REPORT_DATA_SOURCES: "report-data-sources",
  WIDGET_DATA: "widget-data"
};

/**
 * Hook to fetch and sync report data with the store
 * Used for the Report Builder component
 */
export function useReportFetching(entityId?: string, entityType?: ReportEntityType) {
  const queryClient = useQueryClient();
  const { setFindings, setDataSources, setLoading, setEntityId, setEntityType } = useReportStore();

  // Set entity ID and type in store
  useEffect(() => {
    if (entityId && entityType) {
      setEntityId(entityId);
      setEntityType(entityType);
    }
  }, [entityId, entityType, setEntityId, setEntityType]);

  // Fetch initial report
  const { isLoading: isReportLoading, refetch: refetchReport } = useQuery({
    queryKey: [REPORT_QUERY_KEYS.REPORT, "initial", entityId, entityType],
    queryFn: async () => {
      if (!entityId || !entityType) return null;
      const result = await fetchInitialReport(entityId, entityType);
      return result.success ? result.data : null;
    },
    enabled: !!entityId && !!entityType
  });

  // Fetch findings for the entity (only for audit plans)
  const { data: findingsResult, isLoading: isFindingsLoading } = useQuery({
    queryKey: [REPORT_QUERY_KEYS.REPORT_FINDINGS, entityId, entityType],
    queryFn: async () => {
      // Only fetch findings for audit plans
      if (entityType !== "audit_plan") return [];
      const result = await fetchFindingsForReport(entityId);
      return result.success ? result.data : [];
    },
    enabled: entityType === "audit_plan" && !!entityId
  });

  // Fetch data sources
  const { data: dataSourcesResult, isLoading: isDataSourcesLoading } = useQuery({
    queryKey: [REPORT_QUERY_KEYS.REPORT_DATA_SOURCES],
    queryFn: async () => {
      const result = await getDataSources();
      return result.success ? result.data : [];
    }
  });

  // NOTE: Report initialization is handled by parent components
  // (ReportDetailsClient or AuditPlanReportTab) which perform template merging.
  // Do NOT sync reportResult to the store here — it would overwrite the
  // properly merged report with the raw API record (no sections at top level).

  useEffect(() => {
    if (findingsResult) setFindings(findingsResult);
  }, [findingsResult, setFindings]);

  useEffect(() => {
    if (dataSourcesResult) setDataSources(dataSourcesResult);
  }, [dataSourcesResult, setDataSources]);

  useEffect(() => {
    setLoading(isReportLoading || isFindingsLoading || isDataSourcesLoading);
  }, [isReportLoading, isFindingsLoading, isDataSourcesLoading, setLoading]);

  // Save mutation - now passes entityId and entityType separately since they're not in ReportContent
  const saveMutation = useMutation({
    mutationFn: async (report: ReportContent) => {
      const saveReportData = {
        id: report.report_id || "",
        title: report.title,
        report_type: report.report_type,
        entity_id: entityId as string,
        entity_type: entityType as ReportEntityType,
        report_content: report,

        // Include management_standard at the top level for easier access
        management_standard: report.management_standard
      };

      console.log("Saving report:", saveReportData);

      const result = await saveReportAction(
        saveReportData,
        entityId || undefined,
        entityType || undefined
      );
      if (!result.success) {
        throw new Error(result.message || "Failed to save report");
      }
      return result.data;
    },
    onSuccess: (_data, variables) => {
      toast.success("Report saved successfully!");
      // Invalidate all report queries
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT] });
      // Invalidate specific report query
      if (variables.report_id) {
        queryClient.invalidateQueries({
          queryKey: [REPORT_QUERY_KEYS.REPORT, variables.report_id]
        });
      }
      // Invalidate entity-specific report query
      if (entityId && entityType) {
        queryClient.invalidateQueries({
          queryKey: [REPORT_QUERY_KEYS.REPORT, "entity", entityId, entityType]
        });
      }
      // Refetch the current report
      refetchReport();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save report");
    }
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const result = await publishReport(reportId);
      if (!result.success) {
        throw new Error(result.message || "Failed to submit report");
      }
      return result.data;
    },
    onSuccess: (_data, reportId) => {
      toast.success("Report submitted successfully!");
      // Invalidate all report queries
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT] });
      // Invalidate specific report query
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, reportId] });
      // Invalidate entity-specific report query
      if (entityId && entityType) {
        queryClient.invalidateQueries({
          queryKey: [REPORT_QUERY_KEYS.REPORT, "entity", entityId, entityType]
        });
      }
      // Refetch the current report
      refetchReport();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit report");
    }
  });

  return {
    isLoading: isReportLoading || isFindingsLoading || isDataSourcesLoading,
    saveReport: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    publishReport: publishMutation.mutate,
    isPublishing: publishMutation.isPending,
    refetchReport
  };
}

/**
 * Hook to fetch all reports with pagination
 */
export function useReportsList(params: {
  page?: number;
  pageSize?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  entityId?: string;
  entityType?: ReportEntityType;
}) {
  return useQuery({
    queryKey: [REPORT_QUERY_KEYS.REPORTS, params],
    queryFn: async () => {
      const result = await getReports({
        page: params.page || 1,
        page_size: params.pageSize || 10,
        status: params.status,
        entity_id: params.entityId,
        entity_type: params.entityType
      });
      return result.success ? result.data : { data: [], pagination: { total: 0 } };
    }
  });
}

/**
 * Hook to fetch a single report by ID
 */
export function useReport(reportId: string | null) {
  return useQuery({
    queryKey: [REPORT_QUERY_KEYS.REPORT, reportId],
    queryFn: async () => {
      if (!reportId) return null;
      const result = await getReport(reportId);
      return result.success ? result.data : null;
    },
    enabled: !!reportId
  });
}

/**
 * Hook to fetch a report by entity ID and type
 * Returns the first report associated with the given entity
 */
export function useReportByEntityId(
  entityId: string | null | undefined,
  entityType: ReportEntityType
) {
  return useQuery({
    queryKey: [REPORT_QUERY_KEYS.REPORT, "entity", entityId, entityType],
    queryFn: async () => {
      if (!entityId) return null;
      const result = await getReportByEntityId(entityId, entityType);
      return result.success ? result.data : null;
    },
    enabled: !!entityId
  });
}

/**
 * Hook for report mutations (create, update, delete)
 */
export function useReportMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (params: {
      title: string;
      reportType: "general_audit" | "compliance_audit" | "risk" | "followup";
      managementStandard?: string;
      entityId: string;
      entityType: ReportEntityType;
    }) => {
      // Build report_content with management_standard if provided
      const reportContent: Partial<ReportContent> = {};
      if (params.managementStandard) {
        reportContent.management_standard = params.managementStandard;
      }

      const result = await createReport({
        title: params.title,
        report_type: params.reportType,
        report_content: reportContent,
        entity_id: params.entityId,
        entity_type: params.entityType
      });
      if (!result.success) {
        throw new Error(result.message || "Failed to create report");
      }
      return result.data as ReportRecord;
    },
    onSuccess: (_data, variables) => {
      toast.success("Report created successfully!");
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
      // Invalidate specific entity report queries
      queryClient.invalidateQueries({
        queryKey: [REPORT_QUERY_KEYS.REPORT, "entity", variables.entityId, variables.entityType]
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create report");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ reportId, data }: { reportId: string; data: Partial<ReportContent> }) => {
      const result = await updateReport(reportId, data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update report");
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Report updated successfully!");
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update report");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const result = await deleteReport(reportId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete report");
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Report deleted successfully!");
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete report");
    }
  });

  return {
    createReport: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateReport: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteReport: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  };
}

/**
 * Hook to fetch data for a widget from a data source
 */
export function useWidgetData(
  dataSourceId: string | undefined,
  widgetType: "pie_chart" | "table" | "bar_chart" | "line_chart",
  entityId?: string,
  entityType?: ReportEntityType,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [REPORT_QUERY_KEYS.WIDGET_DATA, dataSourceId, widgetType, entityId, entityType],
    queryFn: async () => {
      if (!dataSourceId) return null;
      const result = await fetchWidgetDataAction({
        dataSourceId,
        widgetType,
        entityId,
        entityType
      });
      return result.success ? result.data : null;
    },
    enabled: enabled && !!dataSourceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes (renamed from cacheTime in v5)
  });
}

/**
 * Hook to fetch data for multiple widgets at once
 */
export function useMultipleWidgetData(
  widgets: Array<{
    instance_id: string;
    widget_type: "pie_chart" | "table" | "bar_chart" | "line_chart";
    data: {
      data_source_id?: string;
      [key: string]: any;
    };
  }>,
  entityId?: string,
  entityType?: ReportEntityType
) {
  return widgets.map((widget) =>
    useWidgetData(
      widget.data.data_source_id,
      widget.widget_type,
      entityId,
      entityType,
      !!widget.data.data_source_id
    )
  );
}
