import { getKRIs, type KRI } from "@/app/_actions/risk-module-actions";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, AlertCircle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { KRIConfigureDialog } from "../../_components/kri-configure-dialog";
import { KRIHistoryButton } from "../../_components/kri-history-button";
import BackButton from "@/components/back-button";

function getTrendIcon(trend: string) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />;
  if (trend === "down")
    return <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />;
  return <Minus className="text-muted-foreground h-4 w-4" />;
}

function formatValue(
  value: number | string,
  measurementType: string,
  currencyCode?: string
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  switch (measurementType) {
    case "PERCENTAGE":
      return `${numValue.toFixed(2)}%`;
    case "CURRENCY":
      return `${currencyCode || "USD"} ${numValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "COUNT":
      return numValue.toLocaleString("en-US", { maximumFractionDigits: 0 });
    case "NUMERIC":
      return numValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    default:
      return numValue.toString();
  }
}

function getProgressPercentage(
  current: number,
  target: number,
  limit: number,
  invertDirection: boolean = false
) {
  const currentNum = typeof current === "string" ? parseFloat(current) : current;
  const targetNum = typeof target === "string" ? parseFloat(target) : target;
  const limitNum = typeof limit === "string" ? parseFloat(limit) : limit;

  if (invertDirection) {
    // Lower is better
    if (currentNum <= targetNum) return 100; // Perfect
    if (currentNum >= limitNum) return 0; // Critical
    const range = limitNum - targetNum;
    const progress = ((limitNum - currentNum) / range) * 100;
    return Math.min(Math.max(progress, 0), 100);
  } else {
    // Higher is better
    if (currentNum >= targetNum) return 100; // Perfect
    if (currentNum <= limitNum) return 0; // Critical
    const range = targetNum - limitNum;
    const progress = ((currentNum - limitNum) / range) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
}

function calculateStatus(
  current: number | string,
  fromTrigger: number | string,
  fromCondition: string,
  toTrigger: number | string,
  toCondition: string,
  limit: number | string,
  invertDirection: boolean = false
): string {
  const currentNum = typeof current === "string" ? parseFloat(current) : current;
  const fromTriggerNum = typeof fromTrigger === "string" ? parseFloat(fromTrigger) : fromTrigger;
  const toTriggerNum = typeof toTrigger === "string" ? parseFloat(toTrigger) : toTrigger;
  const limitNum = typeof limit === "string" ? parseFloat(limit) : limit;

  // Check if in critical zone (beyond limit)
  // For inverted KRIs (lower-is-better), breach occurs when current >= limit.
  // For non-inverted KRIs (higher-is-better), breach occurs when current <= limit.
  if (invertDirection ? currentNum >= limitNum : currentNum <= limitNum) return "critical";

  // Check if in warning zone (trigger range)
  const inFromRange = evaluateCondition(currentNum, fromTriggerNum, fromCondition);
  const inToRange = evaluateCondition(currentNum, toTriggerNum, toCondition);

  if (inFromRange && inToRange) return "warning";

  // Otherwise normal
  return "normal";
}

function evaluateCondition(value: number, threshold: number, condition: string): boolean {
  switch (condition) {
    case ">":
      return value > threshold;
    case ">=":
      return value >= threshold;
    case "<":
      return value < threshold;
    case "<=":
      return value <= threshold;
    case "=":
      return value === threshold;
    default:
      return false;
  }
}

function conditionWord(condition: string): string {
  switch (condition) {
    case ">":
      return "above";
    case ">=":
      return "at or above";
    case "<":
      return "below";
    case "<=":
      return "at or below";
    case "=":
      return "equal to";
    default:
      return condition;
  }
}

function statusAccent(status: string) {
  if (status === "warning")
    return {
      stripe: "bg-amber-500",
      glow: "from-amber-500/10",
      bar: "bg-amber-500",
      pill: "bg-amber-100 text-amber-800 ring-amber-200/60 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30"
    };
  if (status === "critical")
    return {
      stripe: "bg-red-500",
      glow: "from-red-500/10",
      bar: "bg-red-500",
      pill: "bg-red-100 text-red-800 ring-red-200/60 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30"
    };
  return {
    stripe: "bg-emerald-500",
    glow: "from-emerald-500/10",
    bar: "bg-emerald-500",
    pill: "bg-emerald-100 text-emerald-800 ring-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30"
  };
}

export default async function KRIPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const response = await getKRIs({ kri_register_id: id });
  const kris: any[] = response.success && response.data?.data ? response.data.data : [];

  console.log("KRI Data:", kris);

  // Normalize status values
  const normalizeStatus = (status: string): string => {
    const normalized = status?.toLowerCase();
    if (normalized === "green") return "normal";
    if (normalized === "amber") return "warning";
    if (normalized === "critical" || normalized === "red") return "critical";
    return normalized || "normal";
  };

  // Calculate status for each KRI
  const enrichedKRIs = kris.map((kri) => {
    const currentValue = kri.last_measured_value || 0;
    const calculatedStatus =
      kri.last_status ||
      calculateStatus(
        currentValue,
        kri.from_trigger_value,
        kri.from_trigger_condition,
        kri.to_trigger_value,
        kri.to_trigger_condition,
        kri.limit_value,
        kri.invert_direction
      );

    const status = normalizeStatus(calculatedStatus);

    return {
      ...kri,
      currentValue,
      status,
      trend: kri.trend_direction || "stable",
      lastUpdated: kri.last_measured_date || kri.updated_at
    };
  });

  const normalCount = enrichedKRIs.filter((k) => k.status === "normal").length;
  const warningCount = enrichedKRIs.filter((k) => k.status === "warning").length;
  const criticalCount = enrichedKRIs.filter((k) => k.status === "critical").length;
  const totalCount = enrichedKRIs.length;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Key Risk Indicators (KRI)
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Monitor critical risk metrics and thresholds
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <BackButton title="Back to KRI Registers" />
            <KRIConfigureDialog registerId={id} />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="container mx-auto grid grid-cols-2 gap-3 px-4 pt-6 sm:gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Normal</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{normalCount}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-500/15">
              <AlertCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Warning</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {warningCount}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-500/15">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Critical</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalCount}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-500/15">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total KRIs</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalCount}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-500/15">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* KRI Cards */}
      <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-2">
        {enrichedKRIs?.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">No KRIs configured yet</p>
          </div>
        ) : (
          enrichedKRIs?.map((kri) => {
            const accent = statusAccent(kri.status);
            const performance = getProgressPercentage(
              kri.currentValue,
              kri.target_value,
              kri.limit_value,
              kri.invert_direction
            );
            return (
              <Card
                key={kri.id}
                className="bg-card relative overflow-hidden p-0 shadow-sm ring-1 ring-black/5 transition hover:shadow-md dark:ring-white/5">
                {/* status stripe + ambient glow */}
                <div className={cn("absolute inset-y-0 left-0 w-1", accent.stripe)} />
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent",
                    accent.glow
                  )}
                />

                <div className="relative space-y-5 p-5 pl-6 sm:p-6 sm:pl-7">
                  {/* Header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <h3 className="text-foreground text-base font-semibold leading-snug sm:text-lg">
                          {kri.name}
                        </h3>
                        <span className="mt-1 shrink-0">{getTrendIcon(kri.trend)}</span>
                      </div>
                      {kri.description && (
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                          {kri.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="text-muted-foreground border-border bg-background/60 rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
                          {kri.category?.name || "Uncategorized"}
                        </span>
                        <span className="text-muted-foreground border-border bg-background/60 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize">
                          {String(kri.monitoring_frequency).toLowerCase()}
                        </span>
                        <span className="text-muted-foreground border-border bg-background/60 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize">
                          {String(kri.measurement_type).toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset",
                        accent.pill
                      )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", accent.stripe)} />
                      {kri.status}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="border-border bg-muted/30 grid grid-cols-1 divide-y rounded-xl border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="p-4">
                      <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                        Current
                      </p>
                      <p className="text-foreground mt-1 font-mono text-lg font-semibold tabular-nums">
                        {formatValue(kri.currentValue, kri.measurement_type, kri.currency_code)}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                        Target
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatValue(kri.target_value, kri.measurement_type, kri.currency_code)}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                        Limit
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-red-600 dark:text-red-400">
                        {formatValue(kri.limit_value, kri.measurement_type, kri.currency_code)}
                      </p>
                    </div>
                  </div>

                  {/* Warning zone — plain language */}
                  <div className="border-border rounded-xl border border-dashed p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                          Warning zone
                        </p>
                        <p className="text-foreground mt-1.5 text-sm leading-relaxed">
                          Trigger when value is{" "}
                          <span className="text-foreground font-mono font-semibold tabular-nums">
                            {conditionWord(kri.from_trigger_condition)}{" "}
                            {formatValue(
                              kri.from_trigger_value,
                              kri.measurement_type,
                              kri.currency_code
                            )}
                          </span>{" "}
                          <span className="text-muted-foreground">and</span>{" "}
                          <span className="text-foreground font-mono font-semibold tabular-nums">
                            {conditionWord(kri.to_trigger_condition)}{" "}
                            {formatValue(
                              kri.to_trigger_value,
                              kri.measurement_type,
                              kri.currency_code
                            )}
                          </span>
                          .
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                          Risk score
                        </p>
                        <p className="text-foreground mt-1 font-mono text-base font-semibold tabular-nums">
                          {kri.average_risk_score || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                        Performance
                      </span>
                      <span className="text-foreground font-mono text-sm font-semibold tabular-nums">
                        {performance.toFixed(0)}%
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                      <div
                        className={cn("h-full rounded-full transition-all", accent.bar)}
                        style={{ width: `${performance}%` }}
                      />
                    </div>
                  </div>

                  {/* Owner */}
                  {kri.owner && (
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold uppercase">
                        {kri.owner.first_name?.[0]}
                        {kri.owner.last_name?.[0]}
                      </span>
                      <span>
                        Owned by{" "}
                        <span className="text-foreground font-medium">
                          {kri.owner.first_name} {kri.owner.last_name}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-muted-foreground text-xs">
                      Last updated{" "}
                      <span className="text-foreground font-medium">
                        {kri.lastUpdated
                          ? format(new Date(kri.lastUpdated), "MMM dd, yyyy")
                          : "N/A"}
                      </span>
                    </span>
                    <KRIHistoryButton
                      kri={{
                        ...kri,
                        targetValue: parseFloat(kri.target_value),
                        threshold: parseFloat(kri.limit_value),
                        unit:
                          kri.measurement_type === "CURRENCY"
                            ? kri.currency_code
                            : kri.measurement_type === "PERCENTAGE"
                              ? "%"
                              : ""
                      }}
                    />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
