"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const findings = [
  {
    id: "F-001",
    title: "Inadequate Access Controls",
    severity: "CRITICAL",
    status: "Awaiting Response",
    days: 12
  },
  { id: "F-002", title: "Missing Documentation", severity: "HIGH", status: "In Progress", days: 5 },
  {
    id: "F-003",
    title: "Outdated Procedures",
    severity: "MEDIUM",
    status: "Awaiting Response",
    days: 8
  },
  {
    id: "F-004",
    title: "Training Gaps Identified",
    severity: "MEDIUM",
    status: "Remediated",
    days: 0
  },
  { id: "F-005", title: "System Log Retention", severity: "HIGH", status: "In Progress", days: 3 }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "bg-destructive/10 text-destructive";
    case "HIGH":
      return "bg-orange-500/10 text-orange-500";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-500";
    case "LOW":
      return "bg-green-500/10 text-green-500";
    default:
      return "";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Awaiting Response":
      return "bg-destructive/10 text-destructive";
    case "In Progress":
      return "bg-blue-500/10 text-blue-500";
    case "Remediated":
      return "bg-green-500/10 text-green-500";
    default:
      return "";
  }
};

export default function FindingsTracker() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Audit Findings</CardTitle>
        <CardDescription>Open and in-progress findings from active audits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {findings.map((finding) => (
            <div key={finding.id} className="border-border border-b pb-3 last:border-0">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-xs">{finding.id}</span>
                    <p className="text-foreground text-sm font-medium">{finding.title}</p>
                  </div>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${getSeverityColor(finding.severity)}`}>
                  {finding.severity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${getStatusColor(finding.status)}`}>
                  {finding.status}
                </span>
                {finding.days > 0 && (
                  <span className="text-destructive text-xs font-medium">
                    {finding.days} days overdue
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
