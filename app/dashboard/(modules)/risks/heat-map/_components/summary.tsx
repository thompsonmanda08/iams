// components/risk-summary-stats.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  blurColor: string;
  valueColor?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  blurColor,
  valueColor
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full blur-2xl", blurColor)} />
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", bgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RiskSummaryStatsProps {
  summary: {
    low_count: number;
    medium_count: number;
    high_count: number;
    very_high_count: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    above_appetite_count: number;
    within_appetite_count: number;
  };
}

export function RiskSummaryStats({ summary }: RiskSummaryStatsProps) {
  // Import icons here to avoid repetition
  const {
    Shield,
    AlertTriangle,
    TrendingUp,
    Target,
    ArrowUp,
    ArrowDown
  } = require("lucide-react");

  const riskLevelStats = [
    {
      label: "Low Risk",
      value: summary.low_count,
      icon: Shield,
      iconColor: "text-green-600",
      bgColor: "bg-green-500/10",
      blurColor: "bg-green-500/10",
    },
    {
      label: "Medium Risk",
      value: summary.medium_count,
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
      blurColor: "bg-yellow-500/10",
    },
    {
      label: "High Risk",
      value: summary.high_count,
      icon: TrendingUp,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-500/10",
      blurColor: "bg-orange-500/10",
    },
    {
      label: "Very High Risk",
      value: summary.very_high_count,
      icon: AlertTriangle,
      iconColor: "text-red-600",
      bgColor: "bg-red-500/10",
      blurColor: "bg-red-500/10",
    },
    {
      label: "Within Appetite",
      value: summary.within_appetite_count,
      icon: Target,
      iconColor: "text-green-600",
      bgColor: "bg-green-500/10",
      blurColor: "bg-green-500/10",
      valueColor: "text-green-600",
    },
    {
      label: "Above Appetite",
      value: summary.above_appetite_count,
      icon: AlertTriangle,
      iconColor: "text-red-600",
      bgColor: "bg-red-500/10",
      blurColor: "bg-red-500/10",
      valueColor: "text-red-600",
    },
    {
      label: "Average Score",
      value: summary.average_score.toFixed(1),
      icon: TrendingUp,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      blurColor: "bg-primary/10",
    },
    {
      label: "Highest Score",
      value: summary.highest_score,
      icon: ArrowUp,
      iconColor: "text-red-600",
      bgColor: "bg-red-500/10",
      blurColor: "bg-red-500/10",
      valueColor: "text-red-600",
    },
    {
      label: "Lowest Score",
      value: summary.lowest_score,
      icon: ArrowDown,
      iconColor: "text-green-600",
      bgColor: "bg-green-500/10",
      blurColor: "bg-green-500/10",
      valueColor: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {riskLevelStats.slice(0, 4).map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {riskLevelStats.slice(4).map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
} 