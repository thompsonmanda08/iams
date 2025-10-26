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
    year: new Date().getFullYear(),
    title: '',
    description: '',
    ref_no: '',
    audit_area: '',
    audit_scope: '',
    audit_criteria: '',
    audit_objective: '',
    management_standard: 'ISO IEC 27001:2022',
    audit_team_leader: '',
    audit_team_member: '',
    client_representative: '',
    audit_language: 'English',
    start_date: '',
    end_date: '',
    opening_meeting_datetime: '',
    closing_meeting_datetime: '',
    working_paper_template_id: '',
    selectedCategories: [] as string[],
  });

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!formData.title || !formData.ref_no || !formData.audit_scope || !formData.audit_objective ||
          !formData.start_date || !formData.end_date || !formData.audit_team_leader ||
          !formData.audit_area || !formData.audit_criteria) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.working_paper_template_id) {
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
      working_paper_template_id: templateId,
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

    // Prepare data according to new API structure
    const auditData = {
      year: formData.year,
      title: formData.title,
      description: formData.description || undefined,
      start_date: formData.start_date,
      end_date: formData.end_date,
      ref_no: formData.ref_no,
      audit_area: formData.audit_area,
      audit_scope: formData.audit_scope,
      audit_criteria: formData.audit_criteria,
      audit_objective: formData.audit_objective,
      management_standard: formData.management_standard,
      audit_team_leader: formData.audit_team_leader,
      audit_team_member: formData.audit_team_member || undefined,
      client_representative: formData.client_representative || undefined,
      audit_language: formData.audit_language || undefined,
      opening_meeting_datetime: formData.opening_meeting_datetime || undefined,
      closing_meeting_datetime: formData.closing_meeting_datetime || undefined,
      working_paper_template_id: formData.working_paper_template_id || undefined,
    };

    try {
      const result = await createAuditPlan(auditData);

      if (result.success) {
        toast({
          title: "Success",
          description: "Audit plan created successfully as Draft. You can submit it for approval when ready.",
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <Input
                          id="year"
                          type="number"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                          placeholder="2025"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ref_no">Reference Number *</Label>
                        <Input
                          id="ref_no"
                          value={formData.ref_no}
                          onChange={(e) => setFormData({ ...formData, ref_no: e.target.value })}
                          placeholder="e.g., AP-2025-001"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Audit Plan Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Annual Audit Plan 2025"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Comprehensive audit plan for fiscal year..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="management_standard">Management Standard *</Label>
                      <Select
                        value={formData.management_standard}
                        onValueChange={(value) => setFormData({ ...formData, management_standard: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select standard" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ISO IEC 27001:2022">ISO IEC 27001:2022</SelectItem>
                          <SelectItem value="ISO IEC 27001:2013">ISO IEC 27001:2013</SelectItem>
                          <SelectItem value="ISO 9001:2015">ISO 9001:2015</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audit_area">Audit Area *</Label>
                      <Input
                        id="audit_area"
                        value={formData.audit_area}
                        onChange={(e) => setFormData({ ...formData, audit_area: e.target.value })}
                        placeholder="e.g., ISMS based on ISO 27001:2022"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audit_scope">Audit Scope *</Label>
                      <Textarea
                        id="audit_scope"
                        value={formData.audit_scope}
                        onChange={(e) => setFormData({ ...formData, audit_scope: e.target.value })}
                        placeholder="All information security controls across the organization..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audit_criteria">Audit Criteria *</Label>
                      <Input
                        id="audit_criteria"
                        value={formData.audit_criteria}
                        onChange={(e) => setFormData({ ...formData, audit_criteria: e.target.value })}
                        placeholder="e.g., ISO 27001:2022 requirements"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audit_objective">Audit Objective *</Label>
                      <Textarea
                        id="audit_objective"
                        value={formData.audit_objective}
                        onChange={(e) => setFormData({ ...formData, audit_objective: e.target.value })}
                        placeholder="Assess compliance with ISO 27001:2022 and effectiveness of ISMS..."
                        rows={3}
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
                        <Label htmlFor="start_date">Start Date *</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date *</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="opening_meeting_datetime">Opening Meeting</Label>
                        <Input
                          id="opening_meeting_datetime"
                          type="datetime-local"
                          value={formData.opening_meeting_datetime}
                          onChange={(e) => setFormData({ ...formData, opening_meeting_datetime: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="closing_meeting_datetime">Closing Meeting</Label>
                        <Input
                          id="closing_meeting_datetime"
                          type="datetime-local"
                          value={formData.closing_meeting_datetime}
                          onChange={(e) => setFormData({ ...formData, closing_meeting_datetime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team & Stakeholders
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="audit_team_leader">Audit Team Leader *</Label>
                      <Input
                        id="audit_team_leader"
                        value={formData.audit_team_leader}
                        onChange={(e) => setFormData({ ...formData, audit_team_leader: e.target.value })}
                        placeholder="Team leader user ID"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audit_team_member">Audit Team Member</Label>
                      <Input
                        id="audit_team_member"
                        value={formData.audit_team_member}
                        onChange={(e) => setFormData({ ...formData, audit_team_member: e.target.value })}
                        placeholder="Team member user ID"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client_representative">Client Representative</Label>
                      <Input
                        id="client_representative"
                        value={formData.client_representative}
                        onChange={(e) => setFormData({ ...formData, client_representative: e.target.value })}
                        placeholder="e.g., John Doe, CISO"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audit_language">Audit Language</Label>
                      <Input
                        id="audit_language"
                        value={formData.audit_language}
                        onChange={(e) => setFormData({ ...formData, audit_language: e.target.value })}
                        placeholder="English"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Template Selection */}
              {currentStep === 2 && (
                <TemplateSelectorSimple
                  value={formData.working_paper_template_id}
                  onChange={handleTemplateChange}
                />
              )}

              {/* Step 3: Category Selection */}
              {currentStep === 3 && formData.working_paper_template_id && (
                <CategorySelector
                  templateId={formData.working_paper_template_id}
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
