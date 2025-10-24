import { ActionsTable } from "./actions-table";
const mockActions = [
  {
    id: "ACT-2025813-12351354175488",
    actionId: "8b08ab2b-8c0b-4429-9078-4aa60e0815a",
    risk: {
      title: "Infrastructure Risk",
      description:
        "Damage to Buildings and Facilities. Structural damage or collapse of offices, factories, or warehouses"
    },
    action: "Testing",
    type: "Primary",
    dueDate: "10/17/2025",
    weight: "100.00%",
    updatesFrequency: "Monthly",
    progress: 0,
    status: "Active"
  }
];

export default function ActionsPage() {
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
        <ActionsTable actions={mockActions} />
      </div>
    </main>
  );
}
