"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { useTaskStore } from "@/lib/stores/task-store";

export function TaskStats() {
  const { getStats } = useTaskStore();
  const stats = getStats();

  const statCards = [
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: AlertCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} rounded-full p-2`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
