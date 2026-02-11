"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CustomAlert from "@/components/ui/custom-alert";
import {
  Loader2,
  ArrowLeft,
  Check,
  Search,
  FileText,
  AlertCircle,
  CheckCircle,
  Edit2
} from "lucide-react";
import { DataSourceSelector } from "@/components/shared/data-source-selector";
import { WidgetTypeSelector } from "@/components/shared/widget-type-selector";
import { useWidgetDataFetch, transformWidgetData } from "@/hooks/shared/use-widget-data";
import { useDataSources } from "@/hooks/shared/use-data-sources";
import type { DataSource, WidgetType, WidgetInstance, ReportEntityType } from "@/lib/types/report-types";
import { cn } from "@/lib/utils";
import { searchDataSources } from "@/lib/utils/search-data-sources";

export interface WidgetConfiguration {
  dataSourceId: string;
  dataSourceName: string;
  widgetType: WidgetType;
  data: any;
}

export interface WidgetConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigure: (config: WidgetConfiguration) => void;
  entityId?: string;
  entityType?: ReportEntityType;
  existingWidget?: WidgetInstance;
  filterByCategory?: DataSource["category"][];
}

/**
 * Create empty data structure for manual entry based on widget type
 */
function getEmptyDataForWidgetType(widgetType: WidgetType): any {
  switch (widgetType) {
    case "pie_chart":
      return {
        title: "New Pie Chart",
        slices: [
          { label: "Category 1", value: 10, color: "#3b82f6" },
          { label: "Category 2", value: 15, color: "#10b981" },
          { label: "Category 3", value: 8, color: "#f59e0b" }
        ]
      };

    case "bar_chart":
      return {
        title: "New Bar Chart",
        categories: [
          {
            label: "Category 1",
            series: [
              { label: "Series 1", value: 10, color: "#3b82f6" },
              { label: "Series 2", value: 15, color: "#10b981" }
            ]
          },
          {
            label: "Category 2",
            series: [
              { label: "Series 1", value: 12, color: "#3b82f6" },
              { label: "Series 2", value: 18, color: "#10b981" }
            ]
          }
        ],
        orientation: "vertical",
        show_values: true
      };

    case "table":
      return {
        title: "New Table",
        columns: [
          { key: "column1", header: "Column 1" },
          { key: "column2", header: "Column 2" },
          { key: "column3", header: "Column 3" }
        ],
        rows: [],
        is_configurable: true
      };

    case "line_chart":
    case "area_chart":
      return {
        title: widgetType === "line_chart" ? "New Line Chart" : "New Area Chart",
        categories: ["Jan", "Feb", "Mar", "Apr", "May"],
        series: [
          {
            label: "Series 1",
            data: [10, 15, 12, 18, 20],
            color: "#3b82f6"
          }
        ]
      };

    case "metric_card":
      return {
        title: "New Metric",
        value: 0,
        unit: "",
        trend: 0,
        description: ""
      };

    default:
      return {
        title: "New Widget"
      };
  }
}

/**
 * WidgetConfigurationModal - Two-step modal for configuring a widget
 * Step 1: Select data source
 * Step 2: Select widget type from compatible options
 * Then: Fetch data and return configuration
 */
