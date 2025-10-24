"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Finding } from "@/lib/types/audit-types";

interface FindingsAnalyticsProps {
  findings: Finding[];
}

export function FindingsAnalytics({ findings }: FindingsAnalyticsProps) {
  // Calculate analytics from findings
  const bySeverity = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
  };

  const byStatus = {
    open: findings.filter((f) => f.status === "open").length,
    inProgress: findings.filter((f) => f.status === "in-progress").length,
    resolved: findings.filter((f) => f.status === "resolved").length,
    closed: findings.filter((f) => f.status === "closed").length,
  };

  // Group by clause
  const byClauseMap = findings.reduce((acc, finding) => {
    const key = finding.clause;
    if (!acc[key]) {
      acc[key] = {
        clauseNumber: finding.clause,
        clauseTitle: finding.clauseTitle,
        count: 0,
      };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { clauseNumber: string; clauseTitle: string; count: number }>);

  const byClause = Object.values(byClauseMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const severityData = [
    { name: "Critical", value: bySeverity.critical, color: "#dc2626" },
    { name: "High", value: bySeverity.high, color: "#ea580c" },
    { name: "Medium", value: bySeverity.medium, color: "#d97706" },
    { name: "Low", value: bySeverity.low, color: "#2563eb" },
  ];

  const statusData = [
    { name: "Open", value: byStatus.open, color: "#dc2626" },
    { name: "In Progress", value: byStatus.inProgress, color: "#d97706" },
    { name: "Resolved", value: byStatus.resolved, color: "#16a34a" },
    { name: "Closed", value: byStatus.closed, color: "#6b7280" },
  ];

  const clauseData = byClause.map((item) => ({
    name: item.clauseNumber,
    count: item.count,
    fullName: `${item.clauseNumber} - ${item.clauseTitle}`,
  }));

  if (findings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No findings data available for analytics</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Findings by Severity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Findings by Severity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={severityData.filter((d) => d.value > 0)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Findings by Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Findings by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData.filter((d) => d.value > 0)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Findings by Clause */}
      {clauseData.length > 0 && (
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Top Findings by Clause</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clauseData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                labelFormatter={(label) => {
                  const item = clauseData.find((d) => d.name === label);
                  return item?.fullName || label;
                }}
              />
              <Bar dataKey="count" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
