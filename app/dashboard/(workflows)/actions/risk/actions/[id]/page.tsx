import { ActionDetails } from "../action-details";
import { getRisk } from "@/app/_actions/risk-module-actions";

export default async function ActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const response = await getRisk(id);
  const data = response.success && response.data.data ? response.data.data : null;
  const actions = data || [];

  return (
    <main className="bg-background min-h-screen">
      <ActionDetails action={actions} />
    </main>
  );
}
