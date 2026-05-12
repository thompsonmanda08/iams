"use client";

import { formatDate } from "@/lib/utils/date-format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, SquareArrowOutUpRight } from "lucide-react";
import { useFindingEvidence } from "@/hooks/use-evidence-queries";
import Link from "next/link";

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

interface FindingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finding: any;
}

export function FindingDetailsDialog({ open, onOpenChange, finding }: FindingDetailsDialogProps) {
  const {
    data: evidenceData = {
      evidence: [],
      total_count: 0,
      verified_count: 0,
      unverified_count: 0
    },
    isLoading: isLoadingEvidence
  } = useFindingEvidence(finding?.id);

  const evidenceList = evidenceData?.evidence || [];
  const isFindingApproved = ["APPROVED", "CLOSED"].includes(finding?.status);
  const totalEvidence = evidenceData?.total_count || 0;
  const verifiedCount = isFindingApproved ? totalEvidence : (evidenceData?.verified_count || 0);
  const unverifiedCount = isFindingApproved ? 0 : (evidenceData?.unverified_count || 0);

  if (!finding) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="flex! max-h-[90svh] w-full! max-w-2xl! flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {finding.category?.display_name ||
              finding.category_name ||
              finding.clauseTitle ||
              "Finding Details"}
          </DialogTitle>
          {finding.finding_number && (
            <p className="text-muted-foreground text-xs">
              Finding #{finding.finding_number}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Status & Severity Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {finding.severity && (
              <Badge className={SEVERITY_COLORS[finding.severity] || ""}>
                {finding.severity}
              </Badge>
            )}
            {finding.status && <Badge variant="outline">{finding.status}</Badge>}
          </div>

          {/* Finding Details */}
          <div className="space-y-3">
            {finding.conclusion && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Conclusion</p>
                <p className="text-sm whitespace-pre-wrap">{finding.conclusion}</p>
              </div>
            )}

            {finding.workings_and_test_results && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Workings & Test Results
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {finding.workings_and_test_results}
                </p>
              </div>
            )}

            {finding.recommendation && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Recommendation</p>
                <p className="text-sm whitespace-pre-wrap">{finding.recommendation}</p>
              </div>
            )}

            {(finding.responsible_person_name || finding.due_date) && (
              <div className="grid grid-cols-2 gap-4">
                {finding.responsible_person_name && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-medium">
                      Responsible Person
                    </p>
                    <p className="text-sm">{finding.responsible_person_name}</p>
                  </div>
                )}
                {finding.due_date && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-medium">Due Date</p>
                    <p className="text-sm">
                      {formatDate(finding.due_date)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Evidence Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Evidence & Support</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="gap-1">
                  <FileText className="h-3 w-3" />
                  {totalEvidence} Evidence
                </Badge>
                {verifiedCount > 0 && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {verifiedCount} Verified
                  </Badge>
                )}
                {unverifiedCount > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {unverifiedCount} Unverified
                  </Badge>
                )}
              </div>
            </div>

            {isLoadingEvidence ? (
              <div className="text-muted-foreground py-8 text-center text-sm">
                Loading evidence...
              </div>
            ) : evidenceList.length > 0 ? (
              <div className="space-y-2">
                {evidenceList.map((item: any, index: number) => (
                  <Card key={item.id} className="bg-muted/30">
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {item.title || `Evidence #${index + 1}`}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              Type: <span className="font-medium">{item.evidence_type}</span>
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
                            ? formatDate(item.collection_date)
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
