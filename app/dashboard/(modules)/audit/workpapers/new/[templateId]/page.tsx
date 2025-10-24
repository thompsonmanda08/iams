"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateWorkpaperForm } from "@/components/audit/create-workpaper-form";
import { GeneralWorkpaperForm } from "@/components/audit/general-workpaper-form";
import { CustomWorkpaperForm } from "@/components/audit/custom-workpaper-form";
import { CustomTemplateBuilder } from "@/components/audit/custom-template-builder";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Mock custom templates - should be fetched from API
const mockCustomTemplates = [
  {
    id: "custom-1",
    name: "Financial Controls Review",
    description: "Template for reviewing financial controls and reconciliations",
    sections: [
      { id: "s1", title: "Control Identification", fields: [] },
      { id: "s2", title: "Testing Procedures", fields: [] }
    ],
    includeEvidenceGrid: true,
    isPublic: true,
    usageCount: 15
  }
];

export default function NewWorkpaperPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const templateId = params.templateId as string;
  const auditId = searchParams.get("auditId") || undefined;
  const auditTitle = searchParams.get("auditTitle") || undefined;

  const [selectedCustomTemplate, setSelectedCustomTemplate] = useState<any>(null);

  useEffect(() => {
    // If it's a custom template ID, load the template
    if (templateId && templateId.startsWith("custom-") && templateId !== "custom-new") {
      const template = mockCustomTemplates.find((t) => t.id === templateId);
      if (template) {
        setSelectedCustomTemplate(template);
      }
    }
  }, [templateId]);

  const handleSuccess = () => {
    toast.success("Workpaper created successfully");
    router.push("/dashboard/audit/workpapers");
  };

  const handleCancel = () => {
    router.back();
  };

  const handleTemplateCreated = (template: any) => {
    toast.success("Custom template created successfully");
    router.push(`/dashboard/audit/workpapers/new/${template.id}?auditId=${auditId}&auditTitle=${auditTitle}`);
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Create Workpaper</h1>
          </div>
          {auditTitle ? (
            <p className="text-muted-foreground">
              Audit: <span className="font-medium">{auditTitle}</span>
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              You can attach this workpaper to an audit plan later
            </p>
          )}
        </div>
      </div>

      {/* Form Content based on template */}
      {templateId === "iso27001" && (
        <CreateWorkpaperForm
          auditId={auditId}
          auditTitle={auditTitle}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {templateId === "general" && (
        <GeneralWorkpaperForm
          auditId={auditId}
          auditTitle={auditTitle}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {templateId === "custom-new" && (
        <Card>
          <CardContent className="pt-6">
            <CustomTemplateBuilder
              onSuccess={handleTemplateCreated}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      {selectedCustomTemplate &&
       templateId !== "iso27001" &&
       templateId !== "general" &&
       templateId !== "custom-new" && (
        <CustomWorkpaperForm
          auditId={auditId}
          auditTitle={auditTitle}
          template={selectedCustomTemplate}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Invalid template */}
      {!["iso27001", "general", "custom-new"].includes(templateId) &&
       !selectedCustomTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Template Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The selected template could not be found.
            </p>
            <Button onClick={() => router.push("/dashboard/audit/workpapers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workpapers
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
