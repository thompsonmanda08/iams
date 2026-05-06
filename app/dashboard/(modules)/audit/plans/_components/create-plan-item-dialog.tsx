"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, PencilLine, ShieldAlert } from "lucide-react";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { DatePicker } from "@/components/ui/date-picker";
import CustomAlert from "@/components/ui/custom-alert";
import { Textarea } from "@/components/ui/textarea";
import { useDepartments } from "@/hooks/use-query-data";
import { createAnnualAuditPlanItem, updateAnnualAuditPlan } from "@/app/_actions/audit-module-actions";
import { notify, toLocalDateString } from "@/lib/utils";
import { AUDIT_QUERY_KEYS } from "@/hooks/use-audit-query-data";
import { Department, ErrorState } from "@/lib/types";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

type AnnualPlanItem = {
  id?: string;
  department_id: string;
  universe_item_ids: string[];
  engagement_date: string;
  engagement_end_date: string;
  responsible_person: string;
  [s: string]: any;
};

const INIT_FORM_DATA: AnnualPlanItem = {
  department_id: "",
  universe_item_ids: [],
  engagement_date: "",
  engagement_end_date: "",
  responsible_person: ""
};

interface CreatePlanItemDialogProps {
  planId: string;
  showTrigger?: boolean;
  initialData?: AnnualPlanItem | null;
  selectedItemId?: string | null;
  triggerLabel?: string;
}

export function CreatePlanItemDialog({
  planId,
  showTrigger = true,
  initialData = null,
  selectedItemId = null,
  triggerLabel
}: CreatePlanItemDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { checkPermission, hasPermission } = usePermissions();
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<AnnualPlanItem>(
    initialData && selectedItemId
      ? {
          department_id: initialData.department_id || "",
          engagement_date: initialData?.engagement_date || "",
          engagement_end_date: initialData?.engagement_end_date || "",
          responsible_person: initialData?.responsible_person || "",
          universe_item_ids: initialData.universe_item_ids || []
        }
      : INIT_FORM_DATA
  );

  const { data, isLoading: loadingDepartments } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });

  const departments = (data?.data?.data || []) as Department[];

  useEffect(() => {
    if (openModal) {
      if (initialData && selectedItemId) {
        setFormData({
          department_id: initialData.department_id || "",
          engagement_date: initialData?.engagement_date || "",
          engagement_end_date: initialData?.engagement_end_date || "",
          responsible_person: initialData?.responsible_person || "",
          universe_item_ids: initialData.universe_item_ids || []
        });
      } else if (!initialData) {
        setFormData(INIT_FORM_DATA);
      }
      setError({ status: false, message: "" });
    }
  }, [initialData, selectedItemId, openModal]);

  useEffect(() => {
    if (!openModal) {
      const timer = setTimeout(() => {
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [openModal]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return initialData && selectedItemId
        ? updateAnnualAuditPlan(String(planId), { ...data, id: String(selectedItemId) })
        : createAnnualAuditPlanItem(String(planId), data);
    },
    onSuccess: (response) => {
      if (response.success) {
        notify({
          description: `Plan item ${initialData && selectedItemId ? "updated" : "created"} successfully`
        });
        queryClient.invalidateQueries({
          queryKey: [AUDIT_QUERY_KEYS.ANNUAL_AUDIT_PLANS, planId, "items"]
        });
        router.refresh();
        setOpenModal(false);
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });
      } else {
        notify({
          description: response.message,
          type: "error"
        });
        setError({ status: true, message: response.message });
      }
    },
    onError: (error) => {
      notify({
        description: "Oops! Something went wrong.",
        type: "error"
      });
      setError({ status: true, message: "An unexpected error occurred" });
      console.error("Error saving:", error);
    }
  });

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, initialData && selectedItemId ? "can_edit" : "can_create")) return;
    saveMutation.mutate(formData);
  }

  const departmentOptions = useMemo(() => {
    return departments.map((dept) => ({
      id: dept?.id as string,
      name: dept?.name
    }));
  }, [departments]);

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal} modal={false}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            {initialData ? (
              <>
                <PencilLine className="h-3.5 w-3.5" /> {triggerLabel || "Update Plan Item"}
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> {triggerLabel || "Add Plan Item"}
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Annual Audit Plan Item" : "Create Annual Audit Plan Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <SearchSelectField
            label="Functional Unit / Department"
            placeholder="--Select Functional Area--"
            value={formData?.department_id || ""}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, department_id: value }));
            }}
            isLoading={loadingDepartments}
            options={departmentOptions}
          />

          <Textarea
            label="Responsible Person"
            placeholder="Name of the responsible person"
            value={formData.responsible_person || ""}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, responsible_person: e.target.value }));
            }}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DatePicker
              type="date"
              label="Engagement Date"
              minDate={new Date()}
              value={
                formData.engagement_date
                  ? (new Date(formData.engagement_date) as unknown as any)
                  : undefined
              }
              onValueChange={(date) => {
                setError({ status: false, message: "" });
                setFormData((c) => ({
                  ...c,
                  engagement_date: toLocalDateString(date)
                }));
              }}
            />
            <DatePicker
              type="date"
              label="Engagement End Date"
              minDate={new Date()}
              value={
                formData.engagement_end_date
                  ? (new Date(formData.engagement_end_date) as unknown as any)
                  : undefined
              }
              onValueChange={(date) => {
                setError({ status: false, message: "" });
                setFormData((c) => ({
                  ...c,
                  engagement_end_date: toLocalDateString(date)
                }));
              }}
            />
          </div>

          {error.status && <CustomAlert type="error" message={error.message} Icon={ShieldAlert} />}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setOpenModal(false);
                  setFormData(INIT_FORM_DATA);
                  setError({ status: false, message: "" });
                }}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={saveMutation.isPending}
              isLoading={saveMutation.isPending}
              loadingText="Saving...">
              {initialData ? "Update Item" : "Create Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
