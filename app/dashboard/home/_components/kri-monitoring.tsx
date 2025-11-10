"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { PieChart, Pie, Label } from "recharts";

const kriStatus = [
  { name: "green", value: 18, fill: "var(--color-state-node-final)" },
  { name: "amber", value: 7, fill: "var(--color-amber-active)" },
  { name: "red", value: 3, fill: "var(--color-destructive)" }
];

const kriDetails = [
  { name: "Revenue Threshold", status: "green", value: "2.4M / 2.5M", trend: "↑" },
  { name: "Fraud Loss Ratio", status: "amber", value: "0.8% / 1.0%", trend: "→" },
  { name: "Compliance Rate", status: "red", value: "92% / 95%", trend: "↓" },
  { name: "System Uptime", status: "green", value: "99.8% / 99.5%", trend: "↑" }
];

const kriChartConfig = {
  value: {
    label: "KRIs"
  },
  green: {
    label: "Green",
    color: "hsl(var(--state-node-final))"
  },
  amber: {
    label: "Amber",
    color: "hsl(var(--amber-active))"
  },
  red: {
    label: "Red",
    color: "hsl(var(--destructive))"
  }
} satisfies ChartConfig;

export default function KriMonitoring() {
  const totalKris = kriStatus.reduce((acc, curr) => acc + curr.value, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "text-state-node-final bg-state-node-final/10 dark:text-state-node-final/40";
      case "amber":
        return "text-amber-active bg-amber-active/10 dark:text-yamber-active/40";
      case "red":
        return "text-destructive bg-destructive/5";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>KRI Status Overview</CardTitle>
          <CardDescription>Key Risk Indicator distribution</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={kriChartConfig} className="h-[250px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={kriStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
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
                            className="fill-foreground text-3xl font-bold">
                            {totalKris}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm">
                            Total KRIs
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KRI Measurements</CardTitle>
          <CardDescription>Latest indicator values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {kriDetails.map((kri) => (
              <div
                key={kri.name}
                className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">{kri.name}</p>
                  <p className="text-muted-foreground text-xs">{kri.value}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-1 text-sm font-semibold capitalize ${getStatusColor(kri.status)}`}>
                    {kri.status}
                  </span>
                  <span className="text-lg">{kri.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
