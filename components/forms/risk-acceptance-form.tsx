"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  Users,
  ClipboardCheck,
  Download,
  Pen,
  X,
  Calendar as CalendarIcon,
  Save
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { downloadPDF } from "./download-acceptance-form";

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
  expiration_date: Date | string;
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
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [currentSignatureField, setCurrentSignatureField] = useState<ApproverKey | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    risk_description: initialData?.risk_description || "",
    risk_rate: initialData?.risk_rate || "",
    deficiency_description: initialData?.deficiency_description || "",
    justification: initialData?.justification || "",
    compensating_controls: initialData?.compensating_controls || "",
    additional_remarks: initialData?.additional_remarks || "",
    expiration_date: initialData?.expiration_date || "",
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
      icon: Users,
      fields: ["riskCoordinator", "riskOwner", "reviewedBy", "emcApproval", "boardApproval"],
      mode: ["edit"]
    }
  ];

  // Filter steps based on current mode
  const steps = allSteps.filter((step) => !step.mode || step.mode.includes(mode));

  const updateField = (field: keyof FormData, value: string | Date | RiskRate): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateApprover = (
    approver: ApproverKey,
    field: ApproverField,
    value: string | Date
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [approver]: { ...prev[approver], [field]: value }
    }));
  };

  const nextStep = (): void => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = (): void => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const openSignatureModal = (approverKey: ApproverKey): void => {
    setCurrentSignatureField(approverKey);
    setShowSignatureModal(true);
  };

  const clearCanvas = (): void => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = (): void => {
    const canvas = canvasRef.current;
    if (canvas && currentSignatureField) {
      const signatureData = canvas.toDataURL();
      updateApprover(currentSignatureField, "signature", signatureData);
      setShowSignatureModal(false);
      setCurrentSignatureField(null);
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): void => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("clientX" in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ("clientY" in e ? e.clientY : e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): void => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("clientX" in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ("clientY" in e ? e.clientY : e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = (): void => {
    setIsDrawing(false);
  };

  useEffect(() => {
    if (showSignatureModal && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [showSignatureModal]);

  const handleSubmit = async (): Promise<void> => {
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

  const approverConfigs: ApproverConfig[] = [
    { key: "risk_coordinator", title: "Risk Coordinator" },
    { key: "risk_owner", title: "Risk Owner" },
    { key: "reviewed_by", title: "Reviewed By" },
    { key: "emc_approval", title: "EMC Approval (CEO)" },
    { key: "board_approval", title: "Board Approval - Audit and Risk Chairperson" }
  ];

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
              <Button
                onClick={() => downloadPDF(formData)}
                variant="outline"
                className="text-primary">
                <Download className="mr-2 h-5 w-5" />
                Download
              </Button>
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
                  <Label className="mb-2 block">1. Risk Description *</Label>
                  <Textarea
                    value={formData.risk_description}
                    onChange={(e) => updateField("risk_description", e.target.value)}
                    rows={4}
                    placeholder="Describe the risk in detail..."
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Risk Rate *</Label>
                  <RadioGroup
                    value={formData.risk_rate}
                    onValueChange={(value) => updateField("risk_rate", value as RiskRate)}
                    className="flex gap-4">
                    {(["High", "Medium"] as const).map((rate) => (
                      <Label key={rate} className="flex cursor-pointer items-center">
                        <RadioGroupItem value={rate} id={rate} />
                        <span
                          className={`ml-2 rounded-full px-3 py-1 text-sm font-medium ${
                            rate === "High"
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
                  <Label className="mb-2 block">2. Description of Deficiency *</Label>
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
                  <Label className="mb-2 block">3. Justification of Risk Acceptance *</Label>
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
                  <Label className="mb-2 block">4. Description of Compensating Controls *</Label>
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
                  <Label className="mb-2 block">Risk Acceptance Expiration Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.expiration_date && "text-muted-foreground"
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiration_date
                          ? format(formData.expiration_date as Date, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.expiration_date as Date}
                        onSelect={(date) => updateField("expiration_date", date as Date)}
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

            {/* Step 3: Approvals (Edit Mode Only) */}
            {currentStep === 3 && mode === "edit" && (
              <div className="animate-fade-in space-y-8">
                <p className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-600">
                  <strong>Approval Sign Off:</strong> Complete your information and add your
                  signature
                </p>

                {approverConfigs.map((approver) => (
                  <div
                    key={approver.key}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-4 font-semibold text-slate-700">{approver.title}</h3>
                    <div className="mb-4 grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="mb-1 block">Name *</Label>
                        <Input
                          type="text"
                          value={formData[approver.key].name}
                          onChange={(e) => updateApprover(approver.key, "name", e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block">Designation *</Label>
                        <Input
                          type="text"
                          value={formData[approver.key].designation}
                          onChange={(e) =>
                            updateApprover(approver.key, "designation", e.target.value)
                          }
                          placeholder="Job title"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block">Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData[approver.key].date && "text-muted-foreground"
                              )}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData[approver.key].date
                                ? format(formData[approver.key].date as Date, "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData[approver.key].date as Date}
                              onSelect={(date) =>
                                updateApprover(approver.key, "date", date as Date)
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Signature *</Label>
                      {formData[approver.key].signature ? (
                        <div className="flex items-center justify-between rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-4">
                          <img
                            src={formData[approver.key].signature}
                            alt="Signature"
                            className="h-16 max-w-[200px] object-contain"
                          />
                          <Button onClick={() => openSignatureModal(approver.key)}>Change</Button>
                        </div>
                      ) : (
                        <Button onClick={() => openSignatureModal(approver.key)}>
                          <Pen className="mr-2 h-5 w-5" />
                          Click to Sign
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Send completed form to:{" "}
                    <a href="mailto:InternalAuditRisk@infratel.co.zm" className="underline">
                      InternalAuditRisk@infratel.co.zm
                    </a>
                  </p>
                </div>
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

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold text-slate-800">Sign Here</h3>
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setCurrentSignatureField(null);
                }}
                className="rounded p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <p className="mb-4 text-sm text-slate-600">
                Draw your signature below using your mouse or touch screen
              </p>
              <div className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t bg-slate-50 p-4">
              <Button onClick={clearCanvas} variant="outline">
                Clear
              </Button>
              <Button onClick={saveSignature}>Save Signature</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
