"use client";

import { Card } from "@/components/ui/card";
import { Globe, CheckCircle, Clock, Activity, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PieChartComponent } from "./pie-chart-component";

interface UniverseAnalyticsProps {
  stats: {
    total_universe_items: number;
    audited_items: number;
    pending_items: number;
    active_items: number;
    completion_rate: number;
  };
}

export function UniverseAnalytics({ stats }: UniverseAnalyticsProps) {
  const universeChartData = [
    { name: "Audited", value: stats.audited_items },
    { name: "Pending", value: stats.pending_items }
  ];

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getCompletionBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const CHART_CONFIG = {
    Audited: {
      label: "Audited Items",
      color: "#10b981"
    },
    Pending: {
      label: "Pending Items",
      color: "#f59e0b"
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <Globe className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Universe Analytics</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - Pie Chart */}
        <div>
          <PieChartComponent
            title="Audit Universe Status"
            data={universeChartData}
            height={300}
            config={CHART_CONFIG}
          />
        </div>

        {/* Right Column - Key Metrics */}
        <div className="space-y-4">
          <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-blue-100 p-4 dark:from-indigo-950/30 dark:to-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  Total Universe Items
                </p>
                <p className="mt-1 text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                  {stats.total_universe_items}
                </p>
              </div>
              <Globe className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium">Audited Items</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.audited_items}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium">Pending Items</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
                {stats.pending_items}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Active Items
                </p>
                <p className="mt-1 text-lg font-bold text-purple-800 dark:text-purple-200">
                  {stats.active_items}
                </p>
              </div>
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Completion Progress Section */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Audit Completion Progress</h4>
          <span className={`text-lg font-bold ${getCompletionColor(stats.completion_rate)}`}>
            {stats.completion_rate}%
          </span>
        </div>

        <Progress
          value={stats.completion_rate}
          className={`h-3 ${getCompletionBarColor(stats.completion_rate)}`}
        />

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-4 text-center">
            <Target className="mx-auto mb-2 h-5 w-5 text-blue-600" />
            <p className="text-muted-foreground text-sm">Target</p>
            <p className="mt-1 text-xl font-bold">100%</p>
          </div>

          <div className="rounded-lg border p-4 text-center">
            <CheckCircle className="mx-auto mb-2 h-5 w-5 text-green-600" />
            <p className="text-muted-foreground text-sm">Completed</p>
            <p className="mt-1 text-xl font-bold">{stats.audited_items}</p>
          </div>

          <div className="rounded-lg border p-4 text-center">
            <Activity className="mx-auto mb-2 h-5 w-5 text-amber-600" />
            <p className="text-muted-foreground text-sm">Remaining</p>
            <p className="mt-1 text-xl font-bold">{stats.pending_items}</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="mb-2 text-sm font-medium">Audit Universe Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items:</span>
                <span className="font-medium">{stats.total_universe_items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audited:</span>
                <span className="font-medium text-green-600">{stats.audited_items}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending:</span>
                <span className="font-medium text-amber-600">{stats.pending_items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active:</span>
                <span className="font-medium text-blue-600">{stats.active_items}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t pt-3">
            <div className="flex justify-between font-medium">
              <span>Completion Rate:</span>
              <span className={getCompletionColor(stats.completion_rate)}>
                {stats.completion_rate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
