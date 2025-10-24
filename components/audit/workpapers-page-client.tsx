"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, FileText, ClipboardList, Settings, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WorkpapersTable } from "./workpapers-table";
import { CreateWorkpaperForm } from "./create-workpaper-form";
import { GeneralWorkpaperForm } from "./general-workpaper-form";
import { CustomTemplateBuilder } from "./custom-template-builder";
import { CustomWorkpaperForm } from "./custom-workpaper-form";
import type { Workpaper, AuditPlan, CustomTemplate } from "@/lib/types/audit-types";

interface WorkpapersPageClientProps {
  workpapers: Workpaper[];
  audits: AuditPlan[];
}

type WorkpaperTemplate = "iso27001" | "general" | "custom-new" | string | null;

// Mock custom templates - replace with actual data fetch
const mockCustomTemplates: CustomTemplate[] = [
  {
    id: "custom-1",
    name: "IT Security Assessment",
    description: "Comprehensive IT security controls testing template",
    type: "custom",
    createdBy: "John Doe",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
    isPublic: true,
    includeEvidenceGrid: false,
    sections: [
      {
        id: "sec-1",
        title: "Scope & Objectives",
        description: "Define assessment scope",
        order: 0,
        fields: [
          {
            id: "field-1",
            label: "Assessment Scope",
            type: "textarea",
            required: true,
            placeholder: "Describe the scope...",
            order: 0
          },
          {
            id: "field-2",
            label: "Risk Level",
            type: "select",
            required: true,
            options: ["Low", "Medium", "High", "Critical"],
            order: 1
          }
        ]
      }
    ],
    usageCount: 15
  }
];

