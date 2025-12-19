"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, SquareArrowOutUpRight } from "lucide-react";
import type { FindingAction } from "@/lib/types/audit-types";
import {
  useFindingActionEvidence,
  useFindingActionReviews,
  useFinding
} from "@/hooks/use-finding-actions-queries";
import { useFindingEvidence } from "@/hooks/use-evidence-queries";
import { SubmitEvidenceDialog } from "./submit-evidence-dialog";
import { ReviewEvidenceDialog } from "./review-evidence-dialog";
import { CreateReassessmentDialog } from "./create-reassessment-dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "@/store/session-store";
import { StatusBadge } from "@/components/status-badge";
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
  const [submitEvidenceOpen, setSubmitEvidenceOpen] = useState(false);
  const [reviewEvidenceOpen, setReviewEvidenceOpen] = useState(false);
  const [createReassessmentOpen, setCreateReassessmentOpen] = useState(false);

  // Get current user session
  const session = useSession();
  const currentUserId = session?.user?.id;

  // Fetch evidence and reviews for this action
  const { data: evidence = [], isLoading: isLoadingEvidence } = useFindingActionEvidence(action.id);
  const { data: reviews = [], isLoading: isLoadingReviews } = useFindingActionReviews(action.id);

  // Fetch finding details by ID
  const { data: findingData, isLoading: isLoadingFinding } = useFinding(action.finding_id);

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
  const hasReviews = reviews && reviews?.length > 0;

  // Can only create reassessment if user is the assigned reviewer (auditor)
  const isAssignedReviewer = currentUserId === action.auditor_id;

  const allActionEvidenceApproved = evidence?.every(
    (item) => item.status?.toUpperCase() === "APPROVED"
  );

  console.log("Finding Action Evidence:", { action, reviews });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex! h-[90vh] w-full! max-w-3xl! flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finding Action Details</DialogTitle>
            <DialogDescription>
              Action for {action.finding?.finding_number || "Unknown"} -{" "}
              {action.finding?.category_name || "Unknown"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Action Overview */}

            {/* Tabs for Evidence and Reviews */}
            <Tabs defaultValue="overview" className="w-full!">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Action Overview</TabsTrigger>
                <TabsTrigger value="finding-evidence">
                  Finding Evidence{" "}
                  {Number(findingEvidenceData?.evidence?.length) > 0 &&
                    `(${findingEvidenceData?.evidence?.length || 0})`}
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
                {isLoadingFinding ? (
                  <FindingInformationCardSkeleton />
                ) : (
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
                {isLoadingFinding ? (
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
                              {action.reviewer_name ||
                                action.reviewer_user?.last_name ||
                                "Unassigned"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {action.reviewer_user?.email || ""}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">Auditor</p>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {action.auditor_name ||
                                action.auditor_user?.last_name ||
                                "Unassigned"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {action.auditor_user?.email || ""}
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
                    <div>
                      <div>
                        <p className="text-sm font-semibold">Finding Evidence</p>
                        <p className="text-muted-foreground text-xs">
                          {findingEvidenceData?.evidence?.length || 0} evidence
                          {findingEvidenceData?.evidence?.length !== 1 ? "s" : ""} attached to this
                          finding
                        </p>
                      </div>
                    </div>

                    {findingEvidenceData.evidence?.length > 0 ? (
                      <div className="space-y-3">
                        {findingEvidenceData.evidence.map((item, index) => (
                          <Card key={item.id} className="bg-muted/30">
                            <CardContent className="">
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
                                          href={item.file_link || "#"}
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
                                          href={item.external_link || "#"}
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
                      <Button
                        size="sm"
                        onClick={() => setSubmitEvidenceOpen(true)}
                        className="gap-2">
                        <Plus className="h-4 w-4" />
                        Submit Action Evidence
                      </Button>
                    </div>

                    {evidence?.length > 0 ? (
                      <div className="space-y-3">
                        {evidence.map((item, index) => (
                          <Card key={item.id} className="bg-muted/50">
                            <CardContent className="">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {item.evidence_file_name || `Evidence File #${index}`}
                                    </p>
                                    {item.evidence_summary && (
                                      <p className="text-muted-foreground mt-1 text-xs">
                                        {item.evidence_summary}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end justify-end space-y-2">
                                    {item.status && (
                                      <Badge
                                        className={cn("text-xs", STATUS_COLORS[item.status].badge)}>
                                        {STATUS_COLORS[item.status].text}
                                      </Badge>
                                    )}

                                    {(() => {
                                      const reviewStatus = getEvidenceReviewStatus(item);
                                      return (
                                        <Badge
                                          className={cn(
                                            "text-xs",
                                            REVIEW_STATUS_COLORS[reviewStatus].badge
                                          )}>
                                          {REVIEW_STATUS_COLORS[reviewStatus].text}
                                        </Badge>
                                      );
                                    })()}
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
                      <Button
                        size="sm"
                        onClick={() => setReviewEvidenceOpen(true)}
                        className="gap-2"
                        disabled={!hasEvidence}>
                        <Plus className="h-4 w-4" />
                        Add Review
                      </Button>
                    </div>

                    {reviews?.length > 0 ? (
                      <div className="space-y-3">
                        {reviews.map((review) => (
                          <Card key={review.id} className="bg-muted/50">
                            <CardContent className="pt-6">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                      Review by {review.reviewer?.name || "Unknown"}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      {review.reviewer?.email || ""}
                                    </p>
                                  </div>
                                  {review.status && STATUS_COLORS[review.status] && (
                                    <Badge className={cn("text-xs", STATUS_COLORS[review.status])}>
                                      {review.status}
                                    </Badge>
                                  )}
                                </div>
                                {review.comments && (
                                  <p className="mt-2 text-sm">{review.comments}</p>
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

            {/* Create Reassessment Button */}
            {hasEvidence && hasReviews && allActionEvidenceApproved && isAssignedReviewer && (
              <Button
                onClick={() => setCreateReassessmentOpen(true)}
                // variant="outline"
                className="w-full">
                Create Reassessment
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

      {/* Create Reassessment Dialog */}
      <CreateReassessmentDialog
        open={createReassessmentOpen}
        onOpenChange={setCreateReassessmentOpen}
        findingId={action.finding_id}
      />
    </>
  );
}
