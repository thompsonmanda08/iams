"use client";

import { useWorkerStatus, useTriggerWorkerProcess } from "@/hooks/use-workflow-query-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, Play, RotateCw, CheckCircle2, AlertTriangle } from "lucide-react";

export const WorkflowWorkerStatus = () => {
  const { data, isLoading, error } = useWorkerStatus();
  const { mutate: triggerWorker, isPending: isTriggering } = useTriggerWorkerProcess();

  const workerStatus = data?.data;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Background Worker Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load worker status. Please try again.
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
          <CardTitle>Background Worker Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isRunning = workerStatus?.is_running;
  const pendingTasks = workerStatus?.pending_tasks_count || 0;
  const failedTasks = workerStatus?.failed_tasks_count || 0;
  const lastRun = workerStatus?.last_run_at
    ? new Date(workerStatus.last_run_at).toLocaleString()
    : "Never";
  const nextRun = workerStatus?.next_run_at
    ? new Date(workerStatus.next_run_at).toLocaleString()
    : "Not scheduled";

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Background Worker Status
            {isRunning ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Running
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Idle
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manages delayed transitions, scheduled triggers, and background tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Pending Tasks */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium">Pending Tasks</p>
              <p className="mt-2 text-3xl font-bold text-primary">{pendingTasks}</p>
              <p className="text-xs text-muted-foreground mt-1">Ready to process</p>
            </div>

            {/* Failed Tasks */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium">Failed Tasks</p>
              <p className={`mt-2 text-3xl font-bold ${failedTasks > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {failedTasks}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Need attention</p>
            </div>

            {/* Last Run */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium">Last Run</p>
              <p className="mt-2 text-sm font-mono">{lastRun}</p>
            </div>

            {/* Next Run */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm font-medium">Next Run</p>
              <p className="mt-2 text-sm font-mono">{nextRun}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worker Statistics */}
      {workerStatus?.statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {/* Total Processed */}
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processed</p>
                  <p className="text-lg font-bold">{workerStatus.statistics.total_processed || 0}</p>
                </div>
              </div>

              {/* Success Rate */}
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-lg font-bold">
                    {workerStatus.statistics.success_rate || 0}%
                  </p>
                </div>
              </div>

              {/* Average Duration */}
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                  <p className="text-lg font-bold">
                    {(workerStatus.statistics.avg_duration_ms || 0) / 1000}s
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Tasks Details */}
      {failedTasks > 0 && workerStatus?.failed_tasks && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Failed Tasks Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workerStatus.failed_tasks.slice(0, 5).map((task: any, index: number) => (
                <Alert key={index} variant="destructive" className="bg-destructive/5">
                  <AlertCircle className="h-4 w-4" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">{task.task_type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{task.error_message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last attempt: {new Date(task.last_attempt_at).toLocaleString()}
                    </p>
                  </div>
                </Alert>
              ))}
              {failedTasks > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{failedTasks - 5} more failed tasks...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {failedTasks > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            There are {failedTasks} failed tasks. Consider triggering the worker to retry.
          </AlertDescription>
        </Alert>
      )}

      {pendingTasks > 10 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {pendingTasks} tasks are pending. The worker should process these shortly.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
          <CardDescription>
            Manually trigger the worker to process pending tasks immediately
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            onClick={() => triggerWorker()}
            disabled={isTriggering || !isRunning}
            className="gap-2">
            <Play className="h-4 w-4" />
            {isTriggering ? "Processing..." : "Trigger Process"}
          </Button>

          <Button variant="outline" disabled className="gap-2">
            <RotateCw className="h-4 w-4" />
            Restart Worker (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
