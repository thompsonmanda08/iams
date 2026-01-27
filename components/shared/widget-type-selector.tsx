"use client";

import React from "react";
import {
  PieChart,
  BarChart2,
  Table2,
  LineChart,
  AreaChart,
  Type,
  GitBranch,
  Gauge
} from "lucide-react";
import type { WidgetType } from "@/lib/types/report-types";
import { cn } from "@/lib/utils";

export interface WidgetTypeSelectorProps {
  compatibleWidgets: WidgetType[];
  selectedType?: WidgetType;
  onSelect: (type: WidgetType) => void;
  className?: string;
}

const widgetTypeConfig: Record<
  WidgetType,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  pie_chart: {
    label: "Pie Chart",
    description: "Show data as proportional slices",
    icon: PieChart,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:border-blue-800"
  },
  bar_chart: {
    label: "Bar Chart",
    description: "Compare values across categories",
    icon: BarChart2,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-950/30 dark:hover:bg-green-950/50 dark:border-green-800"
  },
  table: {
    label: "Table",
    description: "Display data in rows and columns",
    icon: Table2,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 dark:border-purple-800"
  },
  line_chart: {
    label: "Line Chart",
    description: "Show trends over time",
    icon: LineChart,
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100 border-orange-200 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 dark:border-orange-800"
  },
  text_block: {
    label: "Text Block",
    description: "Display formatted text content",
    icon: Type,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50 hover:bg-muted border-border"
  },
  risk_objective_mapping: {
    label: "Risk-Objective Map",
    description: "Map risks to strategic objectives",
    icon: GitBranch,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 dark:border-indigo-800"
  },
  area_chart: {
    label: "Area Chart",
    description: "Show trends with filled areas",
    icon: AreaChart,
    color: "text-teal-600",
    bgColor: "bg-teal-50 hover:bg-teal-100 border-teal-200 dark:bg-teal-950/30 dark:hover:bg-teal-950/50 dark:border-teal-800"
  },
  metric_card: {
    label: "Metric Card",
    description: "Display a single key metric",
    icon: Gauge,
    color: "text-rose-600",
    bgColor: "bg-rose-50 hover:bg-rose-100 border-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:border-rose-800"
  }
};

/**
 * WidgetTypeSelector - Select a widget type from compatible options
 * Displays visual cards for each available widget type
 */
export function WidgetTypeSelector({
  compatibleWidgets,
  selectedType,
  onSelect,
  className
}: WidgetTypeSelectorProps) {
  if (!compatibleWidgets || compatibleWidgets.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No compatible widget types available
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3", className)}>
      <p className="text-sm font-medium text-foreground">
        Select how you want to display this data:
      </p>
      <div
        className={cn(
          "grid gap-2",
          compatibleWidgets.length <= 2 ? "grid-cols-2" : "grid-cols-3"
        )}
      >
        {compatibleWidgets.map((widgetType) => {
          const config = widgetTypeConfig[widgetType];
          if (!config) return null;

          const Icon = config.icon;
          const isSelected = selectedType === widgetType;

          return (
            <button
              key={widgetType}
              type="button"
              onClick={() => onSelect(widgetType)}
              className={cn(
                "flex flex-col items-center rounded-lg border p-4 transition-all",
                config.bgColor,
                isSelected
                  ? "ring-2 ring-primary ring-offset-1"
                  : "border-border"
              )}
            >
              <Icon className={cn("h-8 w-8 mb-2", config.color)} />
              <span className="text-sm font-medium text-foreground">
                {config.label}
              </span>
              <span className="mt-1 text-xs text-muted-foreground text-center">
                {config.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Get widget type display info
 */
export function getWidgetTypeInfo(widgetType: WidgetType) {
  return widgetTypeConfig[widgetType];
}

export default WidgetTypeSelector;
