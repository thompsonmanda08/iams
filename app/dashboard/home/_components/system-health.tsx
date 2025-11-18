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

const activityChartConfig = {
  active: {
    label: "Active",
    color: "hsl(var(--state-node-final))"
  },
  inactive: {
    label: "Inactive",
    color: "hsl(var(--amber-active))"
  },
  locked: {
    label: "Locked",
    color: "hsl(var(--destructive))"
  }
} satisfies ChartConfig;

export default function SystemHealth({ systemHealth }: SystemHealthProps) {
  const users = [
    { name: "Total Users", count: systemHealth.total_users },
    { name: "Active Users", count: systemHealth.active_users },
    { name: "Inactive Users", count: systemHealth.inactive_users },
    { name: "Locked Accounts", count: systemHealth.locked_users }
  ];

  const userStatusData = [
    {
      category: "Users",
      active: systemHealth.active_users,
      inactive: systemHealth.inactive_users,
      locked: systemHealth.locked_users
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
        <Card>
          <CardHeader>
            <CardTitle>User Status Overview</CardTitle>
            <CardDescription>Current user account status values</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityChartConfig} className="h-[300px] w-full">
              <LineChart data={userStatusData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="var(--state-node-final)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="inactive"
                  stroke="var(--amber-active)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="locked"
                  stroke="var(--destructive)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Status Details */}
        <Card>
          <CardHeader>
            <CardTitle>User Status Details</CardTitle>
            <CardDescription>Current user account status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-state-node-final h-3 w-3 rounded-full"></div>
                  <span className="text-sm">Active Users</span>
                </div>
                <span className="text-state-node-final font-semibold">
                  {systemHealth.active_users}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-active h-3 w-3 rounded-full"></div>
                  <span className="text-sm">Inactive Users</span>
                </div>
                <span className="text-amber-active font-semibold">
                  {systemHealth.inactive_users}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-destructive h-3 w-3 rounded-full"></div>
                  <span className="text-sm">Locked Users</span>
                </div>
                <span className="text-destructive font-semibold">{systemHealth.locked_users}</span>
              </div>

              {/* Visual distribution bar */}
              <div className="pt-4">
                <div className="text-muted-foreground mb-2 text-xs font-medium">Distribution</div>
                <div className="bg-muted flex h-4 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-state-node-final h-full transition-all"
                    style={{
                      width: `${(systemHealth.active_users / systemHealth.total_users) * 100}%`
                    }}
                    title={`Active: ${systemHealth.active_users} users`}
                  />
                  <div
                    className="bg-amber-active h-full transition-all"
                    style={{
                      width: `${(systemHealth.inactive_users / systemHealth.total_users) * 100}%`
                    }}
                    title={`Inactive: ${systemHealth.inactive_users} users`}
                  />
                  <div
                    className="bg-destructive h-full transition-all"
                    style={{
                      width: `${(systemHealth.locked_users / systemHealth.total_users) * 100}%`
                    }}
                    title={`Locked: ${systemHealth.locked_users} users`}
                  />
                </div>
                <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                  <span>
                    {Math.round((systemHealth.active_users / systemHealth.total_users) * 100)}%
                  </span>
                  <span>
                    {Math.round((systemHealth.inactive_users / systemHealth.total_users) * 100)}%
                  </span>
                  <span>
                    {Math.round((systemHealth.locked_users / systemHealth.total_users) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
