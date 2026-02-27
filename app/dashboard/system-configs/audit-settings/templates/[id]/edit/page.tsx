import PageHeader from "@/components/page-header";
import { getWorkingPaperTemplate } from "@/app/_actions/audit-module-actions";
import { notFound } from "next/navigation";
import type { WorkpaperBuilderTemplateId } from "@/lib/types/audit-types";
import { Card, CardContent } from "@/components/ui/card";
import { WorkpaperTemplateForm } from "../../../_components/workpaper-template-form";
import { GeneralTemplateConfigsForm } from "../../../_components/general-workpaper-form";

export default async function UpdateTemplatePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id: templateId } = await params;
  const { framework_type }: { framework_type?: string } = await searchParams;

  // Fetch the template data
  const templateResponse = await getWorkingPaperTemplate(templateId);

  if (!templateResponse.success || !templateResponse.data) {
    notFound();
  }

  const template = templateResponse?.success ? templateResponse.data?.data || [] : [];

  // Map the standard to builderId
  const builderId: WorkpaperBuilderTemplateId = (framework_type?.toUpperCase() ||
    "GENERAL") as WorkpaperBuilderTemplateId;

  const description =
    builderId === "ISO27001"
      ? "ISO 27001, COSO, COBIT and NIST compliance monitoring and audit workpaper templates"
      : "General B 1.1.2 form type of workpaper template";

  const title =
    builderId === "ISO27001"
      ? "Update Compliance Workpaper Template"
      : "Update General Workpaper Template";

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <PageHeader title={`${title}`} description={description} icon="FileText" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <WorkpaperTemplateForm templateId={templateId} initialData={template} />

        {builderId === "GENERAL" && (
          <div className="grid gap-4">
            <Card>
              <CardContent className="">
                <GeneralTemplateConfigsForm initialData={template as any} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
