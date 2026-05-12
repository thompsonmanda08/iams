"use client";

import { useState } from "react";
import { useWorkflowInstance, useWorkflowApprovals, useAvailableTransitions } from "@/hooks/use-workflow-query-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { WorkflowStateTimeline } from "./workflow-state-timeline";
import { formatDate, formatDateTime } from "@/lib/utils/date-format";

interface InstanceDetailsProps {
  instanceId: string;
  workflowName?: string;
  onClose?: () => void;
  onTransitionClick?: (transitionId: string) => void;
}

export const InstanceDetails = ({
  instanceId,
  workflowName = "Workflow",
  onClose,
  onTransitionClick
}: InstanceDetailsProps) => {
  const [showTimeline, setShowTimeline] = useState(true);
  const [showApprovals, setShowApprovals] = useState(true);

  const { data: instanceData, isLoading: instanceLoading, error: instanceError } = useWorkflowInstance(instanceId);
  const { data: approvalsData, isLoading: approvalsLoading } = useWorkflowApprovals(instanceId);
  const { data: transitionsData, isLoading: transitionsLoading } = useAvailableTransitions(instanceId);

  const instance = instanceData?.data;
  const approvals = approvalsData?.data || [];
  const availableTransitions = transitionsData?.data || [];

  if (instanceError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instance Details</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" className="absolute right-4 top-4" onClick={onClose}>
              ✕
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load instance details. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (instanceLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!instance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Instance not found. The instance may have been deleted or you may not have access to it.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Instance Header */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Instance Details</span>
              <Badge variant="secondary">{instance.id?.slice(0, 8)}</Badge>
            </CardTitle>
            <CardDescription>
              {workflowName} - {instance.entity_type}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-lg">
              ✕
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Instance Info */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Entity ID</p>
              <p className="font-mono text-sm">{instance.entity_id}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Current State</p>
              <Badge variant="outline" className="w-fit">
                {instance.current_state}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge
                variant={instance.workflow_status === "COMPLETED" ? "secondary" : "default"}
                className="w-fit">
                {instance.workflow_status}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">
                {formatDateTime(instance.created_at)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">
                {formatDateTime(instance.updated_at)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Workflow ID</p>
              <p className="font-mono text-xs">{instance.workflow_id?.slice(0, 12)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Section */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowTimeline(!showTimeline)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">State Transition History</CardTitle>
            {showTimeline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {showTimeline && (
          <CardContent>
            <WorkflowStateTimeline instanceId={instanceId} />
          </CardContent>
        )}
      </Card>

      {/* Approvals Section */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowApprovals(!showApprovals)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              Pending Approvals
              {approvals.length > 0 && (
                <Badge variant="destructive" className="rounded-full w-6 h-6 flex items-center justify-center p-0">
                  {approvals.length}
                </Badge>
              )}
            </CardTitle>
            {showApprovals ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {showApprovals && (
          <CardContent>
            {approvalsLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : approvals.length > 0 ? (
              <div className="space-y-3">
                {approvals.map((approval: any) => (
                  <Card key={approval.id} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Transition</p>
                          <p className="text-sm font-semibold">{approval.transition_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Status</p>
                          <Badge
                            variant={
                              approval.status === "APPROVED"
                                ? "secondary"
                                : approval.status === "REJECTED"
                                  ? "destructive"
                                  : "default"
                            }>
                            {approval.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Reason</p>
                          <p className="text-sm">{approval.reason || approval.comments || "—"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Processed</p>
                          <p className="text-sm">
                            {formatDate(approval.created_at)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No pending approvals for this instance.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>

      {/* Available Transitions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Transitions</CardTitle>
          <CardDescription>
            Choose an action to transition this instance to the next state
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transitionsLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : availableTransitions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {availableTransitions.map((transition: any) => (
                <Button
                  key={transition.id}
                  variant="outline"
                  className="h-auto flex-col items-start p-3"
                  onClick={() => onTransitionClick?.(transition.id)}>
                  <p className="font-semibold">{transition.action_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    → {transition.to_state}
                  </p>
                </Button>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No transitions available from the current state. This workflow instance may be
                completed or unable to proceed further.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
