"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDataSourceData } from "@/app/_actions/reports-actions";
import type { WidgetType, ReportEntityType } from "@/lib/types/report-types";

export interface FetchWidgetDataParams {
  dataSourceId: string;
  widgetType: WidgetType;
  entityId?: string;
  entityType?: ReportEntityType;
}

/**
 * Hook for fetching widget data on demand
 * Use this when configuring a widget with a data source
 */
export function useWidgetDataFetch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dataSourceId, widgetType, entityId, entityType }: FetchWidgetDataParams) => {
      // Map widget types to API-compatible types
      const apiWidgetType = widgetType as
        | "pie_chart"
        | "bar_chart"
        | "table"
        | "metric_card"
        | "line_chart"
        | "area_chart"
        | "risk_objective_mapping";

      const result = await getDataSourceData(dataSourceId, apiWidgetType, entityId, entityType);

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch widget data");
      }

      return result.data;
    },
    onSuccess: (data, variables) => {
      // Cache the widget data for potential reuse
      queryClient.setQueryData(
        ["widget-data", variables.dataSourceId, variables.widgetType],
        data
      );
    }
  });
}

/**
 * Transform raw data from API to widget-specific format
 */
export function transformWidgetData(
  rawData: any,
  widgetType: WidgetType,
  dataSourceId: string,
  title?: string
): any {
  console.log("🔍 [transformWidgetData] Starting transformation:", {
    widgetType,
    dataSourceId,
    title,
    rawDataType: typeof rawData,
    isArray: Array.isArray(rawData),
    rawDataKeys: typeof rawData === "object" && rawData !== null ? Object.keys(rawData) : []
  });

  let result: any;

  switch (widgetType) {
    case "pie_chart":
      // API returns array of { label, value, color }
      const slices = Array.isArray(rawData) ? rawData : rawData?.slices || [];
      console.log("🔍 [transformWidgetData] pie_chart - rawData:", {
        isArray: Array.isArray(rawData),
        hasSlices: rawData?.slices !== undefined,
        slicesLength: slices.length,
        slicesData: slices.map((s: any) => ({
          label: s.label,
          value: s.value,
          color: s.color
        }))
      });
      result = {
        title: title || "Chart",
        slices: slices,
        data_source_id: dataSourceId
      };
      break;

    case "bar_chart":
      // API returns { categories: [], series: [] } format
      console.log("🔍 [transformWidgetData] bar_chart - rawData:", {
        hasCategories: rawData?.categories !== undefined,
        hasSeries: rawData?.series !== undefined,
        categoriesLength: rawData?.categories?.length,
        seriesLength: rawData?.series?.length
      });
      if (rawData?.categories && rawData?.series) {
        // Map series "name" to "label" if needed (API returns "name", widget expects "label")
        const barSeries = (rawData.series || []).map((s: any) => ({
          ...s,
          label: s.label || s.name || "Series"
        }));
        result = {
          title: title || "Chart",
          categories: rawData.categories,
          series: barSeries,
          orientation: "vertical",
          show_values: true,
          data_source_id: dataSourceId
        };
      } else {
        // Fallback for flat array format
        result = {
          title: title || "Chart",
          categories: rawData || [],
          orientation: "vertical",
          show_values: true,
          data_source_id: dataSourceId
        };
      }
      break;

    case "table":
      // API returns { columns: [], rows: [] }
      console.log("🔍 [transformWidgetData] table - rawData:", {
        hasColumns: rawData?.columns !== undefined,
        hasRows: rawData?.rows !== undefined,
        columnsLength: rawData?.columns?.length,
        rowsLength: rawData?.rows?.length
      });
      result = {
        title: title || "Table",
        columns: rawData?.columns || [],
        rows: rawData?.rows || [],
        data_source_id: dataSourceId
      };
      break;

    case "line_chart":
    case "area_chart":
      // Similar structure to bar chart
      console.log(`🔍 [transformWidgetData] ${widgetType} - rawData:`, {
        hasCategories: rawData?.categories !== undefined,
        hasSeries: rawData?.series !== undefined
      });
      // Map series "name" to "label" if needed (API returns "name", widget expects "label")
      const lineSeries = (rawData?.series || []).map((s: any) => ({
        ...s,
        label: s.label || s.name || "Series"
      }));
      result = {
        title: title || "Chart",
        categories: rawData?.categories || [],
        series: lineSeries,
        data_source_id: dataSourceId
      };
      break;

    case "metric_card":
      // API returns { value, unit?, trend?, description? }
      console.log("🔍 [transformWidgetData] metric_card - rawData:", {
        hasValue: rawData?.value !== undefined,
        hasUnit: rawData?.unit !== undefined,
        hasTrend: rawData?.trend !== undefined
      });
      result = {
        title: title || "Metric",
        value: rawData?.value || 0,
        unit: rawData?.unit || "",
        trend: rawData?.trend || 0,
        description: rawData?.description || "",
        data_source_id: dataSourceId
      };
      break;

    case "text_block":
      // API returns { content, title? }
      console.log("🔍 [transformWidgetData] text_block - rawData:", {
        hasContent: rawData?.content !== undefined,
        contentLength: rawData?.content?.length || 0
      });
      result = {
        title: rawData?.title || title || "",
        content: rawData?.content || "",
        data_source_id: dataSourceId
      };
      break;

    case "risk_objective_mapping":
      // API returns { columns: [], rows: [] } where columns are objectives and rows are risks
      // Transform table format to risk_objective_mapping format
      const objectives = (rawData?.columns || []).map((col: any) => ({
        id: col.key,
        label: col.header,
        shortLabel: col.header
      }));

      const risks = (rawData?.rows || []).map((row: any, index: number) => ({
        id: row.risk_id,
        number: index + 1,
        description: row.risk_name,
        mappedObjectives: [row.strategic_objective_id]
      }));

      // Group risks by risk_id to combine multiple objective mappings
      const risksMap = new Map<string, any>();
      (rawData?.rows || []).forEach((row: any, index: number) => {
        if (!risksMap.has(row.risk_id)) {
          risksMap.set(row.risk_id, {
            id: row.risk_id,
            number: 0,
            description: row.risk_name,
            mappedObjectives: []
          });
        }
        const risk = risksMap.get(row.risk_id);
        if (!risk.mappedObjectives.includes(row.strategic_objective_id)) {
          risk.mappedObjectives.push(row.strategic_objective_id);
        }
      });

      // Convert map to array and assign numbers
      const risksList = Array.from(risksMap.values()).map((risk, index) => ({
        ...risk,
        number: index + 1
      }));

      result = {
        title: title || "Risk Objective Mapping",
        objectives: objectives,
        risks: risksList,
        data_source_id: dataSourceId
      };
      break;

    default:
      console.log(`🔍 [transformWidgetData] ${widgetType} - using default transformation`);
      result = {
        ...rawData,
        data_source_id: dataSourceId
      };
  }

  console.log("✅ [transformWidgetData] Transformation complete:", {
    widgetType,
    resultKeys: Object.keys(result),
    title: result.title,
    data_source_id: result.data_source_id
  });

  return result;
}
