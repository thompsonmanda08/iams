"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RiskOverview from "./risk-overview";
import KriMonitoring from "./kri-monitoring";
import AuditStatus from "./audit-status";
import FindingsTracker from "./findings-tracker";
import SystemHealth from "./system-health";

export default function Dashboard() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto space-y-6 py-8">
        {/* Executive Overview Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-foreground text-3xl font-bold">48</div>
              <p className="text-muted-foreground mt-1 text-xs">
                <span className="text-destructive">12 HIGH</span> •{" "}
                <span className="text-amber-active">22 MEDIUM</span> •{" "}
                <span className="text-state-node-final">14 LOW</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                KRI Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-foreground text-3xl font-bold">28</div>
              <p className="text-muted-foreground mt-1 text-xs">
                <span className="text-state-node-final">18 Green</span> •{" "}
                <span className="text-amber-active">7 Amber</span> •{" "}
                <span className="text-destructive">3 Red</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Active Audits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-foreground text-3xl font-bold">5</div>
              <p className="text-muted-foreground mt-1 text-xs">3 in progress • 2 scheduled</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Open Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-foreground text-3xl font-bold">16</div>
              <p className="text-muted-foreground mt-1 text-xs">4 awaiting response</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-muted grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="risks">Risk Management</TabsTrigger>
            <TabsTrigger value="kri">KRI Monitoring</TabsTrigger>
            <TabsTrigger value="audit">Audit & Findings</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RiskOverview />
              <KriMonitoring />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AuditStatus />
              <FindingsTracker />
            </div>
          </TabsContent>

          {/* Risk Management Tab */}
          <TabsContent value="risks" className="mt-6 space-y-6">
            <RiskOverview />
          </TabsContent>

          {/* KRI Monitoring Tab */}
          <TabsContent value="kri" className="mt-6 space-y-6">
            <KriMonitoring />
          </TabsContent>

          {/* Audit & Findings Tab */}
          <TabsContent value="audit" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AuditStatus />
              <FindingsTracker />
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system" className="mt-6 space-y-6">
            <SystemHealth />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
