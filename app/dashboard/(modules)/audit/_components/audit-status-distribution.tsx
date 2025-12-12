"use client";

import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { PieChartComponent } from "./pie-chart-component";

interface AuditStatusDistributionProps {
  data: Array<{ name: string; value: number }>;
  stats: {
    approved_audit_count: number;
    in_progress_audit_count: number;
    upcoming_audit_count: number;
  };
}

export function AuditStatusDistribution({ data, stats }: AuditStatusDistributionProps) {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Audit Status Distribution</h3>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <PieChartComponent title="Audit Status Breakdown" data={data} height={300} />
        </div>

        <div className="flex flex-col justify-center space-y-4">
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Approved Audits</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.approved_audit_count}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">In Progress</span>
              <span className="text-2xl font-bold text-blue-600">
                {stats.in_progress_audit_count}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Upcoming</span>
              <span className="text-2xl font-bold text-amber-600">
                {stats.upcoming_audit_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
