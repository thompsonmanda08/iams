"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardList, Settings, Sparkles } from "lucide-react";
import type { AuditPlan, CustomTemplate } from "@/lib/types/audit-types";

interface WorkpaperTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audits?: AuditPlan[];
  customTemplates?: CustomTemplate[];
}

export function WorkpaperTemplateDialog({
  open,
  onOpenChange,
  audits = [],
  customTemplates = []
}: WorkpaperTemplateDialogProps) {
  const router = useRouter();
  // const [selectedAuditId, setSelectedAuditId] = useState<string | undefined>(undefined);

  // const selectedAudit = audits.find((a) => a.id === selectedAuditId);

  const handleTemplateSelect = (templateId: string) => {
    // Build the URL without audit info - users will attach to audit plan later
    const url = `/dashboard/audit/workpapers/new/${templateId}`;

    // Navigate to the creation page
    router.push(url);

    // Close the dialog
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-7xl! overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Workpaper Template</DialogTitle>
        </DialogHeader>

        {/* Audit Selection - Commented out for now */}
        {/* Users will attach workpaper to audit plan later from the audit plan details page */}
        {/* {audits.length > 0 && (
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
        )} */}

        {/* Template Selection */}
        {
          <div className="space-y-6 py-4">
            <p className="text-muted-foreground text-sm">
              Select the type of workpaper template you want to use:
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* ISO 27001 Template */}
              <Card
                className="hover:border-primary cursor-pointer p-6 transition-all hover:bg-slate-50"
                onClick={() => handleTemplateSelect("iso27001")}>
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <ClipboardList className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">ISO 27001 Clause (Simple)</h3>
                    <p className="text-muted-foreground text-sm">
                      Quick workpaper for single ISO 27001 clause testing
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

              {/* ISO 27001:2022 Comprehensive Template */}
              <Card
                className="hover:border-primary cursor-pointer p-6 transition-all hover:bg-slate-50 border-2"
                onClick={() => handleTemplateSelect("iso27001-2022")}>
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                    <ClipboardList className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-lg font-semibold">ISO 27001:2022</h3>
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Category-based template with comprehensive audit documentation
                    </p>
                  </div>
                  <ul className="text-muted-foreground w-full space-y-1 text-left text-xs">
                    <li>✓ 11 ISO 27001:2022 categories</li>
                    <li>✓ Category-based organization</li>
                    <li>✓ Documents & sampling fields</li>
                    <li>✓ Compatible with audit plan templates</li>
                  </ul>
                </div>
              </Card>

              {/* General Template */}
              <Card
                className="hover:border-primary cursor-pointer p-6 transition-all hover:bg-slate-50"
                onClick={() => handleTemplateSelect("general")}>
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
                onClick={() => handleTemplateSelect("custom-new")}>
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
            {customTemplates.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Your Custom Templates</h4>
                  <p className="text-muted-foreground text-sm">
                    Select from your saved templates or create a new one
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {customTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="hover:border-primary cursor-pointer p-4 transition-all hover:bg-slate-50"
                      onClick={() => handleTemplateSelect(template.id)}>
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
        }

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
  );
}
