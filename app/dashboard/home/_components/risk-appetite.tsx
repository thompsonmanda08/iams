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
import { PieChart, Pie, Cell, Label } from "recharts";

interface RiskAppetiteStatus {
  within: number;
  above: number;
  below: number;
  total_count: number;
}

interface RiskOverviewProps {
  riskAppetite?: RiskAppetiteStatus;
}

const appetiteChartConfig = {
  Below: {
    label: "Below",
    color: "var(--green-active)"
  },
  Within: {
    label: "Within",
    color: "var(--amber-active)"
  },
  Above: {
    label: "Above",
    color: "var(--red-active)"
  }
} satisfies ChartConfig;

export default function RiskAppetite({ riskAppetite }: RiskOverviewProps) {
  const appetiteData = riskAppetite
    ? [
        {
          name: "Below",
          value: riskAppetite.below || 0,
          fill: "var(--green-active)"
        },
        {
          name: "Within",
          value: riskAppetite.within || 0,
          fill: "var(--amber-active)"
        },
        {
          name: "Above",
          value: riskAppetite.above || 0,
          fill: "var(--red-active)"
        }
      ]
    : [];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Risk Appetite Status</CardTitle>
        <CardDescription>Risks within and above appetite</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer config={appetiteChartConfig} className="h-[250px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={appetiteData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
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
                          {riskAppetite?.total_count}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm">
                          Total Risks
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
              {appetiteData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
