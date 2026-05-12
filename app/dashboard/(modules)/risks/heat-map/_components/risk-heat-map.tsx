"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { AlertTriangle, Calendar, Coins, User, Building, Loader2, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils/date-format";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/page-header";
import { RiskSummaryStats } from "./summary";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useHeatMap, useMatrixRatings } from "@/hooks/use-matrix-query-data";
import { useRiskMatrices } from "@/hooks/use-risk-query-data";
import { useIsMobile } from "@/hooks/use-mobile";
import type { RiskMatrix as RiskMatrixType } from "@/lib/types/risk-type";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ── Types ─────────────────────────────────────────────────────────────────────

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

interface RatingLevelSummary {
  id: string;
  name: string;
  min_score: number;
  max_score: number;
  color_hex: string;
  description: string;
  count: number;
}

interface MatrixCell {
  likelihood: number;
  impact: number;
  likelihood_label: string;
  impact_label: string;
  score: number;
  rating_level_id: string;
  rating_level_name: string;
  color_hex: string;
  count: number;
  risks: Risk[];
}

interface HeatmapData {
  type: string;
  register_id: string | null;
  metadata: {
    title: string;
    description: string;
    register_name: string;
    matrix_name: string;
    matrix_size?: string; // backend returns "5x5" — parsed into likelihood/impact_levels
    likelihood_levels: number;
    impact_levels: number;
    date_range: { start_date: string; end_date: string };
    total_risks: number;
    generated_at: string;
  };
  rating_levels: RatingLevelSummary[];
  matrix: MatrixCell[];
  summary: {
    by_rating_level: RatingLevelSummary[];
    rating_counts?: Record<string, number>; // backend returns object form, normalised to by_rating_level
    average_score: number;
    highest_score: number;
    lowest_score: number;
    above_appetite_count: number;
    within_appetite_count: number;
  };
}

// ── Color helper ─────────────────────────────────────────────────────────────

function getColorFromRatings(score: number, ratings: any[]): string {
  if (!ratings.length) return "";
  const sorted = [...ratings].sort((a, b) => a.min_score - b.min_score);
  const match = sorted.find((r) => score >= r.min_score && score <= r.max_score);
  if (match) return match.color_hex;
  if (score < sorted[0].min_score) return sorted[0].color_hex;
  return sorted[sorted.length - 1].color_hex;
}

// ── Derive summary stats from matrix cells when backend hasn't populated them ─

function computeSummaryFromMatrix(matrix: MatrixCell[], configRatings: any[]) {
  let within = 0;
  let above = 0;
  const scores: number[] = [];
  const ratingCounts: Record<string, number> = {};

  matrix.forEach((cell) => {
    if (!cell.risks?.length) return;

    cell.risks.forEach(() => scores.push(cell.score));

    cell.risks.forEach((risk) => {
      if (risk.risk_appetite_status === "WITHIN") within++;
      else above++;
    });

    const matchedRating =
      configRatings.find((r) => r.id === cell.rating_level_id) ??
      configRatings.find((r) => cell.score >= r.min_score && cell.score <= r.max_score);
    if (matchedRating) {
      ratingCounts[matchedRating.id] = (ratingCounts[matchedRating.id] ?? 0) + cell.count;
    }
  });

  return {
    within,
    above,
    average_score: scores.length
      ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 0,
    highest_score: scores.length ? Math.max(...scores) : 0,
    lowest_score: scores.length ? Math.min(...scores) : 0,
    ratingCounts
  };
}

// ── Risk Matrix grid ──────────────────────────────────────────────────────────

