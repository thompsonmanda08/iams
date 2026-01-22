import React, { useState } from "react";
import { WidgetDataSourcePicker } from "./widget-data-source-picker";
import { BarChart3, Edit2, Plus, Trash2, X } from "lucide-react";
import { DataSource } from "@/lib/types/report-types";
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


// ============================================================================
// BAR CHART COMPONENT
// ============================================================================

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

  // Determine if using flat structure (from API) or nested structure (legacy)
  const isFlatStructure = Array.isArray(data.categories) &&
    typeof data.categories[0] === 'string' &&
    data.series;

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

  // Calculate max value for scaling
  const values = categories.flatMap((cat) => cat?.series?.map((series) => series.value) || []);
  const maxValue = values.length > 0 ? Math.max(...values) : 100;

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
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          {data.title}
        </h4>
        <div className="flex items-center gap-2">
          {showDataSourcePicker && onDataSourceChange && (
            <WidgetDataSourcePicker
              widgetType="bar_chart"
              currentDataSourceId={dataSourceId}
              onDataSourceChange={onDataSourceChange}
            />
          )}
          {!dataSourceId && onDataChange && (
            <>
              <button
                onClick={toggleOrientation}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                {orientation === "vertical" ? "↔" : "↕"} Orientation
              </button>
              <button
                onClick={() => setIsConfiguring(!isConfiguring)}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  isConfiguring
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}>
                <Edit2 className="h-3 w-3" />
                {isConfiguring ? "Done" : "Configure"}
              </button>
            </>
          )}
        </div>
      </div>

      {isConfiguring && !isFlatStructure && (
        <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3">
          <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Configure Bar Chart
          </div>
          <div className="space-y-3">
            {categories.map((category, catIndex) => (
              <div key={catIndex} className="rounded border border-gray-200 bg-white p-2">
                <div className="mb-2 flex items-center justify-between">
                  <input
                    type="text"
                    value={category.label}
                    onChange={(e) => updateCategory(catIndex, { label: e.target.value })}
                    className="rounded border border-gray-300 px-2 py-1 text-sm font-medium"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => addSeries(catIndex)}
                      className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100">
                      <Plus className="h-3 w-3" /> Add Series
                    </button>
                    <button
                      onClick={() => removeCategory(catIndex)}
                      className="text-gray-400 hover:text-red-500">
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
                        className="h-6 w-6 cursor-pointer rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={series.label}
                        onChange={(e) =>
                          updateSeries(catIndex, seriesIndex, { label: e.target.value })
                        }
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                      />
                      <input
                        type="number"
                        value={series.value}
                        onChange={(e) =>
                          updateSeries(catIndex, seriesIndex, { value: Number(e.target.value) })
                        }
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => removeSeries(catIndex, seriesIndex)}
                        className="text-gray-400 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={addCategory}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-dashed border-gray-300 py-1.5 text-xs font-medium text-gray-500 transition-all hover:border-purple-400 hover:bg-white hover:text-purple-600">
              <Plus className="h-3 w-3" />
              Add Category
            </button>
          </div>
        </div>
      )}

      {/* Bar Chart Visualization */}
      <div className={`${orientation === "vertical" ? "flex h-64" : "h-80"} gap-2`}>
        {orientation === "vertical" ? (
          // Vertical bars
          <div className="flex flex-1 items-end justify-between gap-1 px-4 pb-8">
            {categories.map((category, catIndex) => (
              <div key={catIndex} className="flex h-full flex-col items-center gap-1">
                <div className="flex h-full flex-col-reverse items-center justify-end gap-1">
                  {category.series.map((series, seriesIndex) => (
                    <div
                      key={seriesIndex}
                      style={{
                        height: `${(series.value / maxValue) * 90}%`,
                        backgroundColor: series.color
                      }}
                      className="relative w-6 rounded-t hover:opacity-90 mt-4"
                      title={`${series.label}: ${series.value}`}>
                      {showValues && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                          {series.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs font-medium text-gray-700 text-capitalize">{category.label}</div>
              </div>
            ))}
          </div>
        ) : (
          // Horizontal bars
          <div className="flex flex-col gap-2 px-4">
            {categories.map((category, catIndex) => (
              <div key={catIndex} className="flex items-center gap-2">
                <div className="w-32 truncate text-xs font-medium text-gray-700">
                  {category.label}
                </div>
                <div className="flex flex-1 gap-1">
                  {category?.series?.map((series, seriesIndex) => (
                    <div
                      key={seriesIndex}
                      style={{
                        width: `${(series.value / maxValue) * 100}%`,
                        backgroundColor: series.color
                      }}
                      className="h-6 rounded-l hover:opacity-90"
                      title={`${series.label}: ${series.value}`}>
                      {showValues && (
                        <div className="flex h-full items-center justify-center text-xs font-medium text-white">
                          {series.value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from(
          new Set(categories.flatMap((cat) => cat.series.map((series) => series.label)))
        ).map((seriesLabel, index) => {
          // Find the color for this series (take from first occurrence)
          const firstSeries = categories
            .flatMap((cat) => cat.series)
            .find((series) => series.label === seriesLabel);

          return (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: firstSeries?.color || "#ccc" }}
              />
              <span className="text-gray-600 text-capitalize">{seriesLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};