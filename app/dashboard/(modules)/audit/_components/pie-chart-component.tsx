"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, Label } from "recharts";
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

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-2">
      <h4 className="text-muted-foreground text-center text-sm font-medium">{title}</h4>
      <ChartContainer config={config} className="w-full flex justify-center" style={{ height }}>
        <RechartsPieChart>
          {showTooltip && (
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          )}
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={2}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle">
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-2xl font-bold">
                        {total.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 20}
                        className="fill-muted-foreground text-xs">
                        Total
                      </tspan>
                    </text>
                  );
                }
              }}
            />
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        </RechartsPieChart>
      </ChartContainer>
    </div>
  );
}
