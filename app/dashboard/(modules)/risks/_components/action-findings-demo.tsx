"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, Clock, FileText } from "lucide-react";
import type { ActionFindings } from "@/app/_actions/risk-module-actions";

interface ActionFindingsDemoProps {
  mockFindings: ActionFindings[];
}

export function ActionFindingsDemo({ mockFindings }: ActionFindingsDemoProps) {
  const completed = mockFindings.filter((f) => f.status === "COMPLETED");
  const pendingReview = mockFindings.filter((f) => f.status === "PENDING_REVIEW");
  const needsRevision = mockFindings.filter((f) => f.status === "NEEDS_REVISION");
  const open = mockFindings.filter((f) => f.status === "OPEN");

  const statusConfig = {
    OPEN: {
      icon: Clock,
      color: "bg-yellow-50 border-yellow-200",
      badge: "outline",
      label: "Open"
    },
    PENDING_REVIEW: {
      icon: AlertCircle,
      color: "bg-blue-50 border-blue-200",
      badge: "default",
      label: "Pending Review"
    },
    COMPLETED: {
      icon: CheckCircle,
      color: "bg-green-50 border-green-200",
      badge: "default",
      label: "Completed"
    },
    NEEDS_REVISION: {
      icon: AlertCircle,
      color: "bg-red-50 border-red-200",
      badge: "destructive",
      label: "Needs Revision"
    }
  };

  const FindingCard = ({ finding }: { finding: ActionFindings }) => {
    const config = statusConfig[finding.status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Card className={`border ${config.color} p-4`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-2 flex-1">
            <Icon className="h-5 w-5 mt-0.5 text-gray-600" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm line-clamp-2">{finding.description}</h4>
              <p className="text-xs text-gray-500 mt-1">ID: {finding.id}</p>
            </div>
          </div>
          <Badge variant={config.badge as any}>{config.label}</Badge>
        </div>

        <div className="space-y-2 text-xs">
          {finding.evidence_notes && (
            <div>
              <p className="font-medium text-gray-700">Evidence:</p>
              <p className="text-gray-600 line-clamp-2">{finding.evidence_notes}</p>
            </div>
          )}

          {finding.status !== "OPEN" && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
              <div>
                <p className="font-medium text-gray-700">Score</p>
                <p className="text-gray-900">
                  {finding.assessment_score !== undefined ? `${finding.assessment_score}/10` : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Reviewer</p>
                <p className="text-gray-900 truncate">{finding.reviewer_id || "Pending"}</p>
              </div>
            </div>
          )}

          {finding.reviewer_feedback && (
            <div className="pt-2 border-t">
              <p className="font-medium text-gray-700 mb-1">Feedback:</p>
              <p className="text-gray-600 text-xs line-clamp-3 italic">
                "{finding.reviewer_feedback}"
              </p>
            </div>
          )}

          <div className="text-gray-500 pt-2 flex justify-between">
            <span>Submitted: {new Date(finding.submission_date).toLocaleDateString()}</span>
            {finding.assessment_date && (
              <span>Assessed: {new Date(finding.assessment_date).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Action Findings Workflow - Mock Data
        </CardTitle>
        <CardDescription>
          Complete demonstration of the action findings submission and review process with realistic
          scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({mockFindings.length})</TabsTrigger>
            <TabsTrigger value="completed" className="text-green-700">
              Completed ({completed.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-blue-700">
              Pending ({pendingReview.length})
            </TabsTrigger>
            <TabsTrigger value="revision" className="text-red-700">
              Revision ({needsRevision.length})
            </TabsTrigger>
            <TabsTrigger value="open" className="text-yellow-700">
              Open ({open.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {mockFindings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completed.length > 0 ? (
              completed.map((finding) => <FindingCard key={finding.id} finding={finding} />)
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center">No completed findings</p>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pendingReview.length > 0 ? (
              pendingReview.map((finding) => <FindingCard key={finding.id} finding={finding} />)
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center">No pending review findings</p>
            )}
          </TabsContent>

          <TabsContent value="revision" className="space-y-3 mt-4">
            {needsRevision.length > 0 ? (
              needsRevision.map((finding) => <FindingCard key={finding.id} finding={finding} />)
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center">No revision needed findings</p>
            )}
          </TabsContent>

          <TabsContent value="open" className="space-y-3 mt-4">
            {open.length > 0 ? (
              open.map((finding) => <FindingCard key={finding.id} finding={finding} />)
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center">No open findings</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Workflow Description */}
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h4 className="font-semibold mb-3">📋 Complete Workflow Process</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-2">
              <span className="font-semibold min-w-fit">1. OPEN</span>
              <span>Action owner receives assigned risk</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-fit">2. Submit</span>
              <span>Owner clicks "Submit Findings" and provides evidence</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-fit">3. PENDING_REVIEW</span>
              <span>Reviewer receives notification and assesses the submission</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-fit">4. COMPLETED/REVISION</span>
              <span>
                If approved → COMPLETED (risk mitigated). If rejected → NEEDS_REVISION (owner
                submits again)
              </span>
            </div>
          </div>
        </div>

        {/* Example Scenarios */}
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <h4 className="font-semibold mb-3">🎯 Example Scenarios in Mock Data</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>AF-2024-001 (COMPLETED):</strong> MFA implementation - High quality submission,
              approved with score 9/10
            </p>
            <p>
              <strong>AF-2024-002 (PENDING_REVIEW):</strong> Vulnerability assessment - Awaiting
              reviewer assessment
            </p>
            <p>
              <strong>AF-2024-003 (NEEDS_REVISION):</strong> GDPR policy - Rejected, detailed
              feedback provided for improvements
            </p>
            <p>
              <strong>AF-2024-004 (COMPLETED):</strong> Security training - Perfect execution,
              approved with score 10/10
            </p>
            <p>
              <strong>AF-2024-005 (OPEN):</strong> Pending action - Not yet submitted by owner
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
