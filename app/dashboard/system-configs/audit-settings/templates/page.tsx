import { Suspense } from "react";
import { getWorkingPaperTemplates } from "@/app/_actions/audit-module-actions";
import { WorkpaperTemplatesTable } from "@/app/dashboard/system-configs/audit-settings/_components/workpaper-templates-table";
import { CreateWorkpaperTemplateDialog } from "@/app/dashboard/system-configs/audit-settings/_components/create-workpaper-dialog";
import PageHeader from "@/components/page-header";

export default async function WorkpaperTemplatesPage() {
  const templatesResponse = await getWorkingPaperTemplates();
  const rawTemplates = templatesResponse.success ? (templatesResponse.data?.data ?? []) : [];

  // Sort newest first
  const templates = [...rawTemplates].sort(
    (a: any, b: any) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );



  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Working Paper Templates"
              description="Manage working paper templates and their categories"
              icon="FileCode2"
            />

            <CreateWorkpaperTemplateDialog showTrigger={true} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Results Summary */}
          {templates && templates.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {templates.length} template{templates.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Table */}
          <Suspense fallback={<TableLoading />}>
            <WorkpaperTemplatesTable templates={templates || []} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function TableLoading() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}
