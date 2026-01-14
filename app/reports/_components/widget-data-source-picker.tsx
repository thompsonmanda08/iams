import React, { useState } from "react";
import { Settings2, ChevronDown, Edit2, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { WidgetType, DataSource } from "../types";

export interface WidgetDataSourcePickerProps {
  currentDataSourceId: string | undefined;
  widgetType: WidgetType;
  onDataSourceChange: (dataSource: DataSource | null) => void;
}

// Data sources configuration should ideally come from a context or prop, but for now we keep it here
// or import it if better. We'll define a local version or import it.
// Since AVAILABLE_DATA_SOURCES was in page.tsx, let's export it from a constants file or similar.
// For now, I will include the data checking logic but we need the data sources.
// I will move AVAILABLE_DATA_SOURCES to a separate file or keep it in the parent and pass it down?
// Better to move it to a constants file. Let's assume we will pass sources as props or import them.

// Use a simplified version or assume integration later.
// Actually, `AVAILABLE_DATA_SOURCES` is a constant. I should extract it to `types.ts` or a new `constants.ts`.
// For this refactor, I'll place the constant in `types.ts`? No, types shouldn't have values.
// I will create a `constants.ts` file in `_components` or `reports` folder.
// For now, I'll paste the component and assume we fix imports.
// Wait, I can't leave broken imports.

// Let's create `constants.ts` first?
// Or I can copy the constant here if it's small. It was somewhat large.
// Let's assume I will create `constants.ts` next.

import { AVAILABLE_DATA_SOURCES } from "../constants";

export const WidgetDataSourcePicker = ({
  currentDataSourceId,
  widgetType,
  onDataSourceChange
}: WidgetDataSourcePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter data sources compatible with this widget type
  const compatibleSources = AVAILABLE_DATA_SOURCES.filter((ds) =>
    ds.compatible_widgets.includes(widgetType)
  );

  const filteredSources =
    selectedCategory === "all"
      ? compatibleSources
      : compatibleSources.filter((ds) => ds.category === selectedCategory);

  const currentSource = compatibleSources.find((ds) => ds.id === currentDataSourceId);

  const categories = Array.from(new Set(compatibleSources.map((ds) => ds.category)));

  const categoryLabels: Record<string, string> = {
    audit: "Audit Data",
    risk: "Risk Data",
    compliance: "Compliance",
    custom: "Custom Entry"
  };

  const categoryColors: Record<string, string> = {
    audit: "bg-blue-100 text-blue-700",
    risk: "bg-red-100 text-red-700",
    compliance: "bg-green-100 text-green-700",
    custom: "bg-purple-100 text-purple-700"
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-50">
        <Settings2 className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">
          {currentSource ? currentSource.name : "Select Data Source"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 p-3">
            <p className="mb-2 text-xs font-medium text-gray-500">
              Select data source for {widgetType === "pie_chart" ? "Pie Chart" : "Table"}
            </p>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`rounded px-2 py-1 text-xs font-medium ${
                  selectedCategory === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    selectedCategory === cat
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {categoryLabels[cat] || cat}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {/* Option to use custom/manual entry */}
            <button
              onClick={() => {
                onDataSourceChange(null);
                setIsOpen(false);
              }}
              className={`mb-1 w-full rounded-lg p-3 text-left transition-colors ${
                !currentDataSourceId ? "border border-blue-200 bg-blue-50" : "hover:bg-gray-50"
              }`}>
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-gray-900">Manual Entry</span>
                <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
                  Custom
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Enter your own data manually</p>
            </button>

            <div className="my-2 border-t border-gray-100" />

            {filteredSources.map((source) => (
              <button
                key={source.id}
                onClick={() => {
                  onDataSourceChange(source);
                  setIsOpen(false);
                }}
                className={`mb-1 w-full rounded-lg p-3 text-left transition-colors ${
                  currentDataSourceId === source.id
                    ? "border border-blue-200 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}>
                <div className="flex items-center gap-2">
                  {source.category === "audit" && <FileText className="h-4 w-4 text-blue-500" />}
                  {source.category === "risk" && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {source.category === "compliance" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {source.category === "custom" && <Edit2 className="h-4 w-4 text-purple-500" />}
                  <span className="font-medium text-gray-900">{source.name}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${categoryColors[source.category]}`}>
                    {categoryLabels[source.category]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{source.description}</p>
                {source.requires_entity && (
                  <p className="mt-1 text-xs text-amber-600">
                    ⚠ Requires linked audit plan or risk register
                  </p>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full rounded bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
