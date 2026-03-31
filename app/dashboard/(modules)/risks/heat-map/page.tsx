import { getHeatMap } from "@/app/_actions/risk-module-actions";
import { getRiskMatrices } from "@/app/_actions/config-actions";
import { RiskHeatMap } from "./_components/risk-heat-map";

const fallbackHeatmapData = {
  type: "inherent",
  register_id: null,
  metadata: {
    title: "Risk Heatmap",
    description: "No heatmap data available.",
    register_name: "",
    matrix_name: "",
    likelihood_levels: 5,
    impact_levels: 5,
    date_range: {
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString()
    },
    total_risks: 0,
    generated_at: new Date().toISOString()
  },
  rating_levels: [],
  matrix: [],
  summary: {
    by_rating_level: [],
    average_score: 0,
    highest_score: 0,
    lowest_score: 0,
    above_appetite_count: 0,
    within_appetite_count: 0
  }
};

export default async function RiskHeatMapPage() {
  const [matricesResult, heatmapResult] = await Promise.allSettled([
    getRiskMatrices({ page_size: 100 }),
    getHeatMap()
  ]);

  const matricesRes = matricesResult.status === "fulfilled" ? matricesResult.value : null;
  const heatmapRes = heatmapResult.status === "fulfilled" ? heatmapResult.value : null;

  const matrices = matricesRes?.success
    ? (matricesRes.data?.data ?? matricesRes.data ?? [])
    : [];
  const defaultMatrix = matrices.find((m: any) => m.is_default) ?? matrices[0] ?? null;
  const heatmapData =
    heatmapRes?.success && heatmapRes?.data ? heatmapRes.data : fallbackHeatmapData;

  return (
    <RiskHeatMap
      heatmapData={heatmapData}
      matrices={matrices}
      defaultMatrixId={defaultMatrix?.id ?? null}
    />
  );
}
