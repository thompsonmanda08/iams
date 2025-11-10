"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const auditPlans = [
  { name: "IT Infrastructure Audit", status: "Active", progress: 65, dueDate: "Mar 15, 2025" },
  { name: "Financial Controls Review", status: "Active", progress: 40, dueDate: "Apr 10, 2025" },
  { name: "HR Compliance Audit", status: "Scheduled", progress: 0, dueDate: "May 1, 2025" },
  { name: "Supply Chain Assessment", status: "Draft", progress: 15, dueDate: "Jun 1, 2025" },
  { name: "Data Privacy Audit", status: "Completed", progress: 100, dueDate: "Feb 28, 2025" }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-blue-500/10 text-blue-500";
    case "Scheduled":
      return "bg-yellow-500/10 text-yellow-500";
    case "Completed":
      return "bg-green-500/10 text-green-500";
    case "Draft":
      return "bg-muted text-muted-foreground";
    default:
      return "";
  }
};

export default function AuditStatus() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Audit Plan Status</CardTitle>
        <CardDescription>Engagement progress and timelines</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditPlans.map((plan) => (
            <div key={plan.name} className="border-border border-b pb-4 last:border-0 last:pb-0">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">{plan.name}</p>
                  <p className="text-muted-foreground text-xs">{plan.dueDate}</p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </span>
              </div>
              <div className="bg-primary/10 h-2 w-full rounded-full">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${plan.progress}%` }}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{plan.progress}% complete</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
