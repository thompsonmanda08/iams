"use client";

import { useState, useRef, useEffect } from "react";
import { X, Pen, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { submitRiskAcceptanceSignature } from "@/app/_actions/risk-module-actions";

export interface ApproverSignature {
  action_id: string;
  user_id: string;
  name: string;
  designation: string;
  date: Date | string;
  signature: string;
}

interface SignatureFormProps {
  actionId: string;
  userId: string;
  acceptanceId: string;
  onSubmit: (data: ApproverSignature) => Promise<void>;
  onClose: () => void;
}

export default function SignatureForm({
  actionId,
  userId,
  acceptanceId,
  onSubmit,
  onClose
}: SignatureFormProps) {
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
    signature: ""
  });

  // Initialize canvas when modal opens
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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

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
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to create signature image");
          setIsUploadingSignature(false);
          return;
        }

        // Create a File from the blob
        const file = new File([blob], `signature-${Date.now()}.png`, { type: "image/png" });

        // Upload to PocketBase
        const uploadResponse = await uploadFile(file);

        if (uploadResponse.success && uploadResponse.data?.file_url) {
          setFormData((prev) => ({ ...prev, signature: uploadResponse.data.file_url }));
          setShowSignatureModal(false);
          toast.success("Signature saved");
        } else {
          toast.error(uploadResponse.message || "Failed to upload signature");
        }
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to save signature");
    } finally {
      setIsUploadingSignature(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.designation.trim()) {
      toast.error("Please enter your designation");
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit to API
      const submitResponse = await submitRiskAcceptanceSignature(acceptanceId, {
        action_id: formData.action_id,
        user_id: formData.user_id,
        name: formData.name,
        designation: formData.designation,
        signature: formData.signature
      });

      if (!submitResponse.success) {
        throw new Error(submitResponse.message || "Failed to submit signature");
      }

      // Call the onSubmit callback
      await onSubmit(formData);
      toast.success("Signature submitted successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit signature");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center rounded-lg bg-black p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold text-slate-800">Sign Here</h3>
              <button
                onClick={() => {
                  setShowSignatureModal(false);
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

      {/* Main Form */}
      <div className="space-y-6 rounded-lg">
        <div>
          <h3 className="mb-4 font-semibold text-slate-700">Approval Sign-Off</h3>
        </div>

        <div className="flex flex-col gap-4">
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
            onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
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
                  {formData.date ? format(formData.date as Date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date as Date}
                  onSelect={(date) => setFormData((prev) => ({ ...prev, date: date as Date }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">
            Signature <span className="!text-red-500">*</span>
          </Label>
          {formData.signature ? (
            <div className="flex items-center justify-between rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-4">
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
          <div className="mt-3 gap-2 rounded-lg bg-orange-50 px-2 py-2">
            <span className="font-mono text-xs italic">
              Submitting this form without a signature will be treated as a rejection of the action.
            </span>
          </div>
        </div>

        <div className="flex gap-3 border-t pt-6">
          <Button onClick={onClose} variant="destructive" className="flex-1" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Submit Signature"}
          </Button>
        </div>
      </div>
    </>
  );
}
