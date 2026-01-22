"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { useReportStore } from "@/store/report-store";
import {
  ReportBuilder,
  type ReportEntity,
  type ReportEntityType
} from "@/components/reports/report-builder";
import type {
  ReportContent,
  ReportStatus,
  ReportSection,
  WidgetInstance,
  WidgetType
} from "@/lib/types/report-types";
import { mergeReportWithTemplate } from "@/lib/config/report-template-merger";
import { getDataSourceData } from "@/app/_actions/reports-actions";
import { transformWidgetData } from "@/hooks/shared/use-widget-data";

interface ReportDetailsClientProps {
  reportId: string;
  initialReport: ReportContent;
  reportStatus: ReportStatus;
  entity: ReportEntity;
  entityType: ReportEntityType;
}

/**
 * Collect all widgets that have a data_source_id from all sections
 */
function getWidgetsWithDataSources(sections: ReportSection[]): Array<{
  sectionId: string;
  widget: WidgetInstance;
}> {
  const result: Array<{ sectionId: string; widget: WidgetInstance }> = [];

  for (const section of sections) {
    for (const widget of section.widgets || []) {
      if (widget.data?.data_source_id) {
        result.push({
          sectionId: section.section_id,
          widget
        });
      }
    }
  }

  return result;
}

/**
 * Hook to dynamically fetch data for all widgets with data sources
 */
function useWidgetDataPopulation(
  sections: ReportSection[],
  entityId: string | undefined,
  enabled: boolean
) {
  const widgetsWithDataSources = enabled ? getWidgetsWithDataSources(sections) : [];

  return useQuery({
    queryKey: ["widgetData", entityId, widgetsWithDataSources.map((w) => w.widget.data.data_source_id)],
    queryFn: async () => {
      if (widgetsWithDataSources.length === 0) {
        return {};
      }

      console.log(`Fetching data for ${widgetsWithDataSources.length} widgets with data sources...`);

      // Fetch all widget data in parallel
      const fetchPromises = widgetsWithDataSources.map(async ({ sectionId, widget }) => {
        const dataSourceId = widget.data.data_source_id;
        const widgetType = widget.widget_type as
          | "pie_chart"
          | "bar_chart"
          | "table"
          | "metric_card"
          | "line_chart"
          | "area_chart"
          | "risk_objective_mapping";

        try {
          const result = await getDataSourceData(dataSourceId, widgetType, entityId);

          if (result.success && result.data) {
            return {
              sectionId,
              widgetId: widget.instance_id,
              widgetType: widget.widget_type,
              dataSourceId,
              data: result.data
            };
          }

          console.warn(`Failed to fetch data for widget ${widget.instance_id}: ${result.message}`);
          return null;
        } catch (error) {
          console.error(`Error fetching data for widget ${widget.instance_id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);

      // Build a map of section -> widget -> data
      const widgetDataMap: Record<
        string,
        Record<string, { widgetType: WidgetType; dataSourceId: string; data: any }>
      > = {};

      for (const result of results) {
        if (result) {
          if (!widgetDataMap[result.sectionId]) {
            widgetDataMap[result.sectionId] = {};
          }
          widgetDataMap[result.sectionId][result.widgetId] = {
            widgetType: result.widgetType,
            dataSourceId: result.dataSourceId,
            data: result.data
          };
        }
      }

      return widgetDataMap;
    },
    enabled: enabled && widgetsWithDataSources.length > 0,
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Apply fetched widget data to report sections
 */
function applyWidgetDataToSections(
  sections: ReportSection[],
  widgetDataMap: Record<string, Record<string, { widgetType: WidgetType; dataSourceId: string; data: any }>>
): ReportSection[] {
  return sections.map((section) => {
    const sectionWidgetData = widgetDataMap[section.section_id];

    if (!sectionWidgetData) {
      return section;
    }

    return {
      ...section,
      widgets: section.widgets.map((widget) => {
        const fetchedData = sectionWidgetData[widget.instance_id];

        if (!fetchedData) {
          return widget;
        }

        // Transform the raw data to the widget's expected format
        const transformedData = transformWidgetData(
          fetchedData.data,
          fetchedData.widgetType,
          fetchedData.dataSourceId,
          widget.data?.title
        );

        return {
          ...widget,
          data: {
            ...widget.data,
            ...transformedData
          }
        };
      })
    };
  });
}

export function ReportDetailsClient({
  reportId,
  initialReport,
  reportStatus,
  entity,
  entityType
}: ReportDetailsClientProps) {
  const { setReport, setEntityId, setEntityType } = useReportStore();

  // Merge report with template first to get initial structure (memoized to prevent infinite loops)
  const mergedReport = useMemo(() => {
    if (!initialReport) return null;

    let report = mergeReportWithTemplate(initialReport, entity.management_standard, {
      id: reportId,
      title: initialReport.title,
      created_at: initialReport.created_at,
      updated_at: initialReport.updated_at,
      status: reportStatus
    });

    // Ensure the report_id and status are set correctly from the database
    report.report_id = reportId;
    report.status = reportStatus;

    return report;
  }, [initialReport, entity.management_standard, reportId, reportStatus]);

  // Dynamically fetch data for widgets that have data_source_id
  const { data: widgetDataMap } = useWidgetDataPopulation(
    mergedReport?.sections || [],
    entity.id,
    !!mergedReport
  );

  // Track if we've initialized to prevent redundant updates
  const hasInitialized = useRef(false);
  const lastWidgetDataMapRef = useRef<typeof widgetDataMap>(null);

  // Initialize the store with merged report and populated widget data
  useEffect(() => {
    if (!mergedReport) return;

    // Check if widget data has actually changed
    const widgetDataChanged = JSON.stringify(widgetDataMap) !== JSON.stringify(lastWidgetDataMapRef.current);

    // Skip if already initialized and widget data hasn't changed
    if (hasInitialized.current && !widgetDataChanged) {
      return;
    }

    let finalReport = mergedReport;

    // Apply fetched widget data if available
    if (widgetDataMap && Object.keys(widgetDataMap).length > 0) {
      try {
        const updatedSections = applyWidgetDataToSections(mergedReport.sections || [], widgetDataMap);
        finalReport = {
          ...mergedReport,
          sections: updatedSections
        };
        console.log("Widget data populated successfully for", Object.keys(widgetDataMap).length, "sections");
      } catch (error) {
        console.error("Error applying widget data:", error);
        // Continue with unmodified report if population fails
      }
    }

    setReport(finalReport);
    lastWidgetDataMapRef.current = widgetDataMap;
    hasInitialized.current = true;

    // Set the entity ID and type in the store
    if (entity.id) {
      setEntityId(entity.id);
      setEntityType(entityType);
    }
  }, [
    mergedReport,
    widgetDataMap,
    entity.id,
    entityType,
    setReport,
    setEntityId,
    setEntityType
  ]);

  // Show ReportBuilder with read-only type since entity is already determined
  return <ReportBuilder entity={entity} entityType={entityType} readOnlyType />;
}
