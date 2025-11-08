"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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
  Calendar as CalendarIcon,
  X,
  ArrowRight,
  Filter,
  Loader2,
  View
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { getIncidents } from "@/app/_actions/incident-actions";
import { toast } from "sonner";
import { CustomPagination } from "@/components/ui/pagination";
import { IncidentData } from "@/lib/types/incidents-types";
import Search from "@/components/ui/search-field";

export function MyIncidents() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 1,
    has_next: false,
    has_prev: false
  });

  useEffect(() => {
    fetchIncidents();
  }, [pagination.page, pagination.page_size]);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const response = await getIncidents({
        page: pagination.page,
        page_size: pagination.page_size
      });

      if (response.success && response.data) {
        setIncidents(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } else {
        toast.error("Failed to load incidents");
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast.error("Error loading incidents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (incident: IncidentData) => {
    setSelectedIncident(incident);
    setDetailsDialogOpen(true);
  };

  const handleClearDates = () => {
    setDateRange(undefined);
  };

  const calculateDuration = () => {
    if (!dateRange?.from || !dateRange?.to) return null;
    const days =
      Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const getMaterialityColor = (materiality: string) => {
    const colors = {
      LOW: "bg-green-100 text-green-800 border-green-200",
      MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
      HIGH: "bg-orange-100 text-orange-800 border-orange-200",
      CRITICAL: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[materiality as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
      RESOLVED: "bg-green-100 text-green-800 border-green-200",
      CLOSED: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredIncidents = incidents.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.incident.details.toLowerCase().includes(searchLower) ||
      item.incident.location.toLowerCase().includes(searchLower) ||
      item.department.name.toLowerCase().includes(searchLower) ||
      item.primary_cause.name.toLowerCase().includes(searchLower)
    );
  });

  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    setPagination((prev) => ({
      ...prev,
      page: page !== undefined ? page : prev.page,
      page_size: page_size !== undefined ? page_size : prev.page_size,
      ...(page_size !== undefined && { page: 1 })
    }));
  };

  const customPaginationData = {
    page: pagination.page,
    page_size: pagination.page_size,
    total_pages: pagination.total_pages,
    totalCount: pagination.total,
    has_prev: pagination.has_prev,
    has_next: pagination.has_next
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
            <Search
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(value) => setSearchQuery(value)}
            />
          </div>

          <div className="rounded-lg border">
            <div className="max-h-[600px] overflow-auto py-1">
              <Table>
                <TableHeader className="bg-background sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="min-w-[120px]">Incident Date</TableHead>
                    <TableHead className="min-w-[150px]">Department</TableHead>
                    <TableHead className="min-w-[150px]">Primary Cause</TableHead>
                    <TableHead className="min-w-[120px]">Materiality</TableHead>
                    <TableHead className="min-w-[150px]">Location</TableHead>
                    <TableHead className="min-w-[150px]">Responsible Person</TableHead>
                    <TableHead className="min-w-[120px]">Due Date</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                          <p className="text-muted-foreground">Loading incidents...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredIncidents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-muted-foreground py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="text-muted-foreground/50 h-8 w-8" />
                          <p>No incidents found</p>
                          {searchQuery && <p className="text-xs">Try adjusting your search</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIncidents.map((item, index) => (
                      <TableRow key={item.incident.id}>
                        <TableCell className="font-medium">
                          {(pagination.page - 1) * pagination.page_size + index + 1}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(item.incident.incident_date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{item.department.name}</TableCell>
                        <TableCell>{item.primary_cause.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium capitalize",
                              getMaterialityColor(item.incident.materiality)
                            )}>
                            {item.incident.materiality}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.incident.location}</TableCell>
                        <TableCell>
                          {`${item.responsible_person.first_name} ${item.responsible_person.last_name}`}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(item.incident.due_date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium capitalize",
                              getStatusColor(item.incident.status)
                            )}>
                            {item.incident.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(item)}
                            className="h-8 gap-1.5">
                            <View className="h-3.5 w-3.5" />
                            View Incident
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* CustomPagination */}
          {filteredIncidents.length > 0 && (
            <CustomPagination
              pagination={customPaginationData}
              updatePagination={updatePagination}
              allowSetPageSize={true}
              showDetails={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Incident Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-h-[85vh] min-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
            <DialogDescription>Complete information about the selected incident</DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Incident Date</Label>
                    <p className="font-medium">
                      {format(new Date(selectedIncident.incident.incident_date), "PPP")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Discovery Date</Label>
                    <p className="font-medium">
                      {format(new Date(selectedIncident.incident.discovery_date), "PPP")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Department</Label>
                    <p className="font-medium">{selectedIncident.department.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Location</Label>
                    <p className="font-medium">{selectedIncident.incident.location}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Materiality</Label>
                    <Badge
                      className={cn(
                        "mt-1 font-medium capitalize",
                        getMaterialityColor(selectedIncident.incident.materiality)
                      )}>
                      {selectedIncident.incident.materiality}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <Badge
                      className={cn(
                        "mt-1 font-medium capitalize",
                        getStatusColor(selectedIncident.incident.status)
                      )}>
                      {selectedIncident.incident.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Causes */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold">Causes</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Primary Cause</Label>
                    <p className="font-medium">{selectedIncident.primary_cause.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {selectedIncident.primary_cause.description}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Specific Cause</Label>
                    <p className="font-medium">{selectedIncident.specific_cause.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {selectedIncident.specific_cause.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <h3 className="border-b pb-2 text-lg font-semibold">Incident Details</h3>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm whitespace-pre-wrap">{selectedIncident.incident.details}</p>
                </div>
              </div>

              {/* Root Cause */}
              <div className="space-y-2">
                <h3 className="border-b pb-2 text-lg font-semibold">Root Cause</h3>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedIncident.incident.root_cause}
                  </p>
                </div>
              </div>

              {/* Action Plan */}
              <div className="space-y-2">
                <h3 className="border-b pb-2 text-lg font-semibold">Action Plan</h3>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedIncident.incident.action_plan}
                  </p>
                </div>
              </div>

              {/* Responsibility & Timeline */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold">Responsibility & Timeline</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Responsible Person</Label>
                    <p className="font-medium">
                      {`${selectedIncident.responsible_person.first_name} ${selectedIncident.responsible_person.last_name}`}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {selectedIncident.responsible_person.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Due Date</Label>
                    <p className="font-medium">
                      {format(new Date(selectedIncident.incident.due_date), "PPP")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Impact */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold">Financial Impact</h3>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Financial Loss Implications
                  </Label>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1 font-medium",
                      selectedIncident.incident.financial_loss_implications === "YES"
                        ? "border-red-200 bg-red-100 text-red-800"
                        : "border-green-200 bg-green-100 text-green-800"
                    )}>
                    {selectedIncident.incident.financial_loss_implications}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