export function WidgetConfigurationModal({
  isOpen,
  onClose,
  onConfigure,
  entityId,
  entityType,
  existingWidget,
  filterByCategory
}: WidgetConfigurationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: fetchWidgetData, isPending: isFetching } = useWidgetDataFetch();

  // Reset state when modal opens/closes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        // Reset state on close
        setIsLoading(false);
        setSelectedDataSource(null);
        setSelectedWidgetType(null);
        setError(null);
        onClose();
      }
    },
    [onClose]
  );

  // Handle data source selection
  const handleDataSourceSelect = useCallback((dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setError(null);

    // If only one compatible widget, auto-select it
    if (dataSource.compatible_widgets.length === 1) {
      setSelectedWidgetType(dataSource.compatible_widgets[0]);
    } else {
      setSelectedWidgetType(null);
    }
  }, []);

  // Handle widget type selection
  const handleWidgetTypeSelect = useCallback((widgetType: WidgetType) => {
    setSelectedWidgetType(widgetType);
    setError(null);
  }, []);

  // Confirm and fetch data
  const handleConfirm = useCallback(async () => {
    console.log("🔍 [WidgetConfigModal] handleConfirm triggered:", {
      selectedDataSource: selectedDataSource?.id,
      selectedWidgetType,
      entityId
    });

    if (!selectedDataSource || !selectedWidgetType) {
      setError("Please select both a data source and widget type");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let transformedData;

      // Handle manual entry - create empty data structures
      if (selectedDataSource.id === "manual") {
        console.log(
          "🔍 [WidgetConfigModal] Manual entry selected, creating empty data structure..."
        );

        // Create empty data structure based on widget type
        const emptyData = getEmptyDataForWidgetType(selectedWidgetType);
        transformedData = {
          ...emptyData,
          title: selectedDataSource.name,
          data_source_id: "manual"
        };

        console.log("✅ [WidgetConfigModal] Empty data structure created:", {
          widgetType: selectedWidgetType,
          keys: Object.keys(transformedData)
        });
      } else {
        // Fetch real data from API
        console.log("🔍 [WidgetConfigModal] Fetching widget data from API...");
        const rawData = await fetchWidgetData({
          dataSourceId: selectedDataSource.id,
          widgetType: selectedWidgetType,
          entityId,
          entityType
        });

        console.log("🔍 [WidgetConfigModal] Raw data received:", {
          dataType: typeof rawData,
          isArray: Array.isArray(rawData),
          keys: typeof rawData === "object" && rawData !== null ? Object.keys(rawData) : []
        });

        // Transform the data based on widget type
        console.log("🔍 [WidgetConfigModal] Transforming data...");
        transformedData = transformWidgetData(
          rawData,
          selectedWidgetType,
          selectedDataSource.id,
          selectedDataSource.name
        );

        console.log("🔍 [WidgetConfigModal] Transformed data:", {
          title: transformedData.title,
          dataSourceId: transformedData.data_source_id,
          keys: Object.keys(transformedData)
        });
      }

      console.log("🔍 [WidgetConfigModal] Calling onConfigure with config:", {
        dataSourceId: selectedDataSource.id,
        dataSourceName: selectedDataSource.name,
        widgetType: selectedWidgetType
      });

      onConfigure({
        dataSourceId: selectedDataSource.id,
        dataSourceName: selectedDataSource.name,
        widgetType: selectedWidgetType,
        data: transformedData
      });

      console.log("✅ [WidgetConfigModal] Widget configured successfully");

      // Reset and close
      handleOpenChange(false);
    } catch (err: any) {
      console.error("❌ [WidgetConfigModal] Error:", err);
      setError(err.message || "Failed to fetch widget data");
      setIsLoading(false);
    }
  }, [
    selectedDataSource,
    selectedWidgetType,
    entityId,
    entityType,
    fetchWidgetData,
    onConfigure,
    handleOpenChange
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{existingWidget ? "Reconfigure Widget" : "Add Widget"}</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Fetching data from the selected source..."
              : "Choose a data source and select how to display it"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Data Source Selection */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">1. Select Data Source</h3>
                <p className="text-xs text-muted-foreground">Choose where the data comes from</p>
              </div>
              <InlineDataSourceSelector
                selectedDataSourceId={selectedDataSource?.id}
                onSelect={handleDataSourceSelect}
                filterByCategory={filterByCategory}
              />
            </div>

            {/* Right: Widget Type Selection */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">2. Select Widget Type</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedDataSource
                    ? `Choose how to display "${selectedDataSource.name}"`
                    : "Select a data source first"}
                </p>
              </div>
              {selectedDataSource ? (
                <WidgetTypeSelector
                  compatibleWidgets={selectedDataSource.compatible_widgets}
                  selectedType={selectedWidgetType ?? undefined}
                  onSelect={handleWidgetTypeSelect}
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
                  <p className="text-sm text-muted-foreground">Please select a data source</p>
                </div>
              )}
            </div>
          </div>
          {/* Error Message */}
          {error && <CustomAlert type="error" message={error} className="mt-4" />}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            disabled={isFetching || isLoading}
            variant="destructive"
            onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedWidgetType || isFetching || isLoading}
            className="gap-2"
            isLoading={isFetching}
            loadingText="Please wait...">
            <Check className="h-4 w-4" />
            Add Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * InlineDataSourceSelector - Inline version without popover
 * Shows all data sources in a scrollable list
 */
interface InlineDataSourceSelectorProps {
  selectedDataSourceId?: string;
  onSelect: (dataSource: DataSource) => void;
  filterByCategory?: DataSource["category"][];
}

function InlineDataSourceSelector({
  selectedDataSourceId,
  onSelect,
  filterByCategory
}: InlineDataSourceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: dataSources = [], isLoading } = useDataSources();

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

  // Filter by allowed categories
  const filteredByAllowedCategories = useMemo(() => {
    if (!filterByCategory || filterByCategory.length === 0) {
      return dataSources;
    }
    return dataSources.filter((ds: DataSource) => filterByCategory.includes(ds.category));
  }, [dataSources, filterByCategory]);

  // Get available categories
  const availableCategories = useMemo(() => {
    return Array.from(new Set(filteredByAllowedCategories.map((ds: DataSource) => ds.category)));
  }, [filteredByAllowedCategories]);

  // Apply search and category filter with smart scoring
  const filteredSources = useMemo(() => {
    let sources = filteredByAllowedCategories;

    if (selectedCategory !== "all") {
      sources = sources.filter((ds: DataSource) => ds.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      return searchDataSources(sources, searchQuery).map((scored) => scored.source);
    }

    return sources;
  }, [filteredByAllowedCategories, selectedCategory, searchQuery]);

  const handleSelect = (dataSource: DataSource) => {
    console.log("✅ [InlineDataSourceSelector] Data source selected:", {
      id: dataSource.id,
      name: dataSource.name,
      category: dataSource.category
    });
    onSelect(dataSource);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search data sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          autoFocus
          className="bg-background text-foreground w-full rounded-md border border-input py-2 pr-3 pl-9 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-1">
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
        {availableCategories.map((cat: DataSource["category"]) => (
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

      {/* Manual Entry Option - hidden when search doesn't match */}
      {(!searchQuery.trim() || "manual entry".includes(searchQuery.toLowerCase())) && (
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
          className={cn(
            "w-full rounded-lg border-2 p-3 text-left transition-colors",
            selectedDataSourceId === "manual"
              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
              : "border-border hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
          )}>
          <div className="flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-foreground">Manual Entry</span>
            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
              Custom
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Enter your own data manually</p>
        </button>
      )}

      {/* Data Source List */}
      <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading data sources...</span>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No data sources found</div>
        ) : (
          filteredSources.map((source: DataSource) => {
            const config = categoryConfig[source.category];
            const Icon = config.icon;
            const isSelected = selectedDataSourceId === source.id;

            return (
              <button
                key={source.id}
                type="button"
                onClick={() => handleSelect(source)}
                className={cn(
                  "w-full rounded-lg p-3 text-left transition-colors",
                  isSelected
                    ? "border-2 border-primary bg-primary/10"
                    : "border-2 border-transparent hover:border-border hover:bg-muted"
                )}>
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span className="font-medium text-foreground">{source.name}</span>
                  <span
                    className={cn("rounded px-1.5 py-0.5 text-xs", config.bgColor, config.color)}>
                    {config.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{source.description}</p>
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
    </div>
  );
}

export default WidgetConfigurationModal;
