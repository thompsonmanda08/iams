import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, TrendingUp, AlertTriangle, Activity, ArrowRight } from "lucide-react";
import PageHeader from "@/components/page-header";

export default function RisksDashboardPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Risk Management"
            description="Comprehensive risk assessment and monitoring dashboard"
            icon="ChartNetwork"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Risks</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">High Risks</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">KRIs</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Open Actions</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Module Cards */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Risk Modules</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Risk Register */}
              <Link href="/dashboard/risks/risk-registers">
                <Card className="h-full cursor-pointer p-6 transition-all hover:shadow-lg">
                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <ArrowRight className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold">Risk Registers</h3>
                      <p className="text-muted-foreground text-sm">
                        Identify, assess, and manage organizational risks
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Heat Map */}
              <Link href="/dashboard/risks/heat-map">
                <Card className="h-full cursor-pointer p-6 transition-all hover:shadow-lg">
                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-950">
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                      </div>
                      <ArrowRight className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold">Risk Heat Map</h3>
                      <p className="text-muted-foreground text-sm">
                        Visual risk assessment matrix and heat map
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* KRI Dashboard */}
              <Link href="/dashboard/risks/kri">
                <Card className="h-full cursor-pointer p-6 transition-all hover:shadow-lg">
                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                      <ArrowRight className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold">KRI Registers</h3>
                      <p className="text-muted-foreground text-sm">
                        Key Risk Indicators monitoring and tracking
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Actions */}
              <Link href="/dashboard/risks/actions">
                <Card className="h-full cursor-pointer p-6 transition-all hover:shadow-lg">
                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                        <Activity className="h-8 w-8 text-green-600" />
                      </div>
                      <ArrowRight className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold">Risk Actions</h3>
                      <p className="text-muted-foreground text-sm">
                        Track and manage risk mitigation actions
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/risks/risk-registers">
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Add New Risk
                </Button>
              </Link>
              <Link href="/dashboard/risks/heat-map">
                <Button variant="outline" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  View Heat Map
                </Button>
              </Link>
              <Link href="/dashboard/risks/kri">
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Monitor KRIs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