function RiskMatrix({
  matrixData,
  likelihoodLevels,
  impactLevels,
  configRatings,
  onCellClick,
  selectedCell
}: {
  matrixData: MatrixCell[];
  likelihoodLevels: number;
  impactLevels: number;
  configRatings: any[];
  onCellClick: (cell: MatrixCell) => void;
  selectedCell: MatrixCell | null;
}) {
  // Build full N×M grid — cells without data remain null (empty / no-color)
  const grid: (MatrixCell | null)[][] = Array(impactLevels)
    .fill(null)
    .map(() => Array(likelihoodLevels).fill(null));

  matrixData.forEach((cell) => {
    const row = impactLevels - cell.impact;
    const col = cell.likelihood - 1;
    if (row >= 0 && row < impactLevels && col >= 0 && col < likelihoodLevels) {
      grid[row][col] = cell;
    }
  });

  // Build axis label maps from cell data
  const likelihoodLabels: Record<number, string> = {};
  const impactLabels: Record<number, string> = {};
  matrixData.forEach((cell) => {
    likelihoodLabels[cell.likelihood] = cell.likelihood_label;
    impactLabels[cell.impact] = cell.impact_label;
  });

  return (
    <div className="flex gap-2 pr-6">
      {/* Impact axis labels (left) */}
      <div className="flex w-auto flex-col gap-1" style={{ paddingTop: 0 }}>
        {Array.from({ length: impactLevels }, (_, i) => impactLevels - i).map((level) => (
          <div
            key={level}
            className="text-muted-foreground grid h-16 w-6 place-items-center p-4 text-right text-xs">
            <span className="truncate">{impactLabels[level] || level}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {/* Grid rows */}
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {row.map((cell, colIdx) => {
              if (!cell) {
                // Derive score from grid position to color even empty cells
                const likelihood = colIdx + 1;
                const impact = impactLevels - rowIdx;
                const fallbackColor = getColorFromRatings(likelihood * impact, configRatings);
                return (
                  <div
                    key={colIdx}
                    className="h-16 w-16 rounded border border-white/10"
                    style={{ backgroundColor: fallbackColor ? `${fallbackColor}40` : undefined }}
                  />
                );
              }

              const isSelected =
                selectedCell?.likelihood === cell.likelihood &&
                selectedCell?.impact === cell.impact;

              const bgColor = cell.color_hex || getColorFromRatings(cell.score, configRatings);

              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  onClick={() => onCellClick(cell)}
                  title={`${cell.likelihood_label} × ${cell.impact_label} | Score: ${cell.score} | ${cell.rating_level_name}`}
                  className={cn(
                    "flex h-16 w-16 flex-col items-center justify-center rounded border border-white/10 text-white transition-all hover:scale-105 hover:shadow-lg",
                    isSelected && "ring-2 ring-white ring-offset-1"
                  )}
                  style={{ backgroundColor: bgColor }}>
                  {cell.count > 0 && (
                    <span className="text-2xl leading-none font-bold">{cell.count}</span>
                  )}
                  <span className="text-xs opacity-80">
                    {cell.likelihood}×{cell.impact}
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Likelihood axis labels (bottom) */}
        <div className="mt-1 flex gap-1">
          {Array.from({ length: likelihoodLevels }, (_, i) => i + 1).map((level) => (
            <div
              key={level}
              className="text-muted-foreground flex h-8 w-16 items-start justify-center pt-1 text-center text-xs">
              <span className="w-full truncate px-0.5">{likelihoodLabels[level] || level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Cell details content (shared between panel + dialog) ─────────────────────

function CellDetailsContent({
  selectedCell,
  configRatings,
  onNavigate
}: {
  selectedCell: MatrixCell;
  configRatings: any[];
  onNavigate: (id: string) => void;
}) {
  const derivedColor =
    selectedCell.color_hex || getColorFromRatings(selectedCell.score, configRatings);
  const derivedLevelName =
    selectedCell.rating_level_name ||
    configRatings.find(
      (r) => selectedCell.score >= r.min_score && selectedCell.score <= r.max_score
    )?.name;

  return (
    <div className="space-y-5">
      {/* Stat pills */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Likelihood</p>
          <p className="mt-1 text-2xl leading-none font-bold">{selectedCell.likelihood}</p>
          {selectedCell.likelihood_label && (
            <p className="text-muted-foreground mt-1 truncate text-[10px]">
              {selectedCell.likelihood_label}
            </p>
          )}
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Impact</p>
          <p className="mt-1 text-2xl leading-none font-bold">{selectedCell.impact}</p>
          {selectedCell.impact_label && (
            <p className="text-muted-foreground mt-1 truncate text-[10px]">
              {selectedCell.impact_label}
            </p>
          )}
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Score</p>
          <p className="mt-1 text-2xl leading-none font-bold">{selectedCell.score}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Level</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: derivedColor || "#64748b" }}
            />
            <span className="truncate text-xs font-semibold">{derivedLevelName || "—"}</span>
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Risks</p>
          <p className="mt-1 text-2xl leading-none font-bold">{selectedCell.count}</p>
        </div>
      </div>

      {/* Risk table */}
      <div className="space-y-2">
        <p className="text-sm font-semibold">
          Risks in this cell{" "}
          <span className="text-muted-foreground font-normal">({selectedCell.count})</span>
        </p>
        {selectedCell.count > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Risk
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Owner
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Due
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Cost
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Level
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Status
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedCell.risks.map((risk) => {
                  // After normalisation: "Below" → "WITHIN", "Above" → "ABOVE"
                  const isWithin = risk.risk_appetite_status === "WITHIN";
                  return (
                    <tr key={risk.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-2">
                          <div
                            className="mt-0.5 h-full w-0.5 shrink-0 self-stretch rounded-full"
                            style={{ backgroundColor: isWithin ? "#22c55e" : "#ef4444" }}
                          />
                          <div className="min-w-0">
                            <Tooltip>
                              <TooltipTrigger className="max-w-[160px] truncate text-xs font-semibold">
                                {risk.title}
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">{risk.title}</TooltipContent>
                            </Tooltip>
                            <div className="text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Building className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate text-[10px]">{risk.department_name}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <User className="text-muted-foreground h-3 w-3 shrink-0" />
                          <span className="text-muted-foreground max-w-[100px] truncate text-xs">
                            {risk.risk_owner_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="text-muted-foreground h-3 w-3 shrink-0" />
                          <span className="text-muted-foreground text-xs">
                            {risk.target_closing_date
                              ? formatDate(risk.target_closing_date)
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Coins className="text-muted-foreground h-3 w-3 shrink-0" />
                          <span className="text-muted-foreground text-xs">
                            ZMW {risk.mitigation_cost?.toLocaleString() ?? 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          className="w-fit text-xs text-white"
                          style={{ backgroundColor: derivedColor || "#64748b" }}>
                          {derivedLevelName || "—"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline" className="w-fit text-xs">
                          {risk.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => onNavigate(risk.id)}>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground text-sm">No risks in this cell</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RiskHeatMap({
  heatmapData: initialData,
  matrices,
  defaultMatrixId
}: {
  heatmapData: HeatmapData;
  matrices: RiskMatrixType[];
  defaultMatrixId: string | null;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [selectedMatrixId, setSelectedMatrixId] = useState<string | undefined>(
    defaultMatrixId ?? undefined
  );
  const [selectedCell, setSelectedCell] = useState<MatrixCell | null>(null);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);

  const handleCellClick = (cell: MatrixCell) => {
    setSelectedCell(cell);
    if (isMobile) setMobileDialogOpen(true);
  };

  // Use the same matrices source as risk creation — SSR data seeds the cache instantly
  const { data: matrixOptions = matrices, isLoading: matricesLoading } = useRiskMatrices(
    true,
    matrices
  );

  // Fetch rating levels directly from config (same hook as the configuration page).
  // Used as fallback until the backend returns rating_levels inside the heatmap response.
  const { data: configRatings = [] } = useMatrixRatings(selectedMatrixId ?? "");

  const { data: fetchedData, isFetching } = useHeatMap(
    selectedMatrixId,
    "inherent",
    selectedMatrixId === defaultMatrixId ? initialData : undefined
  );
  // Normalize: backend may return an old/partial shape while implementation is pending.
  // Merge with initialData so every field the UI touches is guaranteed to exist.
  const raw = fetchedData ?? initialData;

  // ── Normalize matrix cells: map backend field names to expected UI field names ──
  // Backend returns: cell.color, cell.rating, risk.risk_appetite_status = "Above"/"Below"
  // UI expects:      cell.color_hex, cell.rating_level_name, risk.risk_appetite_status = "ABOVE"/"WITHIN"
  const normalizedMatrix: MatrixCell[] = (raw?.matrix ?? []).map((cell: any) => ({
    ...cell,
    color_hex: cell.color_hex ?? cell.color,
    rating_level_name: cell.rating_level_name ?? cell.rating,
    likelihood_label: cell.likelihood_label ?? String(cell.likelihood),
    impact_label: cell.impact_label ?? String(cell.impact),
    risks: (cell.risks ?? []).map((risk: any) => ({
      ...risk,
      risk_appetite_status:
        risk.risk_appetite_status === "Below"
          ? "WITHIN"
          : risk.risk_appetite_status === "Above"
            ? "ABOVE"
            : risk.risk_appetite_status
    }))
  }));

  // ── Parse matrix_size string ("5x5") → integer dimensions ─────────────────
  const matrixSizeStr: string = raw?.metadata?.matrix_size ?? "";
  const [parsedLikelihood, parsedImpact] = matrixSizeStr.includes("x")
    ? matrixSizeStr.split("x").map(Number)
    : [undefined, undefined];

  // ── Derive fallback stats from normalised matrix cell data ─────────────────
  const computed = computeSummaryFromMatrix(normalizedMatrix, configRatings);
  const matrixRiskTotal = normalizedMatrix.reduce((sum, cell) => sum + (cell.count ?? 0), 0);
  const backendAppetiteTotal =
    (raw?.summary?.within_appetite_count ?? 0) + (raw?.summary?.above_appetite_count ?? 0);
  // Use computed when backend totals don't match actual matrix risk count
  const useComputed =
    computed.within + computed.above > 0 &&
    (backendAppetiteTotal === 0 || backendAppetiteTotal !== matrixRiskTotal);

  // ── Convert backend's rating_counts object → by_rating_level array ─────────
  // Backend: summary.rating_counts = { "HIGH": 1, "VERY_HIGH": 2 }  (UPPER_SNAKE)
  // Config:  configRatings[].name = "High", "Very High"             (Title Case)
  // Normalize both sides to UPPER_SNAKE before matching.
  const normalizeRatingKey = (s: string) => s.toUpperCase().replace(/[\s-]+/g, "_");
  const ratingCountsObj: Record<string, number> = raw?.summary?.rating_counts ?? {};
  const ratingCountsNorm: Record<string, number> = {};
  Object.entries(ratingCountsObj).forEach(([k, v]) => {
    ratingCountsNorm[normalizeRatingKey(k)] = v;
  });
  const byRatingLevelFallback = configRatings.map((r: any) => ({
    ...r,
    count: ratingCountsNorm[normalizeRatingKey(r.name)] ?? computed.ratingCounts[r.id] ?? 0
  }));

  const heatmapData: HeatmapData = {
    ...initialData,
    ...raw,
    rating_levels: raw?.rating_levels?.length
      ? raw.rating_levels
      : configRatings.map((r: any) => ({ ...r, count: 0 })),
    matrix: normalizedMatrix,
    metadata: {
      ...initialData.metadata,
      ...(raw?.metadata ?? {}),
      likelihood_levels:
        raw?.metadata?.likelihood_levels ??
        parsedLikelihood ??
        initialData.metadata?.likelihood_levels ??
        5,
      impact_levels:
        raw?.metadata?.impact_levels ?? parsedImpact ?? initialData.metadata?.impact_levels ?? 5,
      matrix_name: raw?.metadata?.matrix_name ?? initialData.metadata?.matrix_name ?? ""
    },
    summary: {
      ...initialData.summary,
      ...(raw?.summary ?? {}),
      by_rating_level: raw?.summary?.by_rating_level?.length
        ? raw.summary.by_rating_level
        : byRatingLevelFallback,
      within_appetite_count: useComputed
        ? computed.within
        : (raw?.summary?.within_appetite_count ?? 0),
      above_appetite_count: useComputed
        ? computed.above
        : (raw?.summary?.above_appetite_count ?? 0),
      average_score: raw?.summary?.average_score || computed.average_score,
      highest_score: raw?.summary?.highest_score || computed.highest_score,
      lowest_score: raw?.summary?.lowest_score || computed.lowest_score
    }
  };

  const { likelihood_levels, impact_levels, matrix_name } = heatmapData.metadata;
  const gridTitle = `${heatmapData.type?.charAt(0).toUpperCase() + heatmapData.type?.slice(1)} Risk Matrix (${likelihood_levels}×${impact_levels})`;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-6">
          <PageHeader
            title="Risk Heat Maps"
            description="Visual representation of risk distribution"
            icon="Map"
          />
          <Select
            value={selectedMatrixId}
            onValueChange={(id) => {
              setSelectedMatrixId(id);
              setSelectedCell(null);
            }}
            disabled={matricesLoading && matrixOptions.length === 0}>
            <SelectTrigger className="w-">
              <SelectValue placeholder={matricesLoading ? "Loading matrices…" : "Select matrix"} />
            </SelectTrigger>
            <SelectContent>
              {matrixOptions.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                  {m.is_default && <Badge className="ml-1 text-xs">(Default)</Badge>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="container mx-auto space-y-6 p-4 py-8">
        {isFetching && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading heatmap…
          </div>
        )}

        <RiskSummaryStats summary={heatmapData.summary} />

        {/* Matrix + Cell Details — side by side on desktop */}
        <div className="grid items-stretch gap-6 lg:grid-cols-[auto_1fr]">
          {/* Risk Matrix card */}
          <Card className="w-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                {gridTitle}
                {matrix_name && (
                  <span className="text-muted-foreground text-sm font-normal">— {matrix_name}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {heatmapData.matrix.length === 0 ? (
                <div className="py-16 text-center">
                  <AlertTriangle className="text-muted-foreground/40 mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">
                    {heatmapData.rating_levels.length === 0
                      ? "Configure rating levels for this matrix before viewing the heat map."
                      : "No risks have been assessed against this matrix yet."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-muted-foreground mt-8 origin-center -rotate-90 text-sm whitespace-nowrap">
                      Impact →
                    </div>
                    <div className="space-y-1">
                      <RiskMatrix
                        matrixData={heatmapData.matrix}
                        likelihoodLevels={likelihood_levels}
                        impactLevels={impact_levels}
                        configRatings={configRatings}
                        onCellClick={handleCellClick}
                        selectedCell={selectedCell}
                      />
                      <p className="text-muted-foreground mt-1 text-center text-sm">
                        ← Likelihood →
                      </p>
                    </div>
                  </div>

                  {/* Legend */}
                  {heatmapData.rating_levels.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                          Risk Levels:
                        </span>
                        {heatmapData.rating_levels.map((level) => (
                          <Badge
                            key={level.id}
                            className="text-xs text-white"
                            style={{ backgroundColor: level.color_hex }}>
                            {level.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cell Details — desktop panel (hidden on mobile) */}
          <Card className="hidden lg:flex lg:flex-col lg:overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Cell Details</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {selectedCell ? (
                <CellDetailsContent
                  selectedCell={selectedCell}
                  configRatings={configRatings}
                  onNavigate={(id) => router.push(`/dashboard/actions/risk/${id}`)}
                />
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

        {/* Cell Details — mobile dialog */}
        <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto lg:hidden">
            <DialogHeader>
              <DialogTitle>Cell Details</DialogTitle>
            </DialogHeader>
            {selectedCell && (
              <CellDetailsContent
                selectedCell={selectedCell}
                configRatings={configRatings}
                onNavigate={(id) => {
                  setMobileDialogOpen(false);
                  router.push(`/dashboard/actions/risk/${id}`);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
