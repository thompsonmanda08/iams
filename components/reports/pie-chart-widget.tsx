"use client";

import React, { useState, useMemo } from "react";
import { PieChart as PieChartIcon, Edit2, X, Plus } from "lucide-react";
import { Pie, PieChart, Cell, Label, Sector } from "recharts";
import { type PieSectorDataItem } from "recharts/types/polar/Pie";
import { PieChartWidgetData, DataSource, PieChartSlice } from "@/lib/types/report-types";
import { WidgetDataSourcePicker } from "./widget-data-source-picker";
import { WidgetEmptyState } from "./widget-empty-state";
import { Input } from "@/components/ui/input";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PieChartWidgetProps {
  data: PieChartWidgetData;
  dataSourceId?: string;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  onDataChange?: (data: PieChartWidgetData) => void;
  showDataSourcePicker?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const PieChartWidget = ({
  data,
  dataSourceId,
  onDataSourceChange,
  onDataChange,
  showDataSourcePicker = true,
  onRetry,
  isRetrying = false
}: PieChartWidgetProps) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const slices = Array.isArray(data.slices) ? data.slices : [];
  const total = slices.reduce((sum: number, slice: PieChartSlice) => sum + slice.value, 0);

  // Interactive slice selection
  const [activeSlice, setActiveSlice] = useState(slices[0]?.label || "");

  // Update active slice when slices change
  React.useEffect(() => {
    if (slices.length > 0 && !slices.find(s => s.label === activeSlice)) {
      setActiveSlice(slices[0].label);
    }
  }, [slices, activeSlice]);

  // Calculate active index
  const activeIndex = useMemo(
    () => slices.findIndex((slice) => slice.label === activeSlice),
    [slices, activeSlice]
  );

  // Check if in manual mode (no data source or manual entry)
  const isManualMode = !dataSourceId || dataSourceId === "manual";

  // Transform slices for Recharts
  const chartData = useMemo(() => {
    return slices.map((slice) => ({
      name: slice.label,
      value: slice.value,
      fill: slice.color
    }));
  }, [slices]);

  // Create chart config
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    slices.forEach((slice) => {
      config[slice.label] = {
        label: slice.label,
        color: slice.color
      };
    });
    return config;
  }, [slices]);

  const addSlice = () => {
    if (!onDataChange) return;
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#ec4899"];
    const nextColor = colors[slices.length % colors.length];
    onDataChange({
      ...data,
      slices: [...slices, { label: `New Category`, value: 10, color: nextColor }]
    });
  };

  const removeSlice = (index: number) => {
    if (!onDataChange) return;
    onDataChange({
      ...data,
      slices: slices.filter((_, i) => i !== index)
    });
  };

  const updateSlice = (index: number, updates: Partial<PieChartSlice>) => {
    if (!onDataChange) return;
    onDataChange({
      ...data,
      slices: slices.map((slice, i) => (i === index ? { ...slice, ...updates } : slice))
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PieChartIcon className="h-4 w-4 text-blue-600" />
            {data.title}
          </h4>
          {slices.length > 0 && (
            <Select value={activeSlice} onValueChange={setActiveSlice}>
              <SelectTrigger
                className="h-7 w-[140px] rounded-lg text-xs"
                aria-label="Select a slice"
              >
                <SelectValue placeholder="Select slice" />
              </SelectTrigger>
              <SelectContent align="start" className="rounded-xl">
                {slices.map((slice) => (
                  <SelectItem
                    key={slice.label}
                    value={slice.label}
                    className="rounded-lg [&_span]:flex"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="flex h-3 w-3 shrink-0 rounded-sm"
                        style={{ backgroundColor: slice.color }}
                      />
                      {slice.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showDataSourcePicker && onDataSourceChange && (
            <WidgetDataSourcePicker
              widgetType="pie_chart"
              currentDataSourceId={dataSourceId}
              onDataSourceChange={onDataSourceChange}
            />
          )}
          {isManualMode && onDataChange && (
            <button
              onClick={() => setIsConfiguring(!isConfiguring)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                isConfiguring ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" : "text-muted-foreground hover:bg-muted"
              }`}>
              <Edit2 className="h-3 w-3" />
              {isConfiguring ? "Done" : "Configure Slices"}
            </button>
          )}
        </div>
      </div>

      {isConfiguring && (
        <div className="mb-4 space-y-2 rounded-lg bg-muted/50 p-3">
          <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Configure Data Slices
          </div>
          <div className="space-y-2">
            {slices.map((slice, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="color"
                  value={slice.color}
                  onChange={(e) => updateSlice(i, { color: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border border-input bg-background"
                />
                <Input
                  type="text"
                  value={slice.label}
                  onChange={(e) => updateSlice(i, { label: e.target.value })}
                  placeholder="Label"
                  className="flex-1 h-8"
                />
                <Input
                  type="number"
                  value={slice.value}
                  onChange={(e) => updateSlice(i, { value: Number(e.target.value) })}
                  className="w-20 h-8"
                />
                <button
                  onClick={() => removeSlice(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addSlice}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-dashed border-border py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:bg-background hover:text-primary">
            <Plus className="h-3 w-3" />
            Add New Slice
          </button>
        </div>
      )}

      {/* Empty State */}
      {slices.length === 0 ? (
        <WidgetEmptyState
          icon={<PieChartIcon className="mx-auto h-10 w-10 text-muted-foreground" />}
          hasDataSource={!!dataSourceId && dataSourceId !== "manual"}
          isError={!!dataSourceId && dataSourceId !== "manual"}
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      ) : (
        <div className="flex items-center gap-6 p-6">
          {/* Recharts Pie Chart */}
          <ChartContainer config={chartConfig} className="h-56 w-56">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                fill,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} fill={fill} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                    fill={fill}
                  />
                </g>
              )}
              onClick={(data: any) => {
                if (data && data.name) {
                  setActiveSlice(data.name);
                }
              }}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} className="cursor-pointer" />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const activeSliceData = slices[activeIndex];
                    const activeValue = activeSliceData?.value || total;
                    const displayLabel = activeIndex >= 0 ? activeSliceData?.label : "Total";

                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold">
                          {activeValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm">
                          {displayLabel}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend - Interactive */}
        <div className="space-y-2">
          {slices.map((slice, i) => {
            const isActive = activeSlice === slice.label;
            return (
              <button
                key={i}
                onClick={() => setActiveSlice(slice.label)}
                className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 font-medium dark:bg-blue-950"
                    : "hover:bg-muted/50"
                }`}>
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: slice.color }}
                />
                <span className={isActive ? "text-foreground" : "text-muted-foreground"}>
                  {slice.label}
                </span>
                <span className={`ml-auto ${isActive ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                  ({slice.value})
                </span>
              </button>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
};
