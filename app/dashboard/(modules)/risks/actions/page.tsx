import { getRisks } from "@/app/_actions/risk-module-actions";
import { ActionsTable } from "./actions-table";
import { initializeSystemSetup } from "@/app/_actions/auth-actions";
import { User } from "@/lib/types/account";
import PageHeader from "@/components/page-header";
import { getUserSession } from "@/lib/session";
export const dynamic = "force-dynamic";

export default async function ActionsPage() {
  // const systemInit = await initializeSystemSetup();
  // const user = systemInit?.data?.user as User;
  const user = await getUserSession();

  const response = await getRisks({
    risk_owner_id: user?.id
  });
  const data = response.success && response.data ? response.data : null;
  const actions = data || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };
  return (
    <main className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="My Actions"
            description="Your Active Risk Actions"
            icon="AlertTriangle"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <ActionsTable actions={actions?.data} pagination={pagination} />
      </div>
    </main>
  );
}
