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
import {
  Calendar as CalendarIcon,
  X,
  ArrowRight,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const mockData = [
  { month: "Jan", incidents: 12, resolved: 10 },
  { month: "Feb", incidents: 15, resolved: 13 },
  { month: "Mar", incidents: 8, resolved: 8 },
  { month: "Apr", incidents: 20, resolved: 16 },
  { month: "May", incidents: 18, resolved: 15 },
  { month: "Jun", incidents: 14, resolved: 12 }
];

export function EffectsReport() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [department, setDepartment] = useState<string>("");

  const handleClearDates = () => {
    setDateRange(undefined);
  };

  const calculateDuration = () => {
    if (!dateRange?.from || !dateRange?.to) return null;
    const days =
      Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const duration = calculateDuration();

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <FileText className="text-primary h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold">Report Filters</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">
            Configure your report parameters and date range
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Department Filter */}
            <div className="space-y-2">
              <Label htmlFor="report-department" className="text-sm font-medium">
                Department
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="report-department" className="w-full">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="it">Information Technology</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
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
                          <span className="font-medium">{format(dateRange.from, "MMM dd")}</span>
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
          </div>

          {/* Quick Presets */}
          {!dateRange?.from && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Quick Select</Label>
              <div className="grid grid-cols-4 gap-2">
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

          {/* Generate Button */}
          <div className="flex items-center gap-3 pt-2">
            <Button className="flex-1" disabled={!dateRange?.from || !dateRange?.to}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-blue-500/10 blur-2xl" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total Incidents
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87</div>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-green-500/10 blur-2xl" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">Resolved</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">74</div>
            <p className="text-muted-foreground mt-1 text-xs">85% resolution rate</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">Pending</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">13</div>
            <p className="text-muted-foreground mt-1 text-xs">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-purple-500/10 blur-2xl" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Avg. Resolution Time
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.2</div>
            <p className="text-muted-foreground mt-1 text-xs">days average</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Incidents Overview</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Monthly incident tracking and resolution rates
              </p>
            </div>
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BarChart className="text-primary h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Bar
                dataKey="incidents"
                fill="hsl(var(--primary))"
                name="Total Incidents"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="resolved"
                fill="hsl(var(--chart-2))"
                name="Resolved"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
