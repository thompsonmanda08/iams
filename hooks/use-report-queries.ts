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
  getReportByEntityId,
  snapshotReportVersion,
  updateReportVersion,
  publishReportVersion,
  getReportVersion,
  setActiveVersion
} from "@/app/_actions/reports-actions";
import { getWorkpaperByAuditPlanId } from "@/app/_actions/audit-module-actions";
import { listGeneralFindings } from "@/app/_actions/general-findings-actions";
import type { ReportContent, ReportEntityType, ReportRecord } from "@/lib/types/report-types";
import { QUERY_KEYS } from "@/lib/constants";
import { notify } from "@/lib/utils";

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
  const { setFindings, setGeneralFindings, setDataSources, setLoading, setEntityId, setEntityType } =
    useReportStore();

  // Set entity ID and type in store
  useEffect(() => {
    if (entityId && entityType) {
      setEntityId(entityId);
      setEntityType(entityType);
    }
  }, [entityId, entityType, setEntityId, setEntityType]);

  // Fetch initial report
  // Disable refetchOnWindowFocus so unsaved manual widget edits in the store
  // are not clobbered when the user switches browser tabs and back.
  const { isLoading: isReportLoading, refetch: refetchReport } = useQuery({
    queryKey: [REPORT_QUERY_KEYS.REPORT, "initial", entityId, entityType],
    queryFn: async () => {
      if (!entityId || !entityType) return null;
      const result = await fetchInitialReport(entityId, entityType);
      return result.success ? result.data : null;
    },
    enabled: !!entityId && !!entityType,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000
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

  // Fetch general findings for the entity (only for audit plans)
  const { data: generalFindingsResult, isLoading: isGeneralFindingsLoading } = useQuery({
    queryKey: [REPORT_QUERY_KEYS.REPORT_FINDINGS, "general", entityId],
    queryFn: async () => {
      if (entityType !== "audit_plan" || !entityId) return null;
      const result = await getWorkpaperByAuditPlanId(entityId);
      if (!result.success) return null;

      const workpaper = result.data;
      let generalFindings = workpaper?.general_findings ?? [];
      const config = workpaper?.config?.[0] ?? null;
      const metadata = workpaper?.metadata ?? null;

      // The /working-paper endpoint may not embed findings. Fall back to the
      // dedicated /general-work-paper-findings endpoint when the array is empty,
      // matching the source of truth used by the Workpaper tab.
      if (generalFindings.length === 0 && workpaper?.id) {
        const findingsResult = await listGeneralFindings(workpaper.id);
        if (findingsResult.success) {
          const data = findingsResult.data;
          generalFindings = Array.isArray(data?.findings)
            ? data.findings
            : Array.isArray(data)
              ? data
              : [];
        }
      }

      return {
        findings: generalFindings,
        config: config ? { columns: config.columns ?? [], keys: config.keys ?? [] } : null,
        metadata: metadata ? {
          work_done: metadata.work_done || "",
          conclusion: metadata.conclusion || ""
        } : null
      };
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
    if (generalFindingsResult) {
      setGeneralFindings(
        generalFindingsResult.findings ?? [],
        generalFindingsResult.config ?? null,
        generalFindingsResult.metadata ?? null
      );
    }
  }, [generalFindingsResult, setGeneralFindings]);

  useEffect(() => {
    if (dataSourcesResult) setDataSources(dataSourcesResult);
  }, [dataSourcesResult, setDataSources]);

  useEffect(() => {
    setLoading(
      isReportLoading || isFindingsLoading || isGeneralFindingsLoading || isDataSourcesLoading
    );
  }, [isReportLoading, isFindingsLoading, isGeneralFindingsLoading, isDataSourcesLoading, setLoading]);

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
      notify({ description: "Report saved successfully!", type: "success" });
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
      // Invalidations above already trigger refetch automatically — no explicit refetch needed.
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to save report", type: "error" });
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
      notify({ description: "Report submitted successfully!", type: "success" });
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
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to submit report", type: "error" });
    }
  });

  return {
    isLoading: isReportLoading || isFindingsLoading || isGeneralFindingsLoading || isDataSourcesLoading,
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
    enabled: !!entityId,
    // Don't clobber unsaved store edits when the tab regains focus.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000
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
      notify({ description: "Report created successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
      // Invalidate specific entity report queries
      queryClient.invalidateQueries({
        queryKey: [REPORT_QUERY_KEYS.REPORT, "entity", variables.entityId, variables.entityType]
      });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to create report", type: "error" });
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
      notify({ description: "Report updated successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to update report", type: "error" });
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
      notify({ description: "Report deleted successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to delete report", type: "error" });
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

/**
 * Mutation: create a new version snapshot of the current draft
 */
export function useSnapshotVersion(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { label?: string; draft?: ReportContent } | string | undefined) => {
      const label = typeof args === "string" || args === undefined ? args : args.label;
      const draft = typeof args === "string" || args === undefined ? undefined : args.draft;
      const result = await snapshotReportVersion(reportId, label, draft);
      if (!result.success) throw new Error(result.message || "Failed to snapshot");
      return result.data;
    },
    onSuccess: () => {
      notify({ description: "Version saved", type: "success" });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, reportId] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to save version", type: "error" });
    }
  });
}

/**
 * Mutation: update a specific version snapshot
 */
export function useUpdateVersion(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      versionNumber: number;
      patch: Parameters<typeof updateReportVersion>[2];
      summary?: string;
    }) => {
      const result = await updateReportVersion(
        reportId,
        args.versionNumber,
        args.patch,
        args.summary
      );
      if (!result.success) throw new Error(result.message || "Failed to update version");
      return result.data;
    },
    onSuccess: (_data, args) => {
      notify({ description: `Version ${args.versionNumber} updated`, type: "success" });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, reportId] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to update version", type: "error" });
    }
  });
}

/**
 * Mutation: publish a specific version
 */
export function usePublishVersion(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { versionNumber: number; generatePdf?: boolean }) => {
      const result = await publishReportVersion(
        reportId,
        args.versionNumber,
        args.generatePdf ?? true
      );
      if (!result.success) throw new Error(result.message || "Failed to publish version");
      return result.data;
    },
    onSuccess: (_data, args) => {
      notify({
        description: `Version ${args.versionNumber} published`,
        type: "success"
      });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, reportId] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORTS] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to publish version", type: "error" });
    }
  });
}

/**
 * Mutation: switch the active version of a report
 */
export function useSetActiveVersion(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (versionNumber: number) => {
      const result = await setActiveVersion(reportId, versionNumber);
      if (!result.success) throw new Error(result.message || "Failed to switch version");
      return result.data;
    },
    onSuccess: (_data, versionNumber) => {
      notify({ description: `Switched to v${versionNumber}`, type: "success" });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT, reportId] });
      queryClient.invalidateQueries({ queryKey: [REPORT_QUERY_KEYS.REPORT] });
    },
    onError: (error: Error) => {
      notify({ description: error.message || "Failed to switch version", type: "error" });
    }
  });
}
