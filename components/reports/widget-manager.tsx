"use client";

import React, { useState, useCallback } from "react";
import { Settings2, Trash2, GripVertical, Settings } from "lucide-react";
import { PieChartWidget } from "./pie-chart-widget";
import { BarChartWidget } from "./bar-chart-widget";
import { ConfigurableTable } from "./configurable-table";
import { RiskObjectiveMappingTable } from "./risk-objective-mapping-table";
import { AddWidgetButton } from "./add-widget-button";
import { WidgetConfigurationModal, type WidgetConfiguration } from "./widget-configuration-modal";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import type {
  WidgetInstance,
  DataSource,
  ReportEntityType,
  TableColumn
} from "@/lib/types/report-types";
import { cn } from "@/lib/utils";

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
  onWidgetDataSourceChange?: (widgetId: string, dataSource: DataSource | null) => void;
  onWidgetColumnsChange?: (widgetId: string, columns: TableColumn[]) => void;
  onWidgetRowsChange?: (widgetId: string, rows: Record<string, any>[]) => void;
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
  onWidgetDataSourceChange,
  onWidgetColumnsChange,
  onWidgetRowsChange
}: WidgetManagerProps) {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetInstance | null>(null);
  const [deleteWidgetId, setDeleteWidgetId] = useState<string | null>(null);

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

  // Render individual widget based on type
  const renderWidget = (widget: WidgetInstance) => {
    switch (widget.widget_type) {
      case "pie_chart":
        return (
          <PieChartWidget
            data={widget.data}
            dataSourceId={widget.data.data_source_id}
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

      case "bar_chart":
        return (
          <BarChartWidget
            data={widget.data}
            dataSourceId={widget.data.data_source_id}
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

      case "risk_objective_mapping":
        return (
          <RiskObjectiveMappingTable
            title={widget.data.title}
            subtitle={widget.data.subtitle}
            objectives={widget.data.objectives}
            risks={widget.data.risks}
            className="w-full"
            showNumbers={true}
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
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
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
              <div key={widget.instance_id} className="rounded-lg border border-gray-200 bg-white">
                {/* Widget Content */}
                <div className="p-4">{renderWidget(widget)}</div>

                {/* Widget Footer with Data Source and Actions */}
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2">
                  <span className="text-xs text-gray-400">
                    {widget.data.data_source_id
                      ? `Data source: ${widget.data.data_source_id}`
                      : "Manual data"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditWidget(widget)}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-100 hover:text-blue-600"
                      title="Reconfigure widget">
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteWidgetId(widget.instance_id)}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                      title="Remove widget">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
