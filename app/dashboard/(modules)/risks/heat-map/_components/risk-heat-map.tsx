"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Coins, User, Building } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/page-header";
import { RiskSummaryStats } from "./summary";
import { useRouter } from "next/navigation";

interface Risk {
  id: string;
  title: string;
  description: string;
  category_name: string;
  department_name: string;
  risk_owner_name: string;
  status: string;
  recurrence: string;
  risk_appetite_status: string;
  created_at: string;
  updated_at: string;
  controls_count: number;
  mitigation_cost: number;
  target_closing_date: string;
}

interface MatrixCell {
  likelihood: number;
  impact: number;
  score: number;
  rating: string;
  color: string;
  count: number;
  risks: Risk[];
}

interface HeatmapMetadata {
  title: string;
  description: string;
  register_name: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  total_risks: number;
  generated_at: string;
}

interface HeatmapSummary {
  low_count: number;
  medium_count: number;
  high_count: number;
  very_high_count: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  above_appetite_count: number;
  within_appetite_count: number;
}

interface HeatmapData {
  type: string;
  register_id: string | null;
  metadata: HeatmapMetadata;
  matrix: MatrixCell[];
  summary: HeatmapSummary;
}

interface SelectedCell extends MatrixCell {}

const getColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    green: "bg-emerald-500 hover:bg-emerald-600",
    yellow: "bg-amber-500 hover:bg-amber-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    red: "bg-red-500 hover:bg-red-600"
  };
  return colorMap[color] || "bg-gray-500";
};

const getRatingBadgeClass = (rating: string): string => {
  const ratingMap: Record<string, string> = {
    LOW: "bg-emerald-500",
    MEDIUM: "bg-amber-500",
    HIGH: "bg-orange-500",
    VERY_HIGH: "bg-red-500"
  };
  return ratingMap[rating] || "bg-gray-100 text-gray-800";
};

