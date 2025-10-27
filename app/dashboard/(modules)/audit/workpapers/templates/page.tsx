import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { getWorkingPaperTemplates } from "@/app/_actions/audit-module-actions";
import { WorkpaperTemplatesTable } from "@/components/audit/workpaper-templates-table";

export default async function WorkpaperTemplatesPage() {
  const templatesResponse = await getWorkingPaperTemplates();
  const templates = templatesResponse.success ? templatesResponse.data?.data?.data : [];

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Working Paper Templates</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage working paper templates and their categories
              </p>
            </div>
            <div className="flex gap-2">
              {/* <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button> */}
              <Link href="/dashboard/audit/workpapers/templates/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Template
                </Button>
              </Link>
            </div>
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
