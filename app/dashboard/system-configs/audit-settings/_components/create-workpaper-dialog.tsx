"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, PencilLine } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { WorkpaperTemplate } from "@/lib/types/audit-types";
import { WorkpaperTemplateForm } from "./workpaper-template-form";
import { PermissionButton } from "@/components/ui/permission-button";
import { MODULE_CODES } from "@/lib/constants/module-codes";

export function CreateWorkpaperTemplateDialog({
  showTrigger,
  openModal,
  setOpenModal,
  initialData = null,
  templateId = ""
}: {
  showTrigger?: boolean;
  openModal?: boolean;
  templateId?: string;
  initialData?: WorkpaperTemplate | null;
  setInitialData?: React.Dispatch<React.SetStateAction<WorkpaperTemplate | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // Internal state for when setOpenModal is not provided
  const [internalOpenModal, setInternalOpenModal] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = setOpenModal !== undefined ? openModal : internalOpenModal;
  const handleOpenChange = setOpenModal !== undefined ? setOpenModal : setInternalOpenModal;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <PermissionButton
            moduleCode={MODULE_CODES.AUDIT_MODULE_CONFIG}
            action={initialData ? "can_edit" : "can_create"}
            size="sm">
            {initialData ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update Template
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Template
              </>
            )}
          </PermissionButton>
        </DialogTrigger>
      )}
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Template" : "Create Template"}</DialogTitle>
        </DialogHeader>

        <WorkpaperTemplateForm
          templateId={String(templateId)}
          initialData={initialData}
          onSuccess={() => {
            handleOpenChange(false);
          }}
          onCancel={() => {
            handleOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
