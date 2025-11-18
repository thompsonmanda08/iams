"use client";

import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Finding {
  finding_number: string;
  status: string;
  due_date: string;
  conclusion: string;
  severity: string;
}

interface FindingsTrackerProps {
  findings: Finding[];
}

const getSeverityColor = (severity: string) => {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return "bg-destructive/10 text-destructive";
    case "HIGH":
      return "bg-orange-500/10 text-orange-500";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-500";
    case "LOW":
      return "bg-green-500/10 text-green-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "OPEN":
      return "bg-destructive/10 text-destructive";
    case "IN_PROGRESS":
      return "bg-blue-500/10 text-blue-500";
    case "RESOLVED":
      return "bg-green-500/10 text-green-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getDaysOverdue = (dueDate: string) => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function FindingsTracker({ findings }: FindingsTrackerProps) {
  const openFindings = findings.filter((f) => f.status === "OPEN");

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Audit Findings</CardTitle>
        <CardDescription>
          {openFindings.length} open findings • {findings.filter((f) => !f.severity).length}{" "}
          awaiting severity assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {openFindings.length > 0 ? (
            openFindings.slice(0, 5).map((finding) => {
              const daysOverdue = getDaysOverdue(finding.due_date);

              return (
                <div
                  key={finding.finding_number}
                  className="border-border border-b pb-3 last:border-0">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono text-xs">
                          {finding.finding_number}
                        </span>
                        <p className="text-foreground text-sm font-medium">
                          {finding.conclusion || "No conclusion provided"}
                        </p>
                      </div>
                    </div>
                    {finding.severity && (
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${getSeverityColor(finding.severity)}`}>
                        {finding.severity}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={finding.status} />
                    {daysOverdue < 0 && (
                      <span className="text-destructive text-xs font-medium">
                        {Math.abs(daysOverdue)} days overdue
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">No open findings</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
