import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  getWorkingPaperTemplate,
  getTemplateCategories,
} from "@/app/_actions/audit-module-actions";
import { format } from "date-fns";
import { TemplateCategoriesTable } from "@/components/audit/template-categories-table";

interface TemplateDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { id } = await params;

  const [templateResponse, categoriesResponse] = await Promise.all([
    getWorkingPaperTemplate(id),
    getTemplateCategories(id),
  ]);

  if (!templateResponse.success || !templateResponse.data) {
    notFound();
  }

  const template = templateResponse.data;
  const categories = categoriesResponse.success ? categoriesResponse.data : [];

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/audit/workpapers/templates">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{template.name}</h1>
                <p className="text-muted-foreground mt-1">{template.standard}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {template.is_active ? (
                <Badge className="bg-green-500">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
              <Link href={`/dashboard/audit/workpapers/templates/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Template
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Template Details */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Template Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Description</p>
                <p className="mt-1 text-sm">{template.description || "No description"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Version</p>
                <p className="mt-1 text-sm">{template.version || "1.0"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Created</p>
                <p className="mt-1 text-sm">
                  {template.created_at
                    ? format(new Date(template.created_at), "MMMM d, yyyy")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Last Updated</p>
                <p className="mt-1 text-sm">
                  {template.updated_at
                    ? format(new Date(template.updated_at), "MMMM d, yyyy")
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>

          {/* Categories Section */}
          <Tabs defaultValue="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="categories" className="gap-2">
                  <Layers className="h-4 w-4" />
                  Categories ({categories.length})
                </TabsTrigger>
              </TabsList>
              <Link href={`/dashboard/audit/workpapers/templates/${id}/categories/new`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </Link>
            </div>

            <TabsContent value="categories" className="space-y-4">
              <TemplateCategoriesTable categories={categories} templateId={id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
