import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, ListCheck, ClipboardListIcon } from "lucide-react";
import Link from "next/link";
import { AuditPlansTable } from "@/app/dashboard/(modules)/audit/plans/_components/audit-plans-table";
import { getAuditPlans } from "@/app/_actions/audit-module-actions";
import PageHeader from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import Loader from "@/components/ui/loader";

export default async function AuditPlansPage() {
  const plansResponse = await getAuditPlans();
  const plans = plansResponse.success ? plansResponse.data || [] : [];

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Audit Plans"
              description="  Manage and track all audit plans and schedules"
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
              <Link href="/dashboard/audit/plans/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Audit Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Results Summary */}
          {plans && plans.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {plans.length} audit plan{plans.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Table */}
          <Suspense fallback={<TableLoading />}>
            <AuditPlansTable plans={plans} />
          </Suspense>
        </div>
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
