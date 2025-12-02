import { AlertCircle } from "lucide-react";
import PageHeader from "@/components/page-header";
import { getWorkingPaperTemplate } from "@/app/_actions/audit-module-actions";
import { notFound } from "next/navigation";
import type { WorkpaperBuilderTemplateId } from "@/lib/types/audit-types";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ComplianceWorkpaperTemplateForm } from "../../../_components/iso-workpaper-form";

export default async function UpdateTemplatePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id: templateId } = await params;
  const { framework_type } = await searchParams;

  // Fetch the template data
  const templateResponse = await getWorkingPaperTemplate(templateId);

  if (!templateResponse.success || !templateResponse.data) {
    notFound();
  }

  const template = templateResponse?.success ? templateResponse.data?.data || [] : [];

  // Map the standard to builderId
  const builderId: WorkpaperBuilderTemplateId = (template.standard?.toUpperCase() ||
    "GENERAL") as WorkpaperBuilderTemplateId;

  const description =
    builderId === "ISO27001"
      ? "ISO 27001 compliance monitoring and audit tracking"
      : builderId === "GENERAL"
        ? "General B 1.1.2 form type of working template"
        : "Custom workpaper template";

  const title =
    builderId === "ISO27001"
      ? "Update ISO 27001 Workpaper Template"
      : builderId === "GENERAL"
        ? "Update General Workpaper Template"
        : "Update Custom Workpaper Template";

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <PageHeader title={title} description={description} icon="FileText" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {builderId === "ISO27001" && (
          <ComplianceWorkpaperTemplateForm templateId={templateId} initialData={template} />
        )}

        {builderId === "GENERAL" && (
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  General template editing is currently being developed. You can view template
                  details but editing is not yet available. Please use the ISO27001 or Custom
                  template types for editable templates.
                </AlertDescription>
              </Alert>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Template Name</p>
                  <p className="text-lg">{template.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Description</p>
                  <p className="text-sm">{template.description || "No description"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Version</p>
                  <p className="text-sm">{template.version || "1.0"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Status</p>
                  <p className="text-sm">{template.is_active ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {builderId === "CUSTOM" && (
          <Card>
            <CardContent className="pt-6">
              {/* <CustomTemplateBuilder initialData={template as any} /> */}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
