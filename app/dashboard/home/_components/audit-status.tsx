"use client";

import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuditPlan {
  title: string;
  status: string;
  start_date: string;
  progress_percentage: number;
  created_at: string;
}

interface AuditSummary {
  total_audit_plans: number;
  audit_plans_by_status: Record<string, number>;
  active_audit_plans: number;
  completed_audit_plans: number;
  total_findings: number;
  findings_by_severity: Record<string, number>;
  open_findings: number;
  overdue_action_plans: number;
  recent_audit_plans: AuditPlan[];
}

interface AuditStatusProps {
  auditSummary: AuditSummary;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export default function AuditStatus({ auditSummary }: AuditStatusProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Audit Plan Status</CardTitle>
        <CardDescription>
          {auditSummary.total_audit_plans} total plans • {auditSummary.active_audit_plans} active
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditSummary.recent_audit_plans.length > 0 ? (
            auditSummary.recent_audit_plans.map((plan) => (
              <div key={plan.title} className="border-border border-b pb-4 last:border-0 last:pb-0">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-foreground text-sm font-medium">{plan.title}</p>
                    <p className="text-muted-foreground text-xs">
                      Starts {formatDate(plan.start_date)}
                    </p>
                  </div>
                  <StatusBadge status={plan.status} />
                </div>
                <div className="bg-primary/10 h-2 w-full rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${plan.progress_percentage}%` }}
                  />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {plan.progress_percentage}% complete
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No audit plans available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
