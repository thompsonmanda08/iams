"use client";
import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  ClipboardCheck,
  Download,
  Calendar as CalendarIcon,
  Save
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn, notify } from "@/lib/utils";
import { format } from "date-fns";

// Type definitions
type RiskRate = "High" | "Medium" | "Low" | "";
type FormMode = "create" | "edit";

interface ApproverData {
  name: string;
  designation: string;
  date: Date | string;
  signature: string;
}

export interface FormData {
  risk_description: string;
  risk_rate: RiskRate;
  deficiency_description: string;
  justification: string;
  compensating_controls: string;
  additional_remarks: string;
  risk_acceptance_expiry_date: Date | string;
  risk_coordinator: ApproverData;
  risk_owner: ApproverData;
  reviewed_by: ApproverData;
  emc_approval: ApproverData;
  board_approval: ApproverData;
}

type ApproverKey =
  | "risk_coordinator"
  | "risk_owner"
  | "reviewed_by"
  | "emc_approval"
  | "board_approval";
type ApproverField = keyof ApproverData;

interface Step {
  title: string;
  icon: any;
  fields: string[];
  mode?: FormMode[];
}

interface ApproverConfig {
  key: ApproverKey;
  title: string;
}

interface RiskAcceptanceFormProps {
  mode?: FormMode;
  initialData?: Partial<FormData>;
  onSubmit?: (data: FormData) => void | Promise<void>;
}

