import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function KRIPageSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header Skeleton */}
      <div className="bg-card border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>

      {/* Summary Stats Skeleton */}
      <div className="container mx-auto grid grid-cols-1 gap-4 px-4 pt-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>

      {/* KRI Cards Skeleton */}
      <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-l-4 p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, metricIndex) => (
                  <div key={metricIndex} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t pt-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Compact version for when you need fewer skeleton cards
export function KRIPageSkeletonCompact() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header Skeleton */}
      <div className="bg-card border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>

      {/* Summary Stats Skeleton */}
      <div className="container mx-auto grid grid-cols-1 gap-4 px-4 pt-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>

      {/* KRI Cards Skeleton - Fewer cards */}
      <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="border-l-4 p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, metricIndex) => (
                  <div key={metricIndex} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Just the KRI cards grid skeleton (for use with Suspense in specific sections)
export function KRICardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border-l-4 p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, metricIndex) => (
                <div key={metricIndex} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
