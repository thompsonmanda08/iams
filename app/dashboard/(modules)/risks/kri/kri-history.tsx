"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { format, subDays } from "date-fns";

interface KRI {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  targetValue: number;
  threshold: number;
  target_value: number | string;
  limit_value: number | string;
  measurement_type?: string;
  currency_code?: string;
  unit: string;
  status: string;
  trend: string;
  lastUpdated: Date | string;
}

interface KRIHistoryProps {
  kri: KRI | null;
  onClose: () => void;
}

function formatValue(value: number, measurementType?: string, currencyCode?: string): string {
  if (!measurementType) {
    return value.toString();
  }

  switch (measurementType) {
    case "PERCENTAGE":
      return `${value.toFixed(2)}%`;
    case "CURRENCY":
      return `${currencyCode || "USD"} ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "COUNT":
      return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
    case "NUMERIC":
      return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    default:
      return value.toString();
  }
}

function getUnit(measurementType?: string, currencyCode?: string): string {
  switch (measurementType) {
    case "PERCENTAGE":
      return "%";
    case "CURRENCY":
      return currencyCode || "USD";
    case "COUNT":
      return "";
    case "NUMERIC":
      return "";
    default:
      return "";
  }
}

function generateHistoricalData(kri: KRI) {
  const history = [];
  const today = new Date();
  const targetValue =
    typeof kri.target_value === "string"
      ? parseFloat(kri.target_value)
      : kri.targetValue || kri.target_value;
  const limitValue =
    typeof kri.limit_value === "string"
      ? parseFloat(kri.limit_value)
      : kri.threshold || kri.limit_value;

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, "MMM dd");

    // Create variance based on measurement type
    let variance = 0;
    if (kri.measurement_type === "CURRENCY") {
      variance = (Math.random() - 0.5) * ((targetValue as any) * 0.1); // 10% variance
    } else if (kri.measurement_type === "PERCENTAGE") {
      variance = (Math.random() - 0.5) * 5; // 5% variance
    } else {
      variance = (Math.random() - 0.5) * (targetValue * 0.2); // 20% variance
    }

    const trend = (kri.currentValue - targetValue) / 7;
    const value = Number(((targetValue as any) + trend * (7 - i) + variance).toFixed(2));

    history.push({
      date: dateStr,
      value: value,
      status: value <= limitValue ? "critical" : value < targetValue ? "warning" : "normal"
    });
  }

  history[history.length - 1].value = kri.currentValue;

  return history;
}

function generateEvents(kri: KRI) {
  const events = [];
  const today = new Date();
  const unit = getUnit(kri.measurement_type, kri.currency_code);
  const targetValue =
    typeof kri.target_value === "string"
      ? parseFloat(kri.target_value)
      : kri.targetValue || kri.target_value;
  const limitValue =
    typeof kri.limit_value === "string"
      ? parseFloat(kri.limit_value)
      : kri.threshold || kri.limit_value;

  // Current status event
  events.push({
    date: format(today, "MMM dd, yyyy HH:mm"),
    event: `Value updated to ${formatValue(kri.currentValue, kri.measurement_type, kri.currency_code)}`,
    type: "update"
  });

  // Status-based events
  if (kri.status === "critical") {
    events.push({
      date: format(subDays(today, 1), "MMM dd, yyyy HH:mm"),
      event: `Critical threshold breach: Value is below ${formatValue(limitValue as any, kri.measurement_type, kri.currency_code)}`,
      type: "warning"
    });
  } else if (kri.status === "warning") {
    events.push({
      date: format(subDays(today, 1), "MMM dd, yyyy HH:mm"),
      event: `Warning: Value is below target (${formatValue(kri.currentValue, kri.measurement_type, kri.currency_code)})`,
      type: "warning"
    });
  } else {
    events.push({
      date: format(subDays(today, 1), "MMM dd, yyyy HH:mm"),
      event: "Value within acceptable range",
      type: "info"
    });
  }

  // Trend event
  if (kri.trend === "up") {
    events.push({
      date: format(subDays(today, 2), "MMM dd, yyyy HH:mm"),
      event: "Upward trend detected - Improving performance",
      type: "info"
    });
  } else if (kri.trend === "down") {
    events.push({
      date: format(subDays(today, 2), "MMM dd, yyyy HH:mm"),
      event: "Downward trend detected - Requires attention",
      type: "warning"
    });
  }

  // Measurement type specific events
  if (kri.measurement_type === "CURRENCY") {
    events.push({
      date: format(subDays(today, 3), "MMM dd, yyyy HH:mm"),
      event: `Financial metric tracking in ${kri.currency_code}`,
      type: "info"
    });
  }

  // Weekly review event
  events.push({
    date: format(subDays(today, 7), "MMM dd, yyyy HH:mm"),
    event: "Weekly KRI review completed",
    type: "info"
  });

  return events;
}

export function KRIHistory({ kri, onClose }: KRIHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (kri) {
      setHistory(generateHistoricalData(kri));
      setEvents(generateEvents(kri));
    }
  }, [kri]);

  if (!kri) return null;

  const targetValue =
    typeof kri.target_value === "string"
      ? parseFloat(kri.target_value)
      : kri.targetValue || kri.target_value;
  const limitValue =
    typeof kri.limit_value === "string"
      ? parseFloat(kri.limit_value)
      : kri.threshold || kri.limit_value;
  const unit = getUnit(kri.measurement_type, kri.currency_code);

  return (
    <Sheet open={!!kri} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto px-4 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-xl">{kri.name} - History</SheetTitle>
          <SheetDescription>
            View historical trends and events for this KRI
            {kri.measurement_type && (
              <span className="bg-muted ml-2 rounded px-2 py-0.5 text-xs">
                Type: {kri.measurement_type}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="chart" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Trend Chart</TabsTrigger>
            <TabsTrigger value="events">Event Log</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-6 space-y-4">
            <div className="border-border bg-card rounded-lg border p-4">
              <h4 className="text-foreground mb-4 text-sm font-medium">7-Day Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => {
                      if (kri.measurement_type === "CURRENCY") {
                        return `${kri.currency_code} ${value.toLocaleString()}`;
                      } else if (kri.measurement_type === "PERCENTAGE") {
                        return `${value}%`;
                      }
                      return value.toString();
                    }}
                    label={{
                      value: unit,
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "hsl(var(--muted-foreground))" }
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--popover-foreground))"
                    }}
                    formatter={(value: any) => [
                      formatValue(value, kri.measurement_type, kri.currency_code),
                      "Value"
                    ]}
                  />
                  <ReferenceLine
                    y={targetValue}
                    stroke="#22c55e"
                    strokeDasharray="3 3"
                    label={{
                      value: "Target",
                      position: "right",
                      fill: "#22c55e"
                    }}
                  />
                  <ReferenceLine
                    y={limitValue}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    label={{
                      value: "Limit",
                      position: "right",
                      fill: "#ef4444"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="border-border bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">Current</p>
                <p className="text-foreground mt-1 text-xl font-semibold">
                  {formatValue(kri.currentValue, kri.measurement_type, kri.currency_code)}
                </p>
              </div>
              <div className="border-border bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">Target</p>
                <p className="mt-1 text-xl font-semibold text-green-600">
                  {formatValue(targetValue, kri.measurement_type, kri.currency_code)}
                </p>
              </div>
              <div className="border-border bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">Limit</p>
                <p className="mt-1 text-xl font-semibold text-red-600">
                  {formatValue(limitValue, kri.measurement_type, kri.currency_code)}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">No events recorded</p>
                </div>
              ) : (
                events.map((event, index) => (
                  <div
                    key={index}
                    className="border-border bg-card flex gap-4 rounded-lg border p-4">
                    <div
                      className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                        event.type === "warning"
                          ? "bg-amber-500"
                          : event.type === "info"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">{event.event}</p>
                      <p className="text-muted-foreground mt-1 text-xs">{event.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
