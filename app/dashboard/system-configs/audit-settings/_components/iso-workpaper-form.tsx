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

export function ISOWorkpaperTemplateForm({
  templateId,
  initialData
}: {
  templateId: string | null;
  initialData?: WorkpaperTemplate | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(
    templateId && initialData
      ? initialData
      : {
          name: "",
          standard: "ISO27001",
          description: "",
          version: "1.0",
          is_active: true
        }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.standard) {
      notify({
        title: "Validation Error",
        description: "Template name and standard are required",
        type: "error"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newData = {
        name: formData.name,
        standard: formData.standard,
        description: formData.description || undefined,
        version: formData.version || undefined,
        is_active: formData.is_active
      };
      const result = templateId
        ? await updateWorkingPaperTemplate(templateId, newData)
        : await createWorkingPaperTemplate(newData);

      if (result.success) {
        notify({
          title: "Success",
          description: `Working paper template ${templateId ? "updated" : "created"} successfully`
        });
        router.push("/dashboard/system-configs/audit-settings/templates");
      } else {
        notify({
          title: "Error",
          description: result.message || `Failed to ${templateId ? "update" : "create"} template`,
          type: "error"
        });
      }
    } catch (error) {
      notify({
        title: "Error",
        description: "An unexpected error occurred",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
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
                  label="Vision"
                  classNames={{
                    wrapper: "max-w-xs w-full flex-[0.5]"
                  }}
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>

              <SelectField
                label="Workpaper Template"
                placeholder="Select template standard"
                className="w-full max-w-none"
                classNames={{
                  wrapper: "max-w-none"
                }}
                value={formData.standard}
                onValueChange={(value) => setFormData({ ...formData, standard: value })}
                options={[{ id: "ISO27001", name: "ISO 27001 ISMS Audit" }]}
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
                <p className="text-muted-foreground text-sm">
                  Make this template available for use
                </p>
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
                onClick={() => router.back()}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                loadingText="Saving...">
                {templateId ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
