"use client";

import React, { useState, useMemo } from "react";
import { BarChart3, Edit2, Plus, Trash2, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { DataSource } from "@/lib/types/report-types";
import { WidgetEmptyState } from "./widget-empty-state";
import { Input } from "@/components/ui/input";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";

interface BarChartSeries {
  label: string;
  value: number;
  color: string;
}

interface BarChartCategory {
  label: string;
  series: BarChartSeries[];
}

interface BarChartWidgetData {
  title: string;
  categories: BarChartCategory[] | string[];
  series?: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
  orientation?: "horizontal" | "vertical";
  show_values?: boolean;
}

interface BarChartWidgetProps {
  data: BarChartWidgetData;
  dataSourceId?: string;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  onDataChange?: (data: BarChartWidgetData) => void;
  showDataSourcePicker?: boolean;
}

export const BarChartWidget = ({
  data,
  dataSourceId,
  onDataSourceChange,
  onDataChange,
  showDataSourcePicker = true
}: BarChartWidgetProps) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const orientation = data.orientation || "vertical";
  const showValues = data.show_values !== false;

  // Check if in manual mode (no data source or manual entry)
  const isManualMode = !dataSourceId || dataSourceId === "manual";

  // Determine if using flat structure (from API) or nested structure (legacy)
  const isFlatStructure =
    Array.isArray(data.categories) && typeof data.categories[0] === "string" && data.series;

  // Convert flat structure to nested for rendering if needed
  const categories: BarChartCategory[] = isFlatStructure
    ? (data.categories as string[]).map((catLabel, catIndex) => ({
        label: catLabel,
        series: (data.series || []).map((s) => ({
          label: s.label,
          value: s.data[catIndex],
          color: s.color
        }))
      }))
    : Array.isArray(data.categories)
      ? (data.categories as BarChartCategory[])
      : [];

  // Transform data for Recharts (vertical mode - grouped bars)
  const chartData = useMemo(() => {
    return categories.map((cat) => {
      const dataPoint: any = { category: cat.label };
      cat.series.forEach((series) => {
        dataPoint[series.label] = series.value;
      });
      return dataPoint;
    });
  }, [categories]);

  // Flatten data for horizontal mode - each value becomes its own row
  const horizontalChartData = useMemo(() => {
    if (orientation !== "horizontal") return [];
    const flatData: Array<{ name: string; value: number; color: string }> = [];
    categories.forEach((cat) => {
      cat.series.forEach((s) => {
        const name = categories.length > 1 ? `${cat.label} - ${s.label}` : s.label;
        flatData.push({ name, value: s.value, color: s.color });
      });
    });
    return flatData;
  }, [orientation, categories]);

  // Create chart config (vertical mode)
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    const allLabels = Array.from(
      new Set(categories.flatMap((cat) => cat.series.map((s) => s.label)))
    );

    allLabels.forEach((seriesLabel) => {
      const firstSeries = categories
        .flatMap((cat) => cat.series)
        .find((s) => s.label === seriesLabel);

      if (firstSeries) {
        config[seriesLabel] = {
          label: seriesLabel,
          color: firstSeries.color
        };
      }
    });

    return config;
  }, [categories]);

  // Chart config for horizontal mode (flattened)
  const horizontalChartConfig: ChartConfig = useMemo(() => {
    if (orientation !== "horizontal") return {};
    const config: ChartConfig = { value: { label: "Value" } };
    horizontalChartData.forEach((item) => {
      config[item.name] = { label: item.name, color: item.color };
    });
    return config;
  }, [orientation, horizontalChartData]);

  // Get all series labels
  const allSeriesLabels = useMemo(() => {
    return Array.from(new Set(categories.flatMap((cat) => cat.series.map((s) => s.label))));
  }, [categories]);

  // Compute chart height based on bar count so bars are always properly sized
  const chartHeight = useMemo(() => {
    if (orientation === "vertical") {
      return Math.max(256, 40 + allSeriesLabels.length * 8);
    }
    // Horizontal: one bar per flattened row
    const totalBars = categories.reduce((acc, cat) => acc + cat.series.length, 0);
    const barH = 32; // height per bar including spacing
    return Math.max(80 + totalBars * barH, 140);
  }, [orientation, categories, allSeriesLabels.length]);

  const addCategory = () => {
    if (!onDataChange || isFlatStructure) return;
    const nestedCategories = categories as BarChartCategory[];
    onDataChange({
      ...data,
      categories: [
        ...nestedCategories,
        {
          label: `Category ${nestedCategories.length + 1}`,
          series: [
            { label: "Series 1", value: 10, color: "#3b82f6" },
            { label: "Series 2", value: 15, color: "#10b981" }
          ]
        }
      ]
    });
  };

  const removeCategory = (index: number) => {
    if (!onDataChange || isFlatStructure) return;
    const nestedCategories = categories as BarChartCategory[];
    onDataChange({
      ...data,
      categories: nestedCategories.filter((_, i) => i !== index)
    });
  };

  const updateCategory = (index: number, updates: Partial<BarChartCategory>) => {
    if (!onDataChange || isFlatStructure) return;
    const nestedCategories = categories as BarChartCategory[];
    onDataChange({
      ...data,
      categories: nestedCategories.map((cat, i) => (i === index ? { ...cat, ...updates } : cat))
    });
  };

  const addSeries = (categoryIndex: number) => {
    if (!onDataChange || isFlatStructure) return;
    const nestedCategories = categories as BarChartCategory[];
    const category = nestedCategories[categoryIndex];
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#ec4899", "#8b5cf6"];
    const nextColor = colors[category.series.length % colors.length];

    updateCategory(categoryIndex, {
      series: [
        ...category.series,
        {
          label: `Series ${category.series.length + 1}`,
          value: 10,
          color: nextColor
        }
      ]
    });
  };

  const removeSeries = (categoryIndex: number, seriesIndex: number) => {
    if (!onDataChange || isFlatStructure) return;
    const nestedCategories = categories as BarChartCategory[];
    const category = nestedCategories[categoryIndex];
    updateCategory(categoryIndex, {
      series: category.series.filter((_, i) => i !== seriesIndex)
    });
  };

  const updateSeries = (
    categoryIndex: number,
    seriesIndex: number,
    updates: Partial<BarChartSeries>
  ) => {
    if (!onDataChange || isFlatStructure) return;
    const nestedCategories = categories as BarChartCategory[];
    const category = nestedCategories[categoryIndex];
    updateCategory(categoryIndex, {
      series: category.series.map((series, i) =>
        i === seriesIndex ? { ...series, ...updates } : series
      )
    });
  };

  const toggleOrientation = () => {
    if (!onDataChange) return;
    onDataChange({
      ...data,
      orientation: orientation === "vertical" ? "horizontal" : "vertical"
    });
  };

  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          {data.title}
        </h4>
        <div className="flex items-center gap-2">
          {onDataChange && (
            <>
              <button
                onClick={toggleOrientation}
                title={`Switch to ${orientation === "vertical" ? "horizontal" : "vertical"} orientation`}
                className="text-muted-foreground hover:bg-primary/10 hover:text-primary flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors">
                {orientation === "vertical" ? "↕ Vertical" : "↔ Horizontal"}
              </button>
              {isManualMode && (
                <button
                  onClick={() => setIsConfiguring(!isConfiguring)}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                    isConfiguring
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
                      : "text-muted-foreground hover:bg-muted"
                  }`}>
                  <Edit2 className="h-3 w-3" />
                  {isConfiguring ? "Done" : "Configure"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isConfiguring && !isFlatStructure && (
        <div className="bg-muted/50 mb-4 space-y-2 rounded-lg p-3">
          <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Configure Bar Chart
          </div>
          <div className="space-y-3">
            {categories.map((category, catIndex) => (
              <div key={catIndex} className="border-border bg-card rounded border p-2">
                <div className="mb-2 flex items-center justify-between">
                  <Input
                    type="text"
                    value={category.label}
                    onChange={(e) => updateCategory(catIndex, { label: e.target.value })}
                    className="h-8 font-medium"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => addSeries(catIndex)}
                      className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-xs text-green-600 hover:bg-green-500/20 dark:text-green-400">
                      <Plus className="h-3 w-3" /> Add Series
                    </button>
                    <button
                      onClick={() => removeCategory(catIndex)}
                      className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 pl-4">
                  {category.series.map((series, seriesIndex) => (
                    <div key={seriesIndex} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={series.color}
                        onChange={(e) =>
                          updateSeries(catIndex, seriesIndex, { color: e.target.value })
                        }
                        className="border-input bg-background h-6 w-6 cursor-pointer rounded border"
                      />
                      <Input
                        type="text"
                        value={series.label}
                        onChange={(e) =>
                          updateSeries(catIndex, seriesIndex, { label: e.target.value })
                        }
                        className="h-7 flex-1 text-xs"
                      />
                      <Input
                        type="number"
                        value={series.value}
                        onChange={(e) =>
                          updateSeries(catIndex, seriesIndex, { value: Number(e.target.value) })
                        }
                        className="h-7 w-20 text-xs"
                      />
                      <button
                        onClick={() => removeSeries(catIndex, seriesIndex)}
                        className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={addCategory}
              className="border-border text-muted-foreground hover:border-primary hover:bg-background hover:text-primary mt-2 flex w-full items-center justify-center gap-1 rounded border border-dashed py-1.5 text-xs font-medium transition-all">
              <Plus className="h-3 w-3" />
              Add Category
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {categories.length === 0 ? (
        <WidgetEmptyState
          icon={<BarChart3 className="text-muted-foreground mx-auto h-10 w-10" />}
          hasDataSource={!!dataSourceId && dataSourceId !== "manual"}
          isError={!!dataSourceId && dataSourceId !== "manual"}
        />
      ) : (
        <>
          {/* Recharts Bar Chart */}
          {orientation === "horizontal" ? (
            <ChartContainer
              config={horizontalChartConfig}
              className="aspect-auto! w-full"
              style={{ height: chartHeight }}>
              <BarChart
                data={horizontalChartData}
                layout="vertical"
                barSize={20}
                margin={{ left: 120, right: 20, top: 12, bottom: 12 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground, #6b7280)" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground, #6b7280)" }}
                  width={110}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {horizontalChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="w-full"
              style={{ height: chartHeight }}>
              <BarChart
                data={chartData}
                layout="horizontal"
                barSize={20}
                barGap={4}
                barCategoryGap={24}
                margin={{ left: 0, right: 12, top: 12, bottom: 12 }}>
                <CartesianGrid vertical={true} strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground, #6b7280)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground, #6b7280)" }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                {allSeriesLabels.map((seriesLabel) => {
                  const seriesColor = chartConfig[seriesLabel]?.color || "#3b82f6";
                  return (
                    <Bar
                      key={seriesLabel}
                      dataKey={seriesLabel}
                      fill={seriesColor}
                      radius={[4, 4, 0, 0]}
                    />
                  );
                })}
              </BarChart>
            </ChartContainer>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-2">
            {orientation === "horizontal"
              ? horizontalChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div
                      className="h-3 w-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))
              : allSeriesLabels.map((seriesLabel) => {
                  const firstSeries = categories
                    .flatMap((cat) => cat.series)
                    .find((series) => series.label === seriesLabel);

                  return (
                    <div key={seriesLabel} className="flex items-center gap-1 text-xs">
                      <div
                        className="h-3 w-3 rounded"
                        style={{ backgroundColor: firstSeries?.color || "#ccc" }}
                      />
                      <span className="text-muted-foreground">{seriesLabel}</span>
                    </div>
                  );
                })}
          </div>
        </>
      )}
    </div>
  );
};
