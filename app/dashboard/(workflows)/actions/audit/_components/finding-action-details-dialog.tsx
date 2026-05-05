"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, SquareArrowOutUpRight, CheckCircle2, XCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { FindingAction } from "@/lib/types/audit-types";
import {
  useFindingActionEvidence,
  useFindingActionReviews,
  useFinding,
  useGeneralFinding
} from "@/hooks/use-finding-actions-queries";
import { useQuery } from "@tanstack/react-query";
import { AUDIT_QUERY_KEYS } from "@/hooks/use-audit-query-data";
import { getWorkpapers } from "@/app/_actions/audit-module-actions";
import { useFindingEvidence } from "@/hooks/use-evidence-queries";
import { SubmitEvidenceDialog } from "./submit-evidence-dialog";
import { ReviewEvidenceDialog } from "./review-evidence-dialog";
import { CreateReassessmentDialog } from "./create-reassessment-dialog";
import { UpdateGeneralFindingDialog } from "./update-general-finding-dialog";
import Link from "next/link";
import { useSession } from "@/store/session-store";
import { StatusBadge } from "@/components/status-badge";
import { usePermissions } from "@/hooks/use-permissions";
import {
  FindingInformationCardSkeleton,
  ActionOverviewCardSkeleton,
  FindingEvidenceTabSkeleton,
  ActionEvidenceTabSkeleton,
  ReviewsTabSkeleton
} from "@/components/skeleton-loader";

interface FindingActionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: FindingAction;
}

const STATUS_COLORS: Record<string, { badge: string; text: string }> = {
  PENDING: {
    badge: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    text: "Pending"
  },
  IN_PROGRESS: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    text: "In Progress"
  },
  UNDER_REVIEW: {
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    text: "Under Review"
  },
  APPROVED: {
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    text: "Approved"
  },
  COMPLETED: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    text: "Completed"
  },
  REJECTED: { badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", text: "Rejected" }
};

const REVIEW_STATUS_COLORS: Record<string, { badge: string; text: string }> = {
  PENDING: {
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    text: "Pending Review"
  },
  APPROVED: {
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    text: "Approved"
  },
  REJECTED: {
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    text: "Rejected"
  }
};

// Helper function to get review status for evidence
const getEvidenceReviewStatus = (item: any) => {
  if (!item.reviews || item.reviews?.length === 0) {
    return "PENDING";
  }
  // Return the status of the most recent review
  return item.reviews[item.reviews?.length - 1]?.review_status || "PENDING";
};

