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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface RiskSummary {
  total_risks: number;
  risks_by_rating: {
    High: number;
    Low: number;
    Normal: number;
  };
  risks_by_status: {
    DRAFT: number;
    OPEN: number;
  };
  risks_by_department: Array<{
    department_id: string;
    department_name: string;
    risk_count: number;
    open_risk_count: number;
  }>;
}

interface RiskOverviewProps {
  riskSummary: RiskSummary;
}

const riskChartConfig = {
  value: {
    label: "Risks"
  },
  High: {
    label: "High",
    color: "var(--red-active)"
  },
  Medium: {
    label: "Medium",
    color: "var(--amber-active)"
  },
  Low: {
    label: "Low",
    color: "var(--green-active)"
  }
} satisfies ChartConfig;

export default function RiskOverview({ riskSummary }: RiskOverviewProps) {
  const riskData = [
    {
      name: "High",
      value: riskSummary.risks_by_rating.High || 0,
      fill: "var(--red-active)"
    },
    {
      name: "Medium",
      value: riskSummary.risks_by_rating.Normal || 0,
      fill: "var(--amber-active)"
    },
    {
      name: "Low",
      value: riskSummary.risks_by_rating.Low || 0,
      fill: "var(--green-active)"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Risk Distribution by Severity</CardTitle>
          <CardDescription>Current breakdown of all organizational risks</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={riskChartConfig} className="h-[300px] w-full">
            <BarChart data={riskData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Department Risk Summary</CardTitle>
          <CardDescription>Open risks by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskSummary.risks_by_department.length > 0 ? (
              riskSummary.risks_by_department.map((dept) => (
                <div
                  key={dept.department_id}
                  className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{dept.department_name}</p>
                    <p className="text-muted-foreground text-xs">{dept.risk_count} total risks</p>
                  </div>
                  <div className="bg-destructive/5 p-2 text-right">
                    <p className="text-destructive/70 text-sm font-semibold">
                      {dept.open_risk_count} open
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No department risks available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
