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

interface KRI {
  id: string;
  name: string;
  last_status: string;
  updated_at: string;
}

interface KRISummary {
  total_kris: number;
  kris_by_status: Record<string, number>;
  kris_in_breach: number;
  kris_due_measurement: number;
  total_kri_registers: number;
  recent_kris: KRI[];
}

interface KriMonitoringProps {
  kriSummary: KRISummary;
}

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

export default function KriMonitoring({ kriSummary }: KriMonitoringProps) {
  // Transform API data to chart format
  const greenCount = kriSummary.kris_by_status.Green || 0;
  const redCount = kriSummary.kris_in_breach || 0;
  // Calculate amber as the remaining KRIs
  const amberCount = Math.max(0, kriSummary.total_kris - greenCount - redCount);

  const kriStatus = [
    { name: "green", value: greenCount, fill: "var(--color-state-node-final)" },
    { name: "amber", value: amberCount, fill: "var(--color-amber-active)" },
    { name: "red", value: redCount, fill: "var(--color-destructive)" }
  ].filter((item) => item.value > 0);

  const totalKris = kriStatus.reduce((acc, curr) => acc + curr.value, 0);

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "green":
        return "text-state-node-final bg-state-node-final/10 dark:text-state-node-final/40";
      case "amber":
      case "yellow":
        return "text-amber-active bg-amber-active/10 dark:text-amber-active/40";
      case "red":
        return "text-destructive bg-destructive/5";
      default:
        return "text-muted-foreground";
    }
  };

  // Show top 4 recent KRIs with status
  const displayKRIs = kriSummary.recent_kris.filter((kri) => kri.last_status).slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>KRI Status Overview</CardTitle>
          <CardDescription>Key Risk Indicator distribution</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {totalKris > 0 ? (
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
          ) : (
            <p className="text-muted-foreground py-16 text-center text-sm">No KRI data available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KRI Measurements</CardTitle>
          <CardDescription>Latest indicator values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayKRIs.length > 0 ? (
              displayKRIs.map((kri) => (
                <div
                  key={kri.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{kri.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Updated {new Date(kri.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-1 text-sm font-semibold capitalize ${getStatusColor(kri.last_status)}`}>
                      {kri.last_status || "Pending"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No KRI measurements available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
