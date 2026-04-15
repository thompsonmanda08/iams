"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Pencil, X, Info, AlertCircle } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import { useGeneralWorkPaperConfigMutations } from "@/hooks/use-audit-settings-mutations";
import type {
  WorkPaperConfigColumn,
  WorkPaperConfigKey,
  WorkPaperFieldType
} from "@/app/_actions/audit-settings-actions";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FieldRow {
  _id: string;
  key: string; // auto-derived, read-only
  name: string;
  type: WorkPaperFieldType;
  required: boolean;
  description: string;
}

interface GeneralWorkpaperFormProps {
  templateId?: string | null;
  configs?: any;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FIELD_TYPE_OPTIONS = [
  { id: "text", name: "Text" },
  { id: "number", name: "Number" },
  { id: "date", name: "Date" },
  { id: "boolean", name: "Boolean (Tick Mark)" },
  { id: "select", name: "Select" },
  { id: "textarea", name: "Textarea" }
];

const emptyRow = (): FieldRow => ({
  _id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  key: "",
  name: "",
  type: "text",
  required: false,
  description: ""
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toSnakeKey = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

function parseConfigs(configs: any): {
  existingConfigId: string | null;
  columns: FieldRow[];
  keys: FieldRow[];
} {
  const raw = Array.isArray(configs) ? configs[0] : configs;

  if (!raw || (!raw.columns?.length && !raw.keys?.length)) {
    return { existingConfigId: null, columns: [emptyRow()], keys: [emptyRow()] };
  }

  const toRow = (item: any): FieldRow => ({
    _id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key: item.key ?? "",
    name: item.name ?? "",
    type: (item.type as WorkPaperFieldType) ?? "text",
    required: Boolean(item.required),
    description: item.description ?? ""
  });

  return {
    existingConfigId: raw.id ?? null,
    columns: raw.columns?.length ? raw.columns.map(toRow) : [emptyRow()],
    keys: raw.keys?.length ? raw.keys.map(toRow) : [emptyRow()]
  };
}

// ─── Sub-component: Row Builder Table ────────────────────────────────────────

function FieldRowTable({
  rows,
  onChange
}: {
  rows: FieldRow[];
  onChange: (rows: FieldRow[]) => void;
}) {
  const update = (id: string, field: keyof FieldRow, value: any) => {
    onChange(
      rows.map((r) => {
        if (r._id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "name") updated.key = toSnakeKey(value as string);
        return updated;
      })
    );
  };

  const remove = (id: string) => onChange(rows.filter((r) => r._id !== id));

  // Compute duplicate keys for inline warnings
  const keyCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.key) keyCounts.set(r.key, (keyCounts.get(r.key) ?? 0) + 1);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-36">Key (auto)</TableHead>
          <TableHead>Display Name</TableHead>
          <TableHead className="w-40">Type</TableHead>
          <TableHead className="w-24 text-center">Required</TableHead>
          <TableHead>Description / Tooltip</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const isDuplicate = row.key ? (keyCounts.get(row.key) ?? 0) > 1 : false;
          const isEmptyKey = !!row.name.trim() && !row.key;
          return (
          <TableRow key={row._id}>
            {/* Key — auto-derived badge */}
            <TableCell>
              <div className="flex flex-col gap-1">
                <Badge
                  variant={isDuplicate || isEmptyKey ? "destructive" : "secondary"}
                  className="font-mono text-xs">
                  {row.key || "—"}
                </Badge>
                {isDuplicate && (
                  <span className="text-destructive text-[10px]">Duplicate key</span>
                )}
                {isEmptyKey && (
                  <span className="text-destructive text-[10px]">
                    Name must contain letters or numbers
                  </span>
                )}
              </div>
            </TableCell>

            {/* Display Name */}
            <TableCell>
              <Input
                placeholder="e.g. Invoice Number"
                value={row.name}
                onChange={(e) => update(row._id, "name", e.target.value)}
                classNames={{ wrapper: "max-w-none" }}
              />
            </TableCell>

            {/* Type */}
            <TableCell>
              <SelectField
                value={row.type}
                options={FIELD_TYPE_OPTIONS}
                onValueChange={(v) => update(row._id, "type", v)}
                classNames={{ wrapper: "max-w-none" }}
              />
            </TableCell>

            {/* Required */}
            <TableCell className="text-center">
              <Switch
                checked={row.required}
                onCheckedChange={(v) => update(row._id, "required", v)}
              />
            </TableCell>

            {/* Description */}
            <TableCell>
              <Input
                placeholder="Shown as tooltip on hover"
                value={row.description}
                onChange={(e) => update(row._id, "description", e.target.value)}
                classNames={{ wrapper: "max-w-none" }}
              />
            </TableCell>

            {/* Delete */}
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => remove(row._id)}
                disabled={rows.length === 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ─── Sub-component: Read-only View Table ─────────────────────────────────────

function FieldViewTable({ rows, label }: { rows: FieldRow[]; label: string }) {
  if (!rows.length) {
    return <p className="text-muted-foreground text-sm">No {label} defined.</p>;
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Required</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row._id}>
              <TableCell>
                <Badge variant="secondary" className="font-mono text-xs">
                  {row.key}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{row.name}</span>
                  {row.description && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-56 text-xs">
                        {row.description}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs capitalize">
                  {row.type}
                </Badge>
              </TableCell>
              <TableCell>
                {row.required ? (
                  <Badge className="bg-green-100 text-xs text-green-800 dark:bg-green-950 dark:text-green-300">
                    Required
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">Optional</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GeneralTemplateConfigsForm({ templateId, configs }: GeneralWorkpaperFormProps) {
  const {
    existingConfigId: initialConfigId,
    columns: initialColumns,
    keys: initialKeys
  } = parseConfigs(configs);

  const [existingConfigId, setExistingConfigId] = useState<string | null>(initialConfigId);
  const [columns, setColumns] = useState<FieldRow[]>(initialColumns);
  const [keys, setKeys] = useState<FieldRow[]>(initialKeys);
  const [isEditing, setIsEditing] = useState(!initialConfigId); // open immediately when no config

  // Snapshot for cancel
  const [snapshot, setSnapshot] = useState({ columns: initialColumns, keys: initialKeys });

  const router = useRouter();
  const { createConfigMutation, updateConfigMutation } = useGeneralWorkPaperConfigMutations();

  // Refs for values read inside the useEffect without being deps
  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;

  // Track the last-synced config id so we only reset on genuine server-side changes
  const lastSyncedConfigId = useRef<string | null>(initialConfigId);

  // Sync state when the server component re-renders with fresh configs (after router.refresh())
  // but NOT while the user is actively editing — that would discard their in-progress work.
  useEffect(() => {
    const { existingConfigId: id, columns: cols, keys: ks } = parseConfigs(configs);

    // Skip reset if user is editing and the config identity hasn't changed
    if (isEditingRef.current && id === lastSyncedConfigId.current) return;

    lastSyncedConfigId.current = id;
    setExistingConfigId(id);
    setColumns(cols);
    setKeys(ks);
    setIsEditing(!id);
  }, [configs]);

  const isPending = createConfigMutation.isPending || updateConfigMutation.isPending;

  // Validation: at least one named column & key, all named rows must produce a non-empty key,
  // and no duplicate keys within each section
  const filledColumns = columns.filter((c) => c.name.trim());
  const filledKeys = keys.filter((k) => k.name.trim());
  const hasDuplicateKeys = (rows: FieldRow[]) => {
    const keySet = new Set<string>();
    for (const r of rows) {
      if (!r.key) continue;
      if (keySet.has(r.key)) return true;
      keySet.add(r.key);
    }
    return false;
  };
  const hasEmptyKey = (rows: FieldRow[]) => rows.some((r) => r.name.trim() && !r.key);

  const isValid =
    filledColumns.length > 0 &&
    filledKeys.length > 0 &&
    !hasEmptyKey(filledColumns) &&
    !hasEmptyKey(filledKeys) &&
    !hasDuplicateKeys(filledColumns) &&
    !hasDuplicateKeys(filledKeys);

  const handleEdit = useCallback(() => {
    setSnapshot({ columns, keys });
    setIsEditing(true);
  }, [columns, keys]);

  const handleCancel = useCallback(() => {
    setColumns(snapshot.columns);
    setKeys(snapshot.keys);
    setIsEditing(false);
  }, [snapshot]);

  const toApiFields = (rows: FieldRow[]): WorkPaperConfigColumn[] | WorkPaperConfigKey[] =>
    rows
      .filter((r) => r.name.trim())
      .map(({ key, name, type, required, description }) => ({
        key,
        name,
        type,
        required,
        description
      }));

  const handleSave = () => {
    const payload = {
      columns: toApiFields(columns) as WorkPaperConfigColumn[],
      keys: toApiFields(keys) as WorkPaperConfigKey[]
    };

    if (existingConfigId) {
      updateConfigMutation.mutate(
        { id: existingConfigId, ...payload },
        {
          onSuccess: () => {
            lastSyncedConfigId.current = existingConfigId;
            setIsEditing(false);
            router.refresh();
          }
        }
      );
    } else {
      if (!templateId) return;
      createConfigMutation.mutate(
        { template_id: templateId, ...payload },
        {
          onSuccess: () => {
            // Allow the useEffect to pick up the new config from the server
            lastSyncedConfigId.current = null;
            router.refresh();
          }
        }
      );
    }
  };

  // ── View mode (config exists, not editing) ───────────────────────────────

  if (existingConfigId && !isEditing) {
    return (
      <div className="space-y-4">
        {/* Columns view */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">
              Columns ({columns.filter((c) => c.name).length})
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit Config
            </Button>
          </CardHeader>
          <CardContent>
            <FieldViewTable rows={columns.filter((c) => c.name)} label="columns" />
          </CardContent>
        </Card>

        {/* Keys view */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Audit Test Keys ({keys.filter((k) => k.name).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldViewTable rows={keys.filter((k) => k.name)} label="keys" />
          </CardContent>
        </Card>

        {/* Static columns notice */}
        <StaticColumnsNotice />
      </div>
    );
  }

  // ── Edit / Create mode ────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* No config callout */}
      {!existingConfigId && (
        <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
          <AlertCircle className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-muted-foreground text-sm">
            No config defined yet for this template. Define columns and keys below then save.
          </p>
        </div>
      )}

      {/* Columns builder */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Columns</CardTitle>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Data entry headers — users fill these in during audit execution (e.g. Po No., Vendor
                Name, Amount)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setColumns((prev) => [...prev, emptyRow()])}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Column
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <FieldRowTable rows={columns} onChange={setColumns} />
        </CardContent>
      </Card>

      {/* Static columns notice */}
      <StaticColumnsNotice />

      {/* Keys builder */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Audit Test Keys (Tick Marks)</CardTitle>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Rendered under "Audit Tests – Tick Marks" header. Use <code>boolean</code> type for
                checkboxes. The <em>description</em> appears as a tooltip on column headers.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setKeys((prev) => [...prev, emptyRow()])}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <FieldRowTable rows={keys} onChange={setKeys} />
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        {existingConfigId && (
          <Button type="button" variant="destructive" onClick={handleCancel} disabled={isPending}>
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isValid || isPending}
          isLoading={isPending}>
          {existingConfigId ? "Save Changes" : "Create Config"}
        </Button>
      </div>
    </div>
  );
}

// ─── Static columns notice ────────────────────────────────────────────────────

function StaticColumnsNotice() {
  return (
    <div className="bg-muted/30 flex items-start gap-3 rounded-lg border border-dashed p-3 text-sm">
      <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
      <p className="text-muted-foreground text-xs">
        The following columns are always appended automatically during audit execution:{" "}
        <strong>Audit Observations</strong> &middot; <strong>Audit Comments</strong> &middot;{" "}
        <strong>Evidence</strong> (optional)
      </p>
    </div>
  );
}

// Keep legacy named export for the new template page
export { GeneralTemplateConfigsForm as GeneralWorkpaperForm };
