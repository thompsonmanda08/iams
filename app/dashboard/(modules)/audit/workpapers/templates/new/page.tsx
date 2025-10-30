"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import {
  createWorkingPaperTemplate,
  updateWorkingPaperTemplate
} from "@/app/_actions/audit-module-actions";
import { useToast } from "@/hooks/use-toast";
import { WorkpaperTemplate } from "@/lib/types/audit-types";

export default function NewTemplatePage({
  templateId,
  initialData
}: {
  templateId: string;
  initialData?: WorkpaperTemplate;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(
    templateId && initialData
      ? initialData
      : {
          name: "",
          standard: "ISO 27001:2022",
          description: "",
          version: "1.0",
          is_active: true
        }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.standard) {
      toast({
        title: "Validation Error",
        description: "Template name and standard are required",
        variant: "destructive"
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
        toast({
          title: "Success",
          description: `Working paper template ${templateId ? "updated" : "created"} successfully`
        });
        router.push("/dashboard/audit/workpapers/templates");
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to ${templateId ? "update" : "create"} template`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {templateId ? "Update" : "Create"} Working Paper Template
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {templateId ? "Update" : "Create a new"} template for working paper generation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
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

                  <Input
                    id="name"
                    label="Standard"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                    placeholder="e.g., ISO 27001:2022 ISMS Audit"
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

                <div className="space-y-2"></div>

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
      </div>
    </div>
  );
}
