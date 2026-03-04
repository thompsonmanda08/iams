"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, SendHorizonal, Upload, FileText, X, UserPlus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateGeneralFinding,
  useUpdateGeneralFinding,
  useDeleteGeneralFinding,
  useSubmitGeneralFinding
} from "@/hooks/use-general-findings-mutations";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { notify } from "@/lib/utils";
import { AssignFindingActionDialog } from "@/app/dashboard/(modules)/audit/plans/_components/assign-finding-action-dialog";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConfigColumn {
  key: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
  order?: number;
}

interface GeneralEvidenceGridProps {
  config: {
    columns: ConfigColumn[];
    keys: ConfigColumn[];
  };
  findings: any[];
  workingPaperId: string;
  auditPlanId: string;
  disabled?: boolean;
  auditPlanStatus?: string;
}

interface GridRow {
  _localId: string;
  findingId?: string;
  columns: Record<string, any>;
  keys: Record<string, any>;
  audit_observation: string;
  audit_comments: string;
  evidence: string;
  status: string;
  isDirty: boolean;
  isSaving: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateLocalId() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Convert an API finding → local GridRow */
function findingToRow(finding: any): GridRow {
  return {
    _localId: `row-${finding.id}`,
    findingId: finding.id,
    columns: Array.isArray(finding.columns)
      ? Object.assign({}, ...finding.columns)
      : (finding.columns ?? {}),
    keys: Array.isArray(finding.keys) ? Object.assign({}, ...finding.keys) : (finding.keys ?? {}),
    audit_observation: finding.audit_observation ?? "",
    audit_comments: finding.audit_comments ?? "",
    evidence: finding.evidence ?? "",
    status: finding.status ?? "DRAFT",
    isDirty: false,
    isSaving: false
  };
}

/** Convert a GridRow → API payload */
function rowToPayload(
  row: GridRow,
  auditPlanId: string,
  workingPaperId: string
): {
  audit_plan_id: string;
  working_paper_id: string;
  columns: Record<string, any>[];
  keys: Record<string, any>[];
  audit_observation: string;
  audit_comments: string;
  evidence: string;
  status: string;
} {
  return {
    audit_plan_id: auditPlanId,
    working_paper_id: workingPaperId,
    columns: Object.entries(row.columns).map(([k, v]) => ({ [k]: v })),
    keys: Object.entries(row.keys).map(([k, v]) => ({ [k]: v })),
    audit_observation: row.audit_observation,
    audit_comments: row.audit_comments,
    evidence: row.evidence,
    status: row.status || "DRAFT"
  };
}

/** Create an empty row from config definitions */
function createEmptyRow(configColumns: ConfigColumn[], configKeys: ConfigColumn[]): GridRow {
  const columns: Record<string, any> = {};
  configColumns.forEach((col) => {
    columns[col.key] = col.type === "boolean" ? false : col.type === "number" ? null : "";
  });

  const keys: Record<string, any> = {};
  configKeys.forEach((key) => {
    keys[key.key] = key.type === "boolean" ? false : key.type === "number" ? null : "";
  });

  return {
    _localId: generateLocalId(),
    columns,
    keys,
    audit_observation: "",
    audit_comments: "",
    evidence: "",
    status: "DRAFT",
    isDirty: false,
    isSaving: false
  };
}

/** Render the correct input for a field type */
function FieldInput({
  type,
  value,
  onChange,
  placeholder,
  disabled
}: {
  type: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  switch (type) {
    case "boolean":
      return (
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(Boolean(checked))}
          disabled={disabled}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          step="0.01"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
          placeholder={placeholder || "0"}
          className="h-8 text-sm"
          disabled={disabled}
        />
      );
    case "date":
      return (
        <Input
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-sm"
          disabled={disabled}
        />
      );
    case "textarea":
      return (
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 text-sm"
          disabled={disabled}
        />
      );
    default:
      // text, select, fallback
      return (
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 text-sm"
          disabled={disabled}
        />
      );
  }
}

/** Compact file upload for table cells */
function EvidenceUploadCell({
  value,
  onChange,
  disabled
}: {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadFile(file);
      if (response?.success) {
        onChange(response.data?.file_url || "");
        notify({ type: "success", description: "File uploaded successfully" });
      } else {
        notify({ type: "error", description: response?.message || "Upload failed" });
      }
    } catch {
      notify({ type: "error", description: "An error occurred while uploading" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function getFileName(url: string) {
    try {
      const parts = url.split("/");
      return decodeURIComponent(parts[parts.length - 1]) || "file";
    } catch {
      return "file";
    }
  }

  if (uploading) {
    return <Spinner className="text-primary size-4" />;
  }

  if (value) {
    return (
      <div className="flex items-center gap-1">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex max-w-[120px] items-center gap-1 truncate text-xs text-blue-600 hover:underline">
          <FileText className="h-3 w-3 shrink-0" />
          {getFileName(value)}
        </a>
        {!disabled && (
          <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => onChange("")}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <Button
        size="sm"
        variant="ghost"
        className="h-7 gap-1 text-xs"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}>
        <Upload className="h-3 w-3" />
        Upload
      </Button>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GeneralEvidenceGrid({
  config,
  findings,
  workingPaperId,
  auditPlanId,
  disabled = false,
  auditPlanStatus
}: GeneralEvidenceGridProps) {
  const [rows, setRows] = useState<GridRow[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Assign action dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignFindingRow, setAssignFindingRow] = useState<GridRow | null>(null);

  const createMutation = useCreateGeneralFinding();
  const updateMutation = useUpdateGeneralFinding();
  const deleteMutation = useDeleteGeneralFinding();
  const submitMutation = useSubmitGeneralFinding();

  // Initialize rows from findings
  useEffect(() => {
    if (findings && findings.length > 0) {
      setRows(findings.map(findingToRow));
    }
  }, [findings]);

  const configColumns = config?.columns ?? [];
  const configKeys = config?.keys ?? [];

  // ── Row manipulation ─────────────────────────────────────────────────────

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, createEmptyRow(configColumns, configKeys)]);
  }, [configColumns, configKeys]);

  const updateRowField = useCallback(
    (localId: string, section: "columns" | "keys" | "static", field: string, value: any) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row._localId !== localId) return row;
          if (section === "columns") {
            return { ...row, columns: { ...row.columns, [field]: value }, isDirty: true };
          }
          if (section === "keys") {
            return { ...row, keys: { ...row.keys, [field]: value }, isDirty: true };
          }
          // static fields
          return { ...row, [field]: value, isDirty: true };
        })
      );
    },
    []
  );

  const deleteRow = useCallback(
    (localId: string) => {
      const row = rows.find((r) => r._localId === localId);
      if (!row) return;

      if (row.findingId) {
        deleteMutation.mutate(
          { findingId: row.findingId, workingPaperId },
          { onSuccess: () => setRows((prev) => prev.filter((r) => r._localId !== localId)) }
        );
      } else {
        setRows((prev) => prev.filter((r) => r._localId !== localId));
      }
    },
    [rows, deleteMutation, workingPaperId]
  );

  const submitRow = useCallback(
    (localId: string) => {
      const row = rows.find((r) => r._localId === localId);
      if (!row?.findingId) return;

      submitMutation.mutate(
        { findingId: row.findingId, workingPaperId },
        {
          onSuccess: () => {
            setRows((prev) =>
              prev.map((r) => (r._localId === localId ? { ...r, status: "IN_REVIEW" } : r))
            );
          }
        }
      );
    },
    [rows, submitMutation, workingPaperId]
  );

  // ── Auto-save on blur ──────────────────────────────────────────────────

  const saveRow = useCallback(
    (localId: string) => {
      const row = rows.find((r) => r._localId === localId);
      if (!row || !row.isDirty || row.isSaving) return;

      // Check that at least one column has a value
      const hasContent = Object.values(row.columns).some(
        (v) => v !== "" && v !== null && v !== false
      );
      if (!hasContent) return;

      setRows((prev) => prev.map((r) => (r._localId === localId ? { ...r, isSaving: true } : r)));

      const payload = rowToPayload(row, auditPlanId, workingPaperId);

      if (row.findingId) {
        // Update existing
        updateMutation.mutate(
          {
            findingId: row.findingId,
            data: {
              columns: payload.columns,
              keys: payload.keys,
              audit_observation: payload.audit_observation,
              audit_comments: payload.audit_comments,
              evidence: payload.evidence
            },
            workingPaperId
          },
          {
            onSuccess: () => {
              setRows((prev) =>
                prev.map((r) =>
                  r._localId === localId ? { ...r, isDirty: false, isSaving: false } : r
                )
              );
            },
            onError: () => {
              setRows((prev) =>
                prev.map((r) => (r._localId === localId ? { ...r, isSaving: false } : r))
              );
            }
          }
        );
      } else {
        // Create new
        createMutation.mutate(payload, {
          onSuccess: (result) => {
            const newId = result?.data?.id;
            setRows((prev) =>
              prev.map((r) =>
                r._localId === localId
                  ? { ...r, findingId: newId, isDirty: false, isSaving: false }
                  : r
              )
            );
          },
          onError: () => {
            setRows((prev) =>
              prev.map((r) => (r._localId === localId ? { ...r, isSaving: false } : r))
            );
          }
        });
      }
    },
    [rows, auditPlanId, workingPaperId, createMutation, updateMutation]
  );

  const handleRowBlur = useCallback(
    (localId: string) => {
      // Use setTimeout to let the browser update document.activeElement
      setTimeout(() => {
        const active = document.activeElement;
        const rowEl = tableRef.current?.querySelector(`[data-row-id="${localId}"]`);
        if (rowEl && active && rowEl.contains(active)) {
          // Focus is still within the same row — don't save yet
          return;
        }
        saveRow(localId);
      }, 0);
    },
    [saveRow]
  );

  // ── Render ───────────────────────────────────────────────────────────────

  const totalColumns = 1 + configColumns.length + configKeys.length + 4; // # + columns + keys + obs + comments + evidence + actions

  return (
    <>
      <div className="space-y-4">
        {/* Grid */}
        <Card className="overflow-x-auto" ref={tableRef}>
          {/* Header */}
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Evidence & Testing Grid</h3>
              <Badge variant="secondary">{rows.length} rows</Badge>
            </div>
            <div className="flex gap-2">
              {/* TODO: Uncomment when workpaper-level submission API is ready */}
              {/* <Button size="sm" variant="outline" disabled={disabled}>
              <SendHorizonal className="mr-2 h-4 w-4" />
              Submit All for Approval
            </Button> */}
              <Button size="sm" onClick={addRow} variant="outline" disabled={disabled}>
                <Plus className="mr-2 h-4 w-4" />
                Add Row
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table className="min-w-7xl">
              <TableHeader>
                {/* Group header row — spans "Audit Tests" over keys */}
                <TableRow className="border-b-0">
                  <TableHead rowSpan={2} className="w-10 border-b align-bottom">
                    #
                  </TableHead>
                  {configColumns.map((col) => (
                    <TableHead key={col.key} rowSpan={2} className="min-w-40 border-b align-bottom">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={col.required ? "cursor-help font-semibold" : "cursor-help"}>
                            {col.name}
                            {col.required && <span className="text-destructive ml-0.5">*</span>}
                          </span>
                        </TooltipTrigger>
                        {col.description && (
                          <TooltipContent side="top" className="max-w-52 text-xs">
                            {col.description}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TableHead>
                  ))}
                  {configKeys.length > 0 && (
                    <TableHead
                      colSpan={configKeys.length}
                      className="border-b border-l bg-amber-50 text-center text-xs font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                      Audit Tests
                    </TableHead>
                  )}
                  <TableHead rowSpan={2} className="min-w-50 border-b align-bottom">
                    Audit Observations
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-50 border-b align-bottom">
                    Audit Comments
                  </TableHead>
                  <TableHead rowSpan={2} className="min-w-50 border-b align-bottom">
                    Evidence
                  </TableHead>
                  <TableHead rowSpan={2} className="w-28 border-b align-bottom">
                    Actions
                  </TableHead>
                </TableRow>

                {/* Sub-header row for individual key columns */}
                {configKeys.length > 0 && (
                  <TableRow>
                    {configKeys.map((key) => (
                      <TableHead
                        key={key.key}
                        className="min-w-24 border-l bg-amber-50/50 text-center dark:bg-amber-950/20">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-xs font-medium">{key.name}</span>
                          </TooltipTrigger>
                          {key.description && (
                            <TooltipContent side="top" className="max-w-52 text-xs">
                              {key.description}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TableHead>
                    ))}
                  </TableRow>
                )}
              </TableHeader>

              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={row._localId}
                    data-row-id={row._localId}
                    className={
                      row.isDirty
                        ? "border-l-2 border-l-amber-400"
                        : row.isSaving
                          ? "border-l-2 border-l-blue-400 opacity-70"
                          : ""
                    }
                    onFocus={() => setActiveRowId(row._localId)}
                    onBlur={() => handleRowBlur(row._localId)}>
                    {/* Row number */}
                    <TableCell className="font-medium">{index + 1}</TableCell>

                    {/* Dynamic columns */}
                    {configColumns.map((col) => (
                      <TableCell key={col.key}>
                        <FieldInput
                          type={col.type}
                          value={row.columns[col.key]}
                          onChange={(value) =>
                            updateRowField(row._localId, "columns", col.key, value)
                          }
                          placeholder={col.name}
                          disabled={disabled || row.status !== "DRAFT"}
                        />
                      </TableCell>
                    ))}

                    {/* Dynamic keys (audit tests) */}
                    {configKeys.map((key) => (
                      <TableCell
                        key={key.key}
                        className="border-l bg-amber-50/20 text-center dark:bg-amber-950/10">
                        <FieldInput
                          type={key.type}
                          value={row.keys[key.key]}
                          onChange={(value) => updateRowField(row._localId, "keys", key.key, value)}
                          placeholder={key.name}
                          disabled={disabled || row.status !== "DRAFT"}
                        />
                      </TableCell>
                    ))}

                    {/* Audit Observations */}
                    <TableCell>
                      <Input
                        value={row.audit_observation}
                        onChange={(e) =>
                          updateRowField(
                            row._localId,
                            "static",
                            "audit_observation",
                            e.target.value
                          )
                        }
                        placeholder="Observations..."
                        className="h-8 text-sm"
                        disabled={disabled || row.status !== "DRAFT"}
                      />
                    </TableCell>

                    {/* Audit Comments */}
                    <TableCell>
                      <Input
                        value={row.audit_comments}
                        onChange={(e) =>
                          updateRowField(row._localId, "static", "audit_comments", e.target.value)
                        }
                        placeholder="Comments..."
                        className="h-8 text-sm"
                        disabled={disabled || row.status !== "DRAFT"}
                      />
                    </TableCell>

                    {/* Evidence */}
                    <TableCell>
                      <EvidenceUploadCell
                        value={row.evidence}
                        onChange={(url) => updateRowField(row._localId, "static", "evidence", url)}
                        disabled={disabled || row.status !== "DRAFT"}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {row.isSaving && <Spinner className="text-primary size-4" />}
                        {row.findingId && row.status === "DRAFT" && !row.isSaving && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700"
                                onClick={() => submitRow(row._localId)}
                                disabled={disabled || submitMutation.isPending}>
                                <SendHorizonal className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Submit for approval</TooltipContent>
                          </Tooltip>
                        )}
                        {row.findingId && row.status !== "DRAFT" && (
                          <>
                            <Badge variant="outline" className="text-xs">
                              {row.status}
                            </Badge>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-violet-600 hover:text-violet-700"
                                  onClick={() => {
                                    setAssignFindingRow(row);
                                    setAssignDialogOpen(true);
                                  }}>
                                  <UserPlus className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Assign action</TooltipContent>
                            </Tooltip>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-7 w-7 p-0"
                          onClick={() => deleteRow(row._localId)}
                          disabled={disabled || row.isSaving}
                          title="Delete row">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Empty state */}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={totalColumns} className="py-8 text-center">
                      <p className="text-muted-foreground text-sm">No evidence rows added yet</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addRow}
                        className="mt-2"
                        disabled={disabled}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Row
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Assign Action Dialog */}
        <AssignFindingActionDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          finding={assignFindingRow?.findingId ? ({ id: assignFindingRow.findingId } as any) : null}
          auditPlanStatus={auditPlanStatus || ""}
        />
      </div>
    </>
  );
}
