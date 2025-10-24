"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2, AlertCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { EvidenceGrid } from "./evidence-grid";
import { useTeamMembers } from "@/hooks/use-audit-query-data";
import type {
  CustomTemplate,
  CustomWorkpaperInput,
  CustomField,
  EvidenceRow,
} from "@/lib/types/audit-types";
import { useToast } from "@/hooks/use-toast";
import { TICK_MARKS } from "@/lib/data/tick-marks";

interface CustomWorkpaperFormProps {
  auditId: string;
  auditTitle?: string;
  template: CustomTemplate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomWorkpaperForm({
  auditId,
  auditTitle,
  template,
  onSuccess,
  onCancel,
}: CustomWorkpaperFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: teamMembers } = useTeamMembers();
  const [isSaving, setIsSaving] = useState(false);

  const currentUser = teamMembers?.[0]?.name || "Current User";

  // Form state
  const [preparedBy, setPreparedBy] = useState(currentUser);
  const [preparedDate, setPreparedDate] = useState(new Date());
  const [reviewedBy, setReviewedBy] = useState<string | undefined>(undefined);
  const [reviewedDate, setReviewedDate] = useState<Date | undefined>();

  // Dynamic field values
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  // Evidence grid (if template includes it)
  const [evidenceRows, setEvidenceRows] = useState<EvidenceRow[]>([]);
  const [selectedTickMarks, setSelectedTickMarks] = useState<string[]>(
    template.defaultTickMarks || []
  );

  // Update field value
  const updateFieldValue = (fieldId: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Render field based on type
  const renderField = (field: CustomField) => {
    const value = fieldValues[field.id] || field.defaultValue || "";

    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            rows={4}
            className="resize-none"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
          />
        );

      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => updateFieldValue(field.id, parseFloat(e.target.value))}
          />
        );

      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            value={value ? new Date(value).toISOString().split("T")[0] : ""}
            onChange={(e) => updateFieldValue(field.id, new Date(e.target.value))}
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(v) => updateFieldValue(field.id, v)}
          >
            <SelectTrigger id={field.id}>
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => updateFieldValue(field.id, checked)}
            />
            <Label htmlFor={field.id} className="font-normal cursor-pointer">
              {field.placeholder || "Enable"}
            </Label>
          </div>
        );

      case "file":
        return (
          <Input
            id={field.id}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                updateFieldValue(field.id, file);
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  // Validation
  const validateForm = (): string | null => {
    if (!preparedBy) return "Prepared by is required";

    // Check required fields
    for (const section of template.sections) {
      for (const field of section.fields) {
        if (field.required && !fieldValues[field.id]) {
          return `"${field.label}" is required`;
        }
      }
    }

    // If evidence grid is included, require at least one row
    if (template.includeEvidenceGrid && evidenceRows.length === 0) {
      return "At least one evidence row is required";
    }

    return null;
  };

  // Submit
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const workpaperData: CustomWorkpaperInput = {
      auditId,
      templateId: template.id,
      preparedBy,
      preparedDate,
      reviewedBy: reviewedBy || undefined,
      reviewedDate,
      fieldValues,
      evidenceRows: template.includeEvidenceGrid ? evidenceRows : undefined,
      selectedTickMarks: template.includeTickMarks ? selectedTickMarks : undefined,
    };

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Success",
        description: "Workpaper created successfully",
      });

      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workpaper",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{template.name}</h2>
          {auditTitle && (
            <p className="text-sm text-muted-foreground mt-1">For Audit: {auditTitle}</p>
          )}
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
      </div>

      {/* Assignment */}
      <Card className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Assignment</h3>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="preparedBy">
                Prepared By <span className="text-destructive">*</span>
              </Label>
              <Select value={preparedBy} onValueChange={setPreparedBy}>
                <SelectTrigger id="preparedBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparedDate">
                Preparation Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="preparedDate"
                type="date"
                value={preparedDate.toISOString().split("T")[0]}
                onChange={(e) => setPreparedDate(new Date(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewedBy">Reviewed By (Optional)</Label>
              <Select value={reviewedBy} onValueChange={(value) => setReviewedBy(value === "none" ? undefined : value)}>
                <SelectTrigger id="reviewedBy">
                  <SelectValue placeholder="Select reviewer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewedDate">Review Date (Optional)</Label>
              <Input
                id="reviewedDate"
                type="date"
                value={reviewedDate ? reviewedDate.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setReviewedDate(e.target.value ? new Date(e.target.value) : undefined)
                }
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Dynamic Sections */}
      {template.sections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
              )}
            </div>

            {section.fields.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                {section.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* Evidence Grid (if included) */}
      {template.includeEvidenceGrid && (
        <Card className="p-6">
          <EvidenceGrid
            rows={evidenceRows}
            onRowsChange={setEvidenceRows}
            selectedTickMarks={selectedTickMarks}
            onTickMarksChange={setSelectedTickMarks}
            availableTickMarks={TICK_MARKS}
          />
        </Card>
      )}

      {/* Validation Message */}
      {(() => {
        const error = validateForm();
        return error ? (
          <Card className="p-4 bg-destructive/10 border-destructive">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </Card>
        ) : null;
      })()}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>

        <Button onClick={handleSubmit} disabled={isSaving || !!validateForm()}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Workpaper"
          )}
        </Button>
      </div>
    </div>
  );
}
