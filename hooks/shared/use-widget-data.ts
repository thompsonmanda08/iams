"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDataSourceData } from "@/app/_actions/reports-actions";
import type { WidgetType } from "@/lib/types/report-types";

export interface FetchWidgetDataParams {
  dataSourceId: string;
  widgetType: WidgetType;
  entityId?: string;
}

/**
 * Hook for fetching widget data on demand
 * Use this when configuring a widget with a data source
 */
export function useWidgetDataFetch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dataSourceId, widgetType, entityId }: FetchWidgetDataParams) => {
      // Map widget types to API-compatible types
      const apiWidgetType = widgetType as
        | "pie_chart"
        | "bar_chart"
        | "table"
        | "metric_card"
        | "line_chart"
        | "area_chart"
        | "risk_objective_mapping";

      const result = await getDataSourceData(dataSourceId, apiWidgetType, entityId);

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
      console.log("🔍 [transformWidgetData] pie_chart - rawData:", {
        isArray: Array.isArray(rawData),
        hasSlices: rawData?.slices !== undefined,
        slicesLength: Array.isArray(rawData) ? rawData.length : rawData?.slices?.length
      });
      result = {
        title: title || "Chart",
        slices: Array.isArray(rawData) ? rawData : rawData?.slices || [],
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
        result = {
          title: title || "Chart",
          categories: rawData.categories,
          series: rawData.series,
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
      result = {
        title: title || "Chart",
        categories: rawData?.categories || [],
        series: rawData?.series || [],
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
