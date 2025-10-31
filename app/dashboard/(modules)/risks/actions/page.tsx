import { getRisks } from "@/app/_actions/risk-module-actions";
import { ActionsTable } from "./actions-table";
import { verifySession } from "@/lib/session";

export default async function ActionsPage() {
  const session = await verifySession();
  console.log("USERS:", session);
  const response = await getRisks({
    risk_owner_id: ""
  });
  const data = response.success && response.data ? response.data : null;
  const actions = data?.data || [];
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Actions</h1>
            <p className="text-muted-foreground mt-1 text-sm">Your Active Risk Actions</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <ActionsTable actions={actions} pagination={pagination} />
      </div>
    </main>
  );
}
