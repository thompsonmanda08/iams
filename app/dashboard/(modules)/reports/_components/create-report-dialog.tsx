"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FileText, ShieldAlert, AlertCircle } from "lucide-react";
import { SearchSelectField } from "@/components/ui/search-select-field";
import CustomAlert from "@/components/ui/custom-alert";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/app/_actions/reports-actions";
import { getAuditPlans } from "@/app/_actions/audit-module-actions";
import { getRiskRegisters } from "@/app/_actions/risk-module-actions";
import { notify } from "@/lib/utils";
import { ErrorState } from "@/lib/types";
import type { ReportType, ReportEntityType } from "@/lib/types/report-types";
import { useQuery } from "@tanstack/react-query";

// Report type options
const REPORT_TYPE_OPTIONS: { id: ReportType; name: string; description: string }[] = [
  {
    id: "general_audit",
    name: "General Audit Report",
    description: "Standard audit report for general audit engagements"
  },
  {
    id: "compliance_audit",
    name: "Compliance Audit Report",
    description: "Report for compliance and ISO standard audits"
  },
  {
    id: "risk",
    name: "Risk Assessment Report",
    description: "Risk assessment and analysis report"
  },
  {
    id: "followup",
    name: "Follow-up Report",
    description: "Follow-up on previous audit findings"
  }
];

// Entity type mapping
const ENTITY_TYPE_BY_REPORT_TYPE: Record<ReportType, ReportEntityType> = {
  general_audit: "audit_plan",
  compliance_audit: "audit_plan",
  risk: "risk_register",
  followup: "audit_plan"
};

type CreateReportFormData = {
  title: string;
  description: string;
  report_type: ReportType | "";
  entity_id: string;
};

const INIT_FORM_DATA: CreateReportFormData = {
  title: "",
  description: "",
  report_type: "",
  entity_id: ""
};

interface CreateReportDialogProps {
  showTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "link";
}

