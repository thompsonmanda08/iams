"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface KRIConfigureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KRIConfigure({ open, onOpenChange }: KRIConfigureProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    unit: "",
    target: "",
    threshold: "",
    frequency: ""
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    // Handle form submission
    console.log("KRI Configuration:", formData);
    onOpenChange(false);
    setStep(1);
    setFormData({
      name: "",
      description: "",
      category: "",
      unit: "",
      target: "",
      threshold: "",
      frequency: ""
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Configure New KRI</DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}: {getStepTitle(step)}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${index + 1 <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">KRI Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., System Downtime"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this KRI measures..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData("category", value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it-security">IT Security</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Define the measurement unit and how values should be interpreted for this KRI.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Measurement Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => updateFormData("unit", value)}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="count">Count (number)</SelectItem>
                    <SelectItem value="currency">Currency ($)</SelectItem>
                    <SelectItem value="time">Time (hours/days)</SelectItem>
                    <SelectItem value="ratio">Ratio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Set target and threshold values. The target is your desired value, while the
                  threshold triggers warnings when exceeded.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="target">Target Value *</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="e.g., 1"
                    value={formData.target}
                    onChange={(e) => updateFormData("target", e.target.value)}
                  />
                  <p className="text-muted-foreground text-xs">Optimal/desired value</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold Value *</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.threshold}
                    onChange={(e) => updateFormData("threshold", e.target.value)}
                  />
                  <p className="text-muted-foreground text-xs">Warning trigger value</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Configure monitoring frequency and review settings for this KRI.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Monitoring Frequency *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => updateFormData("frequency", value)}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}
              <div className="border-border bg-card mt-6 rounded-lg border p-4">
                <h4 className="text-foreground mb-3 font-medium">Configuration Summary</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="text-foreground font-medium">{formData.name || "Not set"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category:</dt>
                    <dd className="text-foreground font-medium">
                      {formData.category || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Unit:</dt>
                    <dd className="text-foreground font-medium">{formData.unit || "Not set"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Target:</dt>
                    <dd className="text-foreground font-medium">{formData.target || "Not set"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Threshold:</dt>
                    <dd className="text-foreground font-medium">
                      {formData.threshold || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Frequency:</dt>
                    <dd className="text-foreground font-medium">
                      {formData.frequency || "Not set"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="border-border flex justify-between border-t pt-4">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              <Check className="mr-2 h-4 w-4" />
              Complete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return "Basic Information";
    case 2:
      return "Measurement Settings";
    case 3:
      return "Targets & Thresholds";
    case 4:
      return "Monitoring & Review";
    default:
      return "";
  }
}
