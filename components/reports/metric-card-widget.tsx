"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Edit2, Gauge } from "lucide-react";
import { DataSource } from "@/lib/types/report-types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardWidgetData {
  title: string;
  value: number;
  unit?: string;
  trend?: number; // Percentage change
  description?: string;
  data_source_id?: string;
}

interface MetricCardWidgetProps {
  data: MetricCardWidgetData;
  dataSourceId?: string;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  onDataChange?: (data: MetricCardWidgetData) => void;
  showDataSourcePicker?: boolean;
}

export const MetricCardWidget = ({
  data,
  dataSourceId,
  onDataSourceChange,
  onDataChange,
  showDataSourcePicker = true
}: MetricCardWidgetProps) => {
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Check if in manual mode (no data source or manual entry)
  const isManualMode = !dataSourceId || dataSourceId === "manual";

  const getTrendIcon = () => {
    if (!data.trend || data.trend === 0) return <Minus className="h-4 w-4" />;
    return data.trend > 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  const getTrendColor = () => {
    if (!data.trend || data.trend === 0) return "text-muted-foreground";
    return data.trend > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  const updateField = (field: keyof MetricCardWidgetData, value: any) => {
    if (!onDataChange) return;
    onDataChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-rose-600" />
            <CardTitle className="text-sm font-semibold">{data.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isManualMode && onDataChange && (
              <button
                onClick={() => setIsConfiguring(!isConfiguring)}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  isConfiguring
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                    : "text-muted-foreground hover:bg-muted"
                }`}>
                <Edit2 className="h-3 w-3" />
                {isConfiguring ? "Done" : "Configure"}
              </button>
            )}
          </div>
        </div>
        {data.description && (
          <CardDescription className="text-xs">{data.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isConfiguring ? (
          <div className="bg-muted/50 space-y-3 rounded-lg p-3">
            <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Configure Metric
            </div>
            <div className="space-y-2">
              <Input
                label="Title"
                type="text"
                value={data.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="h-9"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Value"
                  type="number"
                  value={data.value}
                  onChange={(e) => updateField("value", Number(e.target.value))}
                  className="h-9"
                />
                <Input
                  label="Unit"
                  type="text"
                  value={data.unit || ""}
                  onChange={(e) => updateField("unit", e.target.value)}
                  placeholder="e.g., %, $, items"
                  className="h-9"
                />
              </div>
              <Input
                label="Trend (%)"
                type="number"
                value={data.trend || 0}
                onChange={(e) => updateField("trend", Number(e.target.value))}
                step="0.1"
                placeholder="e.g., 5.2 or -3.1"
                className="h-9"
              />
              <Textarea
                label="Description"
                value={data.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Optional description"
                className="min-h-15"
                rows={2}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="flex items-baseline gap-1">
              <span className="text-foreground text-4xl font-bold">
                {data.value.toLocaleString()}
              </span>
              {data.unit && <span className="text-muted-foreground text-lg">{data.unit}</span>}
            </div>
            {data.trend !== undefined && data.trend !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm leading-none font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>
                  {data.trend > 0 ? "+" : ""}
                  {data.trend}% from last period
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