const getRecurrenceColor = (recurrence: string): string => {
  const recurrenceMap: Record<string, string> = {
    ONGOING: "bg-blue-100 text-blue-800 border-blue-200",
    "ONE-TIME": "bg-amber-100 text-amber-800 border-amber-200"
  };
  return recurrenceMap[recurrence?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
};

const RiskMatrix = ({
  matrixData,
  onCellClick,
  selectedCell
}: {
  matrixData: MatrixCell[];
  onCellClick: (cell: MatrixCell) => void;
  selectedCell: SelectedCell | null;
}) => {
  const createGrid = () => {
    const grid: (MatrixCell | null)[][] = Array(5)
      .fill(null)
      .map(() => Array(5).fill(null));

    matrixData.forEach((cell) => {
      const impactIndex = 5 - cell.impact;
      const likelihoodIndex = cell.likelihood - 1;
      if (impactIndex >= 0 && impactIndex < 5 && likelihoodIndex >= 0 && likelihoodIndex < 5) {
        grid[impactIndex][likelihoodIndex] = cell;
      }
    });

    return grid;
  };

  const grid = createGrid();

  return (
    <div className="flex flex-col gap-1">
      {grid.map((row, impactIdx) => (
        <div key={impactIdx} className="flex gap-1">
          {row.map((cell, likelihoodIdx) => {
            if (!cell) return <div key={likelihoodIdx} className="h-16 w-16 rounded bg-gray-100" />;

            const isSelected =
              selectedCell &&
              selectedCell.likelihood === cell.likelihood &&
              selectedCell.impact === cell.impact;

            return (
              <button
                key={`${impactIdx}-${likelihoodIdx}`}
                onClick={() => onCellClick(cell)}
                className={cn(
                  getColorClass(cell.color),
                  "flex h-16 w-16 flex-col items-center justify-center rounded text-white transition-all hover:scale-105 hover:shadow-lg",
                  isSelected && "ring-primary ring-1"
                )}>
                <span className="text-2xl font-bold">{cell.count}</span>
                <span className="text-xs opacity-90">
                  L{cell.likelihood}×I{cell.impact}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export function RiskHeatMap({ heatmapData }: { heatmapData: HeatmapData }) {
  const router = useRouter();
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);

  const handleCellClick = (cell: MatrixCell) => {
    setSelectedCell(cell);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Risk Heat Maps"
            description="Visual representation of risk distribution"
            icon="Map"
          />
        </div>
      </div>

      <div className="container mx-auto space-y-6 p-4 py-8">
        <RiskSummaryStats summary={heatmapData.summary} />
        {/* Legend */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-foreground text-sm font-medium">Risk Levels:</span>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Low</Badge>
                <Badge className="bg-amber-500 text-white hover:bg-amber-600">Medium</Badge>
                <Badge className="bg-orange-500 text-white hover:bg-orange-600">High</Badge>
                <Badge className="bg-red-500 text-white hover:bg-red-600">Very High</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              {heatmapData.type.charAt(0).toUpperCase() + heatmapData.type.slice(1)} Risk Matrix
              (5×5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-8">
                <div className="text-muted-foreground origin-center -rotate-90 text-sm">
                  Impact →
                </div>
                <div className="space-y-2">
                  <RiskMatrix
                    matrixData={heatmapData.matrix}
                    onCellClick={handleCellClick}
                    selectedCell={selectedCell}
                  />
                  <div className="text-muted-foreground flex justify-between px-2 text-xs">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                  <p className="text-muted-foreground text-center text-sm">← Likelihood →</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cell Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Cell Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCell ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Likelihood</p>
                    <p className="text-2xl font-bold">{selectedCell.likelihood}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Impact</p>
                    <p className="text-2xl font-bold">{selectedCell.impact}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Score</p>
                    <p className="text-2xl font-bold">{selectedCell.score}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Risk Level</p>
                    <Badge
                      className={cn("border text-sm", getRatingBadgeClass(selectedCell.rating))}>
                      {selectedCell.rating.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Risk Count</p>
                    <p className="text-2xl font-bold">{selectedCell.count}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-lg font-semibold">Risks in this cell ({selectedCell.count})</p>
                  {selectedCell.count > 0 ? (
                    <div className="grid gap-4">
                      {selectedCell.risks.map((risk) => (
                        <Card key={risk.id}>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold">{risk.title}</h4>
                                  <p className="text-muted-foreground mt-1 text-sm">
                                    {risk.description}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Badge variant="outline">{risk.status}</Badge>
                                  <Badge
                                    className={cn("border", getRecurrenceColor(risk.recurrence))}>
                                    {risk.recurrence}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid gap-3 border-t pt-3 md:grid-cols-2 lg:grid-cols-4">
                                <div className="flex items-center gap-2">
                                  <Building className="text-muted-foreground h-4 w-4" />
                                  <div>
                                    <p className="text-muted-foreground text-xs">Department</p>
                                    <p className="text-sm font-medium">{risk.department_name}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <User className="text-muted-foreground h-4 w-4" />
                                  <div>
                                    <p className="text-muted-foreground text-xs">Owner</p>
                                    <p className="text-sm font-medium">{risk.risk_owner_name}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Calendar className="text-muted-foreground h-4 w-4" />
                                  <div>
                                    <p className="text-muted-foreground text-xs">Due Date</p>
                                    <p className="text-sm font-medium">
                                      {format(new Date(risk.target_closing_date), "MMM dd, yyyy")}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Coins className="text-muted-foreground h-4 w-4" />
                                  <div>
                                    <p className="text-muted-foreground text-xs">Cost</p>
                                    <p className="text-sm font-medium">
                                      ZMW {risk.mitigation_cost.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t pt-3">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-muted-foreground">
                                    {risk.controls_count}{" "}
                                    {risk.controls_count === 1 ? "Control" : "Controls"}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={
                                      risk.risk_appetite_status === "Below"
                                        ? "border-green-200 text-green-700"
                                        : "border-red-200 text-red-700"
                                    }>
                                    {risk.risk_appetite_status} Appetite
                                  </Badge>
                                </div>
                                <Button
                                  onClick={() => {
                                    router.push(`/dashboard/risks/actions/${risk.id}`);
                                  }}
                                  size="sm"
                                  variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">No risks in this cell</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <AlertTriangle className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                <p className="text-muted-foreground text-lg">
                  Click on a cell to view risk details
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Select any cell in the matrix above to see associated risks
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
