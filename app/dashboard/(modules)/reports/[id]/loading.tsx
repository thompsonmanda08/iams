import { FileBarChart, ArrowLeft } from "lucide-react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function ReportDetailsLoading() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/reports">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <PageHeader
                title=""
                description=""
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
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            {/* Status Badge skeleton */}
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content - Report Builder Skeleton */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex h-full flex-col">
          {/* Builder Header skeleton */}
          <div className="border-b border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>

          {/* Main Content skeleton */}
          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar skeleton */}
              <div className="col-span-12 space-y-4 lg:col-span-3">
                {/* Table of Contents skeleton */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <Skeleton className="mb-3 h-5 w-32" />
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>

                {/* Report Details skeleton */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <Skeleton className="mb-3 h-5 w-28" />
                  <div className="space-y-3">
                    <div>
                      <Skeleton className="mb-1 h-3 w-12" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                    <div>
                      <Skeleton className="mb-1 h-3 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div>
                      <Skeleton className="mb-1 h-3 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div>
                      <Skeleton className="mb-1 h-3 w-20" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </div>

                {/* Section Types skeleton */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <Skeleton className="mb-3 h-5 w-28" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3 rounded" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Section Button skeleton */}
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Main Editor skeleton */}
              <div className="col-span-12 space-y-4 lg:col-span-9">
                {/* Section cards skeleton */}
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6" />
                        <div>
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="mt-1 h-3 w-32" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                    {/* Expanded content skeleton */}
                    {i === 0 && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Section Button skeleton */}
                <Skeleton className="h-12 w-full rounded-lg border-2 border-dashed" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
