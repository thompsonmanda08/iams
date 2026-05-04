"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  View,
  Plus,
  ClipboardListIcon,
  Pen,
  ExternalLink
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/ui/permission-button";
import { MODULE_CODES } from "@/lib/constants/module-codes";
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
import RiskAcceptanceListSkeleton from "@/components/skeleton-loader";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { useRiskAcceptances } from "@/hooks/use-risk-acceptance-mutations";
import { usePermissions } from "@/hooks/use-permissions";

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

type Status = "all" | "approved" | "rejected" | "draft";

interface Signature {
  id: string;
  organization_id: string;
  acceptance_id: string;
  action_id: string;
  user_id: string;
  name: string;
  designation: string;
  signature: string;
  signed_at: string;
}

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
  acceptance_status: "APPROVED" | "REJECTED" | "DRAFT";
  created_at: string;
  updated_at: string;
  created_by_name: string;
  updated_by_name: string;
  signatures?: Signature[];
}

// Status configuration
const statusConfig = {
  DRAFT: {
    icon: Clock,
    color: "bg-yellow-50 border-yellow-200",
    badge: "outline",
    label: "Draft",
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

// AcceptanceCard component defined outside
interface AcceptanceCardProps {
  acceptance: Acceptance;
  onAcceptanceClick: (acceptance: Acceptance) => void;
  onViewRisk: (riskId: string) => void;
}

const AcceptanceCard = ({ acceptance, onAcceptanceClick, onViewRisk }: AcceptanceCardProps) => {
  const config = statusConfig[acceptance.acceptance_status];
  const Icon = config?.icon;
  const hasRemarks = acceptance.additional_remarks;

  return (
    <Card className={`${config?.color} p-4 transition-all`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-1 items-start gap-2">
          {Icon && <Icon className="mt-0.5 h-5 w-5 text-gray-600" />}
          <div className="flex-1">
            <h4 className="line-clamp-2 text-sm font-semibold">{acceptance.risk_description}</h4>
            <p className="mt-1 text-xs text-gray-500 uppercase">
              ID: {acceptance.id.slice(0, 4)}...
            </p>
          </div>
        </div>
        <StatusBadge status={config?.label} />
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
                onClick={() => onAcceptanceClick(acceptance)}
                className="h-8 gap-1.5">
                Acceptance Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewRisk(acceptance.risk_id)}
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

export default function RiskAcceptanceList() {
  const router = useRouter();
  const { checkPermission, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<Status>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAcceptance, setSelectedAcceptance] = useState<Acceptance | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch acceptances using query hook
  const {
    data: acceptances = [],
    isLoading,
    isError
  } = useRiskAcceptances() as {
    data: Acceptance[];
    isLoading: boolean;
    isError: boolean;
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
    draft: acceptances.filter((a) => a.acceptance_status === "DRAFT").length,
    approved: acceptances.filter((a) => a.acceptance_status === "APPROVED").length,
    rejected: acceptances.filter((a) => a.acceptance_status === "REJECTED").length
  };

  const handleAcceptanceClick = (acceptance: Acceptance) => {
    setSelectedAcceptance(acceptance);
    setShowModal(true);
  };

  const handleViewRisk = (riskId: string) => {
    router.push(`/dashboard/actions/risk/${riskId}`);
  };

  if (isLoading) {
    return <RiskAcceptanceListSkeleton />;
  }

  if (!acceptances.length) {
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
          <Card className="bg-canvas/50 border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center px-8 py-16">
              <div className="relative mb-4">
                <div className="bg-primary/10 absolute inset-0 rounded-full blur-2xl" />
                <div className="bg-canvas border-primary/20 relative rounded-2xl border-2 p-6">
                  <ClipboardListIcon className="text-primary h-16 w-16" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-foreground mb-2 text-2xl font-semibold">No Risk Acceptances</h3>
              <p className="text-muted-foreground mb-8 max-w-md text-center">
                There are currently no risk acceptance requests in the system
              </p>
              <div className="mb-8 grid w-full max-w-2xl grid-cols-3 gap-4 text-xs">
                <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                  <div className="text-primary mb-1 font-mono">IDENTIFY RISKS</div>
                  <div className="text-muted-foreground">Document Risk Details</div>
                </div>
                <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                  <div className="text-primary mb-1 font-mono">REQUEST ACCEPTANCE</div>
                  <div className="text-muted-foreground">Submit for Review</div>
                </div>
                <div className="bg-canvas border-border rounded-lg border p-4 text-center">
                  <div className="text-primary mb-1 font-mono">APPROVE/REJECT</div>
                  <div className="text-muted-foreground">Management Decision</div>
                </div>
              </div>
              <PermissionButton
                moduleCode={MODULE_CODES.RISK_ACCEPTANCES}
                action="can_create"
                size="lg"
                className="gap-2"
                asChild>
                <Link href="/dashboard/risks/risk-registers">
                  <Plus className="h-4 w-4" />
                  Go to Risk Register
                </Link>
              </PermissionButton>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                <TabsTrigger value="draft" className={statusConfig.DRAFT.textColor}>
                  Draft ({counts.draft})
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
                    <AcceptanceCard
                      key={acceptance.id}
                      acceptance={acceptance}
                      onAcceptanceClick={handleAcceptanceClick}
                      onViewRisk={handleViewRisk}
                    />
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
        <DialogContent
          className="max-h-[90vh] min-w-2xl overflow-hidden p-0"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}>
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

              {/* Signatories Section */}
              {selectedAcceptance?.signatures && selectedAcceptance.signatures.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold">Signatories</h3>
                    <p className="text-muted-foreground text-sm">Risk acceptance signatures</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                    {selectedAcceptance.signatures.map((sig) => (
                      <Card key={sig.id} className="border-border/50">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {/* Signer Info */}
                            <div className="flex items-start gap-4">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                <Pen className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-foreground font-semibold">{sig?.name}</p>
                                <p className="text-muted-foreground text-sm">{sig?.designation}</p>
                              </div>
                            </div>

                            {/* Signature Image */}
                            {sig.signature && (
                              <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs font-semibold uppercase">
                                  Signature
                                </Label>
                                <div className="border-border/30 flex items-center justify-center rounded-lg border bg-gray-50 p-3">
                                  <img
                                    src={sig?.signature}
                                    alt={`Signature of ${sig?.name}`}
                                    className="max-h-16 max-w-full object-contain"
                                  />
                                </div>
                                <a
                                  href={sig?.signature}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                                  View Full Size
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}

                            {/* Signed Date */}
                            <div className="space-y-1 border-t pt-3">
                              <Label className="text-muted-foreground text-xs font-semibold uppercase">
                                Signed On
                              </Label>
                              <p className="text-sm font-medium">
                                {sig?.signed_at && formatDate(sig?.signed_at, "long")}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={() => setShowModal(false)} size="sm">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
