import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state that mirrors the ReportBuilder layout: header bar with action
 * buttons, left-rail TOC + report details card, and a stack of section rows.
 * Replaces the spinner so users see structural context while the report
 * fetches.
 */
export function ReportBuilderSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 p-1">
      {/* Header */}
      <div className="border-border bg-background sticky top-0 z-30 border-b pb-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md lg:hidden" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>
      </div>

      {/* Body: TOC + Sections */}
      <div className="flex flex-1 gap-6">
        {/* Left rail */}
        <aside className="hidden w-72 shrink-0 space-y-4 lg:block">
          <div className="border-border rounded-lg border p-4">
            <Skeleton className="mb-3 h-4 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4" style={{ width: `${60 + (i % 4) * 10}%` }} />
              ))}
            </div>
          </div>

          <Skeleton className="h-10 w-full rounded-lg" />

          <div className="border-border rounded-lg border p-4">
            <Skeleton className="mb-3 h-4 w-24" />
            <div className="space-y-2.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3" style={{ width: `${30 + (i * 7) % 40}%` }} />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Section rows */}
        <div className="flex-1 space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="border-border bg-card flex items-center gap-3 rounded-lg border p-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-7 w-7 rounded" />
                <Skeleton className="h-7 w-7 rounded" />
                <Skeleton className="h-7 w-7 rounded" />
                <Skeleton className="h-7 w-7 rounded" />
              </div>
            </div>
          ))}
          <Skeleton className="h-12 w-full rounded-lg border-dashed" />
        </div>
      </div>
    </div>
  );
}
