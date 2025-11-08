"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  CalendarIcon,
  X,
  ArrowRight,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { getIncidentStats } from "@/app/_actions/incident-actions";

interface IncidentStats {
  total_incidents: number;
  resolved_incidents: number;
  pending_incidents: number;
  avg_resolution_days: number;
  by_materiality: Record<string, number>;
  by_status: Record<string, number>;
  by_department: Record<string, number>;
}

export function EffectsReport() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClearDates = () => {
    setDateRange(undefined);
    setStats(null);
    setError(null);
  };

  const calculateDuration = () => {
    if (!dateRange?.from || !dateRange?.to) return null;
    const days =
      Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError("Please select a date range");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getIncidentStats({
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd")
      });

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || "Failed to fetch statistics");
      }
    } catch (err) {
      setError("An error occurred while fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const duration = calculateDuration();

  const resolutionRate = stats
    ? stats.total_incidents > 0
      ? Math.round((stats.resolved_incidents / stats.total_incidents) * 100)
      : 0
    : 0;

  // Transform by_department data for chart
  const chartData = stats?.by_department
    ? Object.entries(stats.by_department).map(([dept, count]) => ({
        department: dept,
        incidents: count
      }))
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <Filter className="text-primary h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">Select date range to filter incidents</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-left font-normal",
                    !dateRange?.from && "text-muted-foreground",
                    dateRange?.from && "border-primary/50 bg-primary/5"
                  )}>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                    {dateRange?.from ? (
                      <div className="flex items-center gap-1.5 truncate text-sm">
                        <span className="font-medium">
                          {format(dateRange.from, "MMM dd, yyyy")}
                        </span>
                        {dateRange.to && (
                          <>
                            <ArrowRight className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                            <span className="font-medium">
                              {format(dateRange.to, "MMM dd, yyyy")}
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm">Select date range</span>
                    )}
                  </div>
                  {dateRange?.from && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-destructive/10 hover:text-destructive ml-2 h-6 w-6 flex-shrink-0 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearDates();
                      }}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {duration && (
              <p className="text-muted-foreground text-xs">
                {duration} {duration === 1 ? "day" : "days"} selected
              </p>
            )}
          </div>

          {/* Quick Presets */}
          {!dateRange?.from && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Quick Select</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "Last 7 days", days: 7 },
                  { label: "Last 30 days", days: 30 },
                  { label: "Last 90 days", days: 90 },
                  { label: "This Year", days: 365 }
                ].map((preset) => (
                  <Button
                    key={preset.days}
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/5 hover:border-primary/50 text-xs transition-all"
                    onClick={() => {
                      const to = new Date();
                      const from = new Date();
                      from.setDate(from.getDate() - preset.days + 1);
                      setDateRange({ from, to });
                    }}>
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              className="flex-1"
              disabled={!dateRange?.from || !dateRange?.to || loading}
              onClick={handleGenerateReport}>
              <FileText className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Generate Report"}
            </Button>
            {dateRange?.from && dateRange?.to && (
              <Button variant="outline" onClick={handleClearDates}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              <div className="rounded-lg bg-blue-100 p-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_incidents}</div>
              <p className="text-muted-foreground mt-2 text-xs">In selected period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.resolved_incidents}</div>
              <p className="text-muted-foreground mt-2 text-xs">
                {resolutionRate}% resolution rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <div className="rounded-lg bg-orange-100 p-2">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pending_incidents}</div>
              <p className="text-muted-foreground mt-2 text-xs">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
              <div className="rounded-lg bg-purple-100 p-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avg_resolution_days.toFixed(1)}</div>
              <p className="text-muted-foreground mt-2 text-xs">days average</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart Card */}
      {stats && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Incidents by Department</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  Distribution of incidents across departments
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-2">
                <BarChart className="text-primary h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="incidents" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
