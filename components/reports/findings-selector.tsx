import React, { useState, useMemo } from "react";
import { Check, ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import {
  FindingSummary,
  GeneralFindingSummary,
  GeneralFindingsConfig
} from "@/lib/types/report-types";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { SelectField } from "../ui/select-field";
import { StatusBadge } from "../status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface FindingsSelectorProps {
  findings: FindingSummary[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  generalFindings?: GeneralFindingSummary[];
  generalFindingsConfig?: GeneralFindingsConfig | null;
  isGeneralFramework?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getColumnValue(finding: GeneralFindingSummary, colKey: string): string {
  for (const col of finding.columns ?? []) {
    if (col.key === colKey) return col.value ?? "—";
    if ((col as any)[colKey] !== undefined) return String((col as any)[colKey]) || "—";
  }
  return "—";
}

function getKeyValue(finding: GeneralFindingSummary, keyKey: string): any {
  for (const k of finding.keys ?? []) {
    if (k.key === keyKey) return k.value ?? null;
    if ((k as any)[keyKey] !== undefined) return (k as any)[keyKey];
  }
  return null;
}

// Helper components for badges
const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    critical: "bg-purple-100 text-purple-800 border-purple-200",
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-green-100 text-green-800 border-green-200"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[severity] || "bg-foreground/10 text-gray-800"}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
};

// ─── General Findings Selector ───────────────────────────────────────────────

const GeneralFindingsSelectorView = ({
  generalFindings,
  generalFindingsConfig,
  selectedIds,
  onSelectionChange
}: {
  generalFindings: GeneralFindingSummary[];
  generalFindingsConfig: GeneralFindingsConfig | null;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) => {
  const configColumns = generalFindingsConfig?.columns ?? [];
  const configKeys = generalFindingsConfig?.keys ?? [];

  const toggleFinding = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => onSelectionChange(generalFindings.map((f) => f.id));
  const deselectAll = () => onSelectionChange([]);

  if (!generalFindings.length) {
    return (
      <div className="bg-card border-foreground/10 rounded-lg border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No general findings found. Findings are created from the Workpaper tab.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border-foreground/10 rounded-lg border">
      <div className="border-foreground/20 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <h4 className="text-foreground text-sm font-semibold">Select Findings for Report</h4>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {selectedIds.length} of {generalFindings.length} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="secondary" size="sm" onClick={deselectAll}>
            Deselect All
          </Button>
        </div>
      </div>

      <TooltipProvider>
        <div className="overflow-x-auto">
          <Table className="min-w-200">
            <TableHeader>
              {/* Group header row */}
              <TableRow className="border-b-0">
                <TableHead rowSpan={2} className="w-10 border-b align-bottom" />
                <TableHead rowSpan={2} className="w-10 border-b align-bottom">
                  #
                </TableHead>
                {configColumns.map((col) => (
                  <TableHead key={col.key} rowSpan={2} className="min-w-32 border-b align-bottom">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help text-xs">{col.name}</span>
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
                <TableHead rowSpan={2} className="min-w-40 border-b align-bottom">
                  Observation
                </TableHead>
                <TableHead rowSpan={2} className="min-w-40 border-b align-bottom">
                  Comments
                </TableHead>
                <TableHead rowSpan={2} className="min-w-20 border-b align-bottom">
                  Status
                </TableHead>
              </TableRow>

              {/* Sub-header for keys */}
              {configKeys.length > 0 && (
                <TableRow>
                  {configKeys.map((key) => (
                    <TableHead
                      key={key.key}
                      className="min-w-20 border-l bg-amber-50/50 text-center dark:bg-amber-950/20">
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
              {generalFindings.map((finding, index) => {
                const isSelected = selectedIds.includes(finding.id);
                return (
                  <TableRow
                    key={finding.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected ? "bg-blue-50 dark:bg-primary/5" : "hover:bg-gray-50 dark:hover:bg-primary/10"
                    )}
                    onClick={() => toggleFinding(finding.id)}>
                    <TableCell className="w-10">
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border-2",
                          isSelected ? "border-primary bg-primary" : "border-foreground/50"
                        )}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{index + 1}</TableCell>
                    {configColumns.map((col) => (
                      <TableCell key={col.key} className="text-xs">
                        {getColumnValue(finding, col.key)}
                      </TableCell>
                    ))}
                    {configKeys.map((key) => {
                      const val = getKeyValue(finding, key.key);
                      return (
                        <TableCell key={key.key} className="text-center">
                          {typeof val === "boolean" || val === "true" || val === "false" ? (
                            val === true || val === "true" ? (
                              <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="mx-auto h-4 w-4 text-red-400" />
                            )
                          ) : (
                            <span className="text-xs">{val ?? "—"}</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="max-w-48 truncate text-xs">
                      {finding.audit_observation || "—"}
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-xs">
                      {finding.audit_comments || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={finding.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const FindingsSelector = ({
  findings,
  selectedIds,
  onSelectionChange,
  generalFindings,
  generalFindingsConfig,
  isGeneralFramework
}: FindingsSelectorProps) => {
  // ── Hooks must be called unconditionally (React rules of hooks) ────────
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const filteredFindings =
    filterSeverity === "all" ? findings : findings.filter((f) => f.severity === filterSeverity);

  // Group findings by category
  const groupedFindings = useMemo(() => {
    const groups: Record<string, FindingSummary[]> = {};

    filteredFindings.forEach((finding) => {
      const category = finding.category_name || "Uncategorized";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(finding);
    });

    // Sort categories alphabetically
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredFindings]);

  // Initialize all categories as expanded on first render
  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    groupedFindings.forEach(([category]) => {
      if (!(category in expandedCategories)) {
        initialExpanded[category] = true;
      }
    });
    if (Object.keys(initialExpanded).length > 0) {
      setExpandedCategories((prev) => ({ ...prev, ...initialExpanded }));
    }
  }, [groupedFindings.length]);

  // Route to general findings selector if general framework
  if (isGeneralFramework && generalFindings) {
    return (
      <GeneralFindingsSelectorView
        generalFindings={generalFindings}
        generalFindingsConfig={generalFindingsConfig ?? null}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  // ── Compliance Findings Selector (existing) ──────────────────────────────

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleFinding = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    onSelectionChange(filteredFindings.map((f) => f.id));
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  const selectCategory = (categoryFindings: FindingSummary[]) => {
    const categoryIds = categoryFindings.map((f) => f.id);
    const newSelected = [...new Set([...selectedIds, ...categoryIds])];
    onSelectionChange(newSelected);
  };

  const deselectCategory = (categoryFindings: FindingSummary[]) => {
    const categoryIds = categoryFindings.map((f) => f.id);
    const newSelected = selectedIds.filter((id) => !categoryIds.includes(id));
    onSelectionChange(newSelected);
  };

  return (
    <div className="bg-card border-foreground/10 rounded-lg border">
      <div className="border-foreground/20 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <h4 className="text-foreground text-sm font-semibold">Select Findings for Report</h4>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {selectedIds.length} of {findings.length} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SelectField
            value={filterSeverity}
            size={"sm" as any}
            onValueChange={(value) => setFilterSeverity(value)}
            options={[
              { id: "all", name: "All Severities" },
              { id: "critical", name: "Critical" },
              { id: "high", name: "High" },
              { id: "medium", name: "Medium" },
              { id: "low", name: "Low" }
            ]}
          />
          <Button variant={"secondary"} size={"sm"} onClick={selectAll}>
            Select All
          </Button>
          <Button onClick={deselectAll} variant={"secondary"} size={"sm"}>
            Deselect All
          </Button>
        </div>
      </div>

      <div className="divide-foreground/20 divide-y">
        {groupedFindings.map(([category, categoryFindings]) => {
          const isExpanded = expandedCategories[category] ?? true;
          const selectedInCategory = categoryFindings.filter((f) =>
            selectedIds.includes(f.id)
          ).length;
          const allSelected = selectedInCategory === categoryFindings.length;
          const someSelected = selectedInCategory > 0 && !allSelected;

          return (
            <div key={category} className="bg-card">
              {/* Category Header */}
              <div className="flex items-center justify-between bg-slate-200/5 px-4 py-2.5">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex flex-1 items-center gap-2 text-left">
                  {isExpanded ? (
                    <ChevronDown className="text-foreground/60 h-4 w-4" />
                  ) : (
                    <ChevronRight className="text-foreground/60 h-4 w-4" />
                  )}
                  <span className="text-foreground text-sm font-semibold">{category}</span>
                  <span className="text-xs text-gray-500">
                    ({selectedInCategory}/{categoryFindings.length})
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  {!allSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCategory(categoryFindings);
                      }}
                      className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
                      Select All
                    </button>
                  )}
                  {someSelected || allSelected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deselectCategory(categoryFindings);
                      }}
                      className="bg-card/80 text-foreground/80 hover:bg-card rounded px-2 py-1 text-xs font-medium">
                      Deselect All
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Category Findings */}
              {isExpanded && (
                <div className="divide-forebg-foreground/10 divide-y">
                  {categoryFindings.map((finding) => {
                    const isSelected = selectedIds.includes(finding.id);
                    return (
                      <div
                        key={finding.id}
                        onClick={() => toggleFinding(finding.id)}
                        className={`flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors ${
                          isSelected
                            ? "dark:bg-primary/5 bg-blue-50"
                            : "dark:hover:bg-primary/10 hover:bg-gray-50"
                        }`}>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                            isSelected ? "border-primary bg-primary" : "border-foreground/50"
                          }`}>
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground/70 font-mono text-xs">
                              {finding.reference_code}
                            </span>

                            <span className="text-foreground text-sm font-medium">
                              {finding.clause_number} -{" "}
                              {finding.clause_description || finding.title}
                            </span>
                          </div>
                          {finding.conformity_status && (
                            <Badge
                              className={cn("mt-0.5 text-[10px] font-medium text-gray-500", {
                                "border-green-200 bg-green-100 text-green-800":
                                  finding.conformity_status === "CONFORMITY",
                                "border-amber-200 bg-amber-100 text-amber-800":
                                  finding.conformity_status === "PARTIAL_CONFORMITY",
                                "border-red-200 bg-red-100 text-red-800":
                                  finding.conformity_status === "NON_CONFORMITY"
                              })}>
                              {finding.conformity_status === "CONFORMITY"
                                ? "Conformity"
                                : finding.conformity_status === "NON_CONFORMITY"
                                  ? "Major Non-Conformity"
                                  : finding.conformity_status === "PARTIAL_CONFORMITY"
                                    ? "Minor Non-Conformity"
                                    : finding.conformity_status}
                            </Badge>
                          )}
                        </div>
                        <SeverityBadge severity={finding.severity} />
                        <StatusBadge status={finding.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
