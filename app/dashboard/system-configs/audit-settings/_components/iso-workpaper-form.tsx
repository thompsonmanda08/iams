"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { WorkpaperTemplate } from "@/lib/types/audit-types";
import {
  createWorkingPaperTemplate,
  updateWorkingPaperTemplate
} from "@/app/_actions/audit-module-actions";
import { Switch } from "@/components/ui/switch";
import { SelectField } from "@/components/ui/select-field";
import { notify } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorState } from "@/lib/types";

const FRAMEWORK_TYPES = [
  { id: "ISO27001", name: "ISO 27001 Audit" },
  { id: "COSO", name: "COSO Audit" },
  { id: "COBIT", name: "COBIT Audit" },
  { id: "NIST", name: "NIST Audit" }
];

const INIT_WORKPAPER_TEMPLATE: Omit<WorkpaperTemplate, "id"> = {
  name: "",
  standard: "ISO",
  framework_type: "ISO27001",
  description: "",
  version: "",
  is_active: true
};

export function ComplianceWorkpaperTemplateForm({
  templateId,
  initialData,
  onSuccess,
  onCancel
}: {
  templateId: string | null;
  initialData?: WorkpaperTemplate | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState(
    templateId && initialData
      ? initialData
      : {
          name: "",
          standard: "ISO27001",
          framework_type: "ISO27001",
          description: "",
          version: "2022",
          is_active: true
        }
  );

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: Omit<WorkpaperTemplate, "id">) => {
      return initialData && templateId
        ? updateWorkingPaperTemplate(templateId, data)
        : createWorkingPaperTemplate(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        notify({
          title: "Success",
          description: `Working paper template ${templateId ? "updated" : "created"} successfully`,
          type: "success"
        });
        // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
        setFormData(INIT_WORKPAPER_TEMPLATE);
        setError({ status: false, message: "" });
        onSuccess?.();
      } else {
        notify({
          title: "Error",
          description: response.message || `Failed to ${templateId ? "update" : "create"} template`,
          type: "error"
        });
        setError({ status: true, message: response.message });
      }
    },
    onError: (error) => {
      notify({
        title: "Error",
        description: "An unexpected error occurred",
        type: "error"
      });
      setError({ status: true, message: "An unexpected error occurred" });
      console.error("Error saving department:", error);
    }
  });

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(formData);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleCreateOrUpdate}>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="name"
                label="Template Name"
                classNames={{
                  wrapper: "max-w-none w-full flex-1"
                }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., ISO 27001:2022 ISMS Audit"
                required
              />
              <Input
                id="version"
                label="Version"
                classNames={{
                  wrapper: "max-w-xs w-full flex-[0.5]"
                }}
                required
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="2022"
              />
            </div>

            <SelectField
              label="Standard / Framework Type"
              placeholder="Select template standard"
              className="w-full max-w-none"
              classNames={{
                wrapper: "max-w-none"
              }}
              value={formData.framework_type}
              onValueChange={(value) =>
                setFormData({ ...formData, framework_type: value, standard: value })
              }
              options={FRAMEWORK_TYPES}
              required
            />

            <Textarea
              id="description"
              label="Description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Working paper template for ISO 27001:2022 ISMS audits..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active Template</Label>
              <p className="text-muted-foreground text-sm">Make this template available for use</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onCancel?.();
                router.back();
              }}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting || saveMutation.isPending}
              loadingText="Saving...">
              {templateId ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
