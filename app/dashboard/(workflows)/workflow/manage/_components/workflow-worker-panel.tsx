"use client";
import { useState, useEffect } from "react";
import { Activity, PlayCircle, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { notify } from "@/lib/utils";

interface WorkerStatus {
  status: string;
  last_run?: string;
  next_run?: string;
  pending_triggers?: number;
  processed_today?: number;
  errors?: number;
  is_running?: boolean;
}

export const WorkflowWorkerPanel = () => {
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchWorkerStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchWorkerStatus(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchWorkerStatus = async (silent = false) => {
    if (!silent) setIsFetching(true);
    try {
      const response = await getBackgroundWorkerStatus();
      if (response.success) {
        setWorkerStatus(response.data || null);
        setLastUpdated(new Date());
      } else {
        if (!silent) {
          notify({ description: "Failed to fetch worker status", type: "error" });
        }
      }
    } catch (error) {
      if (!silent) {
        notify({ description: "Error fetching worker status", type: "error" });
      }
    } finally {
      if (!silent) setIsFetching(false);
    }
  };

  const handleTriggerWorker = async () => {
    setIsLoading(true);
    try {
      const response = await triggerBackgroundWorker();
      if (response.success) {
        notify({ description: "Background worker triggered successfully", type: "success" });
        // Wait a moment for the worker to start, then refresh status
        setTimeout(() => {
          fetchWorkerStatus();
        }, 1000);
      } else {
        notify({ description: response.message || "Failed to trigger worker", type: "error" });
      }
    } catch (error) {
      notify({ description: "Error triggering worker", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "running":
        return "bg-green-500";
      case "idle":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (
    status?: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case "active":
      case "running":
        return "default";
      case "idle":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Workflow Background Worker
            </CardTitle>
            <CardDescription>
              Monitor and control the automated workflow processing service
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchWorkerStatus()}
              disabled={isFetching}>
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFetching && !workerStatus ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : workerStatus ? (
          <>
            {/* Status Overview */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Status</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${getStatusColor(workerStatus.status)}`}
                      />
                      <Badge variant={getStatusVariant(workerStatus.status)}>
                        {workerStatus.status || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                  {workerStatus.is_running ? (
                    <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                  ) : (
                    <CheckCircle2 className="text-muted-foreground h-5 w-5" />
                  )}
                </div>
              </div>

              <div className="bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-sm font-medium">Pending Triggers</p>
                <p className="mt-2 text-2xl font-bold">{workerStatus.pending_triggers ?? 0}</p>
              </div>

              <div className="bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-sm font-medium">Processed Today</p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {workerStatus.processed_today ?? 0}
                </p>
              </div>

              <div className="bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-sm font-medium">Errors</p>
                <p className="mt-2 text-2xl font-bold text-red-600">{workerStatus.errors ?? 0}</p>
              </div>
            </div>

            {/* Timing Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {workerStatus.last_run && (
                <div className="bg-muted/50 rounded-lg border p-4">
                  <p className="text-muted-foreground text-sm font-medium">Last Run</p>
                  <p className="mt-1 text-sm font-semibold">
                    {new Date(workerStatus.last_run).toLocaleString()}
                  </p>
                </div>
              )}
              {workerStatus.next_run && (
                <div className="bg-muted/50 rounded-lg border p-4">
                  <p className="text-muted-foreground text-sm font-medium">Next Run</p>
                  <p className="mt-1 text-sm font-semibold">
                    {new Date(workerStatus.next_run).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Warnings/Alerts */}
            {workerStatus.pending_triggers && workerStatus.pending_triggers > 10 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  There are {workerStatus.pending_triggers} pending triggers. Consider manually
                  triggering the worker to process them.
                </AlertDescription>
              </Alert>
            )}

            {workerStatus.errors && workerStatus.errors > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The worker has encountered {workerStatus.errors} errors. Please check the logs for
                  more details.
                </AlertDescription>
              </Alert>
            )}

            {/* Manual Trigger */}
            <div className="bg-muted/30 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Manual Processing</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Trigger the worker to immediately process pending workflow triggers
                  </p>
                </div>
                <Button
                  onClick={handleTriggerWorker}
                  disabled={isLoading || workerStatus.is_running}
                  className="gap-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  {workerStatus.is_running ? "Running..." : "Trigger Now"}
                </Button>
              </div>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <p className="text-muted-foreground text-center text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Activity className="text-muted-foreground mx-auto h-8 w-8" />
            <p className="text-muted-foreground mt-2 text-sm">Unable to fetch worker status</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchWorkerStatus()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
