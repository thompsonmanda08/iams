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
    <main>
      <div className="mb-2">
        <h1 className="text-foreground text-3xl font-semibold">Your Active Risk Actions</h1>
        <p className="text-muted-foreground mt-1 text-sm">My Actions</p>
      </div>
      <ActionsTable actions={mockActions} />
    </main>
  );
}