export function WorkpapersPageClient({ workpapers, audits }: WorkpapersPageClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<WorkpaperTemplate>(null);
  const [selectedCustomTemplate, setSelectedCustomTemplate] = useState<CustomTemplate | null>(null);

  const handleOpenCreateDialog = () => {
    // Auto-select first active audit if available
    const firstActiveAudit = audits.find((a) => a.status === "in-progress") || audits[0];
    if (firstActiveAudit) {
      setSelectedAuditId(firstActiveAudit.id);
    }
    setIsCreateDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsCreateDialogOpen(false);
    setSelectedAuditId("");
    setSelectedTemplate(null);
    setSelectedCustomTemplate(null);
  };

  const handleCancel = () => {
    setIsCreateDialogOpen(false);
    setSelectedAuditId("");
    setSelectedTemplate(null);
    setSelectedCustomTemplate(null);
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setSelectedCustomTemplate(null);
  };

  const handleTemplateCreated = (templateId: string) => {
    // In real implementation, fetch the created template and use it
    handleSuccess();
  };

  const handleCustomTemplateSelect = (template: CustomTemplate) => {
    setSelectedCustomTemplate(template);
    setSelectedTemplate(template.id);
  };

  const selectedAudit = audits.find((a) => a.id === selectedAuditId);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Audit Workpapers</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Document audit testing procedures and evidence
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="gap-2" onClick={handleOpenCreateDialog}>
                <Plus className="h-4 w-4" />
                Create Workpaper
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Results Summary */}
          {workpapers && workpapers.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {workpapers.length} workpaper{workpapers.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Table */}
          <WorkpapersTable workpapers={workpapers || []} />
        </div>
      </div>

      {/* Create Workpaper Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] w-full max-w-6xl! overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {!selectedTemplate ? "Choose Workpaper Template" : "Create Workpaper"}
            </DialogTitle>
          </DialogHeader>

          {/* Audit Selection */}
          {!selectedAuditId && audits.length > 0 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="audit-select">
                  Select Audit Plan <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedAuditId} onValueChange={setSelectedAuditId}>
                  <SelectTrigger id="audit-select">
                    <SelectValue placeholder="Select an audit plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {audits.map((audit) => (
                      <SelectItem key={audit.id} value={audit.id}>
                        {audit.title} ({audit.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Template Selection */}
          {selectedAuditId && !selectedTemplate && (
            <div className="space-y-6 py-4">
              <p className="text-muted-foreground text-sm">
                Select the type of workpaper template you want to use:
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* ISO 27001 Template */}
                <Card
                  className="hover:border-primary cursor-pointer p-6 transition-all hover:bg-slate-50"
                  onClick={() => setSelectedTemplate("iso27001")}>
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <ClipboardList className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">ISO 27001 Clause Template</h3>
                      <p className="text-muted-foreground text-sm">
                        Use pre-configured ISO 27001 clause templates with automated objective and
                        test procedure population
                      </p>
                    </div>
                    <ul className="text-muted-foreground w-full space-y-1 text-left text-xs">
                      <li>✓ Template library with 8+ clauses</li>
                      <li>✓ Auto-population of objectives</li>
                      <li>✓ Evidence upload support</li>
                      <li>✓ Test result tracking</li>
                    </ul>
                  </div>
                </Card>

                {/* General Template */}
                <Card
                  className="hover:border-primary cursor-pointer p-6 transition-all hover:bg-slate-50"
                  onClick={() => setSelectedTemplate("general")}>
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">General Work Paper (B.1.1.2)</h3>
                      <p className="text-muted-foreground text-sm">
                        Comprehensive evidence grid with tick marks for detailed transaction testing
                        and audit procedures
                      </p>
                    </div>
                    <ul className="text-muted-foreground w-full space-y-1 text-left text-xs">
                      <li>✓ Evidence & testing grid with 26 tick marks</li>
                      <li>✓ Financial transaction testing</li>
                      <li>✓ Debits/Credits tracking</li>
                      <li>✓ Customizable tick mark selection</li>
                    </ul>
                  </div>
                </Card>

                {/* Create Custom Template */}
                <Card
                  className="hover:border-primary cursor-pointer border-2 border-dashed p-6 transition-all hover:bg-slate-50"
                  onClick={() => setSelectedTemplate("custom-new")}>
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                      <Sparkles className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Create Custom Template</h3>
                      <p className="text-muted-foreground text-sm">
                        Build your own reusable template with custom fields and sections
                      </p>
                    </div>
                    <ul className="text-muted-foreground w-full space-y-1 text-left text-xs">
                      <li>✓ Custom sections and fields</li>
                      <li>✓ Optional evidence grid</li>
                      <li>✓ Share with team</li>
                      <li>✓ Reusable across audits</li>
                    </ul>
                  </div>
                </Card>
              </div>

              {/* Custom Templates List */}
              {mockCustomTemplates.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Your Custom Templates</h4>
                    <p className="text-muted-foreground text-sm">
                      Select from your saved templates or create a new one
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {mockCustomTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="hover:border-primary cursor-pointer p-4 transition-all hover:bg-slate-50"
                        onClick={() => handleCustomTemplateSelect(template)}>
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                            <Settings className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="truncate font-medium">{template.name}</h4>
                              {template.isPublic && (
                                <Badge variant="secondary" className="text-xs">
                                  Team
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                              {template.description}
                            </p>
                            <div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
                              <span>{template.sections.length} sections</span>
                              <span>Used {template.usageCount || 0} times</span>
                              {template.includeEvidenceGrid && (
                                <Badge variant="outline" className="text-xs">
                                  Evidence Grid
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* ISO 27001 Form */}
          {selectedAuditId && selectedAudit && selectedTemplate === "iso27001" && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Back to template selection
              </Button>
              <CreateWorkpaperForm
                auditId={selectedAuditId}
                auditTitle={selectedAudit.title}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          )}

          {/* General Workpaper Form */}
          {selectedAuditId && selectedAudit && selectedTemplate === "general" && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Back to template selection
              </Button>
              <GeneralWorkpaperForm
                auditId={selectedAuditId}
                auditTitle={selectedAudit.title}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          )}

          {/* Custom Template Builder */}
          {selectedAuditId && selectedTemplate === "custom-new" && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Back to template selection
              </Button>
              <CustomTemplateBuilder onSuccess={handleTemplateCreated} onCancel={handleBack} />
            </div>
          )}

          {/* Custom Workpaper Form */}
          {selectedAuditId &&
            selectedAudit &&
            selectedCustomTemplate &&
            selectedTemplate !== "iso27001" &&
            selectedTemplate !== "general" &&
            selectedTemplate !== "custom-new" && (
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  ← Back to template selection
                </Button>
                <CustomWorkpaperForm
                  auditId={selectedAuditId}
                  auditTitle={selectedAudit.title}
                  template={selectedCustomTemplate}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              </div>
            )}

          {/* No audits message */}
          {audits.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                No audit plans available. Please create an audit plan first.
              </p>
              <Button variant="outline" className="mt-4" onClick={handleCancel}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
