import PageHeader from "@/components/page-header";
import { GeneralWorkpaperForm } from "../../../_components/general-workpaper-form";
import { WorkpaperBuilderTemplateId } from "@/lib/types/audit-types";
import { Card, CardContent } from "@/components/ui/card";
import { CustomWorkpaperForm } from "@/app/dashboard/system-configs/audit-settings/_components/custom-workpaper-form";
import { WorkpaperTemplateForm } from "../../../_components/workpaper-template-form";

export default async function CreateNewTemplatePage({
  params
}: {
  params: Promise<{ builderId: WorkpaperBuilderTemplateId }>;
}) {
  const { builderId } = await params;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <PageHeader
              title="Create New Template"
              description="ISO 27001 compliance monitoring and audit tracking"
              icon="FileText"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {builderId == "ISO27001" && <WorkpaperTemplateForm templateId={null} initialData={null} />}

        {builderId === "GENERAL" && (
          <GeneralWorkpaperForm
          // auditId={auditId}
          // auditTitle={auditTitle}
          // onSuccess={handleSuccess}
          // onCancel={handleCancel}
          />
        )}

        {builderId === "CUSTOM" && (
          <Card>
            <CardContent className="pt-6">{/* <CustomTemplateBuilder /> */}</CardContent>
          </Card>
        )}

        {builderId !== "ISO27001" && builderId !== "GENERAL" && builderId !== "CUSTOM" && (
          <CustomWorkpaperForm />
        )}
      </div>
    </div>
  );
}

/* 

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
*/
