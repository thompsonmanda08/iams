"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, X, CloudUpload } from "lucide-react";

import { IncidentData } from "@/lib/types/incidents-types";
import { sendIncidentForReview } from "@/app/_actions/incident-actions";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { useUsers } from "@/hooks/use-users-query-data";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { DatePicker } from "@/components/ui/date-picker";
import { useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";

interface SendForReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: IncidentData | null;
}

interface FormData {
  responsible_person_id: string;
  reviewer_id: string;
  due_date: string;
  instructions: string;
  comment: string;
  file_urls: string[];
}

export function SendForReviewDialog({ open, onOpenChange, incident }: SendForReviewDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    responsible_person_id: "",
    reviewer_id: "",
    due_date: "",
    instructions: "",
    comment: "",
    file_urls: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: usersResponse, isLoading: isLoadingUsers } = useUsers({
    page_size: 100,
    page: 1
  });

  const user_options =
    usersResponse?.data?.data?.map((user: any) => ({
      value: user.id,
      name: `${user.first_name} ${user.last_name}` || user.email
    })) || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.responsible_person_id) {
      newErrors.responsible_person_id = "Responsible person is required";
    }
    if (!formData.reviewer_id) {
      newErrors.reviewer_id = "Reviewer is required";
    }
    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }
    if (!formData.instructions.trim()) {
      newErrors.instructions = "Instructions are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      const fileId = `${file.name}-${Date.now()}`;
      setUploadingFiles((prev) => [...prev, fileId]);

      try {
        const uploadedPath = await uploadFile(file);

        if (uploadedPath) {
          // Extract the file URL from the response
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!incident) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await sendIncidentForReview(incident.incident.id, {
        responsible_person_id: formData.responsible_person_id,
        reviewer_id: formData.reviewer_id,
        due_date: new Date(formData.due_date).toISOString(),
        instructions: formData.instructions,
        comment: formData.comment,
        file_urls: formData.file_urls
      });

      if (response.success) {
        notify({ description: "Incident sent for review successfully", type: "success" });
        onOpenChange(false);
        setFormData({
          responsible_person_id: "",
          reviewer_id: "",
          due_date: "",
          instructions: "",
          comment: "",
          file_urls: []
        });
        queryClient.invalidateQueries({ queryKey: ["incidents"] });
      } else {
        notify({ description: response.message || "Failed to send for review", type: "error" });
      }
    } catch (error) {
      notify({ description: "Error sending incident for review", type: "error" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Submit Incident For Review</DialogTitle>
          <DialogDescription>
            Submit the incident for review with supporting documentation and instructions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
            {/* Responsible Person - Single Select */}

            <SearchSelectField
              label="Action Owner (Who will be responsible for addressing the incident)"
              placeholder={
                isLoadingUsers ? "Loading users..." : "Search and select responsible person"
              }
              value={formData.responsible_person_id}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  responsible_person_id: value
                }));
                if (errors.responsible_person_id) {
                  setErrors((prev: any) => ({ ...prev, responsible_person_id: undefined }));
                }
              }}
              options={user_options}
              listItemName="name"
              isDisabled={isSubmitting || isLoadingUsers}
              isLoading={isLoadingUsers}
              isInvalid={!!errors.responsible_person_id}
              errorText={errors.responsible_person_id}
              required
            />

            {/* Reviewer - Single Select */}

            <SearchSelectField
              label="Assign Reviewer (Who can review the action)"
              placeholder={isLoadingUsers ? "Loading users..." : "Search and select a reviewer"}
              value={formData.reviewer_id}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  reviewer_id: value
                }));
                if (errors.reviewer_id) {
                  setErrors((prev: any) => ({ ...prev, reviewer_id: undefined }));
                }
              }}
              options={user_options}
              listItemName="name"
              isDisabled={isSubmitting || isLoadingUsers}
              isLoading={isLoadingUsers}
              isInvalid={!!errors.reviewer_id}
              errorText={errors.reviewer_id}
              required
            />

            {/* Due Date */}
            <DatePicker
              label="Due Date"
              name="due_date"
              value={formData.due_date ? (new Date(formData.due_date || "") as any) : undefined}
              onValueChange={(date) => {
                setFormData((prev) => ({
                  ...prev,
                  due_date: date ? date.toISOString().split("T")[0] : ""
                }));
                if (errors.due_date) {
                  setErrors((prev: any) => ({ ...prev, due_date: undefined }));
                }
              }}
              minDate={new Date()}
              isDisabled={isSubmitting}
              isInvalid={!!errors.due_date}
              errorText={errors.due_date}
              required
            />

            <Separator />

            {/* Instructions */}
            <Textarea
              label="Instructions"
              id="instructions"
              placeholder="e.g., Please review the attached evidence and determine root cause classification."
              value={formData.instructions}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  instructions: e.target.value
                }));
                if (errors.instructions) {
                  setErrors((prev: any) => ({ ...prev, instructions: undefined }));
                }
              }}
              disabled={isSubmitting}
              className={`min-h-24 ${errors.instructions ? "border-destructive" : ""}`}
              error={errors.instructions}
              required
            />

            {/* Comment */}
            <Textarea
              label="Additional Comment"
              id="comment"
              placeholder="e.g., Attaching initial evidence files for review. Please see the access logs and screenshot."
              value={formData.comment}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  comment: e.target.value
                }));
              }}
              disabled={isSubmitting}
              className="min-h-20"
            />

            <Separator />

            {/* File Uploads */}
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
                    Attached Files
                  </Label>
                  <div className="space-y-1">
                    {formData.file_urls.map((url, index) => {
                      const fileName =
                        typeof url === "string" ? url.split("/").pop() || "File" : "File";
                      return (
                        <div
                          key={index}
                          className="bg-primary/10 flex items-center justify-between rounded-md p-2 text-sm">
                          <span className="text-primary truncate">{fileName}</span>
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
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isSubmitting || uploadingFiles.length > 0}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || uploadingFiles.length > 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Sending..." : "Send For Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
