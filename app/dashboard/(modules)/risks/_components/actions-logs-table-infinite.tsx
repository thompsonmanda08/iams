"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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
  AlertCircle,
  Loader2
} from "lucide-react";
import Search from "@/components/ui/search-field";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ActionEvidenceViewerDialog } from "@/app/dashboard/(modules)/risks/_components/action-evidence-viewer-dialog";
import { getActions } from "@/app/_actions/risk-module-actions";
import type { ActionDefinition } from "@/app/_actions/risk-module-actions";
import { Pagination } from "@/lib/types";
import { useRouter } from "next/navigation";

interface ActionsLogsTableWithInfiniteScrollProps {
  actions: ActionDefinition[];
  pagination: Pagination;
  initialStatus?: string;
}

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" }
];

export function ActionsLogsTableWithInfiniteScroll({
  actions: initialActions,
  pagination: initialPagination,
  initialStatus = ""
}: ActionsLogsTableWithInfiniteScrollProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedActionForEvidence, setSelectedActionForEvidence] =
    useState<ActionDefinition | null>(null);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    const params = new URLSearchParams();
    if (status) {
      params.set("status", status);
    }
    router.push(`?${params.toString()}`);
  };

  // Infinite query for fetching actions on scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["actions-logs", activeStatus],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getActions({
        page: pageParam,
        page_size: 50,
        status: activeStatus as any
      });
      return {
        actions: response.success && response.data?.data ? response.data.data : [],
        pagination: response.data?.pagination || {
          total: 0,
          page: pageParam,
          page_size: 50,
          total_pages: 0,
          has_next: false,
          has_prev: false
        },
        nextPage: pageParam + 1
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.has_next ? lastPage.nextPage : undefined;
    },
    initialPageParam: 1,
    initialData: {
      pages: [
        {
          actions: initialActions,
          pagination: initialPagination,
          nextPage: 2
        }
      ],
      pageParams: [1]
    }
  });

  // Combine all actions from all pages
  const allActions = data?.pages.flatMap((page) => page.actions) || [];

  // Setup Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleExport = (type: "copy" | "csv" | "excel" | "pdf" | "print") => {
    console.log(`Exporting as ${type}`);
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
              Complete history of all actions with submission and review status (scroll to load
              more)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Status Tabs */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto border-b">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className={cn(
                "border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                activeStatus === tab.value
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}>
              {tab.label}
            </button>
          ))}
        </div>

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
              {status === "pending" && !allActions.length ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <p className="text-muted-foreground">Loading action logs...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !allActions.length ? (
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
                allActions?.map((actionDef) => {
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
                            {format(new Date(action.due_date), "MMM dd, yyyy")}
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
                                {format(new Date(execution.submitted_at), "MMM dd, yyyy")}
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

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-muted-foreground text-sm">Loading more actions...</span>
              </div>
            )}
            {!hasNextPage && allActions.length > 0 && (
              <span className="text-muted-foreground text-sm">No more actions to load</span>
            )}
          </div>
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
