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
  unit: string;
  status: string;
  trend: string;
  lastUpdated: Date | string;
}

interface KRIHistoryProps {
  kri: KRI | null;
  onClose: () => void;
}

function generateHistoricalData(kri: KRI) {
  const history = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, "MMM dd");

    const variance = (Math.random() - 0.5) * 0.5; 
    const trend = (kri.currentValue - kri.targetValue) / 7;
    const value = Number((kri.targetValue + trend * (7 - i) + variance).toFixed(2));

    history.push({
      date: dateStr,
      value: value,
      status: value >= kri.threshold ? "critical" : value > kri.targetValue ? "warning" : "normal"
    });
  }

  history[history.length - 1].value = kri.currentValue;

  return history;
}

function generateEvents(kri: KRI) {
  const events = [];
  const today = new Date();

  // Current status event
  events.push({
    date: format(today, "MMM dd, yyyy HH:mm"),
    event: `Value updated to ${kri.currentValue}${kri.unit}`,
    type: "update"
  });

  // Status-based events
  if (kri.status === "critical") {
    events.push({
      date: format(subDays(today, 1), "MMM dd, yyyy HH:mm"),
      event: `Threshold breach: Value exceeded ${kri.threshold}${kri.unit}`,
      type: "warning"
    });
  } else if (kri.status === "warning") {
    events.push({
      date: format(subDays(today, 1), "MMM dd, yyyy HH:mm"),
      event: `Approaching threshold (${kri.currentValue}${kri.unit})`,
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
      event: "Upward trend detected",
      type: "warning"
    });
  } else if (kri.trend === "down") {
    events.push({
      date: format(subDays(today, 2), "MMM dd, yyyy HH:mm"),
      event: "Value showing improvement",
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

  return (
    <Sheet open={!!kri} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto px-4 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-xl">{kri.name} - History</SheetTitle>
          <SheetDescription>View historical trends and events for this KRI</SheetDescription>
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
                    label={{
                      value: kri.unit,
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
                    formatter={(value: any) => [`${value}${kri.unit}`, "Value"]}
                  />
                  <ReferenceLine
                    y={kri.targetValue}
                    stroke="#22c55e"
                    strokeDasharray="3 3"
                    label={{
                      value: "Target",
                      position: "right",
                      fill: "#22c55e"
                    }}
                  />
                  <ReferenceLine
                    y={kri.threshold}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    label={{
                      value: "Threshold",
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
                <p className="text-foreground mt-1 text-2xl font-semibold">
                  {kri.currentValue}
                  {kri.unit}
                </p>
              </div>
              <div className="border-border bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">Target</p>
                <p className="mt-1 text-2xl font-semibold text-green-600">
                  {kri.targetValue}
                  {kri.unit}
                </p>
              </div>
              <div className="border-border bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">Threshold</p>
                <p className="mt-1 text-2xl font-semibold text-red-600">
                  {kri.threshold}
                  {kri.unit}
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
