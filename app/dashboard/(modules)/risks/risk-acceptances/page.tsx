"use client";
import { useState } from "react";
import { CheckCircle2, XCircle, Clock, AlertCircle, FileText, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/page-header";
import { format } from "date-fns";
import Search from "@/components/ui/search-field";

// Mock data - replace with your API data
const mockAcceptances = [
  {
    id: "RAF-2024-001",
    risk_description: "Cloud infrastructure security gaps in production environment",
    risk_rate: "HIGH",
    status: "PENDING",
    submitted_by: "John Doe",
    submitted_date: "2024-11-05",
    deficiency_description: "Missing multi-factor authentication on admin accounts",
    justification: "Implementing MFA requires vendor approval and testing period",
    compensating_controls: "Enhanced monitoring and access logging implemented",
    expiration_date: "2025-02-05"
  },
  {
    id: "RAF-2024-002",
    risk_description: "Legacy payment system without encryption",
    risk_rate: "HIGH",
    status: "APPROVED",
    submitted_by: "Jane Smith",
    submitted_date: "2024-11-01",
    approved_date: "2024-11-03",
    approved_by: "Risk Manager",
    remarks: "Approved with condition of quarterly reviews",
    deficiency_description: "Payment data transmitted without end-to-end encryption",
    justification: "System upgrade scheduled for Q1 2025",
    compensating_controls: "Network segmentation and enhanced firewall rules",
    expiration_date: "2025-03-01"
  },
  {
    id: "RAF-2024-003",
    risk_description: "Outdated antivirus software on endpoint devices",
    risk_rate: "MEDIUM",
    status: "REJECTED",
    submitted_by: "Mike Johnson",
    submitted_date: "2024-10-28",
    rejected_date: "2024-10-30",
    rejected_by: "Security Officer",
    remarks: "Insufficient compensating controls. Immediate update required.",
    deficiency_description: "Antivirus definitions 6 months out of date",
    justification: "Budget constraints for license renewal",
    compensating_controls: "Manual scanning protocols",
    expiration_date: "2024-12-28"
  },
  {
    id: "RAF-2024-004",
    risk_description: "Database backup frequency below policy standards",
    risk_rate: "MEDIUM",
    status: "PENDING",
    submitted_by: "Sarah Williams",
    submitted_date: "2024-11-07",
    deficiency_description: "Backups performed weekly instead of daily",
    justification: "Storage capacity limitations pending infrastructure upgrade",
    compensating_controls: "Transaction logging and point-in-time recovery enabled",
    expiration_date: "2025-01-07"
  },
  {
    id: "RAF-2024-005",
    risk_description: "Third-party API integration without security audit",
    risk_rate: "HIGH",
    status: "APPROVED",
    submitted_by: "David Brown",
    submitted_date: "2024-10-25",
    approved_date: "2024-10-27",
    approved_by: "CTO",
    remarks: "Approved pending completion of security audit by December 2024",
    deficiency_description: "Vendor security assessment not completed",
    justification: "Critical business functionality required for product launch",
    compensating_controls: "API gateway with rate limiting and monitoring",
    expiration_date: "2024-12-31"
  }
];

type Status = "all" | "pending" | "approved" | "rejected";

export default function RiskAcceptanceList() {
  const [activeTab, setActiveTab] = useState<Status>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAcceptance, setSelectedAcceptance] = useState<typeof mockAcceptances[0] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusConfig = {
    PENDING: {
      icon: Clock,
      color: "bg-yellow-50 border-yellow-200",
      badge: "outline",
      label: "Pending",
      textColor: "text-yellow-700"
    },
    APPROVED: {
      icon: CheckCircle2,
      color: "bg-green-50 border-green-200",
      badge: "default",
      label: "Approved",
      textColor: "text-green-700"
    },
    REJECTED: {
      icon: XCircle,
      color: "bg-red-50 border-red-200",
      badge: "destructive",
      label: "Rejected",
      textColor: "text-red-700"
    }
  };

  // Filter acceptances based on active tab and search
  const filteredAcceptances = mockAcceptances.filter((acceptance) => {
    const matchesTab = activeTab === "all" || acceptance.status.toLowerCase() === activeTab;
    const matchesSearch =
      acceptance.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acceptance.risk_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acceptance.submitted_by.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Count by status
  const counts = {
    all: mockAcceptances.length,
    pending: mockAcceptances.filter((a) => a.status === "PENDING").length,
    approved: mockAcceptances.filter((a) => a.status === "APPROVED").length,
    rejected: mockAcceptances.filter((a) => a.status === "REJECTED").length
  };

  const handleAcceptanceClick = (acceptance: any) => {
    setSelectedAcceptance(acceptance);
    setModalStatus(acceptance.status === "PENDING" ? "" : acceptance.status);
    setRemarks(acceptance.remarks || "");
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!modalStatus || !remarks.trim()) {
      alert("Please select a status and provide remarks");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Updating acceptance:", {
      id: selectedAcceptance?.id,
      status: modalStatus,
      remarks: remarks
    });

    setIsSubmitting(false);
    setShowModal(false);
    setSelectedAcceptance(null);
    setModalStatus("");
    setRemarks("");
  };

  const AcceptanceCard = ({ acceptance }: { acceptance: any }) => {
    const config = statusConfig[acceptance.status as keyof typeof statusConfig];
    const Icon = config.icon;
    const hasRemarks = acceptance.remarks;

    return (
      <Card
        className={`border ${config.color} cursor-pointer p-4 transition-all`}
        onClick={() => handleAcceptanceClick(acceptance)}>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex flex-1 items-start gap-2">
            <Icon className="mt-0.5 h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <h4 className="line-clamp-2 text-sm font-semibold">{acceptance.risk_description}</h4>
              <p className="mt-1 text-xs text-gray-500">ID: {acceptance.id}</p>
            </div>
          </div>
          <Badge variant={config.badge as any}>{config.label}</Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium text-gray-700">Risk Rate</p>
              <Badge
                variant={acceptance.risk_rate === "HIGH" ? "destructive" : "default"}
                className={
                  acceptance.risk_rate === "HIGH"
                    ? ""
                    : "border-yellow-200 bg-yellow-100 text-yellow-700"
                }>
                {acceptance.risk_rate}
              </Badge>
            </div>
            <div>
              <p className="font-medium text-gray-700">Submitted By</p>
              <p className="truncate text-gray-900">{acceptance.submitted_by}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t pt-2">
            <div>
              <p className="font-medium text-gray-700">Submitted Date</p>
              <p className="text-gray-900">
                {format(new Date(acceptance.submitted_date), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Expiration Date</p>
              <p className="text-gray-900">
                {format(new Date(acceptance.expiration_date), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {acceptance.deficiency_description && (
            <div className="border-t pt-2">
              <p className="mb-1 font-medium text-gray-700">Deficiency:</p>
              <p className="line-clamp-2 text-gray-600">{acceptance.deficiency_description}</p>
            </div>
          )}

          {(acceptance.approved_date || acceptance.rejected_date) && (
            <div className="flex items-center justify-between pt-2 text-gray-500">
              {acceptance.approved_date && (
                <span>Approved: {format(new Date(acceptance.approved_date), "MMM dd, yyyy")}</span>
              )}
              {acceptance.rejected_date && (
                <span>Rejected: {format(new Date(acceptance.rejected_date), "MMM dd, yyyy")}</span>
              )}
              {hasRemarks && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Eye className="h-3 w-3" />
                  <span className="text-xs font-medium">View Details</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Risk Acceptance Log"
            description="Review and manage all risk acceptance requests"
            icon="ClipboardCheck"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Risk Acceptance Requests
            </CardTitle>
            <CardDescription>
              Complete history of all risk acceptance requests with approval status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <Search
                placeholder="Search by ID, description, or submitter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e)}
              />
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Status)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="pending" className={statusConfig.PENDING.textColor}>
                  Pending ({counts.pending})
                </TabsTrigger>
                <TabsTrigger value="approved" className={statusConfig.APPROVED.textColor}>
                  Approved ({counts.approved})
                </TabsTrigger>
                <TabsTrigger value="rejected" className={statusConfig.REJECTED.textColor}>
                  Rejected ({counts.rejected})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-3">
                {filteredAcceptances.map((acceptance) => (
                  <AcceptanceCard key={acceptance.id} acceptance={acceptance} />
                ))}
              </TabsContent>

              <TabsContent value="pending" className="mt-4 space-y-3">
                {filteredAcceptances.length > 0 ? (
                  filteredAcceptances.map((acceptance) => (
                    <AcceptanceCard key={acceptance.id} acceptance={acceptance} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
                    <p className="text-sm text-gray-500">No pending acceptances</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="mt-4 space-y-3">
                {filteredAcceptances.length > 0 ? (
                  filteredAcceptances.map((acceptance) => (
                    <AcceptanceCard key={acceptance.id} acceptance={acceptance} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
                    <p className="text-sm text-gray-500">No approved acceptances</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="mt-4 space-y-3">
                {filteredAcceptances.length > 0 ? (
                  filteredAcceptances.map((acceptance) => (
                    <AcceptanceCard key={acceptance.id} acceptance={acceptance} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
                    <p className="text-sm text-gray-500">No rejected acceptances</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-h-[90vh] min-w-2xl overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{selectedAcceptance?.id}</DialogTitle>
                <div className="mt-2 flex items-center gap-2">
                  {selectedAcceptance && (
                    <>
                      <Badge
                        variant="outline"
                        className={statusConfig[
                          selectedAcceptance.status as keyof typeof statusConfig
                        ].color
                          .replace("bg-", "bg-")
                          .replace("border-", "border-")}>
                        {selectedAcceptance.status}
                      </Badge>
                      <Badge
                        variant={
                          selectedAcceptance.risk_rate === "HIGH" ? "destructive" : "default"
                        }
                        className={
                          selectedAcceptance.risk_rate === "HIGH"
                            ? ""
                            : "border-yellow-200 bg-yellow-100 text-yellow-700"
                        }>
                        {selectedAcceptance.risk_rate}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-6">
            <div className="space-y-6 py-4">
              {/* Risk Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    Risk Description
                  </Label>
                  <div className="rounded-md border bg-gray-50 p-4">
                    <p className="text-sm">{selectedAcceptance?.risk_description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    Deficiency Description
                  </Label>
                  <div className="rounded-md border bg-gray-50 p-4">
                    <p className="text-sm">{selectedAcceptance?.deficiency_description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    Justification
                  </Label>
                  <div className="rounded-md border bg-gray-50 p-4">
                    <p className="text-sm">{selectedAcceptance?.justification}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    Compensating Controls
                  </Label>
                  <div className="rounded-md border bg-gray-50 p-4">
                    <p className="text-sm">{selectedAcceptance?.compensating_controls}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Submission Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Submission Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Submitted By</Label>
                      <p className="mt-1 font-medium">{selectedAcceptance?.submitted_by}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Submitted Date</Label>
                      <p className="mt-1 font-medium">
                        {selectedAcceptance?.submitted_date &&
                          format(new Date(selectedAcceptance.submitted_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Expiration Date</Label>
                      <p className="mt-1 font-medium">
                        {selectedAcceptance?.expiration_date &&
                          format(new Date(selectedAcceptance.expiration_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Remarks */}
              {selectedAcceptance?.remarks && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Previous Remarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedAcceptance.remarks}</p>
                    {selectedAcceptance.approved_by && (
                      <p className="text-muted-foreground mt-2 text-xs">
                        By: {selectedAcceptance.approved_by}
                      </p>
                    )}
                    {selectedAcceptance.rejected_by && (
                      <p className="text-muted-foreground mt-2 text-xs">
                        By: {selectedAcceptance.rejected_by}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Status Update Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                  <CardDescription>Change the acceptance status and add remarks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={modalStatus} onValueChange={setModalStatus}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPROVED">APPROVED</SelectItem>
                        <SelectItem value="REJECTED">REJECTED</SelectItem>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks *</Label>
                    <Textarea
                      id="remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={4}
                      placeholder="Enter your remarks here..."
                      className="resize-none"
                    />
                    <p className="text-muted-foreground text-xs">
                      Please provide detailed remarks explaining your decision
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isSubmitting || !modalStatus || !remarks.trim()}>
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
