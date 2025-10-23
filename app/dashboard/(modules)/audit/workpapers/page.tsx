import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { WorkpapersTable } from "@/components/audit/workpapers-table";
import { getWorkpapers } from "@/app/_actions/audit-module-actions";

export default async function WorkpapersPage() {
  const workpapersResponse = await getWorkpapers();
  const workpapers = workpapersResponse.success ? workpapersResponse.data : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Audit Workpapers</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Document audit testing procedures and evidence
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Workpaper
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Results Summary */}
          {workpapers && workpapers.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {workpapers.length} workpaper{workpapers.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Table */}
          <Suspense fallback={<TableLoading />}>
            <WorkpapersTable workpapers={workpapers || []} />
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
        <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
