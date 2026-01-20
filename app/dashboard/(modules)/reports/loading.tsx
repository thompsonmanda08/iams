import { FileText, FileBarChart, FileClock, FileCheck } from "lucide-react";
import PageHeader from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportsLoading() {
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
            {/* Button skeleton */}
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {/* Tabs skeleton */}
          <Tabs className="overflow-x-auto">
            <TabsList className="inline-flex h-12 w-auto min-w-full gap-1 lg:gap-3">
              <TabsTrigger value="all" className="gap-2" asChild>
                <FileText className="h-5 w-5" />
                All Reports
              </TabsTrigger>
              <TabsTrigger value="draft" className="gap-2" asChild>
                <FileClock className="h-5 w-5 text-amber-500" />
                Drafts
              </TabsTrigger>
              <TabsTrigger value="published" className="gap-2" asChild>
                <FileCheck className="h-5 w-5 text-green-500" />
                Published
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Card with table skeleton */}
          <Card className="p-4">
            <div className="mb-4 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Table skeleton */}
            <div className="rounded-lg border">
              {/* Table header */}
              <div className="bg-muted/50 flex items-center gap-4 border-b px-4 py-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="ml-auto h-4 w-16" />
              </div>

              {/* Table rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0">
                  {/* Title column */}
                  <div className="w-32 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  {/* Type column */}
                  <Skeleton className="h-6 w-20 rounded-full" />
                  {/* Source column */}
                  <Skeleton className="h-4 w-24" />
                  {/* Created by column */}
                  <div className="w-28 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  {/* Last updated column */}
                  <div className="w-28 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  {/* Status column */}
                  <Skeleton className="h-6 w-16 rounded-full" />
                  {/* Actions column */}
                  <Skeleton className="ml-auto h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
