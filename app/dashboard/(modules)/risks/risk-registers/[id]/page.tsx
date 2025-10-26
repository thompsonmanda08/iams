import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getRiskRegister, getRisks } from "@/app/_actions/risk-module-actions";
import RisksTable from "../../_components/risks-table";
import CreateRiskDialog from "../../_components/create-risk-dialog";

type PageProps = {
  params: {
    id: string;
  };
  searchParams: {
    search?: string;
    category?: string;
    status?: string;
    page?: string;
  };
};

export default async function RisksPage({ params, searchParams }: PageProps) {
  const { id } = params;
  const search =  "";
  const category =  "all";
  const status = searchParams.status || "all";
  const page =  1;
  const limit = 10;

  // Fetch register and risks data server-side
  const [registerResponse, risksResponse] = await Promise.all([
    getRiskRegister(id),
    getRisks({
      page,
      limit,
      search,
      category: category === "all" ? undefined : category,
      status: status === "all" ? undefined : status,
      sortBy: "updatedAt",
      sortOrder: "desc"
    })
  ]);

  if (!registerResponse.success || !registerResponse.data) {
    notFound();
  }

  const register = registerResponse.data;
  const risks = risksResponse.success && risksResponse.data ? risksResponse.data.data : [];
  const meta =
    risksResponse.success && risksResponse.data
      ? risksResponse.data.meta
      : {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        };

  // Calculate stats
  const stats = {
    total: meta.total,
    critical: risks.filter((r: any) => r.riskMagnitude === "critical").length,
    high: risks.filter((r: any) => r.riskMagnitude === "high").length,
    open: risks.filter((r: any) => r.status === "open").length
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto py-6">
          <div className="mb-2">
            <Link href="/dashboard/risks/risk-registers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Registers
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground text-3xl font-bold">{register.name}</h1>
              <p className="text-muted-foreground mt-1">Manage and monitor organizational risks</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/risks/risk-registers/${id}/heat-map`}>
                <Button variant="outline" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Heat Map
                </Button>
              </Link>
              <Link href={`/dashboard/risks/risk-registers/${id}/kri`}>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  KRI Dashboard
                </Button>
              </Link>
              <CreateRiskDialog registerId={id} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto grid grid-cols-1 gap-4  py-8 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Risks</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Critical Risks</p>
              <p className="text-2xl font-bold">{stats.critical}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">High Risks</p>
              <p className="text-2xl font-bold">{stats.high}</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Open Risks</p>
              <p className="text-2xl font-bold">{stats.open}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Table */}
      <div className="py-8">
        <Suspense fallback={<div className="container mx-auto px-4">Loading...</div>}>
          <RisksTable
            risks={risks}
            meta={meta}
            registerId={id}
            currentSearch={search}
            currentCategory={category}
            currentStatus={status}
          />
        </Suspense>
      </div>
    </div>
  );
}
