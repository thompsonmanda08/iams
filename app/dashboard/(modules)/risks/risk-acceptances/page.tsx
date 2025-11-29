"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  View,
  Send
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import Search from "@/components/ui/search-field";
import {
  getRiskAcceptances,
  updateRiskAcceptance,
  submitRiskAcceptanceForApproval
} from "@/app/_actions/risk-module-actions";
import { toast } from "sonner";
import RiskAcceptanceListSkeleton from "@/components/skeleton-loader";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { StatusBadge } from "@/components/status-badge";

// Simple date formatter
const formatDate = (dateString: string, formatType: "short" | "long" = "short") => {
  const date = new Date(dateString);
  if (formatType === "long") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

type Status = "all" | "pending" | "approved" | "rejected";

interface Acceptance {
  id: string;
  organization_id: string;
  risk_id: string;
  risk_description: string;
  risk_rate: "HIGH" | "MEDIUM";
  deficiency_description: string;
  justification: string;
  compensating_controls: string;
  additional_remarks: string;
  risk_acceptance_expiry_date: string;
  acceptance_approved_by: string | null;
  acceptance_approved_date: string | null;
  acceptance_status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  updated_at: string;
  created_by_name: string;
  updated_by_name: string;
}

export default function RiskAcceptanceList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Status>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAcceptance, setSelectedAcceptance] = useState<Acceptance | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptances, setAcceptances] = useState<Acceptance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);
  const [isSubmittingForApproval, setIsSubmittingForApproval] = useState(false);

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

  useEffect(() => {
    fetchAcceptances();
  }, []);

  const fetchAcceptances = async () => {
    try {
      setIsLoading(true);
      const response = await getRiskAcceptances();

      if (response.status && response.data?.acceptances) {
        setAcceptances(response.data.acceptances);
      } else {
        toast.error("Failed to load risk acceptances");
      }
    } catch (err) {
      console.error("Error fetching acceptances:", err);
      toast.error("An error occurred while loading data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAcceptances = acceptances.filter((acceptance) => {
    const matchesTab =
      activeTab === "all" || acceptance.acceptance_status.toLowerCase() === activeTab;
    const matchesSearch =
      acceptance.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acceptance.risk_description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Count by status
  const counts = {
    all: acceptances.length,
    pending: acceptances.filter((a) => a.acceptance_status === "PENDING").length,
    approved: acceptances.filter((a) => a.acceptance_status === "APPROVED").length,
    rejected: acceptances.filter((a) => a.acceptance_status === "REJECTED").length
  };

  const handleAcceptanceClick = (acceptance: Acceptance) => {
    setSelectedAcceptance(acceptance);
    setModalStatus(
      acceptance.acceptance_status === "PENDING" ? "PENDING" : acceptance.acceptance_status
    );
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    setIsSubmitting(true);
    try {
      const updatedData = {
        ...selectedAcceptance,
        acceptance_status: modalStatus as "PENDING" | "APPROVED" | "REJECTED",
        additional_remarks: remarks
      };
      const response = await updateRiskAcceptance(
        selectedAcceptance?.id as string,
        updatedData as any
      );
      if (response.success) {
        toast.success(response.message || "Successfully updated risk acceptance");
        await fetchAcceptances();
        setShowModal(false);
        setSelectedAcceptance(null);
      } else {
        toast.error(response.message || "Failed to update acceptance");
      }
    } catch (err) {
      console.error("Error updating acceptance:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAcceptance = async () => {
    if (!selectedAcceptance) return;

    setIsSubmittingForApproval(true);
    try {
      const response = await submitRiskAcceptanceForApproval(selectedAcceptance.id);
      if (response.success) {
        toast.success(response.message || "Risk acceptance submitted for approval successfully");
        setSubmitConfirmationOpen(false);
        setShowModal(false);
        setSelectedAcceptance(null);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to submit risk acceptance for approval");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while submitting risk acceptance");
    } finally {
      setIsSubmittingForApproval(false);
    }
  };

  if (isLoading) {
    return <RiskAcceptanceListSkeleton />;
  }

  const AcceptanceCard = ({ acceptance }: { acceptance: Acceptance }) => {
    const config = statusConfig[acceptance.acceptance_status];
    const Icon = config.icon;
    const hasRemarks = acceptance.additional_remarks;

    return (
      <Card className={`${config.color} p-4 transition-all`}>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex flex-1 items-start gap-2">
            <Icon className="mt-0.5 h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <h4 className="line-clamp-2 text-sm font-semibold">{acceptance.risk_description}</h4>
              <p className="mt-1 text-xs text-gray-500 uppercase">
                ID: {acceptance.id.slice(0, 4)}...
              </p>
            </div>
          </div>
          <StatusBadge status={config.label} />
        </div>

        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium text-gray-700">Risk Rate</p>
              <StatusBadge status={acceptance.risk_rate} />
            </div>
            <div>
              <p className="font-medium text-gray-700">Created By</p>
              <p className="truncate text-gray-900">{acceptance.created_by_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t pt-2">
            <div>
              <p className="font-medium text-gray-700">Created Date</p>
              <p className="text-gray-900">{formatDate(acceptance.created_at)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Expiration Date</p>
              <p className="text-gray-900">{formatDate(acceptance.risk_acceptance_expiry_date)}</p>
            </div>
          </div>

          {acceptance.deficiency_description && (
            <div className="flex justify-between border-t pt-2">
              <div>
                <p className="mb-1 font-medium text-gray-700">Deficiency:</p>
                <p className="line-clamp-2 text-gray-600">{acceptance.deficiency_description}</p>
              </div>
              <div className="flex gap-4">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAcceptanceClick(acceptance)}
                  className="h-8 gap-1.5">
                  Acceptance Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    router.push(`/dashboard/risks/actions/${acceptance.risk_id}`);
                  }}
                  className="h-8 gap-1.5">
                  <View className="h-3.5 w-3.5" />
                  View Associated Risk
                </Button>
              </div>
            </div>
          )}

          {acceptance.acceptance_approved_date && (
            <div className="flex items-center justify-between pt-2 text-gray-500">
              <span>
                {acceptance.acceptance_status === "APPROVED" ? "Approved" : "Updated"}:{" "}
                {formatDate(acceptance.acceptance_approved_date)}
              </span>
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
                placeholder="Search by ID or description..."
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

              <TabsContent value={activeTab} className="mt-4 space-y-3">
                {filteredAcceptances.length > 0 ? (
                  filteredAcceptances.map((acceptance) => (
                    <AcceptanceCard key={acceptance.id} acceptance={acceptance} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
                    <p className="text-sm text-gray-500">
                      {searchQuery
                        ? "No acceptances match your search"
                        : `No ${activeTab !== "all" ? activeTab : ""} acceptances found`}
                    </p>
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
                <DialogTitle className="text-2xl">Risk Acceptance Details</DialogTitle>
                <div className="mt-2 flex items-center gap-2">
                  {selectedAcceptance && (
                    <>
                      <StatusBadge status={selectedAcceptance.acceptance_status} />

                      <StatusBadge status={selectedAcceptance.risk_rate} />
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
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedAcceptance?.compensating_controls}
                    </p>
                  </div>
                </div>

                {selectedAcceptance?.additional_remarks && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      Additional Remarks
                    </Label>
                    <div className="rounded-md border bg-gray-50 p-4">
                      <p className="text-sm">{selectedAcceptance.additional_remarks}</p>
                    </div>
                  </div>
                )}
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
                      <Label className="text-muted-foreground text-xs">Created By</Label>
                      <p className="mt-1 font-medium">{selectedAcceptance?.created_by_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Created Date</Label>
                      <p className="mt-1 font-medium">
                        {selectedAcceptance?.created_at &&
                          formatDate(selectedAcceptance.created_at, "long")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Expiration Date</Label>
                      <p className="mt-1 font-medium">
                        {selectedAcceptance?.risk_acceptance_expiry_date &&
                          formatDate(selectedAcceptance.risk_acceptance_expiry_date)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Info */}
              {selectedAcceptance?.acceptance_approved_by && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Approval Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-muted-foreground text-xs">Approved By</Label>
                        <p className="mt-1 font-medium">
                          {selectedAcceptance.acceptance_approved_by}
                        </p>
                      </div>
                      {selectedAcceptance.acceptance_approved_date && (
                        <div>
                          <Label className="text-muted-foreground text-xs">Approval Date</Label>
                          <p className="mt-1 font-medium">
                            {formatDate(selectedAcceptance.acceptance_approved_date, "long")}
                          </p>
                        </div>
                      )}
                    </div>
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
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              size="sm"
              disabled={isSubmitting || isSubmittingForApproval}>
              Cancel
            </Button>
            {selectedAcceptance?.acceptance_status === "PENDING" && (
              <Button
                onClick={() => setSubmitConfirmationOpen(true)}
                className="gap-2"
                size="sm"
                disabled={isSubmitting || isSubmittingForApproval}>
                <Send className="h-4 w-4" />
                Submit for Approval
              </Button>
            )}
            <Button
              onClick={handleStatusUpdate}
              size="sm"
              disabled={isSubmitting || isSubmittingForApproval || !modalStatus || !remarks.trim()}>
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit for Approval Confirmation Modal */}
      <ConfirmationModal
        open={submitConfirmationOpen}
        onOpenChange={setSubmitConfirmationOpen}
        onConfirm={handleSubmitAcceptance}
        title="Submit Risk Acceptance for Approval?"
        description="You are about to submit this risk acceptance for approval. Once submitted, it will be reviewed by the approval committee."
        confirmText="Submit"
        isLoading={isSubmittingForApproval}
      />
    </div>
  );
}
