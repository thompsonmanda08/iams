"use client";

import { FileText } from "lucide-react";
import PageHeader from "@/components/page-header";
import { ISOWorkpaperTemplateForm } from "../../../_components/iso-workpaper-form";
import { GeneralWorkpaperForm } from "../../../_components/general-workpaper-form";

export default async function UpdateTemplatePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ builderId: string }>;
}) {
  const { id: templateId } = await params;
  const { builderId } = await searchParams;

  const description =
    builderId == "iso27001"
      ? "ISO 27001 compliance monitoring and audit tracking"
      : builderId == "general"
        ? "General B 1.1.2 form type of working template"
        : "";

  const title =
    builderId == "iso27001"
      ? "Update ISO 27001 Workpaper Template"
      : "Update General Workpaper Template";

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <PageHeader title={title} description={description} Icon={FileText} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {builderId == "iso27001" && (
          <ISOWorkpaperTemplateForm templateId={templateId} initialData={null} />
        )}

        {builderId === "general" && (
          <GeneralWorkpaperForm templateId={templateId} initialData={null} />
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
