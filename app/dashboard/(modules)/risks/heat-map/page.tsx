import { getHeatMap } from "@/app/_actions/risk-module-actions";
import { RiskHeatMap } from "./_components/risk-heat-map";

const fallbackHeatmapData = {
  type: "inherent",
  register_id: null,
  metadata: {
    title: "Risk Heatmap",
    description: "No heatmap data available. Please check your filters or create risks.",
    register_name: "Default",
    date_range: {
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString()
    },
    total_risks: 0,
    generated_at: new Date().toISOString()
  },
  matrix: [],
  summary: {
    low_count: 0,
    medium_count: 0,
    high_count: 0,
    very_high_count: 0,
    average_score: 0,
    highest_score: 0,
    lowest_score: 0,
    above_appetite_count: 0,
    within_appetite_count: 0
  }
};

export default async function RiskHeatMapPage() {
  const response = await getHeatMap();
  const heatmapData = response?.success && response?.data ? response.data : fallbackHeatmapData;

  return <RiskHeatMap heatmapData={heatmapData} />;
}
