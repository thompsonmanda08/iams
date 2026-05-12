"use client";

import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  Pen,
  Calendar as CalendarIcon,
  Loader2,
  ShieldCheck,
  XCircle,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn, notify } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date-format";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { submitRiskAcceptanceSignature } from "@/app/_actions/risk-module-actions";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

export interface ApproverSignature {
  action_id: string;
  user_id: string;
  name: string;
  designation: string;
  date: Date | string;
  signature: string;
  remarks?: string;
}

type Decision = "APPROVE" | "REJECT" | null;

interface SignatureFormProps {
  actionId: string;
  userId: string;
  acceptanceId: string;
  riskName: string;
  onSubmit: (data: ApproverSignature) => Promise<void>;
  onClose: () => void;
}

export default function SignatureForm({
  actionId,
  userId,
  acceptanceId,
  riskName,
  onSubmit,
  onClose
}: SignatureFormProps) {
  const { checkPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<Decision>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [formData, setFormData] = useState<ApproverSignature>({
    action_id: actionId,
    user_id: userId,
    name: "",
    designation: "",
    date: new Date(),
    signature: "",
    remarks: ""
  });

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

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
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

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsUploadingSignature(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          notify({ description: "Failed to create signature image", type: "error" });
          setIsUploadingSignature(false);
          return;
        }
        const file = new File([blob], `signature-${Date.now()}.png`, { type: "image/png" });
        const uploadResponse = await uploadFile(file);

        if (uploadResponse.success && uploadResponse.data?.file_url) {
          setFormData((prev) => ({ ...prev, signature: uploadResponse.data.file_url }));
          setShowSignatureModal(false);
          notify({ description: "Signature saved", type: "success" });
        } else {
          notify({
            description: uploadResponse.message || "Failed to upload signature",
            type: "error"
          });
        }
      });
    } catch (error: any) {
      notify({ description: error.message || "Failed to save signature", type: "error" });
    } finally {
      setIsUploadingSignature(false);
    }
  };

  const validateCommonFields = () => {
    if (!formData.name.trim()) {
      notify({ description: "Please enter your name", type: "error" });
      return false;
    }
    if (!formData.designation.trim()) {
      notify({ description: "Please enter your designation", type: "error" });
      return false;
    }
    return true;
  };

  const handleApprove = async () => {
    if (!checkPermission(MODULE_CODES.RISK_ACCEPTANCES, "can_approve")) return;
    if (!validateCommonFields()) return;
    if (!formData.signature) {
      notify({ description: "Please add your signature to approve", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitResponse = await submitRiskAcceptanceSignature(acceptanceId, {
        action_id: formData.action_id,
        user_id: formData.user_id,
        name: formData.name,
        designation: formData.designation,
        signature: formData.signature
      });

      if (!submitResponse.success) {
        throw new Error(submitResponse.message || "Failed to submit approval");
      }

      await onSubmit(formData);
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      queryClient.invalidateQueries({ queryKey: ["risk-acceptances"] });
      notify({ description: "Risk acceptance approved", type: "success" });
      onClose();
    } catch (error: any) {
      notify({ description: error.message || "Failed to submit approval", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!checkPermission(MODULE_CODES.RISK_ACCEPTANCES, "can_approve")) return;
    if (!validateCommonFields()) return;
    if (!formData.remarks?.trim()) {
      notify({ description: "Please provide remarks for rejection", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitResponse = await submitRiskAcceptanceSignature(acceptanceId, {
        action_id: formData.action_id,
        user_id: formData.user_id,
        name: formData.name,
        designation: formData.designation,
        signature: "",
        remarks: formData.remarks.trim()
      });

      if (!submitResponse.success) {
        throw new Error(submitResponse.message || "Failed to submit rejection");
      }

      await onSubmit({ ...formData, signature: "" });
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      queryClient.invalidateQueries({ queryKey: ["risk-acceptances"] });
      notify({ description: "Risk acceptance rejected", type: "success" });
      onClose();
    } catch (error: any) {
      notify({ description: error.message || "Failed to submit rejection", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => setDecision(null);

  const headerContent = (() => {
    if (decision === "APPROVE") {
      return {
        title: "Approve Risk Acceptance",
        description: `Sign off on: ${riskName}`
      };
    }
    if (decision === "REJECT") {
      return {
        title: "Reject Risk Acceptance",
        description: `Provide remarks for: ${riskName}`
      };
    }
    return {
      title: "Risk Acceptance Approval",
      description: "How would you like to respond?"
    };
  })();

  return (
    <>
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card text-foreground w-full max-w-2xl rounded-lg shadow-xl">
            <div className="border-border flex items-center justify-between border-b p-4">
              <h3 className="text-foreground text-lg font-semibold">Sign Here</h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="hover:bg-muted rounded p-1 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-muted-foreground mb-4 text-sm">
                Draw your signature below using your mouse or touch screen
              </p>
              <div className="border-border overflow-hidden rounded-lg border-2 bg-white">
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
            <div className="bg-muted/40 border-border flex items-center justify-between border-t p-4">
              <Button onClick={clearCanvas} variant="outline" disabled={isUploadingSignature}>
                Clear
              </Button>
              <Button onClick={saveSignature} disabled={isUploadingSignature}>
                {isUploadingSignature && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploadingSignature ? "Uploading..." : "Save Signature"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-1">
          <DialogTitle className="text-lg font-semibold">{headerContent.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {headerContent.description}
          </DialogDescription>
        </div>

        {decision === null && (
          <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-col gap-3 duration-200">
            <button
              type="button"
              onClick={() => setDecision("APPROVE")}
              className="group bg-card border-border hover:border-emerald-400 hover:bg-emerald-50/60 focus-visible:ring-emerald-500/40 dark:hover:border-emerald-500/60 dark:hover:bg-emerald-950/30 flex items-center gap-4 rounded-lg border border-l-4 border-l-emerald-500 p-4 text-left transition focus-visible:ring-2 focus-visible:outline-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-foreground font-medium">Approve</p>
                <p className="text-muted-foreground text-sm">Sign off and accept this risk.</p>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-300" />
            </button>

            <button
              type="button"
              onClick={() => setDecision("REJECT")}
              className="group bg-card border-border hover:border-red-400 hover:bg-red-50/60 focus-visible:ring-red-500/40 dark:hover:border-red-500/60 dark:hover:bg-red-950/30 flex items-center gap-4 rounded-lg border border-l-4 border-l-red-500 p-4 text-left transition focus-visible:ring-2 focus-visible:outline-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300">
                <XCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-foreground font-medium">Reject</p>
                <p className="text-muted-foreground text-sm">Decline with written remarks.</p>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-red-600 dark:group-hover:text-red-300" />
            </button>
          </div>
        )}

        {decision !== null && (
          <div className="animate-in fade-in slide-in-from-bottom-1 space-y-4 duration-200">
            <Input
              label="Name"
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full name"
            />

            <Input
              label="Designation"
              required
              type="text"
              value={formData.designation}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, designation: e.target.value }))
              }
              placeholder="Job title"
            />

            <div>
              <Label className="mb-1 block">
                Date <span className="!text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? formatDate(formData.date as Date) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date as Date}
                    onSelect={(date) =>
                      setFormData((prev) => ({ ...prev, date: date as Date }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {decision === "APPROVE" && (
              <div>
                <Label className="mb-2 block">
                  Signature <span className="!text-red-500">*</span>
                </Label>
                {formData.signature ? (
                  <div className="flex items-center justify-between rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/40 dark:bg-emerald-950/20">
                    <img
                      src={formData.signature}
                      alt="Signature"
                      className="h-16 max-w-[200px] object-contain"
                    />
                    <Button onClick={() => setShowSignatureModal(true)}>Change</Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowSignatureModal(true)}
                    variant="outline"
                    className="w-full">
                    <Pen className="mr-2 h-5 w-5" />
                    Click to Sign
                  </Button>
                )}
              </div>
            )}

            {decision === "REJECT" && (
              <Textarea
                label="Remarks"
                required
                rows={5}
                value={formData.remarks ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, remarks: e.target.value }))
                }
                placeholder="Explain why this risk acceptance is being rejected…"
              />
            )}

            <div className="flex gap-3 border-t pt-6">
              <Button
                onClick={goBack}
                variant="ghost"
                disabled={isSubmitting}
                className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {decision === "APPROVE" ? (
                <Button onClick={handleApprove} disabled={isSubmitting} className="flex-1">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Submitting..." : "Approve & Sign"}
                </Button>
              ) : (
                <Button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  variant="destructive"
                  className="flex-1">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Submitting..." : "Confirm Rejection"}
                </Button>
              )}
            </div>
          </div>
        )}

        {decision === null && (
          <div className="border-t pt-4">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-muted-foreground w-full"
              disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
