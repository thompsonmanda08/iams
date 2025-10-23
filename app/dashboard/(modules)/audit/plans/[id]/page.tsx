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
import { WorkpapersTable } from "@/components/audit/workpapers-table";
import { FindingsTable } from "@/components/audit/findings-table";

interface AuditDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const { id } = params;

  const [auditResponse, workpapersResponse, findingsResponse] = await Promise.all([
    getAuditPlan(id),
    getWorkpapers(id),
    getFindings({ search: "" }),
  ]);

  if (!auditResponse.success || !auditResponse.data) {
    notFound();
  }

  const auditPlan = auditResponse.data;
  const workpapers = workpapersResponse.success ? workpapersResponse.data : [];
  const allFindings = findingsResponse.success ? findingsResponse.data : [];
  const findings = allFindings.filter((f: any) => f.auditId === id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p className="text-sm font-semibold">
                    {format(new Date(auditPlan.startDate), "MMM d")} -{" "}
                    {format(new Date(auditPlan.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Team Leader</p>
                  <p className="text-sm font-semibold">{auditPlan.teamLeader}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conformity Rate</p>
                  <p className="text-sm font-semibold">
                    {auditPlan.conformityRate ? `${auditPlan.conformityRate}%` : "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Findings</p>
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
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">Audit Progress</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {auditPlan.progress}% complete
                </span>
              </div>
              <Progress value={auditPlan.progress} className="h-2" />
            </div>
          </Card>

          {/* Audit Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Audit Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Objectives</p>
                <p className="mt-1 text-sm">{auditPlan.objectives}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scope</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {auditPlan.scope.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="mt-1 text-sm">{auditPlan.teamMembers.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="mt-1 text-sm">
                  {format(new Date(auditPlan.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="workpapers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="workpapers">
                Workpapers ({workpapers.length})
              </TabsTrigger>
              <TabsTrigger value="findings">
                Findings ({findings.length})
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="workpapers" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Audit Workpapers</h3>
                <Button>Add Workpaper</Button>
              </div>
              <WorkpapersTable workpapers={workpapers} />
            </TabsContent>

            <TabsContent value="findings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Audit Findings</h3>
                <Button>Add Finding</Button>
              </div>
              <FindingsTable findings={findings} />
            </TabsContent>

            <TabsContent value="history">
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Audit History</h3>
                <p className="text-sm text-muted-foreground">
                  Activity timeline coming soon
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
