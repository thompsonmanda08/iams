"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, Edit2, Plus, X } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { DataSource } from "@/lib/types/report-types";
import { WidgetEmptyState } from "./widget-empty-state";
import { Input } from "@/components/ui/input";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";

interface LineChartSeries {
  label: string;
  data: number[];
  color: string;
}

interface LineChartWidgetData {
  title: string;
  categories: string[];
  series: LineChartSeries[];
  data_source_id?: string;
}

interface LineChartWidgetProps {
  data: LineChartWidgetData;
  dataSourceId?: string;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  onDataChange?: (data: LineChartWidgetData) => void;
  showDataSourcePicker?: boolean;
}

export const LineChartWidget = ({
  data,
  dataSourceId,
  onDataSourceChange,
  onDataChange,
  showDataSourcePicker = true
}: LineChartWidgetProps) => {
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Check if in manual mode (no data source or manual entry)
  const isManualMode = !dataSourceId || dataSourceId === "manual";

  // Transform data for Recharts format
  const chartData = useMemo(() => {
    if (!data.categories || !data.series) return [];

    return data.categories.map((category, index) => {
      const dataPoint: any = { category };
      data.series.forEach((series) => {
        dataPoint[series.label] = series.data[index] || 0;
      });
      return dataPoint;
    });
  }, [data.categories, data.series]);

  // Create chart config
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.series?.forEach((series, index) => {
      config[series.label] = {
        label: series.label,
        color: series.color || `hsl(var(--chart-${index + 1}))`
      };
    });
    return config;
  }, [data.series]);

  const addSeries = () => {
    if (!onDataChange || !data.categories) return;
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#ec4899"];
    const nextColor = colors[data.series.length % colors.length];

    onDataChange({
      ...data,
      series: [
        ...data.series,
        {
          label: `Series ${data.series.length + 1}`,
          data: data.categories.map(() => 0),
          color: nextColor
        }
      ]
    });
  };

  const removeSeries = (index: number) => {
    if (!onDataChange) return;
    onDataChange({
      ...data,
      series: data.series.filter((_, i) => i !== index)
    });
  };

  const updateSeries = (index: number, updates: Partial<LineChartSeries>) => {
    if (!onDataChange) return;
    onDataChange({
      ...data,
      series: data.series.map((s, i) => (i === index ? { ...s, ...updates } : s))
    });
  };

  const updateDataPoint = (seriesIndex: number, categoryIndex: number, value: number) => {
    if (!onDataChange) return;
    onDataChange({
      ...data,
      series: data.series.map((s, i) =>
        i === seriesIndex
          ? { ...s, data: s.data.map((d, j) => (j === categoryIndex ? value : d)) }
          : s
      )
    });
  };

  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          {data.title}
        </h4>
        <div className="flex items-center gap-2">
          {isManualMode && onDataChange && (
            <button
              onClick={() => setIsConfiguring(!isConfiguring)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                isConfiguring
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-muted"
              }`}>
              <Edit2 className="h-3 w-3" />
              {isConfiguring ? "Done" : "Configure"}
            </button>
          )}
        </div>
      </div>

      {isConfiguring && (
        <div className="bg-muted/50 mb-4 space-y-2 rounded-lg p-3">
          <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Configure Series
          </div>
          <div className="space-y-2">
            {data.series.map((series, seriesIndex) => (
              <div key={seriesIndex} className="border-border bg-card rounded border p-2">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={series.color}
                    onChange={(e) => updateSeries(seriesIndex, { color: e.target.value })}
                    className="border-input bg-background h-6 w-6 cursor-pointer rounded border"
                  />
                  <Input
                    type="text"
                    value={series.label}
                    onChange={(e) => updateSeries(seriesIndex, { label: e.target.value })}
                    className="h-7 flex-1 text-xs"
                  />
                  <button
                    onClick={() => removeSeries(seriesIndex)}
                    className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.categories.map((category, catIndex) => (
                    <div key={catIndex} className="flex items-center gap-1">
                      <span className="text-muted-foreground text-xs">{category}:</span>
                      <Input
                        type="number"
                        value={series.data[catIndex] || 0}
                        onChange={(e) =>
                          updateDataPoint(seriesIndex, catIndex, Number(e.target.value))
                        }
                        className="h-7 w-16 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={addSeries}
              className="border-border text-muted-foreground hover:border-primary hover:bg-background hover:text-primary flex w-full items-center justify-center gap-1 rounded border border-dashed py-1.5 text-xs font-medium transition-all">
              <Plus className="h-3 w-3" />
              Add Series
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data.categories ||
      data.categories.length === 0 ||
      !data.series ||
      data.series.length === 0 ? (
        <WidgetEmptyState
          icon={<TrendingUp className="text-muted-foreground mx-auto h-10 w-10" />}
          hasDataSource={!!dataSourceId && dataSourceId !== "manual"}
          isError={!!dataSourceId && dataSourceId !== "manual"}
        />
      ) : (
        <>
          {/* Line Chart Visualization */}
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <LineChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12
              }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground, #6b7280)" }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground, #6b7280)" }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              {data.series?.map((series) => (
                <Line
                  key={series.label}
                  dataKey={series.label}
                  type="monotone"
                  stroke={series.color}
                  strokeWidth={2}
                  dot={{ fill: series.color, r: 4 }}
                />
              ))}
            </LineChart>
          </ChartContainer>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {data?.series?.map((series) => (
              <div key={series?.label} className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded" style={{ backgroundColor: series?.color }} />
                <span className="text-muted-foreground">{series?.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
