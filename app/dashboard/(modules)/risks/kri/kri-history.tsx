"use client";
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
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { getKRIMeasurements } from "@/app/_actions/risk-module-actions";
import { useQuery } from "@tanstack/react-query";

interface KRI {
  id: string;
  name: string;
  description: string;
  currentValue?: number;
  targetValue?: number;
  threshold?: number;
  target_value: number | string;
  limit_value: number | string;
  measurement_type?: string;
  currency_code?: string;
  unit?: string;
  status: string;
  trend: string;
  lastUpdated?: Date | string;
  last_measured_value?: number;
  last_status?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: string;
  organization_id: string | null;
  branch_id: string | null;
  department_id: string | null;
  role_id: string | null;
  is_active: boolean;
  is_ldap_user: boolean;
  last_login: string;
  change_password: boolean;
  is_locked: boolean;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  old_password: string;
  new_password: string;
  otp: string;
}

interface Measurement {
  id: string;
  kri_id: string;
  incident_id: string | null;
  measurement_date: string;
  measured_value: number;
  status: string;
  notes: string;
  measured_by: string | null;
  created_at: string;
  user?: User;
}

interface KRIHistoryProps {
  kri: KRI | null;
  open: boolean;
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

export function KRIHistory({ kri, open, onClose }: KRIHistoryProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["kri-measurements", kri?.id],
    queryFn: async () => {
      const response = await getKRIMeasurements(kri?.id as string);
      return response;
    },
    enabled: !!kri?.id && open,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  if (!kri) return null;

  const targetValue =
    typeof kri.target_value === "string"
      ? parseFloat(kri.target_value)
      : kri.targetValue || kri.target_value;
  const limitValue =
    typeof kri.limit_value === "string"
      ? parseFloat(kri.limit_value)
      : kri.threshold || kri.limit_value;
  const currentValue = kri.currentValue || kri.last_measured_value || 0;
  const unit = getUnit(kri.measurement_type, kri.currency_code);

  const measurements = (data?.data as Measurement[]) || [];

  const chartData = measurements
    .slice()
    .reverse()
    .map((m: Measurement) => ({
      date: format(new Date(m.measurement_date), "MMM dd"),
      value: m.measured_value,
      status: m.status
    }));

  const events = measurements.map((m: Measurement) => ({
    date: format(new Date(m.measurement_date), "MMM d, yyyy HH:mm"),
    event: `Value updated to ${formatValue(m.measured_value, kri.measurement_type, kri.currency_code)} - ${m.status}`,
    type: m.status === "Red" ? "warning" : m.status === "Green" ? "success" : "info",
    notes: m.notes,
    user: m.user ? `${m.user.first_name} ${m.user.last_name}`.trim() || m.user.email : "System"
  }));

  return (
    <Sheet open={open} onOpenChange={onClose}>
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

        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex h-96 items-center justify-center">
            <p className="text-destructive text-sm">Failed to load measurements</p>
          </div>
        ) : (
          <Tabs defaultValue="chart" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Trend Chart</TabsTrigger>
              <TabsTrigger value="events">Event Log</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-6 space-y-4">
              <div className="border-border bg-card rounded-lg border p-4">
                <h4 className="text-foreground mb-4 text-sm font-medium">
                  {measurements.length}-Period Trend
                </h4>
                {chartData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-muted-foreground text-sm">No measurement data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
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
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="border-border bg-card rounded-lg border p-4">
                  <p className="text-muted-foreground text-xs">Current</p>
                  <p className="text-foreground mt-1 text-xl font-semibold">
                    {formatValue(currentValue, kri.measurement_type, kri.currency_code)}
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
              <div className="space-y-4 pb-8">
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
                            ? "bg-destructive"
                            : event.type === "success"
                              ? "bg-green-500"
                              : "bg-amber-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">{event.event}</p>
                        {event.notes && (
                          <p className="text-muted-foreground mt-1 text-xs">{event.notes}</p>
                        )}
                        <p className="text-muted-foreground mt-1 text-xs">
                          {event.date} • {event.user}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
