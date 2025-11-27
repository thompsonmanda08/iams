"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

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
    color: "var(--green-active)"
  },
  inactive: {
    label: "Inactive",
    color: "var(--amber-active)"
  },
  locked: {
    label: "Locked",
    color: "var(--red-active)"
  }
} satisfies ChartConfig;

const COLORS = {
  active: "var(--green-active)",
  inactive: "var(--amber-active)",
  locked: "var(--red-active)"
};

export default function SystemHealth({ systemHealth }: SystemHealthProps) {
  const users = [
    { name: "Total Users", count: systemHealth.total_users },
    { name: "Active Users", count: systemHealth.active_users },
    { name: "Inactive Users", count: systemHealth.inactive_users },
    { name: "Locked Accounts", count: systemHealth.locked_users }
  ];

  const pieData = [
    {
      name: "Active",
      value: systemHealth.active_users,
      color: COLORS.active
    },
    {
      name: "Inactive",
      value: systemHealth.inactive_users,
      color: COLORS.inactive
    },
    {
      name: "Locked",
      value: systemHealth.locked_users,
      color: COLORS.locked
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
            <CardTitle>User Status Distribution</CardTitle>
            <CardDescription>Visual breakdown of user account statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityChartConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
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
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS.active }}></div>
                  <span className="text-sm">Active Users</span>
                </div>
                <span className="font-semibold" style={{ color: COLORS.active }}>
                  {systemHealth.active_users}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS.inactive }}></div>
                  <span className="text-sm">Inactive Users</span>
                </div>
                <span className="font-semibold" style={{ color: COLORS.inactive }}>
                  {systemHealth.inactive_users}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS.locked }}></div>
                  <span className="text-sm">Locked Users</span>
                </div>
                <span className="font-semibold" style={{ color: COLORS.locked }}>
                  {systemHealth.locked_users}
                </span>
              </div>

              {/* Visual distribution bar */}
              <div className="pt-4">
                <div className="text-muted-foreground mb-2 text-xs font-medium">Distribution</div>
                <div className="bg-muted flex h-4 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(systemHealth.active_users / systemHealth.total_users) * 100}%`,
                      backgroundColor: COLORS.active
                    }}
                    title={`Active: ${systemHealth.active_users} users`}
                  />
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(systemHealth.inactive_users / systemHealth.total_users) * 100}%`,
                      backgroundColor: COLORS.inactive
                    }}
                    title={`Inactive: ${systemHealth.inactive_users} users`}
                  />
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(systemHealth.locked_users / systemHealth.total_users) * 100}%`,
                      backgroundColor: COLORS.locked
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
