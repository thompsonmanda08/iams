import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, ClipboardCheckIcon } from "lucide-react";
import Link from "next/link";
import { AuditMetricsCards } from "@/components/audit/audit-metrics-cards";
import { ConformityChart } from "@/components/audit/conformity-chart";
import { RecentActivity } from "@/components/audit/recent-activity";
import { getAuditMetrics } from "@/app/_actions/audit-module-actions";
import PageHeader from "@/components/page-header";

export default async function AuditDashboardPage() {
  const metricsResponse = await getAuditMetrics();
  const metrics = metricsResponse.success ? metricsResponse.data : null;

  // Mock data for charts - replace with real data from server actions later
  const conformityTrendData = [
    { month: "Jul", conformityRate: 75, nonConformities: 8 },
    { month: "Aug", conformityRate: 78, nonConformities: 7 },
    { month: "Sep", conformityRate: 82, nonConformities: 5 },
    { month: "Oct", conformityRate: 85, nonConformities: 4 },
    { month: "Nov", conformityRate: 88, nonConformities: 3 },
    { month: "Dec", conformityRate: 90, nonConformities: 2 }
  ];

  const recentActivities = [
    {
      id: "1",
      type: "created" as const,
      description: "New audit plan created for Q1 2025",
      user: "John Doe",
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
    },
    {
      id: "2",
      type: "finding-added" as const,
      description: "Critical finding added to Security Controls Review",
      user: "Jane Smith",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: "3",
      type: "workpaper-completed" as const,
      description: "Workpaper for Clause 8.2 completed",
      user: "Mike Johnson",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    },
    {
      id: "4",
      type: "status-changed" as const,
      description: "Audit status changed to In Progress",
      user: "Sarah Williams",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    }
  ];

  return (
    <div className="bg-background min-h-screen">
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
              <Link href="/dashboard/audit/plans/new">
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
            <AuditMetricsCards metrics={metrics} />
          </Suspense>

          {/* Charts and Activity */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ConformityChart data={conformityTrendData} />
            </div>
            <div>
              <RecentActivity activities={recentActivities} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Link href="/dashboard/audit/plans">
              <Card className="cursor-pointer p-6 transition-all hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Audit Plans</h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      View and manage all audit plans
                    </p>
                  </div>
                  <FileText className="text-muted-foreground h-8 w-8" />
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/audit/workpapers">
              <Card className="cursor-pointer p-6 transition-all hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Workpapers</h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Document audit testing procedures
                    </p>
                  </div>
                  <FileText className="text-muted-foreground h-8 w-8" />
                </div>
              </Card>
            </Link>
          </div>
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
