"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Target, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingLevelSummary {
  id: string;
  name: string;
  min_score: number;
  max_score: number;
  color_hex: string;
  description: string;
  count: number;
}

interface HeatmapSummary {
  by_rating_level: RatingLevelSummary[];
  average_score: number;
  highest_score: number;
  lowest_score: number;
  above_appetite_count: number;
  within_appetite_count: number;
}

function StatCard({
  label,
  value,
  colorHex,
  valueColor
}: {
  label: string;
  value: string | number;
  colorHex: string;
  valueColor?: string;
}) {
  return (
    <Card className="relative overflow-hidden p-3">
      <div
        className="absolute top-0 right-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full blur-2xl"
        style={{ backgroundColor: `${colorHex}20` }}
      />
      <CardContent className="p-0">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${colorHex}20` }}>
            <AlertTriangle className="h-4 w-4" style={{ color: colorHex }} />
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground truncate text-xs">{label}</p>
            <p
              className={cn("text-xl leading-tight font-bold", valueColor)}
              style={valueColor ? undefined : { color: colorHex }}>
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreStatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  valueColor
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  valueColor?: string;
}) {
  return (
    <Card className="relative overflow-hidden p-3">
      <div
        className={cn(
          "absolute top-0 right-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full blur-2xl",
          bgColor
        )}
      />
      <CardContent className="p-0">
        <div className="flex items-center gap-3">
          <div
            className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", bgColor)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground truncate text-xs">{label}</p>
            <p className={cn("text-xl leading-tight font-bold", valueColor)}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskSummaryStats({ summary }: { summary: HeatmapSummary }) {
  const colCount = Math.max(summary.by_rating_level.length, 1);
  const gridCols =
    colCount <= 2
      ? "lg:grid-cols-2"
      : colCount === 3
        ? "lg:grid-cols-3"
        : colCount === 4
          ? "lg:grid-cols-4"
          : "lg:grid-cols-5";

  return (
    <div className="space-y-4">
      {/* Dynamic rating level cards — one per configured level */}
      {summary.by_rating_level.length > 0 && (
        <div className={cn("grid gap-4 md:grid-cols-2", gridCols)}>
          {summary.by_rating_level.map((level) => (
            <StatCard
              key={level.id}
              label={`${level.name} Risk`}
              value={level.count}
              colorHex={level.color_hex}
            />
          ))}
        </div>
      )}

      {/* Fixed score / appetite stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <ScoreStatCard
          label="Within Appetite"
          value={summary.within_appetite_count}
          icon={Target}
          iconColor="text-green-600"
          bgColor="bg-green-500/10"
          valueColor="text-green-600"
        />
        <ScoreStatCard
          label="Above Appetite"
          value={summary.above_appetite_count}
          icon={AlertTriangle}
          iconColor="text-red-600"
          bgColor="bg-red-500/10"
          valueColor="text-red-600"
        />
        <ScoreStatCard
          label="Average Score"
          value={summary.average_score.toFixed(1)}
          icon={TrendingUp}
          iconColor="text-primary"
          bgColor="bg-primary/10"
        />
        <ScoreStatCard
          label="Highest Score"
          value={summary.highest_score}
          icon={ArrowUp}
          iconColor="text-red-600"
          bgColor="bg-red-500/10"
          valueColor="text-red-600"
        />
        <ScoreStatCard
          label="Lowest Score"
          value={summary.lowest_score}
          icon={ArrowDown}
          iconColor="text-green-600"
          bgColor="bg-green-500/10"
          valueColor="text-green-600"
        />
      </div>
    </div>
  );
}
