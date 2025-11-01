import { notFound } from "next/navigation";
import { ActionDetails } from "../action-details";
import { log } from "console";
import { getRisk } from "@/app/_actions/risk-module-actions";

// Mock data - replace with actual data fetching
const mockActionDetails = {
  id: "8b08ab2b-8c0b-4429-9078-4aa60e0815a",
  risk: {
    title: "Infrastructure Risk",
    description:
      "Damage to Buildings and Facilities. Structural damage or collapse of offices, factories, or warehouses"
  },
  requiredAction: "Testing",
  actionType: "Primary",
  dueDate: "10/17/2025",
  frequency: "Monthly",
  status: "Active",
  progress: 0,
  weight: 1000
};

export default async function ActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log("Action ID:", id);
  const response = await getRisk(id);
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

  console.log("RES ACTION:", actions);

  return (
    <main className="bg-background min-h-screen">
      <ActionDetails action={mockActionDetails} />
    </main>
  );
}
