import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RiskOverview from "./risk-overview";
import KriMonitoring from "./kri-monitoring";
import AuditStatus from "./audit-status";
import FindingsTracker from "./findings-tracker";
import SystemHealth from "./system-health";
import { getDashboardStats } from "@/app/_actions/reports-actions";

export default async function Dashboard() {
  const data = await getDashboardStats();

  // Calculate stats
  const totalRisks = data.data.overview.total_risks || 0;
  const highRisks = data.data.risk_summary.risks_by_rating.High || 0;
  const mediumRisks = data.data.risk_summary.risks_by_rating.Normal || 0;
  const lowRisks = data.data.risk_summary.risks_by_rating.Low || 0;

  const totalKris = data.data.overview.total_kris;
  const greenKris = data.data.kri_summary.kris_by_status.Green || 0;
  const amberKris = 0; // Add to API response
  const redKris = data.data.kri_summary.kris_in_breach;

  const activeAudits = data.data.audit_summary.active_audit_plans;
  const scheduledAudits =
    data.data.audit_summary.total_audit_plans -
    data.data.audit_summary.active_audit_plans -
    data.data.audit_summary.completed_audit_plans;

  const openFindings = data.data.audit_findings.filter((f:any) => f.status === "OPEN").length;
  const awaitingResponse = data.data.audit_findings.filter(
    (f:any) => f.status === "OPEN" && !f.severity
  ).length;

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto space-y-6 py-8">
        {/* Executive Overview Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card p-0">
            <div className="py-4">
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Total Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-3xl font-bold">{totalRisks}</div>
                <p className="text-muted-foreground mt-1 text-xs">
                  <span className="text-destructive">{highRisks} HIGH</span> •{" "}
                  <span className="text-amber-active">{mediumRisks} MEDIUM</span> •{" "}
                  <span className="text-state-node-final">{lowRisks} LOW</span>
                </p>
              </CardContent>
            </div>
          </Card>

          <Card className="border-border bg-card p-0">
            <div className="py-4">
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  KRI Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-3xl font-bold">{totalKris}</div>
                <p className="text-muted-foreground mt-1 text-xs">
                  <span className="text-state-node-final">{greenKris} Green</span> •{" "}
                  <span className="text-amber-active">{amberKris} Amber</span> •{" "}
                  <span className="text-destructive">{redKris} Red</span>
                </p>
              </CardContent>
            </div>
          </Card>

          <Card className="border-border bg-card p-0">
            <div className="py-4">
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Active Audits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-3xl font-bold">{activeAudits}</div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {activeAudits} in progress • {scheduledAudits} scheduled
                </p>
              </CardContent>
            </div>
          </Card>

          <Card className="border-border bg-card p-0">
            <div className="py-4">
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Open Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-3xl font-bold">{openFindings}</div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {awaitingResponse} awaiting response
                </p>
              </CardContent>
            </div>
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
              <RiskOverview riskSummary={data.data.risk_summary} />
              <KriMonitoring kriSummary={data.data.kri_summary} />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AuditStatus auditSummary={data.data.audit_summary} />
              <FindingsTracker findings={data.data.audit_findings} />
            </div>
          </TabsContent>

          {/* Risk Management Tab */}
          <TabsContent value="risks" className="mt-6 space-y-6">
            <RiskOverview riskSummary={data.data.risk_summary} />
          </TabsContent>

          {/* KRI Monitoring Tab */}
          <TabsContent value="kri" className="mt-6 space-y-6">
            <KriMonitoring kriSummary={data.data.kri_summary} />
          </TabsContent>

          {/* Audit & Findings Tab */}
          <TabsContent value="audit" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AuditStatus auditSummary={data.data.audit_summary} />
              <FindingsTracker findings={data.data.audit_findings} />
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system" className="mt-6 space-y-6">
            <SystemHealth systemHealth={data.data.system_health} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