export function CreateReportDialog({
  showTrigger = true,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  triggerLabel = "Create Report",
  triggerVariant = "default"
}: CreateReportDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined;
  const openModal = isControlled ? controlledOpen : internalOpen;
  const setOpenModal = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<CreateReportFormData>(INIT_FORM_DATA);

  // Determine which entity type to fetch based on report type
  const entityType = formData.report_type
    ? ENTITY_TYPE_BY_REPORT_TYPE[formData.report_type as ReportType]
    : null;

  // Fetch audit plans when report type requires it
  const { data: auditPlansData, isLoading: loadingAuditPlans } = useQuery({
    queryKey: ["audit-plans-for-report"],
    queryFn: async () => {
      const response = await getAuditPlans({ page: 1, page_size: 100 });
      return response.data?.data || response.data || [];
    },
    enabled: openModal && entityType === "audit_plan"
  });

  // Fetch risk registers when report type requires it
  const { data: riskRegistersData, isLoading: loadingRiskRegisters } = useQuery({
    queryKey: ["risk-registers-for-report"],
    queryFn: async () => {
      const response = await getRiskRegisters({ page: 1, page_size: 100 });
      return response.data?.data || response.data || [];
    },
    enabled: openModal && entityType === "risk_register"
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!openModal) {
      const timer = setTimeout(() => {
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [openModal]);

  // Reset entity_id when report type changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, entity_id: "" }));
  }, [formData.report_type]);

  // Create report mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateReportFormData) => {
      const entityType = ENTITY_TYPE_BY_REPORT_TYPE[data.report_type as ReportType];

      return createReport({
        title: data.title,
        report_type: data.report_type as ReportType,
        report_content: {},
        entity_id: data.entity_id,
        entity_type: entityType,
        description: data.description || undefined
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        notify({
          description: "Report created successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["reports"] });
        router.refresh();
        setOpenModal(false);
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });

        // Navigate to the report edit page
        if (response.data?.id) {
          router.push(`/dashboard/reports/${response.data.id}`);
        }
      } else {
        notify({
          description: response.message || "Failed to create report",
          type: "error"
        });
        setError({ status: true, message: response.message || "Failed to create report" });
      }
    },
    onError: (error: any) => {
      notify({
        description: "Oops! Something went wrong.",
        type: "error"
      });
      setError({ status: true, message: "An unexpected error occurred" });
      console.error("Error creating report:", error);
    }
  });

  async function handleCreateReport(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setError({ status: true, message: "Report title is required" });
      return;
    }

    if (!formData.report_type) {
      setError({ status: true, message: "Please select a report type" });
      return;
    }

    // Entity is required for most report types
    const entityType = ENTITY_TYPE_BY_REPORT_TYPE[formData.report_type as ReportType];
    if (entityType && !formData.entity_id) {
      const entityLabel = entityType === "audit_plan" ? "audit plan" : "risk register";
      setError({ status: true, message: `Please select an ${entityLabel}` });
      return;
    }

    createMutation.mutate(formData);
  }

  // Build entity options based on report type
  const entityOptions = useMemo(() => {
    if (entityType === "audit_plan" && auditPlansData) {
      return (auditPlansData as any[]).map((plan) => ({
        id: plan.id,
        name: plan.title || plan.name || `Audit Plan ${plan.ref_no || plan.id}`
      }));
    }

    if (entityType === "risk_register" && riskRegistersData) {
      return (riskRegistersData as any[]).map((register) => ({
        id: register.id,
        name: register.name || register.title || `Risk Register ${register.id}`
      }));
    }

    return [];
  }, [entityType, auditPlansData, riskRegistersData]);

  const entityLabel = entityType === "audit_plan" ? "Audit Plan" : "Risk Register";
  const isLoadingEntities = entityType === "audit_plan" ? loadingAuditPlans : loadingRiskRegisters;

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm" variant={triggerVariant} className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Report
          </DialogTitle>
          <DialogDescription>
            Create a new report that can be edited and published later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateReport} className="space-y-4">
          {/* Report Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Report Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter report title"
              value={formData.title}
              onChange={(e) => {
                setError({ status: false, message: "" });
                setFormData((prev) => ({ ...prev, title: e.target.value }));
              }}
            />
          </div>

          {/* Report Type */}
          <SearchSelectField
            label="Report Type"
            required
            placeholder="--Select Report Type--"
            value={formData.report_type}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((prev) => ({ ...prev, report_type: value as ReportType }));
            }}
            options={REPORT_TYPE_OPTIONS}
          />

          {/* Conditional Entity Selection */}
          {formData.report_type && entityType && (
            <SearchSelectField
              label={entityLabel}
              required
              placeholder={`--Select ${entityLabel}--`}
              value={formData.entity_id}
              onValueChange={(value) => {
                setError({ status: false, message: "" });
                setFormData((prev) => ({ ...prev, entity_id: value }));
              }}
              isLoading={isLoadingEntities}
              options={entityOptions}
              descriptionText={
                entityOptions.length === 0 && !isLoadingEntities
                  ? `No ${entityLabel.toLowerCase()}s found. Please create one first.`
                  : undefined
              }
            />
          )}

          {/* Info about entity selection */}
          {formData.report_type && entityType && (
            <div className="bg-muted/50 flex items-start gap-2 rounded-md p-3 text-sm">
              <AlertCircle className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-muted-foreground">
                {entityType === "audit_plan"
                  ? "Select an audit plan to link findings and data to this report."
                  : "Select a risk register to link risk data to this report."}
              </span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description for this report"
              value={formData.description}
              onChange={(e) => {
                setError({ status: false, message: "" });
                setFormData((prev) => ({ ...prev, description: e.target.value }));
              }}
              rows={3}
            />
          </div>

          {/* Error Alert */}
          {error.status && <CustomAlert type="error" message={error.message} Icon={ShieldAlert} />}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setOpenModal(false);
                  setFormData(INIT_FORM_DATA);
                  setError({ status: false, message: "" });
                }}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              isLoading={createMutation.isPending}
              loadingText="Creating...">
              Create Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
