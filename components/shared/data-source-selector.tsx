"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Edit2,
  Search,
  ChevronDown,
  Loader2
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { useDataSources } from "@/hooks/shared/use-data-sources";
import type { DataSource } from "@/lib/types/report-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface DataSourceSelectorProps {
  selectedDataSourceId?: string;
  onSelect: (dataSource: DataSource) => void;
  filterByCategory?: DataSource["category"][];
  className?: string;
  placeholder?: string;
}

const categoryConfig: Record<
  DataSource["category"],
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  audit: {
    label: "Audit Data",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: FileText
  },
  risk: {
    label: "Risk Data",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: AlertCircle
  },
  compliance: {
    label: "Compliance",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle
  },
  custom: {
    label: "Custom",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Edit2
  }
};

/**
 * DataSourceSelector - Select a data source from all available sources
 * Groups data sources by category and shows compatible widget types
 * Uses Popover component for better UX
 */
export function DataSourceSelector({
  selectedDataSourceId,
  onSelect,
  filterByCategory,
  className,
  placeholder = "Select a data source..."
}: DataSourceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: dataSources = [], isLoading } = useDataSources();

  // Debug logging for data sources
  useEffect(() => {
    console.log("🔍 [DataSourceSelector] Data sources loaded:", {
      total: dataSources.length,
      isLoading,
      filterByCategory: filterByCategory || "none"
    });

    if (dataSources.length > 0) {
      console.table(
        dataSources.map((ds) => ({
          id: ds.id,
          name: ds.name,
          category: ds.category,
          compatible_widgets: ds.compatible_widgets.join(", "),
          requires_entity: ds.requires_entity
        }))
      );
    }
  }, [dataSources, isLoading, filterByCategory]);

  // Filter by allowed categories if specified
  const filteredByAllowedCategories = useMemo(() => {
    if (!filterByCategory || filterByCategory.length === 0) {
      console.log("🔍 [DataSourceSelector] No category filter applied, showing all", dataSources.length, "sources");
      return dataSources;
    }
    const filtered = dataSources.filter((ds) => filterByCategory.includes(ds.category));
    console.log("🔍 [DataSourceSelector] Filtered by categories", filterByCategory, ":", filtered.length, "sources");
    return filtered;
  }, [dataSources, filterByCategory]);

  // Get available categories from filtered sources
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(filteredByAllowedCategories.map((ds) => ds.category)));
    console.log("🔍 [DataSourceSelector] Available categories:", categories);
    return categories;
  }, [filteredByAllowedCategories]);

  // Apply search and category filter
  const filteredSources = useMemo(() => {
    let sources = filteredByAllowedCategories;

    // Filter by selected category
    if (selectedCategory !== "all") {
      sources = sources.filter((ds) => ds.category === selectedCategory);
      console.log("🔍 [DataSourceSelector] Filtered by category", selectedCategory, ":", sources.length, "sources");
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sources = sources.filter(
        (ds) =>
          ds.name.toLowerCase().includes(query) ||
          ds.description.toLowerCase().includes(query)
      );
      console.log("🔍 [DataSourceSelector] Filtered by search", query, ":", sources.length, "sources");
    }

    return sources;
  }, [filteredByAllowedCategories, selectedCategory, searchQuery]);

  // Find currently selected data source
  const selectedSource = dataSources.find((ds) => ds.id === selectedDataSourceId);

  const handleSelect = (dataSource: DataSource) => {
    console.log("✅ [DataSourceSelector] Data source selected:", {
      id: dataSource.id,
      name: dataSource.name,
      category: dataSource.category
    });
    onSelect(dataSource);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2 truncate">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : selectedSource ? (
              <>
                {React.createElement(categoryConfig[selectedSource.category].icon, {
                  className: `h-4 w-4 ${categoryConfig[selectedSource.category].color}`
                })}
                <span className="truncate text-gray-900">{selectedSource.name}</span>
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-xs",
                    categoryConfig[selectedSource.category].bgColor,
                    categoryConfig[selectedSource.category].color
                  )}
                >
                  {categoryConfig[selectedSource.category].label}
                </span>
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        {/* Search */}
        <div className="border-b border-gray-200 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search data sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {categoryConfig[cat].label}
            </button>
          ))}
        </div>

        {/* Manual Entry Option */}
        <div className="border-b border-gray-100 p-2">
          <button
            type="button"
            onClick={() => {
              onSelect({ id: "manual", name: "Manual Entry", category: "custom" } as DataSource);
              setIsOpen(false);
            }}
            className="mb-1 w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-gray-900">Manual Entry</span>
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
                Custom
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Enter your own data manually</p>
          </button>
        </div>

        {/* Data Source List */}
        <div className="max-h-64 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading data sources...</span>
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No data sources found
            </div>
          ) : (
            filteredSources.map((source) => {
              const config = categoryConfig[source.category];
              const Icon = config.icon;
              const isSelected = selectedDataSourceId === source.id;

              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => handleSelect(source)}
                  className={cn(
                    "mb-1 w-full rounded-lg p-3 text-left transition-colors",
                    isSelected
                      ? "border border-blue-200 bg-blue-50"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", config.color)} />
                    <span className="font-medium text-gray-900">{source.name}</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs",
                        config.bgColor,
                        config.color
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{source.description}</p>
                  {source.requires_entity && (
                    <p className="mt-1 text-xs text-amber-600">
                      ⚠ Requires linked audit plan or risk register
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Close Button */}
        <div className="border-t border-gray-200 p-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full rounded bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DataSourceSelector;
