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
  switch (widgetType) {
    case "pie_chart":
      // API returns array of { label, value, color }
      return {
        title: title || "Chart",
        slices: Array.isArray(rawData) ? rawData : rawData?.slices || [],
        data_source_id: dataSourceId
      };

    case "bar_chart":
      // API returns { categories: [], series: [] } format
      if (rawData?.categories && rawData?.series) {
        return {
          title: title || "Chart",
          categories: rawData.categories,
          series: rawData.series,
          orientation: "vertical",
          show_values: true,
          data_source_id: dataSourceId
        };
      }
      // Fallback for flat array format
      return {
        title: title || "Chart",
        categories: rawData || [],
        orientation: "vertical",
        show_values: true,
        data_source_id: dataSourceId
      };

    case "table":
      // API returns { columns: [], rows: [] }
      return {
        title: title || "Table",
        columns: rawData?.columns || [],
        rows: rawData?.rows || [],
        data_source_id: dataSourceId
      };

    case "line_chart":
    case "area_chart":
      // Similar structure to bar chart
      return {
        title: title || "Chart",
        categories: rawData?.categories || [],
        series: rawData?.series || [],
        data_source_id: dataSourceId
      };

    default:
      return {
        ...rawData,
        data_source_id: dataSourceId
      };
  }
}
