"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, Clock, FileText, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/date-format";
import { useState } from "react";
import { ActionEvidenceViewerDialog } from "./action-evidence-viewer-dialog";
import type { ActionDefinition } from "@/app/_actions/risk-module-actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getActions } from "@/app/_actions/risk-module-actions";

interface ActionsLogsCardsProps {
  initialActions: ActionDefinition[];
}

export function ActionsLogsCards({ initialActions }: ActionsLogsCardsProps) {
  const [selectedActionForEvidence, setSelectedActionForEvidence] =
    useState<ActionDefinition | null>(null);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);

  const statusConfig = {
    PENDING: {
      icon: Clock,
      color: "bg-yellow-50 border-yellow-200",
      badge: "outline",
      label: "Pending",
      textColor: "text-yellow-700"
    },
    IN_PROGRESS: {
      icon: AlertCircle,
      color: "bg-blue-50 border-blue-200",
      badge: "default",
      label: "In Progress",
      textColor: "text-blue-700"
    },
    COMPLETED: {
      icon: CheckCircle,
      color: "bg-green-50 border-green-200",
      badge: "default",
      label: "Completed",
      textColor: "text-green-700"
    },
    CANCELLED: {
      icon: AlertCircle,
      color: "bg-red-50 border-red-200",
      badge: "destructive",
      label: "Cancelled",
      textColor: "text-red-700"
    }
  };

  // Infinite query for loading more actions
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["actions-logs-cards"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getActions({
        page: pageParam,
        page_size: 50
      });
      return {
        actions: response.success && response.data?.data ? response.data.data : [],
        nextPage: pageParam + 1,
        hasMore: response.data?.pagination?.has_next || false
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    initialPageParam: 1,
    initialData: {
      pages: [
        {
          actions: initialActions,
          nextPage: 2,
          hasMore: false
        }
      ],
      pageParams: [1]
    }
  });

  // const allActions = data?.pages.flatMap((page) => page.actions) || [];
  const allActions = initialActions;

  const completed = allActions.filter((a) => a.action.status === "COMPLETED");
  const inProgress = allActions.filter((a) => a.action.status === "IN_PROGRESS");
  const pending = allActions.filter((a) => a.action.status === "PENDING");
  const cancelled = allActions.filter((a) => a.action.status === "CANCELLED");

  const ActionCard = ({ actionDef }: { actionDef: ActionDefinition }) => {
    const action = actionDef.action;
    const execution = actionDef.execution;
    const config = statusConfig[action.status as keyof typeof statusConfig];
    const Icon = config.icon;
    const hasEvidence = execution?.submitted_at;

    return (
      <Card
        className={`border ${config.color} p-4 ${
          hasEvidence ? "hover:border-opacity-80 cursor-pointer transition-all hover:shadow-md" : ""
        }`}
        onClick={() => {
          if (hasEvidence) {
            setSelectedActionForEvidence(actionDef);
            setEvidenceDialogOpen(true);
          }
        }}>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex flex-1 items-start gap-2">
            <Icon className="mt-0.5 h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <h4 className="line-clamp-2 text-sm font-semibold">{action.instructions}</h4>
              <p className="mt-1 text-xs text-gray-500">Risk: {action.risk}</p>
            </div>
          </div>
          <Badge variant={config.badge as any}>{config.label}</Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium text-gray-700">Executor</p>
              <p className="truncate text-gray-900">{actionDef.executer_name}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Reviewer</p>
              <p className="truncate text-gray-900">{actionDef.reviewer_name || "Not assigned"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t pt-2">
            <div>
              <p className="font-medium text-gray-700">Due Date</p>
              <p className="text-gray-900">{formatDate(action.due_date)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Execution Status</p>
              <p className="text-gray-900">{execution ? execution.status : "Not Started"}</p>
            </div>
          </div>

          {execution?.evidence_description && (
            <div className="border-t pt-2">
              <p className="mb-1 font-medium text-gray-700">Evidence:</p>
              <p className="line-clamp-2 text-gray-600">{execution.evidence_description}</p>
            </div>
          )}

          {execution?.submitted_at && (
            <div className="flex items-center justify-between pt-2 text-gray-500">
              <span>Submitted: {formatDate(execution.submitted_at)}</span>
              {hasEvidence && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Eye className="h-3 w-3" />
                  <span className="text-xs font-medium">View Evidence</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <>
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Action Execution Logs
          </CardTitle>
          <CardDescription>
            Complete history of all actions with execution status and evidence submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({allActions.length})</TabsTrigger>
              <TabsTrigger value="completed" className={statusConfig.COMPLETED.textColor}>
                Completed ({completed.length})
              </TabsTrigger>
              <TabsTrigger value="in-progress" className={statusConfig.IN_PROGRESS.textColor}>
                In Progress ({inProgress.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className={statusConfig.PENDING.textColor}>
                Pending ({pending.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className={statusConfig.CANCELLED.textColor}>
                Cancelled ({cancelled.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4 space-y-3">
              {allActions.map((actionDef) => (
                <ActionCard key={actionDef.action.id} actionDef={actionDef} />
              ))}
            </TabsContent>

            <TabsContent value="completed" className="mt-4 space-y-3">
              {completed.length > 0 ? (
                completed.map((actionDef) => (
                  <ActionCard key={actionDef.action.id} actionDef={actionDef} />
                ))
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">No completed actions</p>
              )}
            </TabsContent>

            <TabsContent value="in-progress" className="mt-4 space-y-3">
              {inProgress.length > 0 ? (
                inProgress.map((actionDef) => (
                  <ActionCard key={actionDef.action.id} actionDef={actionDef} />
                ))
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">No in-progress actions</p>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-4 space-y-3">
              {pending.length > 0 ? (
                pending.map((actionDef) => (
                  <ActionCard key={actionDef.action.id} actionDef={actionDef} />
                ))
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">No pending actions</p>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="mt-4 space-y-3">
              {cancelled.length > 0 ? (
                cancelled.map((actionDef) => (
                  <ActionCard key={actionDef.action.id} actionDef={actionDef} />
                ))
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">No cancelled actions</p>
              )}
            </TabsContent>
          </Tabs>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="gap-2">
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Actions"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Evidence Viewer Dialog */}
      {selectedActionForEvidence && selectedActionForEvidence.execution && (
        <ActionEvidenceViewerDialog
          open={evidenceDialogOpen}
          onOpenChange={setEvidenceDialogOpen}
          execution={selectedActionForEvidence.execution}
        />
      )}
    </>
  );
}
