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
  CalendarIcon,
  LucideIcon
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

// Type definitions
type RiskRate = "High" | "Medium" | "Low" | "";

interface ApproverData {
  name: string;
  designation: string;
  date: Date | string;
  signature: string;
}

interface FormData {
  riskDescription: string;
  riskRate: RiskRate;
  deficiencyDescription: string;
  justification: string;
  compensatingControls: string;
  additionalRemarks: string;
  expirationDate: Date | string;
  riskCoordinator: ApproverData;
  riskOwner: ApproverData;
  reviewedBy: ApproverData;
  emcApproval: ApproverData;
  boardApproval: ApproverData;
}

type ApproverKey = "riskCoordinator" | "riskOwner" | "reviewedBy" | "emcApproval" | "boardApproval";

type ApproverField = keyof ApproverData;

interface Step {
  title: string;
  icon: LucideIcon;
  fields: string[];
}

interface ApproverConfig {
  key: ApproverKey;
  title: string;
}

export default function RiskAcceptanceForm() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [currentSignatureField, setCurrentSignatureField] = useState<ApproverKey | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    riskDescription: "",
    riskRate: "",
    deficiencyDescription: "",
    justification: "",
    compensatingControls: "",
    additionalRemarks: "",
    expirationDate: "",
    riskCoordinator: { name: "", designation: "", date: "", signature: "" },
    riskOwner: { name: "", designation: "", date: "", signature: "" },
    reviewedBy: { name: "", designation: "", date: "", signature: "" },
    emcApproval: { name: "", designation: "", date: "", signature: "" },
    boardApproval: { name: "", designation: "", date: "", signature: "" }
  });

  const steps: Step[] = [
    {
      title: "Risk Details",
      icon: AlertCircle,
      fields: ["riskDescription", "riskRate", "deficiencyDescription"]
    },
    { title: "Justification", icon: FileText, fields: ["justification"] },
    {
      title: "Controls",
      icon: Shield,
      fields: ["compensatingControls", "additionalRemarks", "expirationDate"]
    },
    {
      title: "Approvals",
      icon: Users,
      fields: ["riskCoordinator", "riskOwner", "reviewedBy", "emcApproval", "boardApproval"]
    }
  ];

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

  const downloadPDF = (): void => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Risk Acceptance Form</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 30px; background: #f1f5f9; padding: 10px; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 5px; }
    .label { font-weight: bold; color: #475569; margin-top: 10px; }
    .value { margin: 5px 0 15px 0; padding: 10px; background: #f8fafc; border-left: 3px solid #3b82f6; }
    .risk-rate { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
    .risk-high { background: #fee2e2; color: #991b1b; }
    .risk-medium { background: #fef3c7; color: #92400e; }
    .risk-low { background: #d1fae5; color: #065f46; }
    .approval-section { margin: 20px 0; padding: 15px; background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 8px; }
    .approval-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 10px; }
    .approval-item { }
    .approval-item strong { display: block; color: #64748b; font-size: 12px; margin-bottom: 5px; }
    .signature-box { border: 2px dashed #cbd5e1; padding: 10px; min-height: 60px; text-align: center; margin-top: 10px; }
    .signature-img { max-width: 200px; max-height: 60px; }
    .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Risk Acceptance Form</h1>
  
  <div class="section">
    <h2>1. Risk Description</h2>
    <div class="value">${formData.riskDescription || "Not provided"}</div>
    
    <div class="label">Risk Rate:</div>
    <div class="value">
      <span class="risk-rate risk-${formData.riskRate?.toLowerCase() || "medium"}">${formData.riskRate || "Not specified"}</span>
    </div>
  </div>

  <div class="section">
    <h2>2. Description of Deficiency</h2>
    <div class="value">${formData.deficiencyDescription || "Not provided"}</div>
  </div>

  <div class="section">
    <h2>3. Justification of Risk Acceptance</h2>
    <div class="value">${formData.justification || "Not provided"}</div>
  </div>

  <div class="section">
    <h2>4. Description of Compensating Controls</h2>
    <div class="value">${formData.compensatingControls || "Not provided"}</div>
  </div>

  <div class="section">
    <h2>5. Additional Remarks</h2>
    <div class="value">${formData.additionalRemarks || "No additional remarks"}</div>
    
    <div class="label">Risk Acceptance Expiration Date:</div>
    <div class="value">${formData.expirationDate || "Not specified"}</div>
  </div>

  <h2>APPROVAL SIGN OFF</h2>

  ${(
    ["riskCoordinator", "riskOwner", "reviewedBy", "emcApproval", "boardApproval"] as ApproverKey[]
  )
    .map((key) => {
      const titles: Record<ApproverKey, string> = {
        riskCoordinator: "Risk Coordinator",
        riskOwner: "Risk Owner",
        reviewedBy: "Reviewed By",
        emcApproval: "EMC Approval (CEO)",
        boardApproval: "Board Approval - Audit and Risk Chairperson"
      };
      const data = formData[key];
      return `
    <div class="approval-section">
      <h3>${titles[key]}</h3>
      <div class="approval-grid">
        <div class="approval-item">
          <strong>NAME</strong>
          ${data.name || "_________________"}
        </div>
        <div class="approval-item">
          <strong>DESIGNATION</strong>
          ${data.designation || "_________________"}
        </div>
        <div class="approval-item">
          <strong>DATE</strong>
          ${data.date || "_________________"}
        </div>
      </div>
      <div class="signature-box">
        <strong>SIGNATURE</strong><br>
        ${data.signature ? `<img src="${data.signature}" class="signature-img" alt="Signature">` : "_________________"}
      </div>
    </div>`;
    })
    .join("")}

  <div class="note">
    <strong>Note:</strong> Send form to: InternalAuditRisk@infratel.co.zm
  </div>

  <p style="text-align: center; color: #64748b; margin-top: 40px; font-size: 12px;">
    Generated on ${new Date().toLocaleString()}
  </p>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Risk_Acceptance_Form_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (): void => {
    console.log("Form submitted:", formData);
    alert(
      "Risk Acceptance Form submitted successfully!\n\nPlease send to: InternalAuditRisk@infratel.co.zm"
    );
  };

  const approverConfigs: ApproverConfig[] = [
    { key: "riskCoordinator", title: "Risk Coordinator" },
    { key: "riskOwner", title: "Risk Owner" },
    { key: "reviewedBy", title: "Reviewed By" },
    { key: "emcApproval", title: "EMC Approval (CEO)" },
    { key: "boardApproval", title: "Board Approval - Audit and Risk Chairperson" }
  ];

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
                  <h1 className="text-2xl font-bold">Risk Acceptance Form</h1>
                </div>
                <p className="text-sm text-blue-100">
                  Complete all sections for risk acceptance approval
                </p>
              </div>
              <Button onClick={downloadPDF} variant="outline" className="text-primary">
                <Download className="h-5 w-5" />
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
                    value={formData.riskDescription}
                    onChange={(e) => updateField("riskDescription", e.target.value)}
                    rows={4}
                    placeholder="Describe the risk in detail..."
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Risk Rate *</Label>
                  <RadioGroup
                    value={formData.riskRate}
                    onValueChange={(value) => updateField("riskRate", value as RiskRate)}
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
                    value={formData.deficiencyDescription}
                    onChange={(e) => updateField("deficiencyDescription", e.target.value)}
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
                    value={formData.compensatingControls}
                    onChange={(e) => updateField("compensatingControls", e.target.value)}
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
                    value={formData.additionalRemarks}
                    onChange={(e) => updateField("additionalRemarks", e.target.value)}
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
                          !formData.expirationDate && "text-muted-foreground"
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expirationDate
                          ? format(formData.expirationDate as Date, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.expirationDate as Date}
                        onSelect={(date) => updateField("expirationDate", date as Date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Step 3: Approvals */}
            {currentStep === 3 && (
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
                          <Pen className="h-5 w-5" />
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
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-slate-500">
                Step {currentStep + 1} of {steps.length}
              </div>

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit}>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Form
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
