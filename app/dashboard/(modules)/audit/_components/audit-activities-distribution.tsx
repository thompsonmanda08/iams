"use client";

import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { PieChartComponent } from "./pie-chart-component";

interface AuditActivitiesDistributionProps {
  quarterlyData: Array<{ name: string; value: number }>;
  stats: {
    total_auditable_area_count: number;
    total_process_activities_count: number;
    quarterly_count: {
      Q1: number;
      Q2: number;
      Q3: number;
      Q4: number;
    };
  };
}

export function AuditActivitiesDistribution({
  quarterlyData,
  stats
}: AuditActivitiesDistributionProps) {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <Activity className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Audit Activities Distribution</h3>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <PieChartComponent title="Activities by Quarter" data={quarterlyData} height={300} />
        </div>

        <div className="flex flex-col justify-center space-y-4">
          <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-950">
            <div className="text-center">
              <p className="text-muted-foreground mb-2 text-sm">Total Auditable Areas</p>
              <p className="text-4xl font-bold text-blue-600">{stats.total_auditable_area_count}</p>
            </div>
          </div>
          <div className="rounded-lg bg-indigo-50 p-6 dark:bg-indigo-950">
            <div className="text-center">
              <p className="text-muted-foreground mb-2 text-sm">Total Process Activities</p>
              <p className="text-4xl font-bold text-indigo-600">
                {stats.total_process_activities_count}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-950">
          <p className="text-muted-foreground mb-1 text-sm">Q1 Activities</p>
          <p className="text-2xl font-bold text-purple-600">{stats.quarterly_count.Q1}</p>
        </div>
        <div className="rounded-lg bg-pink-50 p-4 text-center dark:bg-pink-950">
          <p className="text-muted-foreground mb-1 text-sm">Q2 Activities</p>
          <p className="text-2xl font-bold text-pink-600">{stats.quarterly_count.Q2}</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4 text-center dark:bg-amber-950">
          <p className="text-muted-foreground mb-1 text-sm">Q3 Activities</p>
          <p className="text-2xl font-bold text-amber-600">{stats.quarterly_count.Q3}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950">
          <p className="text-muted-foreground mb-1 text-sm">Q4 Activities</p>
          <p className="text-2xl font-bold text-green-600">{stats.quarterly_count.Q4}</p>
        </div>
      </div>
    </Card>
  );
}
