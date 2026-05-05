import { getKRIs, type KRI } from "@/app/_actions/risk-module-actions";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, AlertCircle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { KRIConfigureDialog } from "../../_components/kri-configure-dialog";
import { KRIHistoryButton } from "../../_components/kri-history-button";
import BackButton from "@/components/back-button";

function getStatusColor(status: string) {
  const colors = {
    normal: "bg-card border-l-green-500 dark:border-l-green-400",
    warning: "bg-card border-l-amber-500 dark:border-l-amber-400",
    critical: "bg-card border-l-red-500 dark:border-l-red-400"
  };
  return colors[status as keyof typeof colors] || "bg-card";
}

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
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Key Risk Indicators (KRI)</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Monitor critical risk metrics and thresholds
            </p>
          </div>
          <div className="flex gap-4">
            <BackButton title="Back to KRI Registers" />
            <KRIConfigureDialog registerId={id} />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="container mx-auto grid grid-cols-1 gap-4 px-4 pt-6 md:grid-cols-4">
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
          enrichedKRIs?.map((kri) => (
            <Card key={kri.id} className={cn("border-l-4 p-6", getStatusColor(kri.status))}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{kri.name}</h3>
                      {getTrendIcon(kri.trend)}
                    </div>
                    <p className="text-muted-foreground text-sm">{kri.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-muted-foreground bg-muted rounded px-2 py-0.5 text-xs">
                        Category: {kri.category?.name || "N/A"}
                      </span>
                      <span className="text-muted-foreground bg-muted rounded px-2 py-0.5 text-xs">
                        Frequency: {kri.monitoring_frequency}
                      </span>
                      <span className="text-muted-foreground bg-muted rounded px-2 py-0.5 text-xs">
                        Type: {kri.measurement_type}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium capitalize",
                      kri.status === "normal" &&
                        "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
                      kri.status === "warning" &&
                        "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
                      kri.status === "critical" &&
                        "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                    )}>
                    {kri.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Current Value</p>
                    <p className="text-lg font-bold">
                      {formatValue(kri.currentValue, kri.measurement_type, kri.currency_code)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Target Value</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatValue(kri.target_value, kri.measurement_type, kri.currency_code)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Limit Value</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatValue(kri.limit_value, kri.measurement_type, kri.currency_code)}
                    </p>
                  </div>
                </div>

                {/* Trigger Range */}
                <div className="bg-muted/50 dark:bg-muted/5 flex justify-between rounded-lg p-3">
                  <div>
                    <p className="text-muted-foreground mb-2 text-xs">
                      Trigger Range (Warning Zone)
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {formatValue(
                          kri.from_trigger_value,
                          kri.measurement_type,
                          kri.currency_code
                        )}
                      </span>
                      <span className="text-muted-foreground">{kri.from_trigger_condition}</span>
                      <span className="text-muted-foreground">to</span>
                      <span className="font-medium">
                        {formatValue(kri.to_trigger_value, kri.measurement_type, kri.currency_code)}
                      </span>
                      <span className="text-muted-foreground">{kri.to_trigger_condition}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2 text-xs">Average Risk Score</p>
                    <span className="text-muted-foreground">{kri.average_risk_score || 0}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>Performance</span>
                    <span>
                      {getProgressPercentage(
                        kri.currentValue,
                        kri.target_value,
                        kri.limit_value,
                        kri.invert_direction
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "h-full transition-all",
                        kri.status === "normal" && "bg-green-500",
                        kri.status === "warning" && "bg-amber-500",
                        kri.status === "critical" && "bg-red-500"
                      )}
                      style={{
                        width: `${getProgressPercentage(
                          kri.currentValue,
                          kri.target_value,
                          kri.limit_value,
                          kri.invert_direction
                        )}%`
                      }}
                    />
                  </div>
                </div>

                {/* Owner Info */}
                {kri.owner && (
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <span className="font-medium">Owner:</span>
                    <span>{`${kri.owner.first_name} ${kri.owner.last_name}`}</span>
                  </div>
                )}

                {/* Footer */}
                <div className="text-muted-foreground flex items-center justify-between border-t pt-3 text-xs">
                  <span>
                    Last updated:{" "}
                    {kri.lastUpdated ? format(new Date(kri.lastUpdated), "MMM dd, yyyy") : "N/A"}
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
          ))
        )}
      </div>
    </div>
  );
}
