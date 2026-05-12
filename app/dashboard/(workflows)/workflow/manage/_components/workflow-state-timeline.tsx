"use client";

import { useWorkflowHistory } from "@/hooks/use-workflow-query-data";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils/date-format";

interface WorkflowStateTimelineProps {
  instanceId: string;
  maxItems?: number;
}

export const WorkflowStateTimeline = ({
  instanceId,
  maxItems = 10
}: WorkflowStateTimelineProps) => {
  const { data, isLoading, error } = useWorkflowHistory(instanceId, 1, maxItems);

  const history = data?.data || [];

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load transition history.</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No transition history available for this instance.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {history.map((record: any, index: number) => (
          <div key={record.id || index} className="flex gap-4 pb-6">
            {/* Timeline Node */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-primary" />
              {index < history.length - 1 && (
                <div className="w-0.5 h-16 bg-border mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <Card className="bg-muted/50">
                <div className="p-4">
                  {/* Transition Info */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {record.from_state} → {record.to_state}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {record.transition_id?.slice(0, 8)}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(record.executed_at)}
                    </span>
                  </div>

                  {/* Executed By */}
                  <div className="text-xs text-muted-foreground mb-2">
                    Executed by <span className="font-medium">{record.executed_by}</span>
                  </div>

                  {/* Reason */}
                  {record.reason && (
                    <p className="text-sm bg-white dark:bg-slate-950 p-2 rounded border text-muted-foreground mt-2">
                      {record.reason}
                    </p>
                  )}

                  {/* Action Results */}
                  {record.action_results && Object.keys(record.action_results).length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">
                        View action results
                      </summary>
                      <pre className="text-xs bg-slate-900 text-slate-100 p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(record.action_results, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Card component since we're not importing it
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`border rounded-lg ${className}`} {...props} />
);
