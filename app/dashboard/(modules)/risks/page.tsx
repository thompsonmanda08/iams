import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowRight
} from "lucide-react";

export default function RisksDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Comprehensive risk assessment and monitoring dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Risks</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Risks</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KRIs</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Actions</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Module Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Risk Modules</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Risk Register */}
              <Link href="/dashboard/risks/risk-register">
                <Card className="p-6 transition-all hover:shadow-lg cursor-pointer h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">Risk Register</h3>
                      <p className="text-sm text-muted-foreground">
                        Identify, assess, and manage organizational risks
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Heat Map */}
              <Link href="/dashboard/risks/heat-map">
                <Card className="p-6 transition-all hover:shadow-lg cursor-pointer h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">Risk Heat Map</h3>
                      <p className="text-sm text-muted-foreground">
                        Visual risk assessment matrix and heat map
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* KRI Dashboard */}
              <Link href="/dashboard/risks/kri">
                <Card className="p-6 transition-all hover:shadow-lg cursor-pointer h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">KRI Dashboard</h3>
                      <p className="text-sm text-muted-foreground">
                        Key Risk Indicators monitoring and tracking
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Actions */}
              <Link href="/dashboard/risks/actions">
                <Card className="p-6 transition-all hover:shadow-lg cursor-pointer h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                        <Activity className="h-8 w-8 text-green-600" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">Risk Actions</h3>
                      <p className="text-sm text-muted-foreground">
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
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/risks/risk-register">
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
