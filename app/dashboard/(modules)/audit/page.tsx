import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, ClipboardCheckIcon } from "lucide-react";
import Link from "next/link";
import { AuditMetricsCards } from "@/components/audit/audit-metrics-cards";
import { getAuditMetrics } from "@/app/_actions/audit-module-actions";
import PageHeader from "@/components/page-header";
import { requireModuleView } from "@/lib/permissions/server";
import { MODULE_CODES } from "@/lib/constants/module-codes";

import { AuditPlanAnalytics } from "./_components/audit-plan-analytics";
import { AuditActivitiesDistribution } from "./_components/audit-activities-distribution";
import { AuditStatusDistribution } from "./_components/audit-status-distribution";
import { BudgetAnalytics } from "./_components/budget-analytics";
import { UniverseAnalytics } from "./_components/universe-analytics";

export default async function AuditDashboardPage() {
  await requireModuleView(MODULE_CODES.AUDIT_OVERVIEW);
  const summary = await getAuditMetrics();

  const overviewChartData = [
    { name: "Approved", value: summary?.data?.overview_stats?.approved_audit_count || 0 },
    { name: "In Progress", value: summary?.data?.overview_stats?.in_progress_audit_count || 0 },
    { name: "Upcoming", value: summary?.data?.overview_stats?.upcoming_audit_count || 0 }
  ].filter((item) => item.value > 0) || [];

  const planTypeChartData = [
    { name: "Annual", value: summary?.data?.audit_plan_stats?.annual_count || 0 },
    { name: "Monthly", value: summary?.data?.audit_plan_stats?.monthly_count || 0 },
    { name: "Weekly", value: summary?.data?.audit_plan_stats?.weekly_count || 0 }
  ] .filter((item) => item.value > 0) || [];

  const planQuarterlyData = Object?.entries(summary?.data?.audit_plan_stats?.quarterly_count)?.map(
    ([quarter, count]) => ({
      name: quarter,
      value: count
    })
  ) || [];

  const activitiesQuarterlyData = Object?.entries(
    summary?.data?.audit_activities_stats?.quarterly_count
  )?.map(([quarter, count]) => ({
    name: quarter,
    value: count
  })) || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Audit Dashboard Overview"
              description="Completion rates and audit analytics"
              icon="AlertCircle"
              classNames={{
                container: "flex items-center gap-4",
                title: "text-3xl font-bold text-foreground"
              }}
              customIcon={
                <div className="relative">
                  <div className="gradient-blue absolute inset-0 rounded-2xl opacity-40 blur-lg"></div>
                  <div className="gradient-blue relative rounded-2xl p-3 shadow-lg">
                    <ClipboardCheckIcon className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              }
            />

            <div className="flex gap-2">
              <Link href="/dashboard/audit/plans">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  View All Audits
                </Button>
              </Link>
              <Link href="/dashboard/audit/plans/engagement/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Audit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Metrics Cards */}
          <Suspense fallback={<MetricsLoading />}>
            <AuditMetricsCards metrics={summary?.data?.overview_stats as any} />
          </Suspense>

          {/* Charts Section */}
          <div className="space-y-8">
            <BudgetAnalytics stats={summary?.data?.budget_stats} />

            <AuditStatusDistribution data={overviewChartData} stats={summary?.data?.overview_stats} />

            <AuditPlanAnalytics
              planTypeData={planTypeChartData}
              quarterlyData={planQuarterlyData as any}
              quarterlyStats={summary?.data?.audit_plan_stats?.quarterly_count}
            />

            <UniverseAnalytics stats={summary?.data?.universe_stats} />

            <AuditActivitiesDistribution
              quarterlyData={activitiesQuarterlyData as any}
              stats={summary?.data?.audit_activities_stats}
            />
          </div>

          {/* Quick Actions */}

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common audit management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/audit/plans">
                    <Button className="gap-2">
                      <FileText className="h-4 w-4" />
                      Audit Plans
                    </Button>
                  </Link>
                  <Link href="/dashboard/system-configs/audit-settings/templates">
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Workpaper Templates
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="h-24 animate-pulse space-y-3">
            <div className="bg-muted h-4 w-24 rounded" />
            <div className="bg-muted h-8 w-16 rounded" />
            <div className="bg-muted h-3 w-32 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}
