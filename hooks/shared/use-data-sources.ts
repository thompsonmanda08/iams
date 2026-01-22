"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllDataSources } from "@/app/_actions/reports-actions";
import type { DataSource } from "@/lib/types/report-types";

export interface UseDataSourcesOptions {
  category?: DataSource["category"];
  enabled?: boolean;
}

/**
 * Hook for fetching and caching data sources
 * Can be filtered by category (audit, risk, compliance, custom)
 */
export function useDataSources(options?: UseDataSourcesOptions) {
  const { category, enabled = true } = options || {};

  return useQuery({
    queryKey: ["data-sources", category],
    queryFn: async () => {
      const result = await getAllDataSources();

      if (!result.success || !Array.isArray(result.data)) {
        return [];
      }

      let sources = result.data as DataSource[];

      // Filter by category if specified
      if (category) {
        sources = sources.filter((ds) => ds.category === category);
      }

      return sources;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes (formerly cacheTime)
  });
}

/**
 * Get a single data source by ID from the cached list
 */
export function useDataSourceById(dataSourceId: string | undefined) {
  const { data: dataSources, ...rest } = useDataSources();

  const dataSource = dataSources?.find((ds) => ds.id === dataSourceId);

  return {
    data: dataSource,
    dataSources,
    ...rest
  };
}
