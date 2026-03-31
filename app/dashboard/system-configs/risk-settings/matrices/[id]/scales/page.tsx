import { getRiskMatrix, getMatrixScales, getMatrixRatingsById } from "@/app/_actions/config-actions";
import { RiskScalesManager } from "../../_components/risk-scales-manager";
import BackButton from "@/components/back-button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MatrixScalesPage({ params }: PageProps) {
  const { id } = await params;

  const [matrixRes, likelihoodRes, impactRes, ratingsRes] = await Promise.all([
    getRiskMatrix(id),
    getMatrixScales(id, "LIKELIHOOD"),
    getMatrixScales(id, "IMPACT"),
    getMatrixRatingsById(id)
  ]);

  const matrix = matrixRes?.data;

  const toArray = (res: any) => {
    if (!res?.success) return [];
    return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  };

  const initialLikelihoodScales = toArray(likelihoodRes)
    .filter((s: any) => s.scale_type === "LIKELIHOOD")
    .sort((a: any, b: any) => a.level - b.level);

  const initialImpactScales = toArray(impactRes)
    .filter((s: any) => s.scale_type === "IMPACT")
    .sort((a: any, b: any) => a.level - b.level);

  const initialRatings = (ratingsRes?.success ? ratingsRes.data ?? [] : [])
    .sort((a: any, b: any) => a.min_score - b.min_score);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6 flex justify-between">
        <div className="mb-2">
          <h1 className="text-foreground text-3xl font-bold">{matrix.name}</h1>
          <p className="text-muted-foreground mt-1">
            Configure likelihood scales, impact scales, and rating levels
          </p>
        </div>
        <BackButton title="Back to Configurations" />
      </div>

      <main className="container mx-auto px-4">
        <RiskScalesManager
          matrixId={id}
          initialLikelihoodScales={initialLikelihoodScales}
          initialImpactScales={initialImpactScales}
          initialRatings={initialRatings}
        />
      </main>
    </div>
  );
}
