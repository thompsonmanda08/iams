import { getRiskMatrix } from "@/app/_actions/config-actions";
import { RiskScalesManager } from "../../_components/risk-scales-manager";
import BackButton from "@/components/back-button";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MatrixScalesPage({ params }: PageProps) {
  const { id } = await params;

  const response = await getRiskMatrix(id);

  const matrix = response?.data;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-6 px-4">
        <BackButton title="Back to Configurations" />
        <div className="mb-2">
          <h1 className="text-foreground text-3xl font-bold">{matrix.name}</h1>
          <p className="text-muted-foreground mt-1">
            Configure likelihood scales, impact scales, and rating levels
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4">
        <RiskScalesManager matrixId={id} />
      </main>
    </div>
  );
}
