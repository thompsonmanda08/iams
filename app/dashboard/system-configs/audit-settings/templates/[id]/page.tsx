import { notFound } from "next/navigation";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  getWorkingPaperTemplate,
  getTemplateCategories
} from "@/app/_actions/audit-module-actions";
import { getGeneralWorkPaperConfigsByTemplateId } from "@/app/_actions/audit-settings-actions";
import { format } from "date-fns";
import { TemplateCategoriesTable } from "@/app/dashboard/system-configs/audit-settings/_components/template-categories-table";
import PageHeader from "@/components/page-header";
import BackButton from "@/components/back-button";
import { CreateWorkpaperTemplateDialog } from "@/app/dashboard/system-configs/audit-settings/_components/create-workpaper-dialog";
import type { WorkpaperTemplate } from "@/lib/types/audit-types";
import { GeneralTemplateConfigsForm } from "../../_components/general-workpaper-form";

interface TemplateDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { id } = await params;
  let categories = [];
  let configurations = [];

  const templateResponse = await getWorkingPaperTemplate(id);

  if (!templateResponse.success || !templateResponse.data) {
    notFound();
  }

  const template = templateResponse.data?.data || [];
  const isISO27001 = template.framework_type?.toUpperCase() !== "GENERAL";

  if (isISO27001) {
    const categoriesResponse = await getTemplateCategories(id);
    categories = categoriesResponse.success ? categoriesResponse.data?.data || [] : [];
  } else {
    
    const configsResponse = await getGeneralWorkPaperConfigsByTemplateId(id);
    configurations = configsResponse.success ? configsResponse.data || [] : [];

    console.log("General Configurations:", configurations);
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <PageHeader
              title={template?.name || "Template Details"}
              description={template?.description || "No description"}
              icon="FileCode2"
            />

            <div className="flex items-center gap-3">
              <BackButton className="mb-0 h-8!" title="Back to Templates" />
              <CreateWorkpaperTemplateDialog
                showTrigger={true}
                initialData={template as WorkpaperTemplate}
                templateId={id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Template Details */}
          <Card className="border-blue-100 bg-blue-50 p-6 dark:border-blue-950/80 dark:bg-blue-950/10">
            <div className="flex items-center gap-4">
              {template.is_active ? (
                <Badge className="bg-green-500">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
              <Badge variant="warning">
                {template.framework_type || template.standard || "ISO27001"}
              </Badge>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-primary dark:text-muted-foreground text-sm font-semibold">
                  Description
                </p>
                <p className="dark:text-foreground mt-1 text-sm text-blue-800">
                  {template.description || "No description"}
                </p>
              </div>
              <div>
                <p className="text-primary dark:text-muted-foreground text-sm font-semibold">
                  Version
                </p>
                <p className="dark:text-foreground mt-1 text-sm text-blue-800">
                  {template.version || "1.0"}
                </p>
              </div>
              <div>
                <p className="text-primary dark:text-muted-foreground text-sm font-semibold">
                  Created
                </p>
                <p className="dark:text-foreground mt-1 text-sm text-blue-800">
                  {template.created_at
                    ? format(new Date(template.created_at), "MMMM d, yyyy")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-primary dark:text-muted-foreground text-sm font-semibold">
                  Last Updated
                </p>
                <p className="dark:text-foreground mt-1 text-sm text-blue-800">
                  {template.updated_at
                    ? format(new Date(template.updated_at), "MMMM d, yyyy")
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>

          {/* Categories / Configurations Section */}
          <Tabs defaultValue={isISO27001 ? "categories" : "configs"} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                {isISO27001 ? (
                  <TabsTrigger value="categories" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Categories ({categories.length})
                  </TabsTrigger>
                ) : (
                  <TabsTrigger value="configs" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Configurations
                  </TabsTrigger>
                )}
              </TabsList>

              {isISO27001 && (
                <Link
                  href={`/dashboard/system-configs/audit-settings/templates/${id}/categories/new`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </Link>
              )}
            </div>

            <TabsContent value="categories" className="space-y-4">
              <TemplateCategoriesTable
                categories={categories}
                templateId={id}
                frameworkType={template.framework_type || template.standard || "ISO27001"}
              />
            </TabsContent>

            <TabsContent value="configs" className="space-y-4">
              <GeneralTemplateConfigsForm configs={configurations} templateId={id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
