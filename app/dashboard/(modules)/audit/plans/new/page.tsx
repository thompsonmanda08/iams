"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Users, FileText, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { createAuditPlan } from "@/app/_actions/audit-module-actions";
import { useToast } from "@/hooks/use-toast";
import { TemplateSelectorSimple } from "@/components/audit/template-selector-simple";
import { CategorySelector } from "@/components/audit/category-selector";
import { TemplateService } from "@/lib/services/template-service";

const STEPS = [
  { id: 1, name: 'Basic Details', icon: Calendar },
  { id: 2, name: 'Template Selection', icon: FileText },
  { id: 3, name: 'Category Selection', icon: CheckCircle2 },
];

export default function NewAuditPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    standard: 'ISO 27001:2022',
    scope: '',
    objectives: '',
    startDate: '',
    endDate: '',
    teamLeader: '',
    teamMembers: '',
    templateId: '',
    selectedCategories: [] as string[],
  });

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!formData.title || !formData.scope || !formData.objectives || !formData.startDate || !formData.endDate || !formData.teamLeader) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.templateId) {
        toast({
          title: "Validation Error",
          description: "Please select a template",
          variant: "destructive",
        });
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleTemplateChange = (templateId: string) => {
    setFormData((prev) => ({
      ...prev,
      templateId,
      selectedCategories: [], // Reset categories when template changes
    }));
  };

  async function handleSubmit() {
    // Validate category selection
    if (formData.selectedCategories.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const auditData = {
      title: formData.title,
      standard: formData.standard,
      scope: formData.scope.split(",").map(s => s.trim()),
      objectives: formData.objectives,
      teamLeader: formData.teamLeader,
      teamMembers: formData.teamMembers.split(",").map(m => m.trim()).filter(Boolean),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      templateId: formData.templateId,
      selectedCategories: formData.selectedCategories,
    };

    try {
      const result = await createAuditPlan(auditData);

      if (result.success) {
        const template = TemplateService.getTemplate(formData.templateId);
        toast({
          title: "Success",
          description: `Audit plan created successfully. ${formData.selectedCategories.length} working papers will be generated.`,
        });
        router.push("/dashboard/audit/plans");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create audit plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/audit/plans">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Audit Plan</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up a new ISO 27001 audit plan with template and category selection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`
                          flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                          ${isActive ? 'border-primary bg-primary text-primary-foreground' : ''}
                          ${isCompleted ? 'border-primary bg-primary text-primary-foreground' : ''}
                          ${!isActive && !isCompleted ? 'border-muted bg-background text-muted-foreground' : ''}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`
                          text-sm mt-2 font-medium
                          ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                        `}
                      >
                        {step.name}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`
                          h-0.5 flex-1 mx-4 transition-colors
                          ${isCompleted ? 'bg-primary' : 'bg-muted'}
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <Card className="p-6">
            <div className="space-y-6">
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Basic Information
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="title">Audit Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Q1 2025 ISO 27001 Internal Audit"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="standard">Standard *</Label>
                      <Select
                        value={formData.standard}
                        onValueChange={(value) => setFormData({ ...formData, standard: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select standard" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ISO 27001:2022">ISO 27001:2022</SelectItem>
                          <SelectItem value="ISO 27001:2013">ISO 27001:2013</SelectItem>
                          <SelectItem value="ISO 9001:2015">ISO 9001:2015</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scope">Scope (comma-separated) *</Label>
                      <Input
                        id="scope"
                        value={formData.scope}
                        onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                        placeholder="e.g., Information Security, Risk Management, ISMS"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple scope items with commas
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="objectives">Audit Objectives *</Label>
                      <Textarea
                        id="objectives"
                        value={formData.objectives}
                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                        placeholder="Describe the main objectives of this audit..."
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Schedule
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="teamLeader">Team Leader *</Label>
                      <Input
                        id="teamLeader"
                        value={formData.teamLeader}
                        onChange={(e) => setFormData({ ...formData, teamLeader: e.target.value })}
                        placeholder="e.g., John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teamMembers">Team Members (comma-separated)</Label>
                      <Input
                        id="teamMembers"
                        value={formData.teamMembers}
                        onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                        placeholder="e.g., Jane Smith, Mike Johnson"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple team members with commas
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Template Selection */}
              {currentStep === 2 && (
                <TemplateSelectorSimple
                  value={formData.templateId}
                  onChange={handleTemplateChange}
                />
              )}

              {/* Step 3: Category Selection */}
              {currentStep === 3 && formData.templateId && (
                <CategorySelector
                  templateId={formData.templateId}
                  selectedCategories={formData.selectedCategories}
                  onCategoriesChange={(categories) =>
                    setFormData({ ...formData, selectedCategories: categories })
                  }
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={isSubmitting}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Audit Plan"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
