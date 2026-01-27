"use client";

import React, { useState, useCallback } from "react";
import { Settings2, Trash2, GripVertical, Settings } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DataSourceSelector } from "@/components/shared/data-source-selector";
import { PieChartWidget } from "./pie-chart-widget";
import { BarChartWidget } from "./bar-chart-widget";
import { LineChartWidget } from "./line-chart-widget";
import { AreaChartWidget } from "./area-chart-widget";
import { MetricCardWidget } from "./metric-card-widget";
import { TextBlockWidget } from "./text-block-widget";
import { ConfigurableTable } from "./configurable-table";
import { RiskObjectiveMappingTable } from "./risk-objective-mapping-table";
import { AddWidgetButton } from "./add-widget-button";
import { WidgetConfigurationModal, type WidgetConfiguration } from "./widget-configuration-modal";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { WidgetTypeChanger } from "@/components/shared/widget-type-changer";
import { useDataSources } from "@/hooks/shared/use-data-sources";
import type {
  WidgetInstance,
  DataSource,
  ReportEntityType,
  TableColumn,
  WidgetType
} from "@/lib/types/report-types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export interface WidgetManagerProps {
  sectionId: string;
  widgets: WidgetInstance[];
  entityId?: string;
  entityType?: ReportEntityType;
  filterByCategory?: DataSource["category"][];
  onAddWidget: (widget: WidgetInstance) => void;
  onRemoveWidget: (widgetId: string) => void;
  onUpdateWidget: (widgetId: string, updates: Partial<WidgetInstance>) => void;
  onWidgetDataChange?: (widgetId: string, data: any) => void;
  onWidgetTypeChange?: (
    widgetId: string,
    newType: import("@/lib/types/report-types").WidgetType
  ) => void;
  onWidgetDataSourceChange?: (widgetId: string, dataSource: DataSource | null) => void;
  onWidgetColumnsChange?: (widgetId: string, columns: TableColumn[]) => void;
  onWidgetRowsChange?: (widgetId: string, rows: Record<string, any>[]) => void;
  onRetryWidget?: (widgetId: string) => Promise<void>;
  retryingWidgetId?: string | null;
}

/**
 * WidgetManager - Container for managing widgets within a section
 * Handles widget CRUD operations and renders widgets with edit/remove actions
 */
