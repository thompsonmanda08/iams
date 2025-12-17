import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Filter, FileText, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/page-header";


const AcceptanceCardSkeleton = () => {
  return (
    <Card className="p-4 transition-all">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-1 items-start gap-2">
          <Skeleton className="mt-0.5 h-5 w-5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t pt-2">
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="space-y-1 border-t pt-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </Card>
  );
};

export default function RiskAcceptanceListSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Risk Acceptance Log"
            description="Review and manage all risk acceptance requests"
            icon="ClipboardCheck"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Risk Acceptance Requests
            </CardTitle>
            <CardDescription>
              Complete history of all risk acceptance requests with approval status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar Skeleton */}
            <div className="mb-6">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <Tabs value="all">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" disabled>
                  <Skeleton className="h-4 w-16" />
                </TabsTrigger>
                <TabsTrigger value="pending" disabled>
                  <Skeleton className="h-4 w-20" />
                </TabsTrigger>
                <TabsTrigger value="approved" disabled>
                  <Skeleton className="h-4 w-24" />
                </TabsTrigger>
                <TabsTrigger value="rejected" disabled>
                  <Skeleton className="h-4 w-24" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-3">
                <AcceptanceCardSkeleton />
                <AcceptanceCardSkeleton />
                <AcceptanceCardSkeleton />
                <AcceptanceCardSkeleton />
                <AcceptanceCardSkeleton />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton for MyIncidents component
export function MyIncidentsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <Filter className="text-primary h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">Select date range to filter incidents</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Quick Select</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Report Incidents Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">Report Incidents</CardTitle>
              <p className="text-muted-foreground text-sm">View and export incident reports</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-md" />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Skeleton className="h-10 w-64 rounded-md" />
          </div>

          <div className="rounded-lg border">
            <div className="max-h-[600px] overflow-auto py-1">
              <table className="w-full">
                <thead className="bg-background sticky top-0 z-10">
                  <tr className="border-b">
                    <th className="text-muted-foreground h-12 w-12 px-4 text-left align-middle font-medium">
                      #
                    </th>
                    <th className="text-muted-foreground h-12 min-w-[120px] px-4 text-left align-middle font-medium">
                      Incident Date
                    </th>
                    <th className="text-muted-foreground h-12 min-w-[150px] px-4 text-left align-middle font-medium">
                      Department
                    </th>
                    <th className="text-muted-foreground h-12 min-w-[150px] px-4 text-left align-middle font-medium">
                      Primary Cause
                    </th>
                    <th className="text-muted-foreground h-12 min-w-[120px] px-4 text-left align-middle font-medium">
                      Materiality
                    </th>
                    <th className="text-muted-foreground h-12 min-w-[150px] px-4 text-left align-middle font-medium">
                      Location
                    </th>
                    <th className="text-muted-foreground h-12 min-w-[150px] px-4 text-left align-middle font-medium">
                      Responsible Person
                    </th>
                    <th className="text-muted-foreground h-12 min-w-[120px] px-4 text-left align-middle font-medium">
                      Due Date
                    </th>
                    <th className="text-muted-foreground h-12 min-w-[120px] px-4 text-left align-middle font-medium">
                      Status
                    </th>
                    <th className="text-muted-foreground h-12 w-[100px] px-4 text-right align-middle font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4">
                        <Skeleton className="h-4 w-6" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-24 rounded-md" />
                          <Skeleton className="h-8 w-20 rounded-md" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Skeleton */}
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton for EffectsReport component
export function EffectsReportSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <Filter className="text-primary h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">Select date range to filter incidents</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Quick Select</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: AlertCircle, color: "bg-blue-100", iconColor: "text-blue-600" },
          { icon: CheckCircle2, color: "bg-green-100", iconColor: "text-green-600" },
          { icon: Clock, color: "bg-orange-100", iconColor: "text-orange-600" },
          { icon: TrendingUp, color: "bg-purple-100", iconColor: "text-purple-600" }
        ].map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <div className={`rounded-lg ${item.color} p-2`}>
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-9 w-20" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Chart bars skeleton */}
            <div className="flex h-[250px] items-end justify-between gap-2 border-b border-l pb-8 pl-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <Skeleton
                    className="w-full rounded-t-md"
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                  />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton for Finding Information Card
export function FindingInformationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Finding Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Grid Layout for 2x4 fields matching exact structure */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i}>
              <Skeleton className="mb-1 h-2 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Clause Description */}
        <div>
          <Skeleton className="mb-1 h-2 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-5/6" />
        </div>

        {/* Recommendation */}
        <div>
          <Skeleton className="mb-1 h-2 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-4/5" />
        </div>

        {/* Workings & Test Results (conditionally shown) */}
        <div>
          <Skeleton className="mb-1 h-2 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for Action Overview Card
export function ActionOverviewCardSkeleton() {
  return (
    <Card>
      <CardHeader className="">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Description */}
        <div>
          <Skeleton className="mb-1 h-2 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-3/4" />
        </div>

        {/* Separator */}
        <div className="my-2 h-px bg-accent" />

        {/* Details Grid - 6 items (Assigned To, Reviewer, Auditor, Iteration, Due Date, Created) */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <Skeleton className="mb-1 h-2 w-20" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-1 h-2 w-40" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for Finding Evidence Tab Content
export function FindingEvidenceTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>

      {/* Evidence Cards */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-muted/30">
            <CardContent className="">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-40" />
                    <Skeleton className="h-2 w-28" />
                    <Skeleton className="mt-2 h-3 w-full" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-2 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Skeleton for Action Evidence Tab Content
export function ActionEvidenceTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header with button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Evidence Cards */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-muted/50">
            <CardContent className="">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-40" />
                    <Skeleton className="h-2 w-28" />
                    <Skeleton className="mt-2 h-3 w-full" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
                <Skeleton className="h-2 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Skeleton for Reviews Tab Content
export function ReviewsTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header with button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Review Cards */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-muted/50">
            <CardContent className="">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-32" />
                    <Skeleton className="h-2 w-40" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-2 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

