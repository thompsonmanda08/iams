"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { listGeneralFindings } from "@/app/_actions/general-findings-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  SendHorizonal,
  UserPlus,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useSubmitGeneralFinding } from "@/hooks/use-general-findings-mutations";
import { AssignFindingActionDialog } from "./assign-finding-action-dialog";
import type { AuditPlan } from "@/lib/types/audit-types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConfigColumn {
  key: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
  order?: number;
}

interface GeneralFindingsListProps {
  findings: any[];
  config: {
    columns: ConfigColumn[];
    keys: ConfigColumn[];
  };
  auditPlanStatus: string;
  auditPlan: AuditPlan;
  workingPaperId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resolve a column value from either {key,value} or flat {[actualKey]:value} format */
function getColumnValue(finding: any, colKey: string): string {
  if (!Array.isArray(finding.columns)) return "—";
  for (const col of finding.columns) {
    // Canonical API format: {key: "po_no", value: "test 3"}
    if (col.key === colKey) return col.value ?? "—";
    // Flat format: {po_no: "test 3"}
    if (col[colKey] !== undefined) return col[colKey] === "" ? "—" : String(col[colKey]);
  }
  return "—";
}

/** Resolve a key (audit test) value from either {key,value} or flat {[actualKey]:value} format */
function getKeyValue(finding: any, keyKey: string): any {
  if (!Array.isArray(finding.keys)) return null;
  for (const k of finding.keys) {
    // Canonical API format: {key: "a", value: true}
    if (k.key === keyKey) return k.value ?? null;
    // Flat format: {a: true}
    if (k[keyKey] !== undefined) return k[keyKey];
  }
  return null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GeneralFindingsList({
  findings: initialFindings,
  config,
  auditPlanStatus,
  auditPlan,
  workingPaperId
}: GeneralFindingsListProps) {
  const submitMutation = useSubmitGeneralFinding();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignFinding, setAssignFinding] = useState<any>(null);

  // Subscribe to the same query key mutated by the workpaper grid so this list
  // stays in sync whenever findings are created, updated, or deleted.
  const { data: findings } = useQuery({
    queryKey: [QUERY_KEYS.GENERAL_FINDINGS, workingPaperId],
    queryFn: async () => {
      const result = await listGeneralFindings(workingPaperId);
      if (!result.success) throw new Error(result.message);

      const findingsArray = Array.isArray(result.data?.findings)
        ? result.data?.findings
        : Array.isArray(result.data)
          ? result.data
          : [];
      return findingsArray as any[];
    },
    initialData: initialFindings,
    staleTime: 0,
    enabled: !!workingPaperId
  });

  const configColumns = config?.columns ?? [];
  const configKeys = config?.keys ?? [];

  // Sort oldest → newest so the most recently created row always appears at the bottom
  const sortedFindings = [...(findings ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const totalColumns = 1 + configColumns.length + configKeys.length + 5; // # + columns + keys + obs + comments + evidence + status + actions

  if (!config || (!configColumns.length && !configKeys.length)) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed p-6">
        <AlertCircle className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">No workpaper configuration found</p>
          <p className="text-muted-foreground mt-1 text-sm">
            The template linked to this audit has no column configuration.
          </p>
        </div>
      </div>
    );
  }

  if (!sortedFindings.length) {
    return (
      <Card className="bg-canvas/50 border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-8 py-16">
          <div className="relative mb-4">
            <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
            <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
              <AlertCircle className="text-primary h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-foreground mb-2 text-2xl font-semibold">No Findings Recorded</h3>
          <p className="text-muted-foreground mb-4 max-w-md text-center">
            No general workpaper findings have been recorded yet. Findings are created from the
            Workpaper tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  function handleSubmit(findingId: string) {
    submitMutation.mutate({ findingId, workingPaperId });
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Card className="overflow-x-auto">
          <Table className="min-w-300">
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
                        <span className="cursor-help">{col.name}</span>
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
                <TableHead rowSpan={2} className="min-w-30 border-b align-bottom">
                  Evidence
                </TableHead>
                <TableHead rowSpan={2} className="min-w-20 border-b align-bottom">
                  Status
                </TableHead>
                <TableHead rowSpan={2} className="w-24 border-b align-bottom">
                  Actions
                </TableHead>
              </TableRow>

              {/* Sub-header row for individual key columns */}
              {configKeys.length > 0 && (
                <TableRow>
                  {configKeys.map((key) => (
                    <TableHead
                      key={key.key}
                      className="min-w-25 border-l bg-amber-50/50 text-center dark:bg-amber-950/20">
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
              {sortedFindings.map((finding: any, index: number) => (
                <TableRow key={finding.id}>
                  {/* Row number */}
                  <TableCell className="font-medium">{index + 1}</TableCell>

                  {/* Dynamic columns */}
                  {configColumns.map((col) => (
                    <TableCell key={col.key} className="text-sm">
                      {getColumnValue(finding, col.key)}
                    </TableCell>
                  ))}

                  {/* Dynamic keys (audit tests) */}
                  {configKeys.map((key) => {
                    const val = getKeyValue(finding, key.key);
                    return (
                      <TableCell
                        key={key.key}
                        className="border-l bg-amber-50/20 text-center dark:bg-amber-950/10">
                        {key.type === "boolean" ? (
                          val === true || val === "true" ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                          ) : val === false || val === "false" ? (
                            <XCircle className="mx-auto h-4 w-4 text-red-500" />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )
                        ) : (
                          <span className="text-sm">{val ?? "—"}</span>
                        )}
                      </TableCell>
                    );
                  })}

                  {/* Audit Observations */}
                  <TableCell className="max-w-62.5 text-sm">
                    {finding.audit_observation || "—"}
                  </TableCell>

                  {/* Audit Comments */}
                  <TableCell className="max-w-62.5 text-sm">
                    {finding.audit_comments || "—"}
                  </TableCell>

                  {/* Evidence */}
                  <TableCell>
                    {finding.evidence ? (
                      <a
                        href={finding.evidence}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400">
                        <FileText className="h-3 w-3" />
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {finding.status || "DRAFT"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {finding.status === "DRAFT" && auditPlanStatus?.toUpperCase() === "APPROVED" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleSubmit(finding.id)}
                              disabled={submitMutation.isPending}>
                              {submitMutation.isPending ? (
                                <Spinner className="size-3" />
                              ) : (
                                <SendHorizonal className="h-3 w-3" />
                              )}{" "}
                              Submit
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Submit for approval</TooltipContent>
                        </Tooltip>
                      )}
                      {finding.status === "APPROVED" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-violet-600 hover:text-violet-700"
                              onClick={() => {
                                setAssignFinding({ ...finding, framework: "GENERAL" });
                                setAssignDialogOpen(true);
                              }}>
                              <UserPlus className="h-3 w-3" />
                              Assign
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Assign action</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Assign Action Dialog */}
        <AssignFindingActionDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          finding={assignFinding}
          auditPlanStatus={auditPlanStatus}
        />
      </div>
    </TooltipProvider>
  );
}
