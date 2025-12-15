"use client";

import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { PieChartComponent } from "./pie-chart-component";

interface AuditPlanAnalyticsProps {
  planTypeData: Array<{ name: string; value: number }>;
  quarterlyData: Array<{ name: string; value: number }>;
  quarterlyStats: {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
  };
}

export function AuditPlanAnalytics({
  planTypeData,
  quarterlyData,
  quarterlyStats
}: AuditPlanAnalyticsProps) {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Audit Plan Analytics</h3>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <PieChartComponent title="Plans by Type" data={planTypeData} height={300} />
        </div>

        <div>
          <PieChartComponent title="Plans by Quarter" data={quarterlyData} height={300} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-950">
          <p className="text-muted-foreground mb-1 text-sm">Q1 Plans</p>
          <p className="text-2xl font-bold text-purple-600">{quarterlyStats.Q1}</p>
        </div>
        <div className="rounded-lg bg-pink-50 p-4 text-center dark:bg-pink-950">
          <p className="text-muted-foreground mb-1 text-sm">Q2 Plans</p>
          <p className="text-2xl font-bold text-pink-600">{quarterlyStats.Q2}</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4 text-center dark:bg-amber-950">
          <p className="text-muted-foreground mb-1 text-sm">Q3 Plans</p>
          <p className="text-2xl font-bold text-amber-600">{quarterlyStats.Q3}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950">
          <p className="text-muted-foreground mb-1 text-sm">Q4 Plans</p>
          <p className="text-2xl font-bold text-green-600">{quarterlyStats.Q4}</p>
        </div>
      </div>
    </Card>
  );
}
