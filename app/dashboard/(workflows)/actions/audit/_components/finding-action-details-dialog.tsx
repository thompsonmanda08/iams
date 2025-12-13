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
import { Plus } from "lucide-react";
import type { FindingAction } from "@/lib/types/audit-types";
import { useFindingActionEvidence, useFindingActionReviews } from "@/hooks/use-finding-actions-queries";
import { SubmitEvidenceDialog } from "./submit-evidence-dialog";
import { ReviewEvidenceDialog } from "./review-evidence-dialog";
import { CreateReassessmentDialog } from "./create-reassessment-dialog";
import { cn } from "@/lib/utils";

interface FindingActionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: FindingAction;
}

const STATUS_COLORS: Record<string, { badge: string; text: string }> = {
  PENDING: { badge: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200", text: "Pending" },
  IN_PROGRESS: { badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", text: "In Progress" },
  UNDER_REVIEW: { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", text: "Under Review" },
  APPROVED: { badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", text: "Approved" },
  COMPLETED: { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", text: "Completed" },
  REJECTED: { badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", text: "Rejected" }
};

const REVIEW_STATUS_COLORS: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

export function FindingActionDetailsDialog({
  open,
  onOpenChange,
  action
}: FindingActionDetailsDialogProps) {
  const [submitEvidenceOpen, setSubmitEvidenceOpen] = useState(false);
  const [reviewEvidenceOpen, setReviewEvidenceOpen] = useState(false);
  const [createReassessmentOpen, setCreateReassessmentOpen] = useState(false);

  // Fetch evidence and reviews for this action
  const { data: evidence = [], isLoading: isLoadingEvidence } = useFindingActionEvidence(action.id);
  const { data: reviews = [], isLoading: isLoadingReviews } = useFindingActionReviews(action.id);

  // Can only create reassessment if evidence exists
  const hasEvidence = evidence && evidence.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finding Action Details</DialogTitle>
            <DialogDescription>
              Action for {action.finding?.finding_number || "Unknown"} -{" "}
              {action.finding?.category_name || "Unknown"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Action Overview */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base">Action Overview</CardTitle>
                  </div>
                  {action.status && STATUS_COLORS[action.status] && (
                    <Badge className={cn("text-xs", STATUS_COLORS[action.status].badge)}>
                      {STATUS_COLORS[action.status].text}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{action.action_description}</p>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Assigned To</p>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{action.assigned_user?.name || "Unassigned"}</p>
                      <p className="text-muted-foreground text-xs">{action.assigned_user?.email || ""}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Reviewer</p>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{action.reviewer?.name || "Unassigned"}</p>
                      <p className="text-muted-foreground text-xs">{action.reviewer?.email || ""}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Due Date</p>
                    <p className="text-sm">
                      {action.due_date ? format(new Date(action.due_date), "MMM d, yyyy") : "Not set"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Created</p>
                    <p className="text-sm">
                      {action.created_at ? format(new Date(action.created_at), "MMM d, yyyy") : "Unknown"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Evidence and Reviews */}
            <Tabs defaultValue="evidence" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="evidence">
                  Evidence {evidence.length > 0 && `(${evidence.length})`}
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </TabsTrigger>
              </TabsList>

              {/* Evidence Tab */}
              <TabsContent value="evidence" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Evidence Submitted</p>
                    <p className="text-muted-foreground text-xs">
                      {evidence.length} evidence{evidence.length !== 1 ? "s" : ""} submitted
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSubmitEvidenceOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Submit Evidence
                  </Button>
                </div>

                {evidence.length > 0 ? (
                  <div className="space-y-3">
                    {evidence.map((item) => (
                      <Card key={item.id} className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.title}</p>
                                {item.description && (
                                  <p className="text-muted-foreground text-xs mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {item.review_status && REVIEW_STATUS_COLORS[item.review_status] && (
                                <Badge className={cn("text-xs", REVIEW_STATUS_COLORS[item.review_status])}>
                                  {item.review_status}
                                </Badge>
                              )}
                            </div>
                            {item.file_link && (
                              <Button
                                size="sm"
                                variant="link"
                                className="h-auto p-0 text-xs"
                                asChild
                              >
                                <a href={item.file_link} target="_blank" rel="noopener noreferrer">
                                  View File
                                </a>
                              </Button>
                            )}
                            <p className="text-muted-foreground text-xs">
                              Submitted {item.submitted_at ? format(new Date(item.submitted_at), "MMM d, yyyy") : "Unknown"}
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
                        No evidence submitted yet. Submit evidence to track progress on this action.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
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
                    disabled={!hasEvidence}
                  >
                    <Plus className="h-4 w-4" />
                    Add Review
                  </Button>
                </div>

                {reviews.length > 0 ? (
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
                              {review.status && REVIEW_STATUS_COLORS[review.status] && (
                                <Badge className={cn("text-xs", REVIEW_STATUS_COLORS[review.status])}>
                                  {review.status}
                                </Badge>
                              )}
                            </div>
                            {review.comments && (
                              <p className="text-sm mt-2">{review.comments}</p>
                            )}
                            <p className="text-muted-foreground text-xs">
                              {review.created_at ? format(new Date(review.created_at), "MMM d, yyyy") : "Unknown"}
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
                        No reviews yet. Reviews will appear here once evidence is submitted and reviewed.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Create Reassessment Button */}
            {hasEvidence && (
              <Button
                onClick={() => setCreateReassessmentOpen(true)}
                variant="outline"
                className="w-full"
              >
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
