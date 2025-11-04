import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { getWorkingPaperTemplates } from "@/app/_actions/audit-module-actions";
import { WorkpaperTemplatesTable } from "@/app/dashboard/system-configs/audit-settings/_components/workpaper-templates-table";
import PageHeader from "@/components/page-header";

export default async function WorkpaperTemplatesPage() {
  const templatesResponse = await getWorkingPaperTemplates();
  const templates = templatesResponse.success ? templatesResponse.data?.data : [];



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

            <div className="flex gap-2">
              <Link href="/dashboard/system-configs/audit-settings/templates/new/CUSTOM">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Custom Template
                </Button>
              </Link>
              <Link href="/dashboard/system-configs/audit-settings/templates/new/GENERAL">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create General Template
                </Button>
              </Link>
              <Link href="/dashboard/system-configs/audit-settings/templates/new/ISO27001">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create ISO27001 Template
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
