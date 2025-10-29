"use client";

import { FileText } from "lucide-react";
import PageHeader from "@/components/page-header";
import { ISOWorkpaperTemplateForm } from "../../../_components/iso-workpaper-form";
import { GeneralWorkpaperForm } from "../../../_components/general-workpaper-form";

export default async function CreateNewTemplatePage({
  params
}: {
  params: Promise<{ builderId: string }>;
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
              Icon={FileText}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {builderId == "iso27001" && (
          <ISOWorkpaperTemplateForm templateId={null} initialData={null} />
        )}

        {builderId === "general" && (
          <GeneralWorkpaperForm
          // auditId={auditId}
          // auditTitle={auditTitle}
          // onSuccess={handleSuccess}
          // onCancel={handleCancel}
          />
        )}

        {/* {templateId === "custom-new" && (
          <Card>
            <CardContent className="pt-6">
              <CustomTemplateBuilder onSuccess={handleTemplateCreated} onCancel={handleCancel} />
            </CardContent>
          </Card>
        )}

        {selectedCustomTemplate &&
          templateId !== "iso27001" &&
          templateId !== "iso27001-2022" &&
          templateId !== "general" &&
          templateId !== "custom-new" && (
            <CustomWorkpaperForm
              auditId={auditId}
              auditTitle={auditTitle}
              template={selectedCustomTemplate}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )} */}
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
