"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  AlertTriangle,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Signature
} from "lucide-react";
import Search from "@/components/ui/search-field";
import { CustomPagination } from "@/components/ui/pagination";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ActionFindingsDialog } from "@/app/dashboard/(modules)/risks/_components/action-findings-dialog";
import { ActionEvidenceViewerDialog } from "@/app/dashboard/(modules)/risks/_components/action-evidence-viewer-dialog";
import { ActionReviewDialog } from "@/app/dashboard/(modules)/risks/_components/action-review-dialog";
import { ActionIncidentSubmissionDialog } from "./_components/action-incident-submission-dialog";
import type { ActionDefinition } from "@/app/_actions/risk-module-actions";
import { Pagination } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { sendRiskActionReminder } from "@/app/_actions/task-actions";
import { toast } from "sonner";
import SignatureForm, { type ApproverSignature } from "./_components/signature-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ActionIncidentReviewDialog } from "./_components/action-incident-review-dialog";

interface ActionsTableProps {
  actions: ActionDefinition[];
  pagination: Pagination;
}

export function ActionsTable({ actions, pagination }: ActionsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const [_, startTransition] = useTransition();
  const [selectedActionForFindings, setSelectedActionForFindings] =
    useState<ActionDefinition | null>(null);
  const [findingsDialogOpen, setFindingsDialogOpen] = useState(false);
  const [selectedActionForEvidence, setSelectedActionForEvidence] =
    useState<ActionDefinition | null>(null);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [selectedActionForReview, setSelectedActionForReview] = useState<ActionDefinition | null>(
    null
  );
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reminderSendingId, setReminderSendingId] = useState<string | null>(null);
  const [selectedActionForSignature, setSelectedActionForSignature] =
    useState<ActionDefinition | null>(null);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [selectedActionForIncidentSubmission, setSelectedActionForIncidentSubmission] =
    useState<ActionDefinition | null>(null);
  const [incidentSubmissionDialogOpen, setIncidentSubmissionDialogOpen] = useState(false);
  const [selectedActionForIncidentReview, setSelectedActionForIncidentReview] =
    useState<ActionDefinition | null>(null);
  const [incidentReviewDialogOpen, setIncidentReviewDialogOpen] = useState(false);

  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page !== undefined) {
      params.set("page", String(page));
    }

    if (page_size !== undefined) {
      params.set("page_size", String(page_size));
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  // Check if action is overdue
  const isOverdue = (dueDate: string, status: string) => {
    if (status === "COMPLETED" || status === "CANCELLED") return false;
    return new Date(dueDate) < new Date();
  };

  const handleSendReminder = async (actionId: string) => {
    setReminderSendingId(actionId);
    try {
      const response = await sendRiskActionReminder(actionId);
      if (response.success) {
        toast.success(response.message || "Reminder sent successfully");
      } else {
        toast.error(response.message || "Failed to send reminder");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send reminder");
    } finally {
      setReminderSendingId(null);
    }
  };

  const handleSignatureSubmit = async () => {
    try {
      setSignatureDialogOpen(false);
      setSelectedActionForSignature(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit signature");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Action Distribution</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage and track risk treatment actions
            </p>
          </div>
          <Search
            placeholder="Search risks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e)}
            className="ml-auto max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="uppercase">
              <TableRow>
                <TableHead className="w-[300px]">Action Details</TableHead>
                <TableHead>Risk/Incident</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Action Status</TableHead>
                {/* <TableHead>Task Type</TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!actions?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="text-muted-foreground/50 h-8 w-8" />
                      <p className="text-muted-foreground">No actions assigned</p>
                      <p className="text-muted-foreground text-xs">
                        You will see your action items here
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                actions?.map((actionDef) => {
                  const action = actionDef.action;
                  const task = actionDef.task;
                  const execution = actionDef.execution;
                  const isUserExecutor = task?.task_type === "EXECUTION";
                  const isUserReviewer = task?.task_type === "REVIEW";
                  const overdue = isOverdue(action.due_date, action.status);

                  return (
                    <TableRow key={action.id}>
                      <TableCell className="align-top">
                        <div className="max-w-sm space-y-1">
                          <div className="text-sm font-semibold">
                            {action.instructions.slice(0, 40)}...
                          </div>
                          <span className="text-muted-foreground line-clamp-3 text-xs">
                            Date created: {format(new Date(action.created_at), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{actionDef.risk_name || "Incident"}</div>
                          <div className="text-muted-foreground text-xs">
                            ID:{" "}
                            {action?.risk_id?.slice(0, 8) ||
                              actionDef.incident_log.incident_id?.slice(0, 8)}
                            ...
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{actionDef.executer_name}</div>
                          <div className="text-muted-foreground max-w-[150px] truncate text-xs">
                            {actionDef.executer_email}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {actionDef.reviewer_name ? (
                          <div className="text-sm">
                            <div className="font-medium">{actionDef.reviewer_name}</div>
                            <div className="text-muted-foreground max-w-[150px] truncate text-xs">
                              {actionDef.reviewer_email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not assigned</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {format(new Date(action.due_date), "MMM dd, yyyy")}
                          </div>
                          <div
                            className={cn(
                              "text-xs",
                              overdue ? "font-medium text-red-600" : "text-muted-foreground"
                            )}>
                            {overdue ? (
                              <>
                                <AlertCircle className="mr-1 inline h-3 w-3" />
                                Overdue by {action.overdue_by} days
                              </>
                            ) : (
                              "On track"
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          status={
                            action.action_type === "RISK_ACCEPTANCE"
                              ? action?.status
                              : execution?.status || "Awaiting Action"
                          }
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isUserExecutor &&
                            action.status === "PENDING" &&
                            !execution &&
                            (action.action_type === "RISK_ACCEPTANCE" ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedActionForSignature(actionDef);
                                  setSignatureDialogOpen(true);
                                }}
                                className="h-8 gap-1.5">
                                <Signature className="h-3.5 w-3.5" />
                                Approval Sign Off
                              </Button>
                            ) : action.action_type === "INCIDENT" ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedActionForIncidentSubmission(actionDef);
                                  setIncidentSubmissionDialogOpen(true);
                                }}
                                className="h-8 gap-1.5">
                                <Upload className="h-3.5 w-3.5" />
                                Submit
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedActionForFindings(actionDef);
                                  setFindingsDialogOpen(true);
                                }}
                                className="h-8 gap-1.5">
                                <Upload className="h-3.5 w-3.5" />
                                Submit
                              </Button>
                            ))}

                          {execution && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedActionForEvidence(actionDef);
                                setEvidenceDialogOpen(true);
                              }}
                              className="h-8 gap-1.5">
                              <Eye className="h-3.5 w-3.5" />
                              View Evidence
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(action.id)}
                            disabled={reminderSendingId === action.id}
                            className="h-8 gap-1.5">
                            {reminderSendingId === action.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            {reminderSendingId === action.id ? "Sending..." : "Send Reminder"}
                          </Button>

                          {isUserReviewer &&
                            action.action_type === "MITIGATION" &&
                            action.status !== "COMPLETED" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedActionForReview(actionDef);
                                  setReviewDialogOpen(true);
                                }}
                                className="gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Review
                              </Button>
                            )}
                          {isUserReviewer &&
                            action.action_type === "INCIDENT" &&
                            action.status !== "RESOLVED" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedActionForIncidentReview(actionDef);
                                  setIncidentReviewDialogOpen(true);
                                }}
                                className="gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Review
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {actions?.length > 0 && (
            <CustomPagination
              pagination={pagination}
              updatePagination={updatePagination}
              allowSetPageSize={true}
              showDetails={true}
              className="border-t"
            />
          )}
        </div>
      </CardContent>

      {/* Action Findings Dialog - For Executors to submit findings */}
      {selectedActionForFindings && (
        <ActionFindingsDialog
          open={findingsDialogOpen}
          onOpenChange={setFindingsDialogOpen}
          actionId={selectedActionForFindings.action.id}
          taskId={selectedActionForFindings.task?.id}
          actionTitle={selectedActionForFindings.action.instructions}
          riskTitle={selectedActionForFindings.risk_name}
        />
      )}

      {/* Action Evidence Viewer Dialog - For viewing submitted evidence */}
      {selectedActionForEvidence && selectedActionForEvidence.execution && (
        <ActionEvidenceViewerDialog
          open={evidenceDialogOpen}
          onOpenChange={setEvidenceDialogOpen}
          execution={selectedActionForEvidence.execution}
        />
      )}

      {/* Action Review Dialog - For Reviewers to review submissions */}
      {selectedActionForReview && (
        <ActionReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          actionDefinition={selectedActionForReview}
        />
      )}

      {/* Signature Form Dialog - For Risk Acceptance Approvals */}
      {selectedActionForSignature && (
        <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
          <DialogContent
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
            className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Risk Acceptance Approval</DialogTitle>
              <DialogDescription>
                Sign off on the risk acceptance for: {selectedActionForSignature.risk_name}
              </DialogDescription>
            </DialogHeader>
            <SignatureForm
              actionId={selectedActionForSignature.action.id}
              userId={selectedActionForSignature.action.created_by}
              acceptanceId={selectedActionForSignature.action.acceptance_id}
              onSubmit={handleSignatureSubmit}
              onClose={() => setSignatureDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Incident Submission Dialog - For viewing incident action submissions */}
      {selectedActionForIncidentSubmission && (
        <ActionIncidentSubmissionDialog
          open={incidentSubmissionDialogOpen}
          onOpenChange={setIncidentSubmissionDialogOpen}
          actionDefinition={selectedActionForIncidentSubmission}
        />
      )}
      {/* Incident Review Dialog - For reviewing incident action submissions */}
      {selectedActionForIncidentReview && (
        <ActionIncidentReviewDialog
          open={incidentReviewDialogOpen}
          onOpenChange={setIncidentReviewDialogOpen}
          actionDefinition={selectedActionForIncidentReview}
        />
      )}
    </Card>
  );
}
