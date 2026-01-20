import React, { useState } from "react";
import { PieChart, Edit2, X, Plus } from "lucide-react";
import { PieChartWidgetData, DataSource, PieChartSlice } from "@/lib/types/report-types";
import { WidgetDataSourcePicker } from "./widget-data-source-picker";

interface PieChartWidgetProps {
  data: PieChartWidgetData;
  dataSourceId?: string;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  onDataChange?: (data: PieChartWidgetData) => void;
  showDataSourcePicker?: boolean;
}

export const PieChartWidget = ({
  data,
  dataSourceId,
  onDataSourceChange,
  onDataChange,
  showDataSourcePicker = true
}: PieChartWidgetProps) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const total = data.slices.reduce((sum, slice) => sum + slice.value, 0);

  const addSlice = () => {
    if (!onDataChange) return;
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#ec4899"];
    const nextColor = colors[data.slices.length % colors.length];
    onDataChange({
      ...data,
      slices: [...data.slices, { label: `New Category`, value: 10, color: nextColor }]
    });
  };

  const removeSlice = (index: number) => {
    if (!onDataChange) return;
    onDataChange({
      ...data,
      slices: data.slices.filter((_, i) => i !== index)
    });
  };

  const updateSlice = (index: number, updates: Partial<PieChartSlice>) => {
    if (!onDataChange) return;
    onDataChange({
      ...data,
      slices: data.slices.map((slice, i) => (i === index ? { ...slice, ...updates } : slice))
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <PieChart className="h-4 w-4 text-blue-600" />
          {data.title}
        </h4>
        <div className="flex items-center gap-2">
          {showDataSourcePicker && onDataSourceChange && (
            <WidgetDataSourcePicker
              widgetType="pie_chart"
              currentDataSourceId={dataSourceId}
              onDataSourceChange={onDataSourceChange}
            />
          )}
          {!dataSourceId && onDataChange && (
            <button
              onClick={() => setIsConfiguring(!isConfiguring)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                isConfiguring ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
              }`}>
              <Edit2 className="h-3 w-3" />
              {isConfiguring ? "Done" : "Configure Slices"}
            </button>
          )}
        </div>
      </div>

      {isConfiguring && (
        <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3">
          <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Configure Data Slices
          </div>
          <div className="space-y-2">
            {data.slices.map((slice, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="color"
                  value={slice.color}
                  onChange={(e) => updateSlice(i, { color: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={slice.label}
                  onChange={(e) => updateSlice(i, { label: e.target.value })}
                  placeholder="Label"
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={slice.value}
                  onChange={(e) => updateSlice(i, { value: Number(e.target.value) })}
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
                <button onClick={() => removeSlice(i)} className="text-gray-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addSlice}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-dashed border-gray-300 py-1.5 text-xs font-medium text-gray-500 transition-all hover:border-purple-400 hover:bg-white hover:text-purple-600">
            <Plus className="h-3 w-3" />
            Add New Slice
          </button>
        </div>
      )}

      <div className="flex items-center gap-6">
        {/* Simple pie representation */}
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 32 32" className="h-full w-full -rotate-90">
            {(() => {
              let cumulativePercent = 0;
              return data.slices.map((slice, i) => {
                const percent = (slice.value / total) * 100;
                const strokeDasharray = `${percent} ${100 - percent}`;
                const strokeDashoffset = -cumulativePercent;
                cumulativePercent += percent;

                return (
                  <circle
                    key={i}
                    cx="16"
                    cy="16"
                    r="12"
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dasharray 0.3s" }}
                  />
                );
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{total}</span>
          </div>
        </div>
        {/* Legend */}
        <div className="space-y-2">
          {data.slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded" style={{ backgroundColor: slice.color }} />
              <span className="text-gray-600">{slice.label}</span>
              <span className="font-medium text-gray-900">({slice.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
