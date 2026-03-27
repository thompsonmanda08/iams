import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import CreateRiskRegisterDialog from "@/components/forms/create-risk-register-dialog";
import { getRiskRegisters } from "@/app/_actions/risk-module-actions";
import RiskRegistersTable from "../_components/risk-registers-table";
import PageHeader from "@/components/page-header";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    page_size?: string;
  }>;
};

export default async function RiskRegistersPage({ searchParams }: PageProps) {
  const { page = "1", page_size = "10" } = await searchParams;

  const response = await getRiskRegisters({
    page: Number(page),
    page_size: Number(page_size)
  });

  const data = response.success && response.data ? response.data : null;
  const registers = data?.data || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };

  const stats = {
    total: pagination.total,
    open: registers.filter((r: any) => r.status === "OPEN").length,
    closed: registers.filter((r: any) => r.status === "CLOSED").length,
    overdue: registers.filter((r: any) => r.timeline_status === "OVERDUE").length
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <PageHeader
            title="Risk Registers"
            description="Manage and organize your risk assessment registers"
            icon="FileText"
          />

          <CreateRiskRegisterDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto grid grid-cols-1 gap-4 px-4 py-8 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Registers</p>
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
              <p className="text-muted-foreground text-sm">Open</p>
              <p className="text-2xl font-bold">{stats.open}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Overdue</p>
              <p className="text-2xl font-bold">{stats.overdue}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Closed</p>
              <p className="text-2xl font-bold">{stats.closed}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Table */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <RiskRegistersTable
            registers={registers}
            pagination={pagination}
          />
        </Suspense>
      </div>
    </div>
  );
}
