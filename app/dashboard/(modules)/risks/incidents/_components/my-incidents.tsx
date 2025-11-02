"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Copy,
  FileText,
  FileSpreadsheet,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  ArrowRight,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export function MyIncidents() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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

          {/* Action Buttons */}
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

      {/* Report Incidents Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Report Incidents</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">View and export incident reports</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input placeholder="Search incidents..." className="pl-9" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Cause 1</TableHead>
                  <TableHead>Cause 2</TableHead>
                  <TableHead>Materiality/Tier</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Root Cause</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Action User</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Financial Value</TableHead>
                  <TableHead>Financial Impact</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={16} className="text-muted-foreground py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="text-muted-foreground/50 h-8 w-8" />
                      <p>No data available in table</p>
                      {!dateRange?.from && (
                        <p className="text-xs">Select a date range to view incidents</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">Showing 0 to 0 of 0 entries</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
