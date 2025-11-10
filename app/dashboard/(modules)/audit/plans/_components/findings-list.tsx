"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { FindingActionsMenu } from "./finding-actions-menu";

interface FindingsListProps {
  findings: any[];
  onRefresh: () => void;
  onEditFinding: (finding: any) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const STATUS_ICONS: Record<string, any> = {
  OPEN: <AlertCircle className="h-4 w-4 text-red-500" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-500" />,
  RESOLVED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  CLOSED: <CheckCircle2 className="h-4 w-4 text-gray-500" />
};

export function FindingsList({ findings, onRefresh, onEditFinding }: FindingsListProps) {
  if (!findings || findings.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground pt-6 text-center">
          <p>No findings recorded for this audit plan yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding, index) => (
        <Card key={finding.id || index} className="gap-2 transition-shadow hover:shadow-md">
          <CardHeader className="">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  {STATUS_ICONS[finding.status] && <div>{STATUS_ICONS[finding.status]}</div>}
                  <CardTitle className="text-base">
                    {finding.category?.display_name ||
                      finding.category_name ||
                      finding.clauseTitle ||
                      "Unnamed Finding"}
                  </CardTitle>
                  {finding.severity && (
                    <Badge className={`${SEVERITY_COLORS[finding.severity] || ""}`}>
                      {finding.severity}
                    </Badge>
                  )}
                  {finding.status && <Badge variant="outline">{finding.status}</Badge>}
                </div>
                <div className="space-y-1">
                  {finding.finding_number && (
                    <CardDescription className="max-w-lg text-xs">
                      {finding.category?.description} - Finding #{finding.finding_number}
                    </CardDescription>
                  )}
                  {/* {finding.description && (
                    <CardDescription className="line-clamp-2 text-xs">
                      {finding.description}
                    </CardDescription>
                  )} */}
                </div>
              </div>
              <FindingActionsMenu
                findingId={finding.id}
                currentStatus={finding.status || "OPEN"}
                onEdit={() => onEditFinding(finding)}
                onRefresh={onRefresh}
              />
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 md:gap-6">
            {finding.conclusion && (
              <div>
                <p className="text-primary mb-1 text-sm font-semibold">Conclusion</p>
                <p className="line-clamp-2">{finding.conclusion}</p>
              </div>
            )}

            {finding.workings_and_test_results && (
              <div>
                <p className="text-primary mb-1 text-sm font-semibold">Workings & Test Results</p>
                <p className="line-clamp-3 text-sm">{finding.workings_and_test_results}</p>
              </div>
            )}

            {finding.recommendation && (
              <div>
                <p className="text-primary mb-1 text-sm font-semibold">Recommendation</p>
                <p className="line-clamp-3">{finding.recommendation}</p>
              </div>
            )}

            {(finding.responsible_person || finding.due_date) && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                {finding.responsible_person && (
                  <div>
                    <p className="text-primary mb-1 text-sm font-semibold">Responsible Person</p>
                    <p>{finding.responsible_person_name}</p>
                  </div>
                )}
                {finding.due_date && (
                  <div className="ml-auto">
                    <p className="text-primary mb-1 text-right text-sm font-semibold">Due Date</p>
                    <Badge variant="outline">
                      {new Date(finding.due_date).toLocaleDateString()}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
