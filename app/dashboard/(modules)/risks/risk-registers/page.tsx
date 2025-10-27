import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import CreateRiskRegisterDialog from "@/components/forms/create-risk-register-dialog";
import { getRiskRegisters } from "@/app/_actions/risk-module-actions";
import RiskRegistersTable from "../_components/risk-registers-table";

type PageProps = {
  searchParams: {
    search?: string;
    status?: string;
    page?: string;
  };
};

export default async function RiskRegistersPage({ searchParams }: PageProps) {
  const search = searchParams.search || "";
  const status = searchParams.status || "";
  const page =  1;

  const response = await getRiskRegisters({
    name: search || undefined,
    status: status && status !== "all" ? status.toUpperCase() : undefined,
    page,
    page_size: 10,
  });

  const data = response.success && response.data ? response.data : null;
  const registers = data?.data || [];
  const pagination = {
    total: data?.total || 0,
    page: data?.page || 1,
    page_size: data?.page_size || 10,
    total_pages: data?.total_pages || 0,
  };

  const stats = {
    total: pagination.total,
    open: registers.filter((r:any) => r.status === "OPEN").length,
    closed: registers.filter((r:any) => r.status === "CLOSED").length,
    overdue: registers.filter((r:any) => r.timeline_status === "OVERDUE").length,
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto flex items-center justify-between py-6">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Risk Registers</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your risk assessment registers
            </p>
          </div>
          <CreateRiskRegisterDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto grid grid-cols-1 gap-4 py-8 md:grid-cols-4">
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
      <div className="container mx-auto py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <RiskRegistersTable
            registers={registers}
            pagination={pagination}
            currentStatus={status}
            currentSearch={search}
          />
        </Suspense>
      </div>
    </div>
  );
}