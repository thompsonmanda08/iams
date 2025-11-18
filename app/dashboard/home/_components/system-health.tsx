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

interface SystemHealthProps {
  systemHealth: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    locked_users: number;
    recent_logins: any[];
  };
}

const systemLogs = [
  { time: "00:00", logins: 145, updates: 23, deletions: 5 },
  { time: "04:00", logins: 98, updates: 12, deletions: 2 },
  { time: "08:00", logins: 342, updates: 67, deletions: 8 },
  { time: "12:00", logins: 512, updates: 112, deletions: 15 },
  { time: "16:00", logins: 421, updates: 89, deletions: 12 },
  { time: "20:00", logins: 287, updates: 45, deletions: 7 },
  { time: "23:59", logins: 156, updates: 18, deletions: 3 }
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

export default function SystemHealth({ systemHealth }: SystemHealthProps) {
  const users = [
    { name: "Total Users", count: systemHealth.total_users },
    { name: "Active Users", count: systemHealth.active_users },
    { name: "Locked Accounts", count: systemHealth.locked_users }
  ];

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

        {/* User Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>User Status Overview</CardTitle>
            <CardDescription>Current user account status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <span className="text-state-node-final font-semibold">
                  {systemHealth.active_users}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Inactive Users</span>
                <span className="text-amber-active font-semibold">
                  {systemHealth.inactive_users}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Locked Users</span>
                <span className="text-destructive font-semibold">{systemHealth.locked_users}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
