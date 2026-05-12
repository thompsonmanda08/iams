"use client";

import { useState, useTransition } from "react";
import { useTableSearch } from "@/hooks/use-table-search";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  FileText,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  Eye,
  AlertCircle
} from "lucide-react";
import Search from "@/components/ui/search-field";
import { CustomPagination } from "@/components/ui/pagination";
import { format } from "date-fns";
import { formatDate } from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";
import { ActionEvidenceViewerDialog } from "@/app/dashboard/(modules)/risks/_components/action-evidence-viewer-dialog";
import type { ActionDefinition } from "@/app/_actions/risk-module-actions";
import { Pagination } from "@/lib/types";

interface ActionsLogsTableProps {
  actions: ActionDefinition[];
  pagination: Pagination;
}

export function ActionsLogsTable({ actions, pagination }: ActionsLogsTableProps) {
  const router = useRouter();
  const { searchValue: searchQuery, setSearchValue: setSearchQuery } = useTableSearch({ debounceMs: 200 });
  const searchParams = useSearchParams();
  const [_, startTransition] = useTransition();
  const [selectedActionForEvidence, setSelectedActionForEvidence] =
    useState<ActionDefinition | null>(null);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);

  const handleExport = (type: "copy" | "csv" | "excel" | "pdf" | "print") => {
    console.log(`Exporting as ${type}`);
  };

  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page !== undefined) {
      params.set("page", String(page));
    }

    if (page_size !== undefined) {
      params.set("page_size", String(page_size));
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  // Get action status badge variant and color
  const getActionStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return { variant: "default", color: "bg-green-100 text-green-800" };
      case "IN_PROGRESS":
        return { variant: "outline", color: "bg-blue-100 text-blue-800" };
      case "PENDING":
        return { variant: "secondary", color: "bg-yellow-100 text-yellow-800" };
      case "CANCELLED":
        return { variant: "destructive", color: "bg-red-100 text-red-800" };
      default:
        return { variant: "secondary", color: "bg-gray-100 text-gray-800" };
    }
  };

  // Get execution status badge
  const getExecutionStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "SUBMITTED":
        return { label: "Submitted", color: "bg-green-100 text-green-800" };
      case "REJECTED":
        return { label: "Rejected", color: "bg-red-100 text-red-800" };
      case "PENDING":
      default:
        return { label: "Pending", color: "bg-yellow-100 text-yellow-800" };
    }
  };

  // Check if action is overdue
  const isOverdue = (dueDate: string, status: string) => {
    if (status === "COMPLETED" || status === "CANCELLED") return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Action Execution Logs</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Complete history of all actions with submission and review status
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("copy")}>
              <Copy className="mr-2 size-4" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <FileText className="mr-2 size-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
              <FileSpreadsheet className="mr-2 size-4" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
              <FileText className="mr-2 size-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("print")}>
              <Printer className="mr-2 size-4" />
              Print
            </Button>
          </div>
          <Search
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e)}
            className="max-w-xs"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Action Details</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Executor</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Action Status</TableHead>
                <TableHead>Execution Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!actions?.length ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="text-muted-foreground/50 h-8 w-8" />
                      <p className="text-muted-foreground">No action logs found</p>
                      <p className="text-muted-foreground text-xs">
                        Actions will appear here once they are executed
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                actions?.map((actionDef) => {
                  const action = actionDef.action;
                  const execution = actionDef.execution;
                  const overdue = isOverdue(action.due_date, action.status);
                  const executionStatus = execution
                    ? getExecutionStatusBadge(execution.status)
                    : null;

                  return (
                    <TableRow key={action.id}>
                      <TableCell className="align-top">
                        <div className="max-w-sm space-y-1">
                          <div className="text-sm font-semibold">
                            {action.instructions.slice(0, 40)}...
                          </div>
                          <div className="text-muted-foreground line-clamp-2 text-xs">
                            {action.instructions.slice(0, 80)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{action.risk}</div>
                          <div className="text-muted-foreground text-xs">
                            ID: {action.risk_id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{actionDef.executer_name}</div>
                          <div className="text-muted-foreground max-w-[150px] truncate text-xs">
                            {actionDef.executer_email}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {actionDef.reviewer_name ? (
                          <div className="text-sm">
                            <div className="font-medium">{actionDef.reviewer_name}</div>
                            <div className="text-muted-foreground max-w-[150px] truncate text-xs">
                              {actionDef.reviewer_email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not assigned</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(action.due_date)}
                          </div>
                          <div
                            className={cn(
                              "text-xs",
                              overdue ? "font-medium text-red-600" : "text-muted-foreground"
                            )}>
                            {overdue ? (
                              <>
                                <AlertCircle className="mr-1 inline h-3 w-3" />
                                Overdue by {action.overdue_by} days
                              </>
                            ) : (
                              "On track"
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={cn("text-xs", getActionStatusVariant(action.status).color)}>
                          {action.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {execution ? (
                          <Badge className={cn("text-xs", executionStatus?.color)}>
                            {executionStatus?.label}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Not Started
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          {execution?.submitted_at ? (
                            <div>
                              <div className="font-medium">
                                {formatDate(execution.submitted_at)}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {format(new Date(execution.submitted_at), "h:mm a")}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {execution && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedActionForEvidence(actionDef);
                                setEvidenceDialogOpen(true);
                              }}
                              className="h-8 gap-1.5">
                              <Eye className="h-3.5 w-3.5" />
                              View Evidence
                            </Button>
                          )}

                          {!execution && (
                            <span className="text-muted-foreground text-xs">No submission</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {actions?.length > 0 && (
            <CustomPagination
              pagination={pagination}
              updatePagination={updatePagination}
              allowSetPageSize={true}
              showDetails={true}
              className="border-t"
            />
          )}
        </div>
      </CardContent>

      {/* Action Evidence Viewer Dialog - For viewing submitted evidence */}
      {selectedActionForEvidence && selectedActionForEvidence.execution && (
        <ActionEvidenceViewerDialog
          open={evidenceDialogOpen}
          onOpenChange={setEvidenceDialogOpen}
          execution={selectedActionForEvidence.execution}
        />
      )}
    </Card>
  );
}
