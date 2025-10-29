import BackButton from "@/components/back-button";
import RiskAcceptanceForm from "@/components/forms/risk-acceptance-form";
export default function RiskAcceptancePage() {
  return (
    <main className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <BackButton title="Back to Actions" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Acceptance</h1>
            <p className="text-muted-foreground mt-1 text-sm">Complete all sections for risk acceptance approval</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <RiskAcceptanceForm />
      </div>
    </main>
  );
}
