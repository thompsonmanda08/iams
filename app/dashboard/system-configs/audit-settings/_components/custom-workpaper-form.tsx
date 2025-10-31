"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, AlertCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { EvidenceGrid } from "../../../../../components/audit/evidence-grid";
import type {
  CustomTemplate,
  CustomWorkpaperInput,
  CustomField,
  EvidenceRow
} from "@/lib/types/audit-types";
import { useToast } from "@/hooks/use-toast";
import { TICK_MARKS } from "@/lib/data/tick-marks";
import { useTeamMembers } from "@/hooks/use-users-query-data";
import { SelectField } from "@/components/ui/select-field";
import { DatePicker } from "@/components/ui/date-picker";
import type { User } from "@/lib/types/account";

interface CustomWorkpaperFormProps {
  // auditId?: string; // Optional - can be attached to audit plan later
  auditTitle?: string;
  template: CustomTemplate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomWorkpaperForm({ auditId, auditTitle, template, onSuccess, onCancel }: any) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: teamMembersResponse } = useTeamMembers({ page_size: 100 });
  const [isSaving, setIsSaving] = useState(false);

  const teamMembers = teamMembersResponse?.data;
  const currentUser = teamMembers?.[0]?.id || "";

  console.log("USERS: ", teamMembers);

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
    template?.defaultTickMarks || []
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
          <DatePicker
            name={field.id}
            value={(value ? new Date(value) : undefined) as any}
            onValueChange={(date) => updateFieldValue(field.id, date)}
          />
        );

      case "select":
        return (
          <SelectField
            value={value}
            onValueChange={(v) => updateFieldValue(field.id, v)}
            options={
              field.options && field.options.length > 0
                ? field.options?.map((option) => {
                    return {
                      id: option,
                      name: option
                    };
                  })
                : []
            }
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => updateFieldValue(field.id, checked)}
            />
            <Label htmlFor={field.id} className="cursor-pointer font-normal">
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
    for (const section of template?.sections || []) {
      for (const field of section.fields) {
        if (field.required && !fieldValues[field.id]) {
          return `"${field.label}" is required`;
        }
      }
    }

    // If evidence grid is included, require at least one row
    if (template?.includeEvidenceGrid && evidenceRows?.length === 0) {
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
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    const workpaperData: CustomWorkpaperInput = {
      // auditId,
      templateId: template.id,
      preparedBy,
      preparedDate,
      reviewedBy: reviewedBy || undefined,
      reviewedDate,
      fieldValues,
      evidenceRows: template?.includeEvidenceGrid ? evidenceRows : undefined,
      selectedTickMarks: template.includeTickMarks ? selectedTickMarks : undefined
    };

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Success",
        description: "Workpaper created successfully"
      });

      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workpaper",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
          <FileText className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            {template?.name || "New Custom Workpaper Template"}
          </h2>
          {auditTitle ? (
            <p className="text-muted-foreground mt-1 text-sm">For Audit: {auditTitle}</p>
          ) : (
            <p className="text-muted-foreground mt-1 text-sm">
              You can attach this workpaper to an audit plan later
            </p>
          )}
          <p className="text-muted-foreground text-sm">{template?.description || ""}</p>
        </div>
      </div>

      {/* Assignment */}
      <Card className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Assignment</h3>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <SelectField
                label="Prepared By"
                required
                value={preparedBy}
                onValueChange={setPreparedBy}
                options={
                  teamMembers?.map((member: User) => ({
                    id: member.id,
                    name: `${member.first_name} ${member.last_name} - ${member.role?.name}`
                  })) || []
                }
              />
            </div>

            <div className="space-y-2">
              <DatePicker
                label="Preparation Date"
                required
                name="preparedDate"
                value={preparedDate as any}
                onValueChange={(date) => date && setPreparedDate(date)}
              />
            </div>

            <div className="space-y-2">
              <SelectField
                label="Reviewed By (Optional)"
                placeholder="Select reviewer..."
                value={reviewedBy}
                onValueChange={(value) => setReviewedBy(value === "none" ? undefined : value)}
                options={[
                  { id: "none", name: "None" },
                  ...(teamMembers?.map((member: User) => ({
                    id: member.id,
                    name: `${member.first_name} ${member.last_name} - ${member.role?.name}`
                  })) || [])
                ]}
              />
            </div>

            <div className="space-y-2">
              <DatePicker
                label="Review Date (Optional)"
                name="reviewedDate"
                value={reviewedDate as any}
                onValueChange={(date) => setReviewedDate(date)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Dynamic Sections */}
      {template &&
        template?.sections?.length > 0 &&
        template?.sections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">{section.title}</h3>
                {section.description && (
                  <p className="text-muted-foreground mt-1 text-sm">{section.description}</p>
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
      {template && template?.includeEvidenceGrid && (
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
          <Card className="bg-destructive/10 border-destructive p-4">
            <div className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </Card>
        ) : null;
      })()}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>

        <Button onClick={handleSubmit} disabled={isSaving || !!validateForm()}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
