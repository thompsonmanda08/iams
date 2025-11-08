"use client";

import { FileText, Download, Calendar, User, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ActionFindings } from "@/app/_actions/risk-module-actions";

interface ActionFindingsDisplayProps {
  findings: ActionFindings;
  isReviewer?: boolean;
}

export function ActionFindingsDisplay({ findings, isReviewer = false }: ActionFindingsDisplayProps) {
  const statusConfig = {
    OPEN: {
      label: "Open",
      variant: "secondary" as const,
      icon: AlertCircle,
      color: "text-yellow-600"
    },
    PENDING_REVIEW: {
      label: "Pending Review",
      variant: "outline" as const,
      icon: AlertCircle,
      color: "text-blue-600"
    },
    COMPLETED: {
      label: "Completed",
      variant: "default" as const,
      icon: CheckCircle,
      color: "text-green-600"
    },
    NEEDS_REVISION: {
      label: "Needs Revision",
      variant: "destructive" as const,
      icon: AlertCircle,
      color: "text-red-600"
    }
  };

  const config = statusConfig[findings.status as keyof typeof statusConfig] || statusConfig.OPEN;
  const StatusIcon = config.icon;

  const submissionDate = new Date(findings.submission_date);
  const assessmentDate = findings.assessment_date ? new Date(findings.assessment_date) : null;

  return (
    <Card className="p-6 space-y-4">
      {/* Header with Status */}
      <div className="flex items-start justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Action Findings
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Submitted on {submissionDate.toLocaleDateString()} at{" "}
            {submissionDate.toLocaleTimeString()}
          </p>
        </div>
        <Badge variant={config.variant} className="flex items-center gap-1">
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {/* Description */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Action Taken</p>
        <p className="text-sm text-gray-900 whitespace-pre-wrap">{findings.description}</p>
      </div>

      {/* Evidence Notes */}
      {findings.evidence_notes && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Supporting Evidence</p>
          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{findings.evidence_notes}</p>
          </div>
        </div>
      )}

      {/* File Attachment */}
      {findings.evidence_file_name && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Attached Evidence</p>
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 flex-1">
              {findings.evidence_file_name}
            </span>
            {findings.evidence_file_url && (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1"
                onClick={() => {
                  // In production, this would open/download the file
                  window.open(findings.evidence_file_url, "_blank");
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Reviewer Assessment */}
      {isReviewer && findings.status !== "OPEN" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Reviewer Assessment</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-700 font-medium">Reviewer</p>
              <p className="text-sm text-gray-900">{findings.reviewer_id || "Not assigned"}</p>
            </div>
            {findings.assessment_score !== undefined && (
              <div>
                <p className="text-sm text-green-700 font-medium">Assessment Score</p>
                <p className="text-sm text-gray-900">{findings.assessment_score}/10</p>
              </div>
            )}
          </div>

          {findings.reviewer_feedback && (
            <div>
              <p className="text-sm text-green-700 font-medium mb-1">Reviewer Feedback</p>
              <div className="bg-white p-2 rounded border border-green-100">
                <p className="text-sm text-gray-700">{findings.reviewer_feedback}</p>
              </div>
            </div>
          )}

          {findings.assessment_date && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Assessed on {new Date(findings.assessment_date).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Timeline Info */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Submitted: {submissionDate.toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          Owner: {findings.action_owner_id}
        </div>
        {findings.reviewer_id && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Reviewer: {findings.reviewer_id}
          </div>
        )}
      </div>
    </Card>
  );
}
