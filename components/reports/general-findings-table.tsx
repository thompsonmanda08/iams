import React from "react";
import { CheckCircle2, XCircle, FileText, MessageSquare } from "lucide-react";
import { GeneralFindingSummary, GeneralFindingsConfig } from "@/lib/types/report-types";
import { getColumnValue, getKeyValue } from "./findings-selector";
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

interface GeneralFindingsTableProps {
  generalFindings: GeneralFindingSummary[];
  generalFindingsConfig: GeneralFindingsConfig | null;
  selectedIds: string[];
  workpaperMetadata?: { work_done: string; conclusion: string } | null;
}

export const GeneralFindingsTable = ({
  generalFindings,
  generalFindingsConfig,
  selectedIds,
  workpaperMetadata
}: GeneralFindingsTableProps) => {
  const configColumns = generalFindingsConfig?.columns ?? [];
  const configKeys = generalFindingsConfig?.keys ?? [];

  const selectedFindings = generalFindings.filter((f) => selectedIds.includes(f.id));

  if (!selectedFindings.length && !workpaperMetadata?.work_done && !workpaperMetadata?.conclusion) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No findings selected. Select findings above to include them in the report.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Findings Table */}
      {selectedFindings.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-4">
              <h4 className="text-sm font-semibold text-foreground">General Findings</h4>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                {selectedFindings.length} {selectedFindings.length === 1 ? "finding" : "findings"}
              </span>
            </div>
          </div>

          <TooltipProvider>
            <div className="overflow-x-auto">
              <Table className="min-w-200">
                <TableHeader>
                  {/* Group header row */}
                  <TableRow className="border-b-0">
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
                  {selectedFindings.map((finding, index) => (
                    <TableRow key={finding.id}>
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
                      <TableCell className="max-w-48 text-xs">
                        {finding.audit_observation || "—"}
                      </TableCell>
                      <TableCell className="max-w-48 text-xs">
                        {finding.audit_comments || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={finding.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        </div>
      )}

      {/* Work Done & Conclusion */}
      {(workpaperMetadata?.work_done || workpaperMetadata?.conclusion) && (
        <div className="grid gap-4 md:grid-cols-2">
          {workpaperMetadata.work_done && (
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">Work Done</h4>
              </div>
              <div className="px-4 py-3">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {workpaperMetadata.work_done}
                </p>
              </div>
            </div>
          )}
          {workpaperMetadata.conclusion && (
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">Conclusion</h4>
              </div>
              <div className="px-4 py-3">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {workpaperMetadata.conclusion}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
