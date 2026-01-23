"use client";

import React, { useState } from "react";
import {
  PieChart,
  BarChart2,
  Table2,
  LineChart,
  AreaChart,
  Type,
  GitBranch,
  Gauge,
  ChevronDown
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import type { WidgetType } from "@/lib/types/report-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface WidgetTypeChangerProps {
  currentType: WidgetType;
  compatibleTypes: WidgetType[];
  onTypeChange: (newType: WidgetType) => void;
  className?: string;
}

const widgetTypeConfig: Record<
  WidgetType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  pie_chart: {
    label: "Pie Chart",
    icon: PieChart,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100"
  },
  bar_chart: {
    label: "Bar Chart",
    icon: BarChart2,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100"
  },
  table: {
    label: "Table",
    icon: Table2,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100"
  },
  line_chart: {
    label: "Line Chart",
    icon: LineChart,
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100"
  },
  area_chart: {
    label: "Area Chart",
    icon: AreaChart,
    color: "text-teal-600",
    bgColor: "bg-teal-50 hover:bg-teal-100"
  },
  text_block: {
    label: "Text Block",
    icon: Type,
    color: "text-gray-600",
    bgColor: "bg-gray-50 hover:bg-gray-100"
  },
  risk_objective_mapping: {
    label: "Risk-Objective Map",
    icon: GitBranch,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 hover:bg-indigo-100"
  },
  metric_card: {
    label: "Metric Card",
    icon: Gauge,
    color: "text-rose-600",
    bgColor: "bg-rose-50 hover:bg-rose-100"
  }
};

/**
 * WidgetTypeChanger - Allows changing the widget type from compatible options
 * Only shows widget types that are compatible with the current data source
 */
export function WidgetTypeChanger({
  currentType,
  compatibleTypes,
  onTypeChange,
  className
}: WidgetTypeChangerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = widgetTypeConfig[currentType];
  const CurrentIcon = currentConfig.icon;

  const handleTypeChange = (newType: WidgetType) => {
    console.log("🔍 [WidgetTypeChanger] Type change requested:", {
      from: currentType,
      to: newType
    });
    onTypeChange(newType);
    setIsOpen(false);
  };

  // Filter to only compatible types
  const availableTypes = compatibleTypes.filter((type) => widgetTypeConfig[type]);

  if (availableTypes.length <= 1) {
    // Don't show the changer if there's only one option
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 gap-1 px-2 text-xs", className)}
        >
          <CurrentIcon className={cn("h-3 w-3", currentConfig.color)} />
          <span>{currentConfig.label}</span>
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2" align="end">
        <p className="mb-2 px-2 text-xs font-medium text-gray-500">
          Change widget type
        </p>
        <div className="space-y-1">
          {availableTypes.map((type) => {
            const config = widgetTypeConfig[type];
            const Icon = config.icon;
            const isCurrent = type === currentType;

            return (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                disabled={isCurrent}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  isCurrent
                    ? "cursor-default bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="flex-1">{config.label}</span>
                {isCurrent && (
                  <span className="text-xs text-blue-600">Current</span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default WidgetTypeChanger;
