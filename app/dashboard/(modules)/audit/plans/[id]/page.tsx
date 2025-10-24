import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Users, TrendingUp, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditStatusBadge } from "@/components/audit/audit-status-badge";
import Link from "next/link";
import { getAuditPlan, getWorkpapers, getFindings } from "@/app/_actions/audit-module-actions";
import { format } from "date-fns";
import { AuditFindingsTab } from "@/components/audit/audit-findings-tab";
import { AuditWorkpapersTab } from "@/components/audit/audit-workpapers-tab";
import { AuditPlan } from "@/lib/types/audit-types";

interface AuditDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const { id } = await params;

  const [auditResponse, workpapersResponse, findingsResponse] = await Promise.all([
    getAuditPlan(id),
    getWorkpapers(id),
    getFindings({ search: "" })
  ]);

  if (!auditResponse.success || !auditResponse.data) {
    notFound();
  }

  const auditPlan = auditResponse.data as AuditPlan;
  const workpapers = workpapersResponse.success ? workpapersResponse.data : [];

  const allFindings = findingsResponse.success ? findingsResponse.data : [];
  const findings = allFindings.filter((f: any) => f.auditId === id);

  // Calculate stats
  const stats = {
    total: findings.length,
    open: findings.filter((f: any) => f.status === "open").length,
    inProgress: findings.filter((f: any) => f.status === "in-progress").length,
    resolved: findings.filter((f: any) => f.status === "resolved").length
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/audit/plans">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{auditPlan.title}</h1>
                <p className="text-muted-foreground mt-1">{auditPlan.standard}</p>
              </div>
            </div>
            <AuditStatusBadge status={auditPlan.status} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Timeline</p>
                  <p className="text-sm font-semibold">
                    {format(new Date(auditPlan.startDate), "MMM d")} -{" "}
                    {format(new Date(auditPlan.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Team Leader</p>
                  <p className="text-sm font-semibold">{auditPlan.teamLeader}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Conformity Rate</p>
                  <p className="text-sm font-semibold">
                    {auditPlan.conformityRate ? `${auditPlan.conformityRate}%` : "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Findings</p>
                  <p className="text-sm font-semibold">{findings.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Progress */}
          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="text-muted-foreground h-5 w-5" />
                  <span className="font-semibold">Audit Progress</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {auditPlan.progress}% complete
                </span>
              </div>
              <Progress value={auditPlan.progress} className="h-2" />
            </div>
          </Card>

          {/* Audit Details */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Audit Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Objectives</p>
                <p className="mt-1 text-sm">{auditPlan.objectives}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Scope</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {auditPlan.scope.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Team Members</p>
                <p className="mt-1 text-sm">{auditPlan.teamMembers.join(", ")}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Created</p>
                <p className="mt-1 text-sm">
                  {format(new Date(auditPlan.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="workpapers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="workpapers">Workpapers ({workpapers.length})</TabsTrigger>
              <TabsTrigger value="findings">Findings ({findings.length})</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="workpapers" className="space-y-4">
              <AuditWorkpapersTab workpapers={workpapers} />
            </TabsContent>

            <TabsContent value="findings" className="space-y-4">
              <AuditFindingsTab stats={stats} findings={findings} />
            </TabsContent>

            <TabsContent value="history">
              <Card className="p-12 text-center">
                <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">Audit History</h3>
                <p className="text-muted-foreground text-sm">Activity timeline coming soon</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
