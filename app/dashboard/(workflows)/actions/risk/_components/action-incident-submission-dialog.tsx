"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate, formatDateTime } from "@/lib/utils/date-format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  User,
  FileText,
  MessageSquare,
  AlertCircle,
  Download,
  X,
  Loader2,
  CloudUpload
} from "lucide-react";
import { cn, notify } from "@/lib/utils";
import type { ActionDefinition } from "@/app/_actions/risk-module-actions";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { submitIncidentFindings } from "@/app/_actions/incident-actions";
import { Separator } from "@radix-ui/react-select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

interface ActionIncidentSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionDefinition: ActionDefinition | null;
}

interface SubmissionFormData {
  comment: string;
  file_urls: string[];
}

export function ActionIncidentSubmissionDialog({
  open,
  onOpenChange,
  actionDefinition
}: ActionIncidentSubmissionDialogProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SubmissionFormData>({
    comment: "",
    file_urls: []
  });
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!actionDefinition || actionDefinition.action.action_type !== "INCIDENT") {
    return null;
  }

  const action = actionDefinition.action;
  const incidentLog = actionDefinition.incident_log;
  const responsibleSubmissions = incidentLog?.responsible_submissions || [];
  const incidentId = incidentLog?.incident_id;
  const reviewerSubmissions = incidentLog?.reviewer_submissions || [];

  const isOverdue = new Date(action.due_date) < new Date() && action.status !== "COMPLETED";
  const hasExistingSubmission = responsibleSubmissions.length > 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      const fileId = `${file.name}-${Date.now()}`;
      setUploadingFiles((prev) => [...prev, fileId]);

      try {
        const uploadedPath = await uploadFile(file);

        if (uploadedPath) {
          let fileUrl: string = "";

          if (typeof uploadedPath === "string") {
            fileUrl = uploadedPath;
          } else if ((uploadedPath as any)?.data?.file_url) {
            fileUrl = (uploadedPath as any).data.file_url;
          } else if ((uploadedPath as any)?.file_url) {
            fileUrl = (uploadedPath as any).file_url;
          } else if ((uploadedPath as any)?.path) {
            fileUrl = (uploadedPath as any).path;
          }

          if (fileUrl) {
            setFormData((prev) => ({
              ...prev,
              file_urls: [...prev.file_urls, fileUrl]
            }));
            notify({ description: `${file.name} uploaded successfully`, type: "success" });
          } else {
            notify({ description: `Failed to get URL for ${file.name}`, type: "error" });
          }
        }
      } catch (error) {
        notify({ description: `Failed to upload ${file.name}`, type: "error" });
        console.error("Upload error:", error);
      } finally {
        setUploadingFiles((prev) => prev.filter((id) => id !== fileId));
      }
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      file_urls: prev.file_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!checkPermission(MODULE_CODES.RISK_INCIDENTS, "can_edit")) return;

    if (!formData.comment.trim()) {
      notify({ description: "Please add a comment before submitting", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitIncidentFindings(incidentId!, {
        comment: formData.comment,
        file_urls: formData.file_urls
      });

      if (response.success) {
        notify({ description: "Findings submitted successfully", type: "success" });
        setFormData({ comment: "", file_urls: [] });
        queryClient.invalidateQueries({ queryKey: ["actions"] });
        queryClient.invalidateQueries({ queryKey: ["incidents"] });
        onOpenChange(false);
      } else {
        notify({ description: response.message || "Failed to submit findings", type: "error" });
      }
    } catch (error: any) {
      notify({ description: error.message || "Failed to submit findings", type: "error" });
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl!" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Incident Action Submission</DialogTitle>
          <DialogDescription>Review incident details and submit your findings</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Incident Details</TabsTrigger>
            <TabsTrigger value="submit">
              Submit Findings
              {hasExistingSubmission && (
                <Badge className="ml-2" variant="outline">
                  Submitted
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="max-h-[500px] w-full pr-4">
            {/* Incident Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-6">
                {/* Action Details Header */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">Action Details</CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">{action.instructions}</p>
                      </div>
                      <Badge
                        variant={action.status === "COMPLETED" ? "default" : "secondary"}
                        className={cn({
                          "border-yellow-200 bg-yellow-500/15 text-yellow-700": isOverdue,
                          "border-green-200 bg-green-500/15 text-green-700":
                            action.status === "COMPLETED",
                          "border-blue-200 bg-blue-500/15 text-blue-700":
                            !isOverdue && action.status !== "COMPLETED"
                        })}>
                        {isOverdue ? "Overdue" : action.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs font-semibold uppercase">
                        Assigned To
                      </span>
                      <div className="flex items-center gap-2">
                        <User className="text-muted-foreground h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">{actionDefinition.executer_name}</p>
                          <p className="text-muted-foreground text-xs">
                            {actionDefinition.executer_email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs font-semibold uppercase">
                        Reviewer
                      </span>
                      <div className="flex items-center gap-2">
                        <User className="text-muted-foreground h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">{actionDefinition.reviewer_name}</p>
                          <p className="text-muted-foreground text-xs">
                            {actionDefinition.reviewer_email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs font-semibold uppercase">
                        Due Date
                      </span>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <p className="text-sm font-medium">
                          {formatDate(action.due_date)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs font-semibold uppercase">
                        Created
                      </span>
                      <p className="text-sm font-medium">
                        {formatDateTime(action.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Responsible Person Submissions */}
                {responsibleSubmissions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4" />
                        Responsible Person Submissions ({responsibleSubmissions.length})
                      </CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-4">
                      {responsibleSubmissions.map((submission: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 space-y-3 rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">
                                {submission.responsible_person_name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Submitted {formatDateTime(submission.submitted_at)}
                              </p>
                            </div>
                            <Badge variant="outline">Submitted</Badge>
                          </div>

                          {submission.comment && (
                            <div className="space-y-2 border-t pt-3">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground text-xs font-semibold uppercase">
                                  Comment
                                </span>
                              </div>
                              <p className="text-foreground text-sm leading-relaxed">
                                {submission.comment}
                              </p>
                            </div>
                          )}

                          {submission.file_urls && submission.file_urls.length > 0 && (
                            <div className="space-y-2 border-t pt-3">
                              <span className="text-muted-foreground text-xs font-semibold uppercase">
                                Attached Files ({submission.file_urls.length})
                              </span>
                              <div className="space-y-2">
                                {submission.file_urls.map((fileUrl: any, fileIdx: number) => {
                                  return (
                                    <div className="rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div>
                                            <p className="text-xs text-gray-600">File</p>
                                          </div>
                                        </div>
                                        <Button
                                          key={fileIdx}
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(fileUrl, "_blank")}
                                          className="gap-2">
                                          <Download className="h-4 w-4" />
                                          Download
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Reviewer Submissions */}
                {reviewerSubmissions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4" />
                        Reviewer Submissions ({reviewerSubmissions.length})
                      </CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-4">
                      {reviewerSubmissions.map((submission: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 space-y-3 rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">
                                {submission.reviewer_name || "Reviewer"}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Reviewed{" "}
                                {formatDateTime(submission.submitted_at)}
                              </p>
                            </div>
                            <Badge
                              variant={submission.status === "APPROVED" ? "default" : "destructive"}
                              className="capitalize">
                              {submission.status}
                            </Badge>
                          </div>

                          {submission.comment && (
                            <div className="space-y-2 border-t pt-3">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="text-muted-foreground h-4 w-4" />
                                <span className="text-muted-foreground text-xs font-semibold uppercase">
                                  Reviewer Comment
                                </span>
                              </div>
                              <p className="text-foreground text-sm leading-relaxed">
                                {submission.comment}
                              </p>
                            </div>
                          )}

                          {submission.file_urls && submission.file_urls.length > 0 && (
                            <div className="space-y-2 border-t pt-3">
                              <span className="text-muted-foreground text-xs font-semibold uppercase">
                                Attached Files ({submission.file_urls.length})
                              </span>
                              <div className="space-y-2">
                                {submission.file_urls.map((fileUrl: any, fileIdx: number) => {
                                  return (
                                    <div
                                      key={fileIdx}
                                      className="rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div>
                                            <p className="text-xs text-gray-600">File</p>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(fileUrl, "_blank")}
                                          className="gap-2">
                                          <Download className="h-4 w-4" />
                                          Download
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Empty State */}
                {responsibleSubmissions.length === 0 && reviewerSubmissions.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <AlertCircle className="text-muted-foreground mb-2 h-8 w-8" />
                      <p className="text-muted-foreground text-sm">No submissions yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Submit Findings Tab */}
            <TabsContent value="submit" className="space-y-6">
              <Textarea
                label="Comment or Findings"
                id="comment"
                placeholder="e.g., Following up on the initial report. Attached is the full audit trail and corrective action evidence..."
                value={formData.comment}
                onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                disabled={isSubmitting}
                className="min-h-32"
                required
              />

              {/* File Upload Section */}
              <div className="space-y-3">
                <Label className="text-foreground/80 mb-2 text-xs font-medium capitalize">
                  Attach Evidence Files
                </Label>
                <div className="flex items-center justify-center rounded-lg border border-dashed border-black/40 px-2">
                  <label className="w-full cursor-pointer text-center">
                    <div className="flex items-center gap-2 space-y-2 text-xs text-gray-400">
                      <CloudUpload className="mb-2 h-12 w-8" />
                      <div className="text-sm font-medium text-gray-400">
                        Click to upload or drag and drop
                      </div>
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      disabled={isSubmitting || uploadingFiles.length > 0}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.text,.csv"
                    />
                  </label>
                </div>

                {/* Uploaded Files List */}
                {formData.file_urls.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-semibold uppercase">
                      Attached Files ({formData.file_urls.length})
                    </Label>
                    <div className="space-y-1">
                      {formData.file_urls.map((url, index) => {
                        const fileName = url.split("/").pop() || "File";
                        return (
                          <div
                            key={index}
                            className="bg-primary/10 flex items-center justify-between rounded-md p-2 text-sm">
                            <span className="text-primary truncate">
                              {decodeURIComponent(fileName)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              disabled={isSubmitting}
                              className="text-muted-foreground hover:text-destructive">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Dialog Footer with Submit Button */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="destructive" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || uploadingFiles.length > 0 || !formData.comment.trim()}
            className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Submit Findings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
