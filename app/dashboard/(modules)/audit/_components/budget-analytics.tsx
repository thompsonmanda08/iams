"use client";

import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BudgetAnalyticsProps {
  stats: {
    total_budget_count: number;
    total_allocated: number;
    total_spent: number;
    remaining_budget: number;
    utilization_percentage: number;
    average_budget_per_audit: number;
  };
}

export function BudgetAnalytics({ stats }: BudgetAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage <= 30) return "text-green-600";
    if (percentage <= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getUtilizationBarColor = (percentage: number) => {
    if (percentage <= 30) return "bg-green-500";
    if (percentage <= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold">Budget Analytics</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - Key Metrics */}
        <div className="space-y-4">
          <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 dark:from-emerald-950/30 dark:to-emerald-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Total Allocated Budget
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                  {formatCurrency(stats.total_allocated)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium">Budget Utilization</p>
              </div>
              <p
                className={`mt-2 text-xl font-bold ${getUtilizationColor(stats.utilization_percentage)}`}>
                {stats.utilization_percentage.toFixed(1)}%
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium">Remaining Budget</p>
              </div>
              <p className="mt-2 text-xl font-bold text-amber-700 dark:text-amber-300">
                {formatCurrency(stats.remaining_budget)}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Average per Audit
                </p>
                <p className="mt-1 text-lg font-bold text-purple-800 dark:text-purple-200">
                  {formatCurrency(stats.average_budget_per_audit)}
                </p>
              </div>
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Right Column - Utilization Details */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium">Budget Utilization Progress</h4>
              <span className="text-muted-foreground text-sm">
                {stats.total_spent.toLocaleString()} / {stats.total_allocated.toLocaleString()}
              </span>
            </div>
            <Progress
              value={stats.utilization_percentage}
              className={`h-2 ${getUtilizationBarColor(stats.utilization_percentage)}`}
            />
            <div className="text-muted-foreground mt-2 flex justify-between text-xs">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-muted-foreground text-sm">Total Budgets</p>
              <p className="mt-1 text-2xl font-bold">{stats.total_budget_count}</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-muted-foreground text-sm">Total Spent</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(stats.total_spent)}</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-muted-foreground text-sm">Utilization</p>
              <p className="mt-1 text-2xl font-bold">{stats.utilization_percentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="mb-2 text-sm font-medium">Budget Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Allocated Budget:</span>
                <span className="font-medium">{formatCurrency(stats.total_allocated)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget Spent:</span>
                <span className="font-medium">{formatCurrency(stats.total_spent)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Available Balance:</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(stats.remaining_budget)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
