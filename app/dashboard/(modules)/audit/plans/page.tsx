import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardListIcon, FileText } from "lucide-react";
import Link from "next/link";
import { AuditPlansTable } from "@/app/dashboard/(modules)/audit/plans/_components/audit-plans-table";
import { getAuditPlans, getAnnualAuditPlans } from "@/app/_actions/audit-module-actions";
import PageHeader from "@/components/page-header";
import Loader from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuditAnnualPlan from "./_components/annaul-plans";
import { Card } from "@/components/ui/card";

export default async function AuditPlansPage() {
  const plansResponse = await getAuditPlans();
  const plans = plansResponse.success ? plansResponse.data || [] : [];

  // Fetch annual audit plans
  const annualPlansResponse = await getAnnualAuditPlans();
  const annualPlans = annualPlansResponse.success ? annualPlansResponse.data || [] : [];

  // console.log({ plans, annualPlans });

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Audit Plans"
              description="Manage and track all audit plans and schedules"
              classNames={{
                container: "flex items-center gap-4",
                title: "text-3xl font-bold text-foreground"
              }}
              customIcon={
                <div className="relative">
                  <div className="gradient-blue absolute inset-0 rounded-2xl opacity-40 blur-lg"></div>
                  <div className="gradient-blue relative rounded-2xl p-3 shadow-lg">
                    <ClipboardListIcon className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              }
            />
            <div className="flex gap-2">
              {/* <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button> */}
              {/* <Link href="/dashboard/audit/plans/engagement/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Audit Plan
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="engagement" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-12 w-auto min-w-full gap-1 lg:gap-3">
              <TabsTrigger value="annual" className="gap-2">
                <FileText className="h-6 w-6" />
                Annual Plans
              </TabsTrigger>
              <TabsTrigger value="engagement" className="gap-2">
                <ClipboardListIcon className="h-6 w-6" />
                Engagements
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="engagement">
            <Suspense fallback={<TableLoading />}>
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm leading-none font-medium">Engagement Plans</h4>
                    <p className="text-muted-foreground text-sm">
                      Plan audits and execute to ensure compliance in your organization
                    </p>
                  </div>
                  <div className="flex items-end gap-2">
                    <Link href="/dashboard/audit/plans/engagement/new">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Audit Plan
                      </Button>
                    </Link>
                  </div>
                </div>
                {/* Results Summary */}
                {plans && plans.length > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Showing {plans.length} audit plan{plans.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                <AuditPlansTable plans={plans} />
              </Card>
            </Suspense>
          </TabsContent>
          <TabsContent value="annual">
            <Suspense fallback={<TableLoading />}>
              <AuditAnnualPlan plans={annualPlans} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TableLoading() {
  return (
    <div className="space-y-3">
      <Loader size={32} loadingText="Please wait..." />
    </div>
  );
}
