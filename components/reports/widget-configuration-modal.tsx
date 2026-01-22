"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { DataSourceSelector } from "@/components/shared/data-source-selector";
import { WidgetTypeSelector } from "@/components/shared/widget-type-selector";
import { useWidgetDataFetch, transformWidgetData } from "@/hooks/shared/use-widget-data";
import type { DataSource, WidgetType, WidgetInstance } from "@/lib/types/report-types";

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
  existingWidget?: WidgetInstance;
  filterByCategory?: DataSource["category"][];
}

type Step = "select-data-source" | "select-widget-type" | "loading";

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
  existingWidget,
  filterByCategory
}: WidgetConfigurationModalProps) {
  const [step, setStep] = useState<Step>("select-data-source");
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: fetchWidgetData, isPending: isFetching } = useWidgetDataFetch();

  // Reset state when modal opens/closes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        // Reset state on close
        setStep("select-data-source");
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

    setStep("select-widget-type");
  }, []);

  // Handle widget type selection
  const handleWidgetTypeSelect = useCallback((widgetType: WidgetType) => {
    setSelectedWidgetType(widgetType);
    setError(null);
  }, []);

  // Go back to data source selection
  const handleBack = useCallback(() => {
    setStep("select-data-source");
    setSelectedWidgetType(null);
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

    setStep("loading");
    setError(null);

    try {
      console.log("🔍 [WidgetConfigModal] Fetching widget data...");
      const rawData = await fetchWidgetData({
        dataSourceId: selectedDataSource.id,
        widgetType: selectedWidgetType,
        entityId
      });

      console.log("🔍 [WidgetConfigModal] Raw data received:", {
        dataType: typeof rawData,
        isArray: Array.isArray(rawData),
        keys: typeof rawData === "object" && rawData !== null ? Object.keys(rawData) : []
      });

      // Transform the data based on widget type
      console.log("🔍 [WidgetConfigModal] Transforming data...");
      const transformedData = transformWidgetData(
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
      setStep("select-widget-type");
    }
  }, [
    selectedDataSource,
    selectedWidgetType,
    entityId,
    fetchWidgetData,
    onConfigure,
    handleOpenChange
  ]);

  const getTitle = () => {
    switch (step) {
      case "select-data-source":
        return existingWidget ? "Reconfigure Widget" : "Add Widget";
      case "select-widget-type":
        return "Select Display Type";
      case "loading":
        return "Loading Data...";
      default:
        return "Configure Widget";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "select-data-source":
        return "Choose a data source to populate your widget";
      case "select-widget-type":
        return `Choose how to display "${selectedDataSource?.name}"`;
      case "loading":
        return "Fetching data from the selected source...";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Select Data Source */}
          {step === "select-data-source" && (
            <DataSourceSelector
              selectedDataSourceId={selectedDataSource?.id}
              onSelect={handleDataSourceSelect}
              filterByCategory={filterByCategory}
            />
          )}

          {/* Step 2: Select Widget Type */}
          {step === "select-widget-type" && selectedDataSource && (
            <div className="space-y-4">
              {/* Selected data source summary */}
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Selected Data Source
                </p>
                <p className="mt-1 font-medium text-gray-900">
                  {selectedDataSource.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedDataSource.description}
                </p>
              </div>

              {/* Widget type selection */}
              <WidgetTypeSelector
                compatibleWidgets={selectedDataSource.compatible_widgets}
                selectedType={selectedWidgetType ?? undefined}
                onSelect={handleWidgetTypeSelect}
              />
            </div>
          )}

          {/* Loading State */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-3 text-sm text-gray-500">
                Fetching data for {selectedDataSource?.name}...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "select-widget-type" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          {step !== "loading" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
          )}

          {step === "select-widget-type" && (
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedWidgetType || isFetching}
              className="gap-2"
            >
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Add Widget
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default WidgetConfigurationModal;
