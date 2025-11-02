import { initializeSystemSetup } from "@/app/_actions/auth-actions";
import { ActionDetails } from "../action-details";
import { getRisk, getRisks } from "@/app/_actions/risk-module-actions";
import { User } from "@/lib/types/account";

export default async function ActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const systemInit = await initializeSystemSetup();
  const user = systemInit?.data?.user as User;

  const response = await getRisks({
    risk_owner_id: user?.id
  });
  // const response = await getRisk(id);
  const data = response.success && response.data[0] ? response.data[0] : null;
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
      <ActionDetails action={data} />
    </main>
  );
}
