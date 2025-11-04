import { ActionDetails } from "../action-details";
import { getRisk, getRisks } from "@/app/_actions/risk-module-actions";
import { User } from "@/lib/types/account";
import { verifySession } from "@/lib/session";

export default async function ActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const response = await getRisk(id);
  const data = response.success && response.data ? response.data : null;
  const actions = data || [];

  return (
    <main className="bg-background min-h-screen">
      <ActionDetails action={actions} />
    </main>
  );
}
