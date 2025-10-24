"use client";

import { useState, useEffect } from "react";
import { risksApi, type HeatMapData } from "@/lib/api/risks-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RiskHeatMapPage() {
  const [heatMapData, setHeatMapData] = useState<HeatMapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<HeatMapData | null>(null);

  useEffect(() => {
    loadHeatMap();
  }, []);

  const loadHeatMap = async () => {
    setIsLoading(true);
    try {
      const data = await risksApi.getHeatMap();
      setHeatMapData(data);
    } catch (error) {
      console.error("Failed to load heat map:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCellColor = (impact: number, likelihood: number) => {
    const score = impact * likelihood;

    if (score >= 20) return "bg-red-600 hover:bg-red-700";
    if (score >= 15) return "bg-red-500 hover:bg-red-600";
    if (score >= 10) return "bg-orange-500 hover:bg-orange-600";
    if (score >= 5) return "bg-amber-400 hover:bg-amber-500";
    return "bg-green-500 hover:bg-green-600";
  };

  const getCellData = (impact: number, likelihood: number) => {
    return heatMapData.find((d) => d.impact === impact && d.likelihood === likelihood);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Risk Heat Map</h1>
          <p className="text-muted-foreground mt-1">Visual representation of risk distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Heat Map */}
        <Card className="p-6 lg:col-span-2">
          {isLoading ? (
            <div className="bg-muted h-96 animate-pulse rounded" />
          ) : (
            <div className="space-y-4">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Residual Risk Matrix (5×5)</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-green-500" />
                    <span>Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-amber-400" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-orange-500" />
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-red-500" />
                    <span>Critical</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {/* Y-axis label */}
                <div className="col-span-1 row-span-6 flex items-center justify-center">
                  <div className="-rotate-90 transform text-sm font-semibold whitespace-nowrap">
                    Impact →
                  </div>
                </div>

                {/* Header row */}
                <div className="col-span-5 mb-2 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((likelihood) => (
                    <div
                      key={likelihood}
                      className="text-muted-foreground text-center text-sm font-medium">
                      {likelihood}
                    </div>
                  ))}
                </div>

                {/* Heat map cells (reversed impact for visual representation) */}
                {[5, 4, 3, 2, 1].map((impact) => (
                  <div key={impact} className="col-span-5 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((likelihood) => {
                      const cellData = getCellData(impact, likelihood);
                      const score = impact * likelihood;

                      return (
                        <button
                          key={`${impact}-${likelihood}`}
                          onClick={() => setSelectedCell(cellData || null)}
                          className={cn(
                            "flex aspect-square flex-col items-center justify-center rounded-lg font-semibold text-white transition-all",
                            getCellColor(impact, likelihood),
                            selectedCell?.impact === impact &&
                              selectedCell?.likelihood === likelihood &&
                              "ring-primary ring-4"
                          )}>
                          <span className="text-2xl">{cellData?.count || 0}</span>
                          <span className="text-xs opacity-75">{score}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}

                {/* X-axis label */}
                <div className="col-span-5 mt-2 text-center text-sm font-semibold">
                  ← Likelihood
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Selected Cell Details */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Cell Details</h3>
          {selectedCell ? (
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">Impact Level</p>
                <p className="text-2xl font-bold">{selectedCell.impact}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Likelihood Level</p>
                <p className="text-2xl font-bold">{selectedCell.likelihood}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Risk Score</p>
                <p className="text-2xl font-bold">
                  {selectedCell.impact * selectedCell.likelihood}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Number of Risks</p>
                <p className="text-2xl font-bold">{selectedCell.count}</p>
              </div>

              {selectedCell.risks.length > 0 && (
                <div className="border-t pt-4">
                  <p className="mb-2 text-sm font-medium">Risks in this cell:</p>
                  <div className="space-y-2">
                    {selectedCell.risks.map((risk) => (
                      <div key={risk.id} className="bg-muted rounded p-2 text-sm">
                        {risk.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Click on a cell to view details</p>
          )}
        </Card>
      </div>
    </div>
  );
}
