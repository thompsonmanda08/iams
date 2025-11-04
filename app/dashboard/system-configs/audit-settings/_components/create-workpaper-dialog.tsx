import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, PencilLine, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/lib/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomAlert from "@/components/ui/custom-alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkpaperTemplate } from "@/lib/types/audit-types";
import {
  createWorkingPaperTemplate,
  updateWorkingPaperTemplate
} from "@/app/_actions/audit-module-actions";
import { notify } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { SelectField } from "@/components/ui/select-field";

const INIT_WORKPAPER_TEMPLATE: Omit<WorkpaperTemplate, "id"> = {
  name: "",
  standard: "ISO",
  description: "",
  version: "",
  is_active: true
};

export function CreateOrUpdateISOTemplateDialog({
  showTrigger,
  openModal,
  setOpenModal,
  initialData = null,
  templateId,
  setInitialData
}: {
  showTrigger?: boolean;
  openModal?: boolean;
  templateId?: string;
  initialData?: WorkpaperTemplate | null;
  setInitialData?: React.Dispatch<React.SetStateAction<WorkpaperTemplate | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [formData, setFormData] = useState<Omit<WorkpaperTemplate, "id">>(INIT_WORKPAPER_TEMPLATE);

  // PRE-POPULATE FORM DATA - Fixed to respond to prop changes
  useEffect(() => {
    if (initialData && templateId) {
      setFormData({
        // id: initialData.id,
        name: initialData.name || "",
        version: initialData.version || "",
        description: initialData.description || "",
        standard: initialData.standard || "",
        is_active: initialData.is_active || true
      });
    } else {
      setFormData(INIT_WORKPAPER_TEMPLATE);
    }
    setError({ status: false, message: "" });
  }, [initialData, templateId, openModal]); // Added dependencies

  // Reset form when modal closes
  useEffect(() => {
    if (!openModal) {
      // Small delay to allow animation to complete
      const timer = setTimeout(() => {
        setFormData(INIT_WORKPAPER_TEMPLATE);
        setError({ status: false, message: "" });
        setInitialData?.(null);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [openModal, setInitialData]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: Omit<WorkpaperTemplate, "id">) => {
      return initialData && templateId
        ? updateWorkingPaperTemplate(templateId, data)
        : createWorkingPaperTemplate(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        notify({
          title: "Success",
          description: `Working paper template ${templateId ? "updated" : "created"} successfully`
        });
        // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
        setOpenModal?.(false);
        setInitialData?.(null);
        setFormData(INIT_WORKPAPER_TEMPLATE);
        setError({ status: false, message: "" });
      } else {
        notify({
          title: "Error",
          description: response.message || `Failed to ${templateId ? "update" : "create"} template`,
          type: "error"
        });
        setError({ status: true, message: response.message });
      }
    },
    onError: (error) => {
      toast.error("An error occurred");
      setError({ status: true, message: "An unexpected error occurred" });
      console.error("Error saving department:", error);
    }
  });

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(formData);
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
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
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
