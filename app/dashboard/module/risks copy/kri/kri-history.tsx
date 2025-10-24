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

interface KRIHistoryProps {
  kriId: string | null;
  onClose: () => void;
}

const kriData: Record<string, any> = {
  "1": {
    title: "System Downtime",
    target: 1,
    threshold: 3,
    unit: "%",
    history: [
      { date: "Oct 15", value: 1.8, status: "warning" },
      { date: "Oct 16", value: 2.1, status: "warning" },
      { date: "Oct 17", value: 2.5, status: "warning" },
      { date: "Oct 18", value: 2.8, status: "warning" },
      { date: "Oct 19", value: 2.3, status: "warning" },
      { date: "Oct 20", value: 2.6, status: "warning" },
      { date: "Oct 21", value: 2.4, status: "warning" },
      { date: "Oct 22", value: 2.5, status: "warning" }
    ],
    events: [
      { date: "Oct 22, 2025 10:41", event: "Value updated to 2.5%", type: "update" },
      { date: "Oct 21, 2025 10:30", event: "Threshold breach warning cleared", type: "info" },
      { date: "Oct 20, 2025 15:22", event: "Value increased to 2.6%", type: "warning" },
      { date: "Oct 19, 2025 09:15", event: "Value decreased to 2.3%", type: "info" },
      { date: "Oct 18, 2025 14:45", event: "Approaching threshold (2.8%)", type: "warning" }
    ]
  },
  "2": {
    title: "Compliance Violations",
    target: 0,
    threshold: 2,
    unit: "count",
    history: [
      { date: "Oct 15", value: 0, status: "normal" },
      { date: "Oct 16", value: 0, status: "normal" },
      { date: "Oct 17", value: 0, status: "normal" },
      { date: "Oct 18", value: 0, status: "normal" },
      { date: "Oct 19", value: 0, status: "normal" },
      { date: "Oct 20", value: 0, status: "normal" },
      { date: "Oct 21", value: 0, status: "normal" },
      { date: "Oct 22", value: 0, status: "normal" }
    ],
    events: [
      { date: "Oct 22, 2025 10:41", event: "No violations detected", type: "info" },
      { date: "Oct 15, 2025 08:00", event: "Weekly compliance audit completed", type: "info" }
    ]
  },
  "3": {
    title: "Fraud Incidents",
    target: 0,
    threshold: 3,
    unit: "count",
    history: [
      { date: "Oct 15", value: 0, status: "normal" },
      { date: "Oct 16", value: 0, status: "normal" },
      { date: "Oct 17", value: 1, status: "warning" },
      { date: "Oct 18", value: 1, status: "warning" },
      { date: "Oct 19", value: 1, status: "warning" },
      { date: "Oct 20", value: 1, status: "warning" },
      { date: "Oct 21", value: 1, status: "warning" },
      { date: "Oct 22", value: 1, status: "warning" }
    ],
    events: [
      { date: "Oct 22, 2025 10:41", event: "Incident count remains at 1", type: "info" },
      { date: "Oct 17, 2025 11:23", event: "Fraud incident detected and flagged", type: "warning" },
      { date: "Oct 17, 2025 11:30", event: "Investigation initiated", type: "info" }
    ]
  },
  "4": {
    title: "Supplier Delays",
    target: 5,
    threshold: 10,
    unit: "%",
    history: [
      { date: "Oct 15", value: 6.2, status: "warning" },
      { date: "Oct 16", value: 6.8, status: "warning" },
      { date: "Oct 17", value: 7.1, status: "warning" },
      { date: "Oct 18", value: 7.5, status: "warning" },
      { date: "Oct 19", value: 7.8, status: "warning" },
      { date: "Oct 20", value: 8.2, status: "warning" },
      { date: "Oct 21", value: 8.5, status: "warning" },
      { date: "Oct 22", value: 8.0, status: "warning" }
    ],
    events: [
      { date: "Oct 22, 2025 10:41", event: "Delay rate decreased to 8.0%", type: "info" },
      { date: "Oct 21, 2025 16:20", event: "Delay rate increased to 8.5%", type: "warning" },
      { date: "Oct 20, 2025 13:15", event: "Supplier performance review scheduled", type: "info" },
      { date: "Oct 19, 2025 10:00", event: "Trending towards threshold", type: "warning" }
    ]
  }
};

export function KRIHistory({ kriId, onClose }: KRIHistoryProps) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (kriId && kriData[kriId]) {
      setData(kriData[kriId]);
    }
  }, [kriId]);

  if (!data) return null;

  return (
    <Sheet open={!!kriId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl px-4">
        <SheetHeader>
          <SheetTitle className="text-xl">{data.title} - History</SheetTitle>
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
                <LineChart data={data.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    label={{
                      value: data.unit,
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "hsl(var(--muted-foreground))" }
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem"
                    }}
                  />
                  <ReferenceLine
                    y={data.target}
                    stroke="hsl(var(--success))"
                    strokeDasharray="3 3"
                    label={{
                      value: "Target",
                      position: "right",
                      fill: "hsl(var(--success))"
                    }}
                  />
                  <ReferenceLine
                    y={data.threshold}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="3 3"
                    label={{
                      value: "Threshold",
                      position: "right",
                      fill: "hsl(var(--destructive))"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="border-border bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">Current</p>
                <p className="text-foreground mt-1 text-2xl font-semibold">
                  {data.history[data.history.length - 1].value}
                  {data.unit}
                </p>
              </div>
              <div className="border-border bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">Target</p>
                <p className="text-success mt-1 text-2xl font-semibold">
                  {data.target}
                  {data.unit}
                </p>
              </div>
              <div className="border-border bg-card rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">Threshold</p>
                <p className="text-destructive mt-1 text-2xl font-semibold">
                  {data.threshold}
                  {data.unit}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="space-y-4">
              {data.events.map((event: any, index: number) => (
                <div key={index} className="border-border bg-card flex gap-4 rounded-lg border p-4">
                  <div
                    className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                      event.type === "warning"
                        ? "bg-secondary"
                        : event.type === "info"
                          ? "bg-primary"
                          : "bg-muted-foreground"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">{event.event}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
