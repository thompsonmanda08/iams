import React, { useState } from "react";
import { Table2, Settings2, Plus, Trash2, GripVertical, X } from "lucide-react";
import { TableWidgetData, DataSource, TableColumn } from "@/lib/types/report-types";
import { WidgetDataSourcePicker } from "./widget-data-source-picker";

interface ConfigurableTableProps {
  data: TableWidgetData;
  dataSourceId?: string;
  onColumnsChange?: (columns: TableColumn[]) => void;
  onRowsChange?: (rows: Record<string, any>[]) => void;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  showDataSourcePicker?: boolean;
}

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    critical: "bg-purple-100 text-purple-800 border-purple-200",
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-green-100 text-green-800 border-green-200"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[severity] || "bg-gray-100 text-gray-800"}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    OPEN: "bg-red-50 text-red-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    CLOSED: "bg-green-50 text-green-700"
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-50 text-gray-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
};

export const ConfigurableTable = ({
  data,
  dataSourceId,
  onColumnsChange,
  onRowsChange,
  onDataSourceChange,
  showDataSourcePicker = true
}: ConfigurableTableProps) => {
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [newColumnHeader, setNewColumnHeader] = useState("");

  // Check if in manual mode (no data source or manual entry)
  const isManualMode = !dataSourceId || dataSourceId === "manual";

  const addColumn = () => {
    if (!newColumnHeader.trim() || !onColumnsChange) return;
    const newKey = newColumnHeader.toLowerCase().replace(/\s+/g, "_");
    onColumnsChange([...data.columns, { key: newKey, header: newColumnHeader }]);
    setNewColumnHeader("");
  };

  const removeColumn = (keyToRemove: string) => {
    if (!onColumnsChange) return;
    onColumnsChange(data.columns.filter((col) => col.key !== keyToRemove));
  };

  const addRow = () => {
    if (!onRowsChange) return;
    const newRow = data.columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});
    onRowsChange([...data.rows, newRow]);
  };

  const removeRow = (index: number) => {
    if (!onRowsChange) return;
    onRowsChange(data.rows.filter((_, i) => i !== index));
  };

  const updateCell = (rowIndex: number, key: string, value: any) => {
    if (!onRowsChange) return;
    onRowsChange(data.rows.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row)));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Table2 className="h-4 w-4 text-blue-600" />
          {data.title}
        </h4>
        <div className="flex items-center gap-2">
          {showDataSourcePicker && onDataSourceChange && (
            <WidgetDataSourcePicker
              widgetType="table"
              currentDataSourceId={dataSourceId}
              onDataSourceChange={onDataSourceChange}
            />
          )}
          {(data.is_configurable || isManualMode) && onColumnsChange && (
            <button
              onClick={() => setIsEditingColumns(!isEditingColumns)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                isEditingColumns ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              }`}>
              <Settings2 className="h-3 w-3" />
              {isEditingColumns ? "Done" : "Configure Columns"}
            </button>
          )}
          {isManualMode && onRowsChange && (
            <button
              onClick={addRow}
              className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100">
              <Plus className="h-3 w-3" />
              Add Row
            </button>
          )}
        </div>
      </div>

      {isEditingColumns && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="mb-2 text-xs font-medium text-gray-600">Current Columns:</div>
          <div className="mb-3 flex flex-wrap gap-2">
            {data.columns.map((col) => (
              <span
                key={col.key}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm shadow-sm">
                <GripVertical className="h-3 w-3 cursor-move text-gray-400" />
                {col.header}
                <button
                  onClick={() => removeColumn(col.key)}
                  className="ml-1 text-gray-400 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newColumnHeader}
              onChange={(e) => setNewColumnHeader(e.target.value)}
              placeholder="New column header..."
              className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={addColumn}
              disabled={!newColumnHeader.trim()}
              className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {data.columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  {col.header}
                </th>
              ))}
              {isManualMode && onRowsChange && <th className="w-10 px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={data.columns.length + (isManualMode && onRowsChange ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  {isManualMode ? "No data yet. Click 'Add Row' to get started." : "No data available."}
                </td>
              </tr>
            ) : (
              data.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="group hover:bg-gray-50/50">
                  {data.columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {isManualMode && onRowsChange ? (
                        <input
                          type="text"
                          value={row[col.key] || ""}
                          onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                          className="w-full border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:outline-none"
                          placeholder="..."
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {col.key === "severity" ? (
                            <SeverityBadge severity={row[col.key]} />
                          ) : col.key === "status" ? (
                            <StatusBadge status={row[col.key]} />
                          ) : (
                            row[col.key] || "-"
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  {isManualMode && onRowsChange && (
                    <td className="px-4 py-3 text-right opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
