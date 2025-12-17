"use client";

import { useState } from "react";
import { useWorkflowInstances } from "@/hooks/use-workflow-query-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, GitPullRequestCreateArrow } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WorkflowInstancesPanelProps {
  workflowId: string;
  workflowName?: string;
}

export const WorkflowInstancesPanel = ({
  workflowId,
  workflowName = "Workflow"
}: WorkflowInstancesPanelProps) => {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch workflow instances with pagination
  const { data, isLoading, error } = useWorkflowInstances({
    workflow_id: workflowId,
    page,
    page_size: pageSize
  });

  const instances = data?.data || [];
  const hasNextPage = instances.length === pageSize;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "CLOSED":
        return "secondary";
      case "IN_REVIEW":
      case "PENDING":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Instances</CardTitle>
          <CardDescription>Active and completed workflow instances</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load workflow instances. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Instances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Instances</CardTitle>
        <CardDescription>
          Active and completed workflow instances for {workflowName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {instances && instances.length > 0 ? (
          <div className="space-y-4">
            <div className="relative overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Instance ID</th>
                    <th className="text-left px-4 py-3 font-medium">Entity</th>
                    <th className="text-left px-4 py-3 font-medium">Current State</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Started</th>
                    <th className="text-center px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {instances.map((instance: any) => (
                    <tr
                      key={instance.id}
                      className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedInstanceId === instance.id ? "bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedInstanceId(instance.id)}>
                      <td className="px-4 py-3 font-mono text-xs">{instance.id?.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{instance.entity_id}</span>
                          <span className="text-xs text-muted-foreground">{instance.entity_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{instance.current_state}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={getStatusBadgeVariant(instance.workflow_status)}
                          className="capitalize">
                          {instance.workflow_status?.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(instance.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(page * pageSize, 1)} to{" "}
                {Math.min((page + 1) * pageSize, instances.length)} of results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage}
                  onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>

            {/* Selected Instance Details */}
            {selectedInstanceId && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Selected Instance: {selectedInstanceId.slice(0, 12)}... (Click View Details to see
                  full information)
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GitPullRequestCreateArrow />
              </EmptyMedia>
              <EmptyTitle>No workflow instances</EmptyTitle>
              <EmptyDescription>
                Workflow instances will appear here once entities are created and workflows are
                started.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <p className="text-sm text-muted-foreground">
                Start a new workflow instance to see it listed here.
              </p>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
};
