import { getActions } from "@/app/_actions/risk-module-actions";
import { ActionsTable } from "./actions-table";
import PageHeader from "@/components/page-header";
import { Pagination } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LogsIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface RiskOwner {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  color: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Risk {
  id: string;
  title: string;
  description: string;
  category: Category;
  department: Department;
  risk_owner: RiskOwner;
  status: string;
  department_status: string;
  inherent_likelihood: number;
  inherent_impact: number;
  residual_likelihood: number;
  residual_impact: number;
  risk_response: string;
  target_closing_date: string;
  treatment_plan: string;
  control_effectiveness: number;
  mitigation_cost: number;
  created_at: string;
  updated_at: string;
}

export default async function ActionsPage() {
  const response = await getActions({ page: 1, page_size: 10 });
  const actions = response.success && response.data?.data ? response.data.data : [];

  const pagination: Pagination = response.data?.pagination || {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };

  console.log("[ACTIONS ]", actions);

  return (
    <main className="min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto flex justify-between px-4 py-6">
          <PageHeader
            title="My Actions"
            description="View risks assigned to you and submit evidence of mitigation actions taken"
            icon="AlertTriangle"
          />
          <div className="flex gap-2 hidden">
            <Link href="/dashboard/risks/actions/logs">
              <Button variant="outline" className="gap-2">
                <LogsIcon className="h-4 w-4" />
                View Action Logs
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <ActionsTable actions={actions} pagination={pagination} />
      </div>
    </main>
  );
}