export function FindingActionDetailsDialog({
  open,
  onOpenChange,
  action
}: FindingActionDetailsDialogProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const [submitEvidenceOpen, setSubmitEvidenceOpen] = useState(false);
  const [reviewEvidenceOpen, setReviewEvidenceOpen] = useState(false);
  const [createReassessmentOpen, setCreateReassessmentOpen] = useState(false);

  // Get current user session
  const { session, user: currentUser } = useSession();
  // useSession.user is the full /auth/setup payload (with `.user` nested);
  // session is the JWT cookie payload (may have user_id and a flat user object).
  const currentUserId =
    session?.user?.id ??
    session?.user_id ??
    (currentUser as any)?.user?.id ??
    (currentUser as any)?.id;

  // Fetch evidence and reviews for this action
  const { data: evidence = [], isLoading: isLoadingEvidence } = useFindingActionEvidence(action.id);
  const { data: reviews = [], isLoading: isLoadingReviews } = useFindingActionReviews(action.id);

  // Determine finding type from the action's framework_type field
  const isGeneralFinding = action.framework_type === "GENERAL";

  // Conditionally fetch: only call the hook that matches the finding type
  const { data: findingData, isLoading: isLoadingFinding } = useFinding(
    !isGeneralFinding ? action.finding_id : undefined
  );
  const { data: generalFindingData, isLoading: isLoadingGeneralFinding } = useGeneralFinding(
    isGeneralFinding ? action.finding_id : undefined
  );

  const isLoadingAnyFinding = isLoadingFinding || isLoadingGeneralFinding;

  // Fetch finding evidence (evidence attached to the finding itself)
  const {
    data: findingEvidenceData = {
      evidence: [],
      total_count: 0,
      verified_count: 0,
      unverified_count: 0
    },
    isLoading: isLoadingFindingEvidence
  } = useFindingEvidence(action.finding_id);

  // Can only create reassessment if evidence exists
  const hasEvidence = evidence && evidence?.length > 0;

  // Role-based access checks
  const isAssignedUser =
    !!currentUserId &&
    (currentUserId === action.assigned_to ||
      currentUserId === action.assigned_to_user?.id);
  const isReviewer =
    !!currentUserId &&
    (currentUserId === action.reviewer_id ||
      currentUserId === action.reviewer_user?.id);
  const isAssignedReviewer =
    !!currentUserId &&
    (currentUserId === action.auditor_id || currentUserId === action.auditor_user?.id);


  // Fetch workpaper config so we can show column/key descriptions in tooltips.
  // Use action.audit_plan.id (same endpoint as page.tsx) which is confirmed to return `config`.
  const auditPlanId = action.audit_plan?.id;
  const { data: workpaperData } = useQuery({
    queryKey: [AUDIT_QUERY_KEYS.WORKPAPERS, auditPlanId],
    queryFn: async () => {
      const res = await getWorkpapers(auditPlanId);
      return res.success ? res.data : null;
    },
    enabled: !!auditPlanId && isGeneralFinding,
    staleTime: 5 * 60 * 1000
  });

  // Build key → { name, description } lookup maps from the workpaper's template config
  const colConfigMap = useMemo(() => {
    const cols: any[] = workpaperData?.config?.[0]?.columns ?? [];
    return Object.fromEntries(cols.map((c: any) => [c.key, { name: c.name, description: c.description }]));
  }, [workpaperData]);

  const keyConfigMap = useMemo(() => {
    const keys: any[] = workpaperData?.config?.[0]?.keys ?? [];
    return Object.fromEntries(keys.map((k: any) => [k.key, { name: k.name, description: k.description }]));
  }, [workpaperData]);

  // Hide reassessment button if finding is already compliant
  const isCompliant = findingData?.compliance_status?.toLowerCase() === "compliant";

  // Evidence may not be visible to the auditor role via API — treat UNDER_REVIEW status as a signal
  // that evidence has been submitted even if the list comes back empty
  const actionHasEvidence =
    (evidence && evidence.length > 0) ||
    action.status === "UNDER_REVIEW" ||
    action.status === "APPROVED";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="flex! h-[90vh] w-full! max-w-3xl! flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finding Action Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Action Overview */}

            {/* Tabs for Evidence and Reviews */}
            <Tabs defaultValue="overview" className="w-full!">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Action Overview</TabsTrigger>
                <TabsTrigger value="finding-evidence">
                  Finding Evidence{" "}
                  {(() => {
                    const n = (findingEvidenceData?.evidence?.length ?? 0) +
                      (isGeneralFinding && generalFindingData?.evidence ? 1 : 0);
                    return n > 0 ? `(${n})` : null;
                  })()}
                </TabsTrigger>
                <TabsTrigger value="action-evidence">
                  Action Evidence {evidence?.length > 0 && `(${evidence?.length})`}
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews {reviews?.length > 0 && `(${reviews?.length})`}
                </TabsTrigger>
              </TabsList>
              {/* Action Overview */}
              <TabsContent value="overview" className="space-y-4">
                {/* Finding Information Card */}
                {isLoadingAnyFinding ? (
                  <FindingInformationCardSkeleton />
                ) : isGeneralFinding ? (
                  /* General Workpaper Finding */
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Finding Information</CardTitle>
                      <CardDescription>General Workpaper Finding</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Dynamic Columns */}
                      {generalFindingData?.columns?.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {generalFindingData.columns.flatMap((col: any) => {
                            if (!col || typeof col !== "object") return [];
                            return Object.entries(col)
                              .filter(
                                ([k, value]: [string, any]) =>
                                  k !== "description" && value != null && value !== ""
                              )
                              .map(([key, value]: [string, any]) => {
                                const cfg = colConfigMap[key];
                                const label = cfg?.name || key.replace(/_/g, " ");
                                const description = cfg?.description;
                                return (
                                  <div key={key}>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <p className="text-muted-foreground mb-1 inline-flex cursor-default items-center gap-1 text-xs font-medium capitalize">
                                            {label}
                                            {description && <Info className="h-3 w-3 shrink-0" />}
                                          </p>
                                        </TooltipTrigger>
                                        {description && (
                                          <TooltipContent side="top">
                                            <p className="max-w-xs text-xs">{description}</p>
                                          </TooltipContent>
                                        )}
                                      </Tooltip>
                                    </TooltipProvider>
                                    <p className="text-sm font-medium">{String(value)}</p>
                                  </div>
                                );
                              });
                          })}
                        </div>
                      )}

                      {/* Audit Tests (Keys) */}
                      {generalFindingData?.keys?.length > 0 && (
                        <div>
                          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                            Audit Tests
                          </p>
                          <div className="rounded-md border bg-amber-50/50 p-3 dark:bg-amber-950/20">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {generalFindingData.keys.flatMap((k: any) => {
                                if (!k || typeof k !== "object") return [];
                                return Object.entries(k)
                                  .filter(([key]: [string, any]) => key !== "description")
                                  .map(([key, value]: [string, any]) => {
                                    const cfg = keyConfigMap[key];
                                    const label = cfg?.name || key.replace(/_/g, " ");
                                    const description = cfg?.description;
                                    const isBool =
                                      typeof value === "boolean" ||
                                      value === "true" ||
                                      value === "false";
                                    const boolVal = value === true || value === "true";
                                    return (
                                      <div key={key} className="flex items-center gap-2">
                                        {isBool ? (
                                          boolVal ? (
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                                          ) : (
                                            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                                          )
                                        ) : null}
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="inline-flex cursor-default items-center gap-1 text-sm">
                                                <span className="text-muted-foreground capitalize">
                                                  {label}
                                                </span>
                                                {description && (
                                                  <Info className="text-muted-foreground h-3 w-3 shrink-0" />
                                                )}
                                                {!isBool && (
                                                  <span className="font-medium">
                                                    : {String(value) ?? "—"}
                                                  </span>
                                                )}
                                              </span>
                                            </TooltipTrigger>
                                            {description && (
                                              <TooltipContent side="top">
                                                <p className="max-w-xs text-xs">{description}</p>
                                              </TooltipContent>
                                            )}
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    );
                                  });
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Static fields */}
                      {generalFindingData?.audit_observation && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Audit Observation
                          </p>
                          <p className="text-sm">{generalFindingData.audit_observation}</p>
                        </div>
                      )}
                      {generalFindingData?.audit_comments && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Audit Comments
                          </p>
                          <p className="text-sm">{generalFindingData.audit_comments}</p>
                        </div>
                      )}
                      {generalFindingData?.evidence && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">Evidence</p>
                          <a
                            href={generalFindingData.evidence}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
                            <FileText className="h-3 w-3" />
                            View Evidence
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium">Status</p>
                        <StatusBadge status={generalFindingData?.status || "DRAFT"} />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Compliance Finding */
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Finding Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Finding Number
                          </p>
                          <p className="text-sm font-medium">
                            {findingData?.finding_number || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Clause Number
                          </p>
                          <p className="text-sm font-medium">
                            {findingData?.clause_number || action.clause_number || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Framework
                          </p>
                          <Badge className="text-sm font-medium">
                            {findingData?.framework || "N/A"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">Severity</p>
                          <p className="text-sm font-medium">{findingData?.severity || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">Status</p>
                          <StatusBadge
                            status={findingData?.status_code || findingData?.status || "N/A"}
                          />
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Compliance Status
                          </p>

                          <Badge
                            variant={
                              findingData?.compliance_status?.toLowerCase() == "compliant"
                                ? "success"
                                : findingData?.compliance_status?.toLowerCase() == "partial"
                                  ? "info"
                                  : "destructive"
                            }
                            className="ml-auto shrink-0 text-xs">
                            {findingData?.compliance_status?.toLowerCase() == "compliant"
                              ? "✓ Compliant"
                              : findingData?.compliance_status?.toLowerCase() == "partial"
                                ? "◬ Partial Compliance"
                                : "✗ Non-Compliant"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Compliance %
                          </p>
                          <p className="text-sm font-medium">
                            {findingData?.compliance_percentage || 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">Category</p>
                          <p className="text-sm font-medium">{findingData?.category_name || ""}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                          Clause Description
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {findingData?.clause_description ||
                            action.clause_description ||
                            "No description"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                          Recommendation
                        </p>
                        <p className="text-sm">
                          {findingData?.recommendation || "No recommendation"}
                        </p>
                      </div>
                      {findingData?.workings_and_test_results && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Workings & Test Results
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {findingData.workings_and_test_results}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                {/* Audit Plan Information */}
                {action.audit_plan && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-base">Audit Plan</CardTitle>
                          <CardDescription>
                            Ref. {action.audit_plan.ref_no} &middot; {action.audit_plan.year}
                          </CardDescription>
                        </div>
                        <StatusBadge status={action.audit_plan.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium">Title</p>
                        <p className="text-sm font-medium">{action.audit_plan.title}</p>
                      </div>
                      {action.audit_plan.description && (
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Description
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {action.audit_plan.description}
                          </p>
                        </div>
                      )}
                      <Separator />
                      <Link
                        href={`/dashboard/audit/plans/engagement/${action.audit_plan.id}`}
                        className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                        View Audit Plan
                        <SquareArrowOutUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {isLoadingAnyFinding ? (
                  <ActionOverviewCardSkeleton />
                ) : (
                  <Card>
                    <CardHeader className="">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-base">Action Overview</CardTitle>
                        </div>
                        {action.status && STATUS_COLORS[action.status] && (
                          <StatusBadge status={STATUS_COLORS[action.status].text} />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* Description */}
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                          Description
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{action.action_description}</p>
                      </div>

                      <Separator />

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Assigned To
                          </p>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {action.assigned_to_name ||
                                action.assigned_to_user?.last_name ||
                                "Unassigned"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {action.assigned_to_user?.email || ""}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">Reviewer</p>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {action.reviewer_name || "Unassigned"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">Auditor</p>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {action.auditor_name || "Unassigned"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Iteration
                          </p>
                          <p className="text-sm font-medium">{action.iteration_number || 1}</p>
                        </div>

                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">Due Date</p>
                          <p className="text-sm">
                            {action.due_date
                              ? format(new Date(action.due_date), "MMM d, yyyy")
                              : "Not set"}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">Created</p>
                          <p className="text-sm">
                            {action.created_at
                              ? format(new Date(action.created_at), "MMM d, yyyy")
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Finding Evidence Tab */}
              <TabsContent value="finding-evidence" className="space-y-4">
                {isLoadingFindingEvidence ? (
                  <FindingEvidenceTabSkeleton />
                ) : (
                  <>
                    {(() => {
                      const structuredEvidence = findingEvidenceData?.evidence ?? [];
                      const generalEvidenceUrl = isGeneralFinding ? generalFindingData?.evidence : null;
                      const totalCount = structuredEvidence.length + (generalEvidenceUrl ? 1 : 0);
                      const hasAny = totalCount > 0;

                      return (
                        <>
                          <div>
                            <p className="text-sm font-semibold">Finding Evidence</p>
                            <p className="text-muted-foreground text-xs">
                              {totalCount} evidence{totalCount !== 1 ? "s" : ""} attached to this finding
                            </p>
                          </div>

                          {hasAny ? (
                            <div className="space-y-2">
                              {/* General finding URL-based evidence */}
                              {generalEvidenceUrl && (
                                <Card className="bg-muted/30">
                                  <CardContent>
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-sm font-medium">Attached Evidence File</p>
                                      <Button
                                        size="sm"
                                        variant="link"
                                        className="m-0 -mr-2 h-auto rounded-none p-0 text-xs"
                                        asChild>
                                        <Link
                                          href={generalEvidenceUrl}
                                          target="_blank"
                                          rel="noopener noreferrer">
                                          View File
                                          <FileText className="ml-1 h-3.5 w-3.5" />
                                        </Link>
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Structured evidence items */}
                              {structuredEvidence.map((item, index) => (
                                <Card key={item.id} className="bg-muted/30">
                                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">
                                            {item.title || `Evidence #${index + 1}`}
                                          </p>
                                          <p className="text-muted-foreground mt-1 text-xs">
                                            Type:{" "}
                                            <span className="font-medium">{item.evidence_type}</span>
                                          </p>
                                          {item.description && (
                                            <p className="text-muted-foreground mt-2 text-xs">
                                              {item.description}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex items-end justify-end gap-1">
                                          {item.file_link && (
                                            <Button
                                              size="sm"
                                              variant="link"
                                              className="m-0 -mr-2 h-auto rounded-none p-0 text-xs"
                                              asChild>
                                              <Link
                                                href={item.file_link}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                Attached File
                                                <FileText className="ml-1 h-4 w-4" />
                                              </Link>
                                            </Button>
                                          )}
                                          {item.external_link && (
                                            <Button
                                              size="sm"
                                              variant="link"
                                              className="m-0 -mr-2 h-auto rounded-none p-0 text-xs"
                                              asChild>
                                              <Link
                                                href={item.external_link}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                External Link
                                                <SquareArrowOutUpRight className="ml-1 h-4 w-4" />
                                              </Link>
                                            </Button>
                                          )}
                                        </div>
                                      </div>

                                      <p className="text-muted-foreground text-xs">
                                        Collected{" "}
                                        {item.collection_date
                                          ? format(new Date(item.collection_date), "MMM d, yyyy")
                                          : "Unknown"}
                                      </p>
                                      {item.notes && (
                                        <p className="text-muted-foreground mt-2 text-xs">
                                          Notes: {item.notes}
                                        </p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <Card className="bg-muted/50 border-dashed">
                              <CardContent className="flex flex-col items-center justify-center px-8 py-12">
                                <p className="text-muted-foreground text-center text-sm">
                                  No evidence attached to this finding yet.
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </TabsContent>

              {/* Action Evidence Tab */}
              <TabsContent value="action-evidence" className="space-y-4">
                {isLoadingEvidence ? (
                  <ActionEvidenceTabSkeleton />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Action Evidence Submitted</p>
                        <p className="text-muted-foreground text-xs">
                          {evidence?.length} evidence{evidence?.length !== 1 ? "s" : ""} submitted
                        </p>
                      </div>
                      {isAssignedUser && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSubmitEvidenceOpen(true);
                          }}
                          className="gap-2">
                          <Plus className="h-4 w-4" />
                          Submit Action Evidence
                        </Button>
                      )}
                    </div>

                    {evidence?.length > 0 ? (
                      <div className="space-y-3">
                        {evidence.map((item, index) => (
                          <Card key={item.id} className="bg-muted/50">
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {`Evidence File #${index + 1}`}
                                    </p>
                                    {item.evidence_summary && (
                                      <p className="text-muted-foreground mt-1 text-xs">
                                        {item.evidence_summary}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end justify-end space-y-2">
                                    {item.status && STATUS_COLORS[item.status] && (
                                      <StatusBadge
                                        status={STATUS_COLORS[item.status].text.toUpperCase()}
                                      />
                                    )}

                                    {item.evidence_file_url && (
                                      <Button
                                        size="sm"
                                        variant="link"
                                        className="m-0 -mr-2 h-auto rounded-none p-0 text-xs"
                                        asChild>
                                        <Link
                                          href={item.evidence_file_url}
                                          target="_blank"
                                          rel="noopener noreferrer">
                                          View File
                                          <SquareArrowOutUpRight className="h-4 w-4" />
                                        </Link>
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                <p className="text-muted-foreground text-xs">
                                  Submitted{" "}
                                  {item.submitted_at
                                    ? format(new Date(item.submitted_at), "MMM d, yyyy")
                                    : "Unknown"}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center px-8 py-12">
                          <p className="text-muted-foreground text-center text-sm">
                            No evidence submitted yet. Submit evidence to track progress on this
                            action.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
                {isLoadingReviews ? (
                  <ReviewsTabSkeleton />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Evidence Reviews</p>
                        <p className="text-muted-foreground text-xs">
                          {reviews.length} review{reviews.length !== 1 ? "s" : ""} recorded
                        </p>
                      </div>
                      {isReviewer && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setReviewEvidenceOpen(true);
                          }}
                          className="gap-2"
                          disabled={!hasEvidence}>
                          <Plus className="h-4 w-4" />
                          Add Review
                        </Button>
                      )}
                    </div>

                    {reviews?.length > 0 ? (
                      <div className="space-y-3">
                        {reviews.map((review: any) => (
                          <Card key={review.id} className="bg-muted/50 border-border/50">
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                      Reviewed by: {review.reviewer_name || "Unknown"}
                                    </p>
                                  </div>
                                  {review.approval_status &&
                                    STATUS_COLORS[review.approval_status] && (
                                      <StatusBadge status={review?.approval_status.toUpperCase()} />
                                    )}
                                </div>
                                {review.reviewer_comments && (
                                  <p className="mt-2 text-sm">{review.reviewer_comments}</p>
                                )}
                                <p className="text-muted-foreground text-xs">
                                  {review.created_at
                                    ? format(new Date(review.created_at), "MMM d, yyyy")
                                    : "Unknown"}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center px-8 py-12">
                          <p className="text-muted-foreground text-center text-sm">
                            No reviews yet. Reviews will appear here once evidence is submitted and
                            reviewed.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Create Reassessment / Update Finding Button */}
            {actionHasEvidence && isAssignedReviewer && (isGeneralFinding || !isCompliant) && (
              <Button
                onClick={() => {
                  setCreateReassessmentOpen(true);
                }}
                className="w-full">
                {isGeneralFinding ? "Update Finding" : "Create Reassessment"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Evidence Dialog */}
      <SubmitEvidenceDialog
        open={submitEvidenceOpen}
        onOpenChange={setSubmitEvidenceOpen}
        actionId={action.id}
      />

      {/* Review Evidence Dialog */}
      <ReviewEvidenceDialog
        open={reviewEvidenceOpen}
        onOpenChange={setReviewEvidenceOpen}
        actionId={action.id}
        evidence={evidence}
      />

      {/* Create Reassessment / Update General Finding Dialog */}
      {isGeneralFinding ? (
        <UpdateGeneralFindingDialog
          open={createReassessmentOpen}
          onOpenChange={setCreateReassessmentOpen}
          findingId={action.finding_id}
          generalFindingData={generalFindingData}
          workpaperConfig={workpaperData?.config?.[0]}
        />
      ) : (
        <CreateReassessmentDialog
          open={createReassessmentOpen}
          onOpenChange={setCreateReassessmentOpen}
          findingId={action.finding_id}
          actionId={action.id}
        />
      )}
    </>
  );
}
