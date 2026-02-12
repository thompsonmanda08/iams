"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, ExternalLink, Save } from "lucide-react";
import type { FindingEvidence, FindingEvidenceType } from "@/lib/types/audit-types";
import UploadField, { ACCEPTABLE_FILE_TYPES } from "@/components/ui/file-dropzone";
import { notify } from "@/lib/utils";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { usePermissions } from "@/hooks/use-permissions";

interface EvidenceFormProps {
  finding_id: string;
  evidence?: FindingEvidence | null;
  onSubmit: (data: {
    finding_id: string;
    evidence_type: FindingEvidenceType;
    title: string;
    description?: string;
    file_link?: string;
    external_link?: string;
    collection_date?: string;
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EVIDENCE_TYPES: { id: FindingEvidenceType; name: string }[] = [
  { id: "Document", name: "Document" },
  { id: "Observation", name: "Observation" },
  { id: "Interview", name: "Interview Notes" },
  { id: "Testing", name: "Test Result" }
];

export function EvidenceForm({
  finding_id,
  evidence,
  onSubmit,
  onCancel,
  isLoading
}: EvidenceFormProps) {
  const { checkPermission } = usePermissions();

  const [formData, setFormData] = useState({
    evidence_type: "" as FindingEvidenceType,
    title: "",
    description: "",
    external_link: "",
    collection_date: "",
    notes: "",
    file_link: ""
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Initialize form with existing evidence data if editing
  useEffect(() => {
    if (evidence) {
      setFormData({
        evidence_type: evidence.evidence_type,
        title: evidence.title || "",
        description: evidence.description || "",
        external_link: evidence.external_link || "",
        collection_date: evidence.collection_date || "",
        notes: evidence.notes || "",
        file_link: ""
      });
    }
  }, [evidence]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    if (!checkPermission("AUDIT_WPS", "can_create")) return;
    // e.preventDefault();

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!formData.evidence_type) errors.evidence_type = "Evidence type is required";
    if (!formData.title.trim()) errors.title = "Title is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await onSubmit({
        finding_id,
        evidence_type: formData.evidence_type,
        title: formData.title,
        description: formData.description || "N/A",
        external_link: formData.external_link || "N/A",
        collection_date: formData.collection_date || "N/A",
        notes: formData.notes || "N/A",
        file_link: formData.file_link || "N/A"
      });
    } catch (error) {
      console.error("Error submitting evidence:", error);
    }
  };

  const [uploading, setUploading] = useState(false);
  async function handleFileUpload(file: File) {
    setUploading(true);

    if (!file?.name?.trim() || !file?.type || !file?.size) {
      notify({
        type: "error",
        description: "Please select a valid file type to upload."
      });
      setUploading(false);
      return;
    }

    try {
      const response = await uploadFile(file);

      if (response?.success) {
        notify({
          type: "success",
          description: "File uploaded successfully!"
        });
        setFormData((prev) => ({
          ...prev,
          file_link: response?.data?.file_url || ""
        }));
      } else {
        notify({
          type: "error",
          description: response?.message || "Failed to upload file."
        });
      }
    } catch (error) {
      notify({
        type: "error",
        description: "An error occurred while uploading the file."
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">
              {evidence ? "Edit Evidence" : "Add Evidence"}
            </CardTitle>
            <CardDescription>
              {evidence
                ? "Update the evidence details below"
                : "Provide evidence to support this finding"}
            </CardDescription>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Evidence Type */}
          <div>
            <SelectField
              label="Evidence Type"
              required={true}
              descriptionText="Categorize the type of evidence"
              type="text"
              value={formData.evidence_type || ""}
              onValueChange={(value) => handleInputChange("evidence_type", value)}
              placeholder="Select evidence type..."
              errorText={fieldErrors["evidence_type"]}
              className="w-full text-sm"
              options={EVIDENCE_TYPES}
            />
          </div>

          {/* Title */}
          <div>
            <Input
              label="Title"
              required={true}
              descriptionText="Brief title for this evidence"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter evidence title..."
              errorText={fieldErrors["title"]}
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <Textarea
              label="Description"
              descriptionText="Detailed description of this evidence"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter description (optional)..."
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Collection Date */}
          <div>
            <DatePicker
              label="Collection Date"
              value={formData.collection_date as any}
              maxDate={new Date()}
              onValueChange={(date) => {
                handleInputChange("collection_date", date || null);
              }}
            />
          </div>

          {/* External Link */}
          <div>
            <Label className="text-sm font-medium">External Link</Label>
            <div className="relative mt-2">
              <ExternalLink className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="url"
                value={formData.external_link}
                onChange={(e) => handleInputChange("external_link", e.target.value)}
                placeholder="https://example.com/policy"
                className="pl-10 text-sm"
              />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Reference link to external documentation (optional)
            </p>
          </div>

          {/* File Upload */}
          <div>
            <UploadField
              label="Attach Evidence (Optional)"
              isLoading={uploading}
              required={false}
              handleFile={async (file) => {
                if (file) {
                  await handleFileUpload(file as File);
                } else {
                  // Clear the file when X is clicked
                  setFormData((prev) => ({
                    ...prev,
                    file_link: ""
                  }));
                }
              }}
              acceptedFiles={{
                ...ACCEPTABLE_FILE_TYPES.pdf,
                ...ACCEPTABLE_FILE_TYPES.word,
                ...ACCEPTABLE_FILE_TYPES.images
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <Textarea
              label="Notes"
              descriptionText="Additional notes or observations"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter notes (optional)..."
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              isLoading={isLoading}
              className="gap-2">
              <Save className="h-4 w-4" />
              {evidence ? "Update Evidence" : "Add Evidence"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
