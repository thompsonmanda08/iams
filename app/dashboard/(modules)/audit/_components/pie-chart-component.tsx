"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { CHART_CONFIG } from "./chart-utils";

interface PieChartComponentProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  height?: number;
  config?: ChartConfig;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export function PieChartComponent({
  title,
  data,
  height = 300,
  config = CHART_CONFIG,
  showLegend = true,
  showTooltip = true
}: PieChartComponentProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: config[item.name as keyof typeof config]?.color || "#8884d8"
  }));

  return (
    <div className="space-y-2">
      <h4 className="text-muted-foreground text-center text-sm font-medium">{title}</h4>
      <ChartContainer config={config} className="w-full" style={{ height }}>
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={1}
            label={(entry) => `${entry.name}: ${entry.value}`}
            labelLine={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          {showTooltip && (
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          )}
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        </RechartsPieChart>
      </ChartContainer>
    </div>
  );
}
