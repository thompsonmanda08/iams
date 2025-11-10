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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

const riskData = [
  { name: "High", value: 12, fill: "var(--color-destructive)" },
  { name: "Medium", value: 22, fill: "var(--color-amber-active)" },
  { name: "Low", value: 14, fill: "var(--color-state-node-final)" }
];

const departmentRisks = [
  { department: "Finance", risks: 8, open: 3 },
  { department: "Operations", risks: 12, open: 4 },
  { department: "HR", risks: 5, open: 1 },
  { department: "IT", risks: 15, open: 5 },
  { department: "Marketing", risks: 8, open: 2 }
];

const riskChartConfig = {
  value: {
    label: "Risks"
  },
  High: {
    label: "High",
    color: "hsl(var(--destructive))"
  },
  Medium: {
    label: "Medium",
    color: "hsl(var(--amber-active))"
  },
  Low: {
    label: "Low",
    color: "hsl(var(--state-node-final))"
  }
} satisfies ChartConfig;

export default function RiskOverview() {
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
            {departmentRisks.map((dept) => (
              <div
                key={dept.department}
                className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{dept.department}</p>
                  <p className="text-muted-foreground text-xs">{dept.risks} total risks</p>
                </div>
                <div className="text-right">
                  <p className="text-destructive/70 text-sm font-semibold">{dept.open} open</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
