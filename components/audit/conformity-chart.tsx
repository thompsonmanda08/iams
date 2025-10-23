"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ConformityTrendData {
  month: string;
  conformityRate: number;
  nonConformities: number;
}

interface ConformityChartProps {
  data?: ConformityTrendData[];
  isLoading?: boolean;
}

export function ConformityChart({ data, isLoading }: ConformityChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-80 animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Conformity Trends</h3>
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No trend data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Conformity Trends</h3>
        <span className="text-sm text-muted-foreground">Last {data.length} months</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="month"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="conformityRate"
            name="Conformity Rate (%)"
            stroke="hsl(142 76% 36%)"
            strokeWidth={2}
            dot={{ fill: "hsl(142 76% 36%)", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="nonConformities"
            name="Non-Conformities"
            stroke="hsl(0 84% 60%)"
            strokeWidth={2}
            dot={{ fill: "hsl(0 84% 60%)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
