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
import { ComplianceWorkpaperTemplateForm } from "./iso-workpaper-form";

export function CreateOrUpdateISOTemplateDialog({
  showTrigger,
  openModal,
  setOpenModal,
  initialData = null,
  templateId = "",
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
          <Button size="sm">
            {initialData ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update Template
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Template
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Template" : "Create Template"}</DialogTitle>
        </DialogHeader>
        {/* <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="name"
                label="Template Name"
                classNames={{
                  wrapper: "max-w-none w-full flex-1"
                }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., ISO 27001:2022 ISMS Audit"
                required
              />
              <Input
                id="version"
                label="Vision"
                classNames={{
                  wrapper: "max-w-xs w-full flex-[0.5]"
                }}
                required
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0"
              />
            </div>

            <SelectField
              label="Management Standard"
              placeholder="Select template standard"
              className="w-full max-w-none"
              classNames={{
                wrapper: "max-w-none"
              }}
              value={formData.standard}
              onValueChange={(value) => setFormData({ ...formData, standard: value })}
              options={[{ id: "ISO", name: "ISO 27001" }]}
              required
            />

            <Textarea
              id="description"
              label="Description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Working paper template for ISO 27001:2022 ISMS audits..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active Template</Label>
              <p className="text-muted-foreground text-sm">Make this template available for use</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          {error.status && <CustomAlert type="error" message={error.message} Icon={ShieldAlert} />}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={saveMutation.isPending}
                onClick={() => {
                  setOpenModal?.(false);
                  setFormData(INIT_WORKPAPER_TEMPLATE);
                  setError({ status: false, message: "" });
                }}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={saveMutation.isPending || !formData.name.trim()}
              isLoading={saveMutation.isPending}
              loadingText="Saving...">
              {initialData && templateId ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </form> */}
        <ComplianceWorkpaperTemplateForm
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
