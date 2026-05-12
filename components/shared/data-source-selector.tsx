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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useDataSources } from "@/hooks/shared/use-data-sources";
import type { DataSource, WidgetType } from "@/lib/types/report-types";
import { cn } from "@/lib/utils";
import { searchDataSources } from "@/lib/utils/search-data-sources";
import { Button } from "@/components/ui/button";
import { getWidgetTypeInfo } from "./widget-type-selector";
import { Spinner } from "../ui/spinner";

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
      console.log(
        "🔍 [DataSourceSelector] No category filter applied, showing all",
        dataSources.length,
        "sources"
      );
      return dataSources;
    }
    const filtered = dataSources.filter((ds) => filterByCategory.includes(ds.category));
    console.log(
      "🔍 [DataSourceSelector] Filtered by categories",
      filterByCategory,
      ":",
      filtered.length,
      "sources"
    );
    return filtered;
  }, [dataSources, filterByCategory]);

  // Get available categories from filtered sources
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(filteredByAllowedCategories.map((ds) => ds.category)));
    console.log("🔍 [DataSourceSelector] Available categories:", categories);
    return categories;
  }, [filteredByAllowedCategories]);

  // Apply search and category filter with smart scoring
  const filteredSources = useMemo(() => {
    let sources = filteredByAllowedCategories;

    // Filter by selected category
    if (selectedCategory !== "all") {
      sources = sources.filter((ds) => ds.category === selectedCategory);
    }

    // Smart search with scoring and ranking
    if (searchQuery.trim()) {
      return searchDataSources(sources, searchQuery).map((scored) => scored.source);
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
    <Popover open={isOpen} onOpenChange={setIsOpen} isModal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn("w-full justify-between", className)}>
          <div className="flex items-center gap-2 truncate">
            {isLoading ? (
              <Spinner className="text-muted-foreground h-4 w-4 animate-spin" />
            ) : selectedSource ? (
              <>
                {React.createElement(categoryConfig[selectedSource.category].icon, {
                  className: `h-4 w-4 ${categoryConfig[selectedSource.category].color}`
                })}
                <span className="text-foreground truncate">{selectedSource.name}</span>
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-xs",
                    categoryConfig[selectedSource.category].bgColor,
                    categoryConfig[selectedSource.category].color
                  )}>
                  {categoryConfig[selectedSource.category].label}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "text-muted-foreground h-4 w-4 shrink-0 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[500px] p-0" align="start" side="bottom" sideOffset={8}>
        {/* Search */}
        <div className="border-border border-b p-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search data sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-input focus:border-primary focus:ring-primary w-full rounded-md border py-2 pr-3 pl-9 text-sm focus:ring-1 focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="border-border flex flex-wrap gap-1 border-b p-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>
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
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}>
              {categoryConfig[cat].label}
            </button>
          ))}
        </div>

        {/* Manual Entry Option */}
        <div className="border-border border-b p-2">
          <button
            type="button"
            onClick={() => {
              handleSelect({
                id: "manual",
                name: "Manual Entry",
                category: "custom",
                description: "Enter your own data manually",
                compatible_widgets: [
                  "pie_chart",
                  "bar_chart",
                  "table",
                  "line_chart",
                  "area_chart",
                  "metric_card",
                  "risk_objective_mapping"
                ],
                requires_entity: false,
                sample_data: {}
              } as DataSource);
            }}
            className="hover:bg-muted mb-1 w-full rounded-lg p-3 text-left transition-colors">
            <div className="flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-purple-500" />
              <span className="text-foreground font-medium">Manual Entry</span>
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
                Custom
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Enter your own data manually</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(
                [
                  "pie_chart",
                  "bar_chart",
                  "table",
                  "line_chart",
                  "area_chart",
                  "metric_card",
                  "risk_objective_mapping"
                ] as WidgetType[]
              ).map((type) => {
                const info = getWidgetTypeInfo(type);
                return (
                  <span
                    key={type}
                    className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
                    title={info.description}>
                    {React.createElement(info.icon, { className: "h-3 w-3" })}
                    {info.label}
                  </span>
                );
              })}
            </div>
          </button>
        </div>

        {/* Data Source List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              <span className="text-muted-foreground ml-2 text-sm">Loading data sources...</span>
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
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
                    isSelected ? "border-primary/30 bg-primary/10 border" : "hover:bg-muted"
                  )}>
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", config.color)} />
                    <span className="text-foreground font-medium">{source.name}</span>
                    <span
                      className={cn("rounded px-1.5 py-0.5 text-xs", config.bgColor, config.color)}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">{source.description}</p>
                  {source.requires_entity && (
                    <p className="mt-1 text-xs text-amber-600">
                      ⚠ Requires linked audit plan or risk register
                    </p>
                  )}

                  {/* Compatible Widget Types */}
                  {source.compatible_widgets && source.compatible_widgets.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {source.compatible_widgets.map((widgetType) => {
                        const info = getWidgetTypeInfo(widgetType);
                        return (
                          <span
                            key={widgetType}
                            className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
                            title={info.description}>
                            {React.createElement(info.icon, { className: "h-3 w-3" })}
                            {info.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Close Button */}
        <div className="border-border border-t p-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="bg-muted text-muted-foreground hover:bg-muted/80 w-full rounded px-3 py-2 text-sm">
            Cancel
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DataSourceSelector;
