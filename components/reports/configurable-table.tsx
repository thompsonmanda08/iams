import React, { useState } from "react";
import { Table2, Settings2, Plus, Trash2, GripVertical, X, Pencil, RotateCcw } from "lucide-react";
import { TableWidgetData, DataSource, TableColumn } from "@/lib/types/report-types";

interface ConfigurableTableProps {
  data: TableWidgetData;
  dataSourceId?: string;
  onColumnsChange?: (columns: TableColumn[]) => void;
  onRowsChange?: (rows: Record<string, any>[]) => void;
  onDataSourceChange?: (dataSource: DataSource | null) => void;
  showDataSourcePicker?: boolean;
  onToggleManualOverride?: (enabled: boolean) => void;
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
  showDataSourcePicker = true,
  onToggleManualOverride
}: ConfigurableTableProps) => {
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [newColumnHeader, setNewColumnHeader] = useState("");
  const [editingColumnKey, setEditingColumnKey] = useState<string | null>(null);
  const [editingColumnHeader, setEditingColumnHeader] = useState("");
  const [dragColumnKey, setDragColumnKey] = useState<string | null>(null);

  // Check if in manual mode (no data source or manual entry)
  const isManualMode = !dataSourceId || dataSourceId === "manual";
  // Editable when in manual mode OR when manual override is active on a data-source table
  const isEditable = isManualMode || data.is_manual_override === true;

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

  const startEditingColumn = (key: string, header: string) => {
    setEditingColumnKey(key);
    setEditingColumnHeader(header);
  };

  const commitColumnEdit = () => {
    if (!editingColumnKey || !onColumnsChange) {
      setEditingColumnKey(null);
      return;
    }
    const trimmed = editingColumnHeader.trim();
    if (!trimmed) {
      setEditingColumnKey(null);
      return;
    }
    onColumnsChange(
      data.columns.map((col) =>
        col.key === editingColumnKey ? { ...col, header: trimmed } : col
      )
    );
    setEditingColumnKey(null);
    setEditingColumnHeader("");
  };

  const moveColumn = (sourceKey: string, targetKey: string) => {
    if (!onColumnsChange || sourceKey === targetKey) return;
    const cols = [...data.columns];
    const fromIdx = cols.findIndex((c) => c.key === sourceKey);
    const toIdx = cols.findIndex((c) => c.key === targetKey);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = cols.splice(fromIdx, 1);
    cols.splice(toIdx, 0, moved);
    onColumnsChange(cols);
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
    <div className="border-border bg-card rounded-lg border">
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <Table2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          {data.title}
        </h4>
        <div className="flex items-center gap-2">
          {!isManualMode && dataSourceId && onToggleManualOverride && (
            <button
              onClick={() => onToggleManualOverride(!data.is_manual_override)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                data.is_manual_override
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-300"
                  : "text-muted-foreground hover:bg-muted"
              }`}>
              {data.is_manual_override ? (
                <>
                  <RotateCcw className="h-3 w-3" />
                  Revert to Data Source
                </>
              ) : (
                <>
                  <Pencil className="h-3 w-3" />
                  Edit Table
                </>
              )}
            </button>
          )}
          {(data.is_configurable || isEditable) && onColumnsChange && (
            <button
              onClick={() => setIsEditingColumns(!isEditingColumns)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                isEditingColumns
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                  : "text-muted-foreground hover:bg-muted"
              }`}>
              <Settings2 className="h-3 w-3" />
              {isEditingColumns ? "Done" : "Configure Columns"}
            </button>
          )}
          {isEditable && onRowsChange && (
            <button
              onClick={addRow}
              className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:bg-green-950/30 dark:text-green-300 dark:hover:bg-green-950/50">
              <Plus className="h-3 w-3" />
              Add Row
            </button>
          )}
        </div>
      </div>

      {data.is_manual_override && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          <Pencil className="h-3 w-3" />
          <span>Manual edit mode — changes will not sync with the data source</span>
        </div>
      )}

      {isEditingColumns && (
        <div className="border-border bg-muted/40 border-b px-4 py-3">
          <div className="text-muted-foreground mb-2 text-xs font-medium">Current Columns:</div>
          <div className="mb-3 flex flex-wrap gap-2">
            {data.columns.map((col) => {
              const isEditing = editingColumnKey === col.key;
              const isDragTarget = dragColumnKey && dragColumnKey !== col.key;
              return (
                <span
                  key={col.key}
                  draggable={!isEditing}
                  onDragStart={(e) => {
                    setDragColumnKey(col.key);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    if (isDragTarget) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragColumnKey) moveColumn(dragColumnKey, col.key);
                    setDragColumnKey(null);
                  }}
                  onDragEnd={() => setDragColumnKey(null)}
                  className={`bg-card text-foreground ring-border inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm shadow-sm ring-1 ${
                    isEditing ? "" : "cursor-move"
                  } ${isDragTarget ? "ring-primary ring-2" : ""}`}>
                  <GripVertical className="text-muted-foreground h-3 w-3" />
                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      value={editingColumnHeader}
                      onChange={(e) => setEditingColumnHeader(e.target.value)}
                      onBlur={commitColumnEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitColumnEdit();
                        } else if (e.key === "Escape") {
                          setEditingColumnKey(null);
                          setEditingColumnHeader("");
                        }
                      }}
                      className="border-input bg-background text-foreground rounded border px-1.5 py-0.5 text-sm focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditingColumn(col.key, col.header)}
                      className="hover:text-primary cursor-text bg-transparent">
                      {col.header}
                    </button>
                  )}
                  <button
                    onClick={() => removeColumn(col.key)}
                    className="text-muted-foreground hover:text-destructive ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newColumnHeader}
              onChange={(e) => setNewColumnHeader(e.target.value)}
              placeholder="New column header..."
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring flex-1 rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
            />
            <button
              onClick={addColumn}
              disabled={!newColumnHeader.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 rounded px-3 py-1.5 text-sm disabled:opacity-50">
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-border bg-muted/40 border-b">
              {data?.columns?.map((col, idx) => (
                <th
                  key={col?.key || col?.header || `col-${idx}`}
                  className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  {col.header}
                </th>
              ))}
              {isEditable && onRowsChange && <th className="w-10 px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {data.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={data.columns.length + (isEditable && onRowsChange ? 1 : 0)}
                  className="text-muted-foreground px-4 py-8 text-center">
                  {isEditable
                    ? "No data yet. Click 'Add Row' to get started."
                    : "No data available."}
                </td>
              </tr>
            ) : (
              data.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="group hover:bg-muted/30">
                  {data.columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {isEditable && onRowsChange ? (
                        <input
                          type="text"
                          value={row[col.key] || ""}
                          onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                          className="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm focus:ring-0 focus:outline-none"
                          placeholder="..."
                        />
                      ) : (
                        <div className="text-foreground text-sm">
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
                  {isEditable && onRowsChange && (
                    <td className="px-4 py-3 text-right opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="text-muted-foreground hover:text-destructive">
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