export function WidgetManager({
  sectionId,
  widgets,
  entityId,
  entityType,
  filterByCategory,
  onAddWidget,
  onRemoveWidget,
  onUpdateWidget,
  onWidgetDataChange,
  onWidgetTypeChange,
  onWidgetDataSourceChange,
  onWidgetColumnsChange,
  onWidgetRowsChange,
  onRetryWidget,
  retryingWidgetId
}: WidgetManagerProps) {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetInstance | null>(null);
  const [deleteWidgetId, setDeleteWidgetId] = useState<string | null>(null);
  const [dataSourcePopoverOpen, setDataSourcePopoverOpen] = useState<string | null>(null);

  // Generate unique widget ID
  const generateWidgetId = useCallback(() => {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Handle adding a new widget
  const handleAddWidget = useCallback(() => {
    setEditingWidget(null);
    setIsConfigModalOpen(true);
  }, []);

  // Handle editing/reconfiguring an existing widget
  const handleEditWidget = useCallback((widget: WidgetInstance) => {
    setEditingWidget(widget);
    setIsConfigModalOpen(true);
  }, []);

  // Handle widget configuration completion
  const handleConfigure = useCallback(
    (config: WidgetConfiguration) => {
      if (editingWidget) {
        // Update existing widget
        onUpdateWidget(editingWidget.instance_id, {
          widget_type: config.widgetType,
          data: config.data
        });
      } else {
        // Add new widget
        const newWidget: WidgetInstance = {
          instance_id: generateWidgetId(),
          widget_type: config.widgetType,
          order: widgets.length,
          data: config.data
        };
        onAddWidget(newWidget);
      }

      setIsConfigModalOpen(false);
      setEditingWidget(null);
    },
    [editingWidget, widgets.length, onAddWidget, onUpdateWidget, generateWidgetId]
  );

  // Handle widget deletion confirmation
  const handleConfirmDelete = useCallback(() => {
    if (deleteWidgetId) {
      onRemoveWidget(deleteWidgetId);
      setDeleteWidgetId(null);
    }
  }, [deleteWidgetId, onRemoveWidget]);

  // Fetch all data sources to determine compatible widget types
  const { data: dataSources = [] } = useDataSources();

  // Get compatible widget types for a given widget
  const getCompatibleWidgetTypes = (widget: WidgetInstance): WidgetType[] => {
    if (!widget.data.data_source_id) {
      return []; // No type changer if no data source
    }

    const dataSource = dataSources.find((ds) => ds.id === widget.data.data_source_id);
    if (!dataSource) {
      return [];
    }

    return dataSource.compatible_widgets || [];
  };

  // Render individual widget based on type
  const renderWidget = (widget: WidgetInstance) => {
    const isRetrying = retryingWidgetId === widget.instance_id;
    const handleRetry = onRetryWidget
      ? () => onRetryWidget(widget.instance_id)
      : undefined;

    switch (widget.widget_type) {
      case "pie_chart":
        return (
          <PieChartWidget
            data={widget.data}
            dataSourceId={widget.data.data_source_id}
            showDataSourcePicker={false}
            onDataSourceChange={
              onWidgetDataSourceChange
                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                : undefined
            }
            onDataChange={
              onWidgetDataChange
                ? (data) => onWidgetDataChange(widget.instance_id, data)
                : undefined
            }
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
        );

      case "bar_chart":
        return (
          <BarChartWidget
            data={widget.data}
            dataSourceId={widget.data.data_source_id}
            showDataSourcePicker={false}
            onDataSourceChange={
              onWidgetDataSourceChange
                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                : undefined
            }
            onDataChange={
              onWidgetDataChange
                ? (data) => onWidgetDataChange(widget.instance_id, data)
                : undefined
            }
          />
        );

      case "table":
        return (
          <ConfigurableTable
            data={widget.data}
            dataSourceId={widget.data.data_source_id}
            showDataSourcePicker={false}
            onRowsChange={
              onWidgetRowsChange
                ? (rows) => onWidgetRowsChange(widget.instance_id, rows)
                : undefined
            }
            onColumnsChange={
              onWidgetColumnsChange
                ? (cols) => onWidgetColumnsChange(widget.instance_id, cols)
                : undefined
            }
            onDataSourceChange={
              onWidgetDataSourceChange
                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                : undefined
            }
          />
        );

      case "line_chart":
        return (
          <LineChartWidget
            data={widget.data}
            dataSourceId={widget.data.data_source_id}
            showDataSourcePicker={false}
            onDataSourceChange={
              onWidgetDataSourceChange
                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                : undefined
            }
            onDataChange={
              onWidgetDataChange
                ? (data) => onWidgetDataChange(widget.instance_id, data)
                : undefined
            }
          />
        );

      case "area_chart":
        return (
          <AreaChartWidget
            data={widget.data}
            dataSourceId={widget.data.data_source_id}
            showDataSourcePicker={false}
            onDataSourceChange={
              onWidgetDataSourceChange
                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                : undefined
            }
            onDataChange={
              onWidgetDataChange
                ? (data) => onWidgetDataChange(widget.instance_id, data)
                : undefined
            }
          />
        );

      case "metric_card":
        return (
          <MetricCardWidget
            data={widget.data}
            dataSourceId={widget.data.data_source_id}
            showDataSourcePicker={false}
            onDataSourceChange={
              onWidgetDataSourceChange
                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                : undefined
            }
            onDataChange={
              onWidgetDataChange
                ? (data) => onWidgetDataChange(widget.instance_id, data)
                : undefined
            }
          />
        );

      case "text_block":
        return (
          <TextBlockWidget
            data={widget.data}
            dataSourceId={widget.data.data_source_id}
            showDataSourcePicker={false}
            onDataSourceChange={
              onWidgetDataSourceChange
                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                : undefined
            }
            onDataChange={
              onWidgetDataChange
                ? (data) => onWidgetDataChange(widget.instance_id, data)
                : undefined
            }
          />
        );

      case "risk_objective_mapping":
        return (
          <RiskObjectiveMappingTable
            title={widget.data.title}
            subtitle={widget.data.subtitle}
            objectives={widget.data.objectives}
            risks={widget.data.risks}
            className="w-full"
            showNumbers={false}
            checkmarkColor="text-green-500"
            headerBgColor="bg-slate-800"
            onDataSourceChange={
              onWidgetDataSourceChange
                ? (ds) => onWidgetDataSourceChange(widget.instance_id, ds)
                : undefined
            }
          />
        );

      default:
        return (
          <div className="rounded-lg bg-gray-100 p-4 text-center text-gray-500">
            Unknown widget type: {widget.widget_type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Add Button */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Widgets ({widgets.length})
        </h4>
        <AddWidgetButton onClick={handleAddWidget} variant="compact" />
      </div>

      {/* Widget List */}
      {widgets.length === 0 ? (
        <AddWidgetButton onClick={handleAddWidget} variant="dashed" />
      ) : (
        <div className="space-y-4">
          {widgets
            .sort((a, b) => a.order - b.order)
            .map((widget) => (
              <div key={widget.instance_id} className="rounded-lg border border-border bg-card">
                {/* Widget Content */}
                <div className="p-4">{renderWidget(widget)}</div>

                {/* Widget Footer with Data Source and Actions */}
                <div className="flex w-full grid-cols-2 items-center justify-between overflow-clip border-t border-border px-4 py-2 lg:pr-14">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {widget.data.data_source_id
                        ? `Data source: ${widget.data.data_source_id}`
                        : "Manual data"}
                    </span>
                    {/* Widget Type Changer - only show if data source has multiple compatible types */}
                    {widget.data.data_source_id && onWidgetTypeChange && (
                      <WidgetTypeChanger
                        currentType={widget.widget_type}
                        compatibleTypes={getCompatibleWidgetTypes(widget)}
                        onTypeChange={(newType) => onWidgetTypeChange(widget.instance_id, newType)}
                      />
                    )}
                  </div>
                  <div className="flex min-w-60 items-center gap-1">
                    <DataSourceSelector
                      selectedDataSourceId={widget.data.data_source_id}
                      onSelect={(dataSource) => {
                        if (onWidgetDataSourceChange) {
                          onWidgetDataSourceChange(widget.instance_id, dataSource);
                        }
                        setDataSourcePopoverOpen(null);
                      }}
                      filterByCategory={filterByCategory}
                    />
                    <Button
                      type="button"
                      size={"icon"}
                      variant={"outline"}
                      onClick={() => setDeleteWidgetId(widget.instance_id)}
                      className="rounded p-1.5 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                      title="Remove widget">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

          {/* Add Another Widget */}
          <AddWidgetButton
            onClick={handleAddWidget}
            variant="default"
            className="w-full justify-center"
          />
        </div>
      )}

      {/* Configuration Modal */}
      <WidgetConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setEditingWidget(null);
        }}
        onConfigure={handleConfigure}
        entityId={entityId}
        existingWidget={editingWidget ?? undefined}
        filterByCategory={filterByCategory}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteWidgetId}
        onOpenChange={(open) => !open && setDeleteWidgetId(null)}
        title="Remove Widget"
        description="Are you sure you want to remove this widget? This action cannot be undone."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default WidgetManager;
