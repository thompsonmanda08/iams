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
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const systemLogs = [
  { time: "00:00", logins: 145, updates: 23, deletions: 5 },
  { time: "04:00", logins: 98, updates: 12, deletions: 2 },
  { time: "08:00", logins: 342, updates: 67, deletions: 8 },
  { time: "12:00", logins: 512, updates: 112, deletions: 15 },
  { time: "16:00", logins: 421, updates: 89, deletions: 12 },
  { time: "20:00", logins: 287, updates: 45, deletions: 7 },
  { time: "23:59", logins: 156, updates: 18, deletions: 3 }
];

const users = [
  { name: "Total Active Users", count: 234 },
  { name: "Locked Accounts", count: 12 },
  { name: "Inactive (>30 days)", count: 45 }
];

const activityChartConfig = {
  logins: {
    label: "Logins",
    color: "var(--color-state-node-final)"
  },
  updates: {
    label: "Updates",
    color: "var(--color-amber-active)"
  },
  deletions: {
    label: "Deletions",
    color: "var(--color-destructive)"
  }
} satisfies ChartConfig;

export default function SystemHealth() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {users.map((user) => (
          <Card key={user.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {user.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity Timeline</CardTitle>
            <CardDescription>System activity over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityChartConfig} className="h-[300px] w-full">
              <LineChart data={systemLogs}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="logins"
                  stroke="var(--color-logins)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="updates"
                  stroke="var(--color-updates)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="deletions"
                  stroke="var(--color-deletions)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>Role-based access control overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Role</th>
                    <th className="px-3 py-2 text-left font-semibold">Dashboard</th>
                    <th className="px-3 py-2 text-left font-semibold">Risk Management</th>
                    <th className="px-3 py-2 text-left font-semibold">Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { role: "Admin", dashboard: "✓", risk: "✓", audit: "✓" },
                    { role: "Risk Manager", dashboard: "✓", risk: "✓", audit: "○" },
                    { role: "Auditor", dashboard: "○", risk: "✓", audit: "✓" },
                    { role: "Department Lead", dashboard: "○", risk: "✓", audit: "○" }
                  ].map((row) => (
                    <tr key={row.role} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{row.role}</td>
                      <td className="text-muted-foreground px-3 py-2">{row.dashboard}</td>
                      <td className="text-muted-foreground px-3 py-2">{row.risk}</td>
                      <td className="text-muted-foreground px-3 py-2">{row.audit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
