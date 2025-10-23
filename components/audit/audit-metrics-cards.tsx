"use client";

import { AlertCircle, CheckCircle2, Clock, FileText, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AuditMetrics } from "@/lib/types/audit-types";

interface AuditMetricsCardsProps {
  metrics: AuditMetrics | null;
  isLoading?: boolean;
}

export function AuditMetricsCards({ metrics, isLoading }: AuditMetricsCardsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-24 animate-pulse space-y-3">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-16 rounded bg-muted" />
              <div className="h-3 w-32 rounded bg-muted" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Audits",
      value: metrics.totalAudits,
      subtitle: `${metrics.activeAudits} in progress`,
      icon: FileText,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Open Findings",
      value: metrics.openFindings,
      subtitle: `${metrics.criticalFindings} critical`,
      icon: AlertCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Upcoming Audits",
      value: metrics.upcomingAudits,
      subtitle: "Next 30 days",
      icon: Clock,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "Conformity Rate",
      value: `${metrics.conformityRate}%`,
      subtitle: "Average across audits",
      icon: TrendingUp,
      iconColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="p-6 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
              </div>
              <div className={`rounded-lg p-3 ${metric.bgColor}`}>
                <Icon className={`h-5 w-5 ${metric.iconColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
