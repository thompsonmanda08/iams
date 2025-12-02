"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ClipboardList } from "lucide-react";
import type {
  AuditPlan,
  CustomTemplate,
  WorkpaperBuilderTemplateId
} from "@/lib/types/audit-types";
import { CreateOrUpdateISOTemplateDialog } from "./create-workpaper-dialog";

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

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // const selectedAudit = audits.find((a) => a.id === selectedAuditId);

  const handleTemplateSelect = (templateId: WorkpaperBuilderTemplateId) => {
    // Build the URL without audit info - users will attach to audit plan later
    const url = `/dashboard/system-configs/audit-settings/templates/new/${templateId}`;
    // const url = `/dashboard/system-configs/audit-settings/templates/new`; // ISO IEC 27001

    // Navigate to the creation page
    router.push(url);

    // Close the dialog
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-full max-w-3xl! overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Workpaper Template</DialogTitle>
            <DialogDescription>
              Select the type of workpaper template you want to use:
            </DialogDescription>
          </DialogHeader>

          {/* Template Selection */}
          {
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card
                  className="hover:border-primary cursor-pointer border-2 p-6 transition-all hover:bg-slate-50"
                  onClick={() => {
                    setIsCreateDialogOpen(true);
                    onOpenChange(false);
                  }}>
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                      <ClipboardList className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="mx-auto flex max-w-max flex-col items-center justify-center gap-1">
                        <h3 className="text-base font-semibold">Compliance Templates</h3>
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Category-based workpaper templates with comprehensive audit documentation
                      </p>
                    </div>
                    <ul className="text-muted-foreground w-full space-y-1 text-center text-xs">
                      <li>✓ ISO 27001, COBIT, COSO, NIST templates</li>
                      <li>✓ Category-based organization</li>
                      <li>✓ Documents & sampling fields</li>
                      <li>✓ Compatible with audit plan templates</li>
                    </ul>
                  </div>
                </Card>

                {/* General Template */}
                <Card
                  className="hover:border-primary cursor-pointer border-2 border-dashed p-6 transition-all hover:bg-slate-50"
                  onClick={() => handleTemplateSelect("GENERAL")}>
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="mx-auto flex max-w-max flex-col items-center justify-center gap-1">
                        <h3 className="text-base font-semibold">General Work Paper (B.1.1.2) </h3>
                        <Badge variant="default" className="text-xs">
                          Coming soon
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Comprehensive evidence grid with tick marks for detailed transaction testing
                        and audit procedures
                      </p>
                    </div>
                    <ul className="text-muted-foreground w-full space-y-1 text-center text-xs">
                      <li>✓ Evidence & testing grid with tick marks</li>
                      <li>✓ Optional evidence grid</li>
                      <li>✓ Financial transaction testing</li>
                      <li>✓ Customizable tick mark selection</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog>

      <CreateOrUpdateISOTemplateDialog
        // showTrigger
        openModal={isCreateDialogOpen}
        setOpenModal={setIsCreateDialogOpen}
      />
    </>
  );
}
