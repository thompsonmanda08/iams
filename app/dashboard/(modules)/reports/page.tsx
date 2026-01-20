import { Suspense } from "react";
import { FileText, FileBarChart, FileClock, FileCheck } from "lucide-react";
import PageHeader from "@/components/page-header";
import Loader from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ReportsTable } from "./_components/reports-table";
import { CreateReportDialog } from "./_components/create-report-dialog";
import { getReports } from "@/app/_actions/reports-actions";
import type { ReportStatus } from "@/lib/types/report-types";
import Link from "next/link";

export default async function ReportsPage({
  searchParams
}: {
  params?: Promise<{ id: string }>;
  searchParams?: Promise<{
    page?: string;
    page_size?: string;
    tab?: string;
  }>;
}) {
  const urlSearchParams = await searchParams;

  const page = urlSearchParams?.page ? Number(urlSearchParams.page) : 1;
  const pageSize = urlSearchParams?.page_size ? Number(urlSearchParams.page_size) : 10;
  const activeTab = urlSearchParams?.tab || "all";

  // Map tab to status filter
  const statusFilter: ReportStatus =
    activeTab === "published" ? "PUBLISHED" : activeTab === "archived" ? "ARCHIVED" : "DRAFT";

  // Fetch reports
  const reportsResponse = await getReports({
    page,
    page_size: pageSize,
    status: statusFilter
  });

  const reports = Array.isArray(reportsResponse.data?.data) ? reportsResponse.data.data : [];
  const pagination = reportsResponse?.data?.pagination || null;

  // Get counts for each status in parallel
  const [draftReportsResponse, publishedReportsResponse] = await Promise.all([
    getReports({ page: 1, page_size: 1, status: "DRAFT" }),
    getReports({ page: 1, page_size: 1, status: "PUBLISHED" })
  ]);

  const counts = {
    all: pagination?.total || 0,
    draft: draftReportsResponse?.data?.pagination?.total || 0,
    published: publishedReportsResponse?.data?.pagination?.total || 0
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Reports"
              description="View, manage and export audit reports"
              classNames={{
                container: "flex items-center gap-4",
                title: "text-3xl font-bold text-foreground"
              }}
              customIcon={
                <div className="relative">
                  <div className="gradient-blue absolute inset-0 rounded-2xl opacity-40 blur-lg"></div>
                  <div className="gradient-blue relative rounded-2xl p-3 shadow-lg">
                    <FileBarChart className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              }
            />
            <CreateReportDialog />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue={activeTab} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="grid h-11 w-auto min-w-full grid-cols-3 gap-1 lg:gap-3">
              <Link href="?tab=all">
                <TabsTrigger value="all" className="w-full gap-2">
                  <FileText className="h-5 w-5" />
                  All Reports
                  {counts.all > 0 && (
                    <span className="bg-muted text-primary ml-1 rounded-full px-2 py-0.5 text-xs">
                      {counts.all}
                    </span>
                  )}
                </TabsTrigger>
              </Link>
              <Link href="?tab=draft">
                <TabsTrigger value="draft" className="w-full gap-2">
                  <FileClock className="h-5 w-5 text-amber-500" />
                  Drafts
                  {counts.draft > 0 && (
                    <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      {counts.draft}
                    </span>
                  )}
                </TabsTrigger>
              </Link>
              <Link href="?tab=published">
                <TabsTrigger value="published" className="w-full gap-2">
                  <FileCheck className="h-5 w-5 text-green-500" />
                  Published
                  {counts.published > 0 && (
                    <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                      {counts.published}
                    </span>
                  )}
                </TabsTrigger>
              </Link>
            </TabsList>
          </div>

          <TabsContent value="all">
            <Suspense fallback={<TableLoading />}>
              <Card className="p-4">
                <div className="mb-4 space-y-1">
                  <h4 className="text-sm leading-none font-medium">All Reports</h4>
                  <p className="text-muted-foreground text-sm">
                    View all generated reports across your audit engagements
                  </p>
                </div>
                {reports.length > 0 && (
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Showing {reports.length} report{reports.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                <ReportsTable reports={reports} pagination={pagination as any} />
              </Card>
            </Suspense>
          </TabsContent>

          <TabsContent value="draft">
            <Suspense fallback={<TableLoading />}>
              <Card className="p-4">
                <div className="mb-4 space-y-1">
                  <h4 className="text-sm leading-none font-medium">Draft Reports</h4>
                  <p className="text-muted-foreground text-sm">
                    Reports that are still being worked on and have not been published
                  </p>
                </div>
                {reports.length > 0 && (
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Showing {reports.length} draft{reports.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                <ReportsTable reports={reports} pagination={pagination as any} />
              </Card>
            </Suspense>
          </TabsContent>

          <TabsContent value="published">
            <Suspense fallback={<TableLoading />}>
              <Card className="p-4">
                <div className="mb-4 space-y-1">
                  <h4 className="text-sm leading-none font-medium">Published Reports</h4>
                  <p className="text-muted-foreground text-sm">
                    Finalized reports that have been published and distributed
                  </p>
                </div>
                {reports.length > 0 && (
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Showing {reports.length} published report{reports.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                <ReportsTable reports={reports} pagination={pagination as any} />
              </Card>
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TableLoading() {
  return (
    <div className="space-y-3">
      <Loader size={32} loadingText="Loading reports..." />
    </div>
  );
}