export default function RiskAcceptanceForm({
  mode: initialMode = "create",
  initialData,
  onSubmit
}: RiskAcceptanceFormProps) {
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    risk_description: initialData?.risk_description || "",
    risk_rate: initialData?.risk_rate || "",
    deficiency_description: initialData?.deficiency_description || "",
    justification: initialData?.justification || "",
    compensating_controls: initialData?.compensating_controls || "",
    additional_remarks: initialData?.additional_remarks || "",
    risk_acceptance_expiry_date: initialData?.risk_acceptance_expiry_date || "",
    risk_coordinator: initialData?.risk_coordinator || {
      name: "",
      designation: "",
      date: "",
      signature: ""
    },
    risk_owner: initialData?.risk_owner || { name: "", designation: "", date: "", signature: "" },
    reviewed_by: initialData?.reviewed_by || { name: "", designation: "", date: "", signature: "" },
    emc_approval: initialData?.emc_approval || {
      name: "",
      designation: "",
      date: "",
      signature: ""
    },
    board_approval: initialData?.board_approval || {
      name: "",
      designation: "",
      date: "",
      signature: ""
    }
  });

  // Define steps based on mode
  const allSteps: Step[] = [
    {
      title: "Risk Details",
      icon: AlertCircle,
      fields: ["riskDescription", "riskRate", "deficiencyDescription"],
      mode: ["create", "edit"]
    },
    {
      title: "Justification",
      icon: FileText,
      fields: ["justification"],
      mode: ["create", "edit"]
    },
    {
      title: "Controls",
      icon: Shield,
      fields: ["compensatingControls", "additionalRemarks", "expirationDate"],
      mode: ["create", "edit"]
    },
    {
      title: "Approvals",
      icon: CheckCircle2,
      fields: ["risk_coordinator", "risk_owner", "reviewed_by", "emc_approval", "board_approval"],
      mode: ["edit"]
    }
  ];

  const approverConfigs: ApproverConfig[] = [
    { key: "risk_coordinator", title: "Risk Coordinator" },
    { key: "risk_owner", title: "Risk Owner" },
    { key: "reviewed_by", title: "Reviewed By" },
    { key: "emc_approval", title: "EMC Approval" },
    { key: "board_approval", title: "Board Approval" }
  ];

  const updateApproverField = (
    approverKey: ApproverKey,
    field: ApproverField,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [approverKey]: { ...prev[approverKey], [field]: value }
    }));
  };

  // Filter steps based on current mode
  const steps = allSteps.filter((step) => !step.mode || step.mode.includes(mode));

  const updateField = (field: keyof FormData, value: string | Date | RiskRate): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = (): void => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = (): void => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (): Promise<void> => {
    if (mode === "edit") {
      const approverKeys: ApproverKey[] = [
        "risk_coordinator",
        "risk_owner",
        "reviewed_by",
        "emc_approval",
        "board_approval"
      ];
      const missing = approverKeys.filter(
        (k) => formData[k]?.name?.trim() && !formData[k]?.signature?.trim()
      );
      if (missing.length > 0) {
        notify({
          description: `Signature required for all approvers: ${missing.join(", ")}`,
          type: "error"
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        console.info("Form submitted:", formData);
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          {/* Header */}
          <div className="from-primary/70 to-primary/80 bg-linear-to-r p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <ClipboardCheck className="h-8 w-8" />
                  <h1 className="text-2xl font-bold">
                    Risk Acceptance Form {mode === "edit" && "- Edit Mode"}
                  </h1>
                </div>
                <p className="text-sm text-blue-100">
                  {mode === "create"
                    ? "Complete all sections to create risk acceptance"
                    : "Add approvals and signatures"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="border-b bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <React.Fragment key={index}>
                    <div className="flex flex-1 flex-col items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isActive
                              ? "bg-primary/70 text-white"
                              : "bg-slate-200 text-slate-400"
                        }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          isActive
                            ? "text-primary/70"
                            : isCompleted
                              ? "text-green-600"
                              : "text-slate-400"
                        }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-2 mt-[-20px] h-1 flex-1 transition-all ${
                          isCompleted ? "bg-green-500" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Step 0: Risk Details */}
            {currentStep === 0 && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <Label className="mb-2 block">
                    1. Risk Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={formData.risk_description}
                    onChange={(e) => updateField("risk_description", e.target.value)}
                    rows={4}
                    placeholder="Describe the risk in detail..."
                  />
                </div>

                <div>
                  <Label className="mb-2 block">
                    Risk Rate <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.risk_rate}
                    onValueChange={(value) => updateField("risk_rate", value as RiskRate)}
                    className="flex gap-4">
                    {(["HIGH", "MEDIUM"] as const).map((rate) => (
                      <Label key={rate} className="flex cursor-pointer items-center">
                        <RadioGroupItem value={rate} id={rate} />
                        <span
                          className={`ml-2 rounded-full px-3 py-1 text-sm font-medium ${
                            rate === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                          {rate}
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">
                    2. Description of Deficiency <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={formData.deficiency_description}
                    onChange={(e) => updateField("deficiency_description", e.target.value)}
                    rows={4}
                    placeholder="Provide a summary of the overall control deficiency..."
                  />
                </div>
              </div>
            )}

            {/* Step 1: Justification */}
            {currentStep === 1 && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <Label className="mb-2 block">
                    3. Justification of Risk Acceptance{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={formData.justification}
                    onChange={(e) => updateField("justification", e.target.value)}
                    rows={8}
                    placeholder="Justify the reason for accepting the risk..."
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    Explain why this risk should be accepted and what business value it provides
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Controls */}
            {currentStep === 2 && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <Label className="mb-2 block">
                    4. Description of Compensating Controls{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={formData.compensating_controls}
                    onChange={(e) => updateField("compensating_controls", e.target.value)}
                    rows={6}
                    placeholder="Describe the compensating controls that will be put in place..."
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    A compensating control must be provided for risk acceptance
                  </p>
                </div>

                <div>
                  <Label className="mb-2 block">5. Additional Remarks</Label>
                  <Textarea
                    value={formData.additional_remarks}
                    onChange={(e) => updateField("additional_remarks", e.target.value)}
                    rows={4}
                    placeholder="Provide any other comments and supporting evidence..."
                  />
                </div>

                <div>
                  <Label className="mb-2 block">
                    Risk Acceptance Expiration Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.risk_acceptance_expiry_date && "text-muted-foreground"
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.risk_acceptance_expiry_date
                          ? format(formData.risk_acceptance_expiry_date as Date, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.risk_acceptance_expiry_date as Date}
                        onSelect={(date) =>
                          updateField("risk_acceptance_expiry_date", date as Date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {mode === "create" && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> After creating the risk acceptance form, you can enter
                      edit mode to add approvals and signatures.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Approvals (edit mode only) */}
            {mode === "edit" && currentStep === 3 && (
              <div className="animate-fade-in space-y-6">
                <p className="text-sm text-slate-500">
                  Provide name, designation and signature for each approver. A typed name in the
                  signature field is sufficient. Signature is required for any approver whose name
                  is filled in.
                </p>
                {approverConfigs.map((cfg) => (
                  <div
                    key={cfg.key}
                    className="space-y-3 rounded-lg border border-slate-200 p-4">
                    <h3 className="text-base font-semibold text-slate-700">{cfg.title}</h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Input
                        label="Name"
                        value={formData[cfg.key].name}
                        onChange={(e) => updateApproverField(cfg.key, "name", e.target.value)}
                        placeholder="Full name"
                      />
                      <Input
                        label="Designation"
                        value={formData[cfg.key].designation}
                        onChange={(e) =>
                          updateApproverField(cfg.key, "designation", e.target.value)
                        }
                        placeholder="Role / title"
                      />
                    </div>
                    <Input
                      label={`Signature${formData[cfg.key].name?.trim() ? " *" : ""}`}
                      value={formData[cfg.key].signature}
                      onChange={(e) => updateApproverField(cfg.key, "signature", e.target.value)}
                      placeholder="Type full name to sign"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t pt-6">
              <Button type="button" onClick={prevStep} disabled={currentStep === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-slate-500">
                Step {currentStep + 1} of {steps.length}
              </div>

              {!isLastStep ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                  {mode === "create" ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Creating..." : "Create Acceptance"}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Submitting..." : "Submit Approval"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
