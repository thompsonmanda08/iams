"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RiskLevel = "low" | "medium" | "high" | "critical";
type RiskType = "inherent" | "residual";

interface CellData {
  count: number;
  risks: string[];
}

interface SelectedCell {
  likelihood: number;
  impact: number;
  type: RiskType;
  data: CellData;
}

// Sample data for demonstration
const generateRiskData = (type: RiskType): CellData[][] => {
  const data: CellData[][] = [];
  for (let i = 0; i < 5; i++) {
    data[i] = [];
    for (let j = 0; j < 5; j++) {
      const count = Math.floor(Math.random() * 8);
      data[i][j] = {
        count,
        risks: count > 0 ? Array.from({ length: count }, (_, k) => `Risk ${k + 1}`) : []
      };
    }
  }
  return data;
};

const inherentData = generateRiskData("inherent");
const residualData = generateRiskData("residual");

const getRiskLevel = (likelihood: number, impact: number): RiskLevel => {
  const score = likelihood * impact;
  if (score <= 4) return "low";
  if (score <= 9) return "medium";
  if (score <= 16) return "high";
  return "critical";
};

const getRiskColor = (level: RiskLevel): string => {
  const colors = {
    low: "bg-emerald-500",
    medium: "bg-amber-500",
    high: "bg-orange-500",
    critical: "bg-red-500"
  };
  return colors[level];
};

const RiskMatrix = ({
  data,
  type,
  onCellClick
}: {
  data: CellData[][];
  type: RiskType;
  onCellClick: (likelihood: number, impact: number, type: RiskType, cellData: CellData) => void;
}) => {
  return (
    <div className="flex flex-col gap-1">
      {[4, 3, 2, 1, 0].map((impact) => (
        <div key={impact} className="flex gap-1">
          {[0, 1, 2, 3, 4].map((likelihood) => {
            const level = getRiskLevel(likelihood + 1, impact + 1);
            const cellData = data[impact][likelihood];
            return (
              <button
                key={`${impact}-${likelihood}`}
                onClick={() => onCellClick(likelihood + 1, impact + 1, type, cellData)}
                className={`${getRiskColor(level)} flex h-12 w-12 flex-col items-center justify-center rounded text-xs font-semibold text-white transition-all hover:scale-105 hover:shadow-lg md:h-14 md:w-14`}>
                <span className="text-base">{cellData.count}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default function RiskHeatMapPage() {
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);

  const handleCellClick = (likelihood: number, impact: number, type: RiskType, data: CellData) => {
    setSelectedCell({ likelihood, impact, type, data });
  };

  return (
    <div className="bg-background min-h-screen py-4">
      <div className="bg-card border-b">
        <div className="container mx-auto py-6">
          <h1 className="text-foreground text-3xl font-bold">Risk Heat Maps</h1>
          <p className="text-muted-foreground mt-1">Visual representation of risk distribution</p>
        </div>
      </div>
      <div className="container mx-auto space-y-6 p-4">
        {/* Legend */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-foreground text-sm font-medium">Risk Levels:</span>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Low</Badge>
                <Badge className="bg-amber-500 text-white hover:bg-amber-600">Medium</Badge>
                <Badge className="bg-orange-500 text-white hover:bg-orange-600">High</Badge>
                <Badge className="bg-red-500 text-white hover:bg-red-600">Critical</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Matrices Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Inherent Risk Matrix */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg font-semibold">
                Inherent Risk Matrix (5×5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs">
                  <span className="absolute top-1/2 -left-8 origin-center -rotate-90 transform">
                    Impact →
                  </span>
                  <span className="w-full text-center">← Likelihood →</span>
                </div>
                <div className="flex justify-center">
                  <RiskMatrix data={inherentData} type="inherent" onCellClick={handleCellClick} />
                </div>
                <div className="text-muted-foreground flex justify-between pt-2 text-xs">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Residual Risk Matrix */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-lg font-semibold">
                Residual Risk Matrix (5×5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs">
                  <span className="absolute top-1/2 -left-8 origin-center -rotate-90 transform">
                    Impact →
                  </span>
                  <span className="w-full text-center">← Likelihood →</span>
                </div>
                <div className="flex justify-center">
                  <RiskMatrix data={residualData} type="residual" onCellClick={handleCellClick} />
                </div>
                <div className="text-muted-foreground flex justify-between pt-2 text-xs">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed View */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg font-semibold">Cell Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCell ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Risk Type</p>
                    <p className="text-foreground text-sm font-semibold capitalize">
                      {selectedCell.type}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Likelihood</p>
                    <p className="text-foreground text-sm font-semibold">
                      {selectedCell.likelihood}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Impact</p>
                    <p className="text-foreground text-sm font-semibold">{selectedCell.impact}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Risk Level</p>
                    <Badge
                      className={`${getRiskColor(getRiskLevel(selectedCell.likelihood, selectedCell.impact))} text-white capitalize`}>
                      {getRiskLevel(selectedCell.likelihood, selectedCell.impact)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-foreground text-sm font-medium">
                    Risks in this cell ({selectedCell.data.count})
                  </p>
                  {selectedCell.data.count > 0 ? (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {selectedCell.data.risks.map((risk, idx) => (
                        <div key={idx} className="bg-muted border-border rounded-lg border p-3">
                          <p className="text-foreground text-sm">{risk}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No risks in this cell</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Click on a cell to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
