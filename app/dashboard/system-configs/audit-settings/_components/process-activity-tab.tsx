"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Workflow, PencilLine, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { AuditConfigurableItem, Department, ErrorState, Pagination } from "@/lib/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createProcessActivity,
  updateProcessActivity,
  deleteProcessActivity
} from "@/app/_actions/audit-settings-actions";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import CustomAlert from "@/components/ui/custom-alert";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { useDepartments } from "@/hooks/use-query-data";
import { Textarea } from "@/components/ui/textarea";

interface ProcessFormData extends Omit<AuditConfigurableItem, "id"> {
  auditable_area_id?: string;
  pillar_id?: string;
  activities?: string[];
}

const INIT_FORM_DATA: ProcessFormData = {
  name: "",
  description: "",
  department_id: null,
  auditable_area_id: "",
  pillar_id: "",
  activities: [""]
};

export default function ProcessActivityTab({
  processes = [],
  pagination
}: {
  processes: AuditConfigurableItem[];
  pagination?: Pagination;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<ProcessFormData | null>(INIT_FORM_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [items, setItems] = useState<AuditConfigurableItem[]>(processes);

  useEffect(() => {
    setItems(processes);
  }, [processes]);

  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProcessActivity(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Process/Activity deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete process");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete process");
      console.error("Error deleting process:", error);
    },
    onSettled: () => {
      setDeleteDialogOpen(false);
      setSelectedId(null);
    }
  });

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    deleteMutation.mutate(selectedId);
  };

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-medium text-sm leading-none">Process/Activity</h4>
            <p className="text-muted-foreground text-sm">
              Manage business processes and their associated activities
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setFormData(null);
              setOpenModal(true);
            }}>
            <Plus className="h-4 w-4" />
            New Process/Activity
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Process Name</TableHead>
              <TableHead>Functional Area</TableHead>
              <TableHead>Strategic Pillar</TableHead>
              <TableHead>Auditable Area</TableHead>
              <TableHead>Activities</TableHead>
              <TableHead className="w-24" align="center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Workflow />
                      </EmptyMedia>
                      <EmptyTitle>No processes yet</EmptyTitle>
                      <EmptyDescription>
                        You haven&apos;t created any processes yet. Get started by creating your
                        first process/activity.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setFormData(null);
                            setOpenModal(true);
                          }}>
                          <Plus className="h-4 w-4" /> Create New Process/Activity
                        </Button>
                      </div>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item: any) => {
                const departmentName = item?.department || "No department assigned - Global";
                const pillarName = item?.pillar || "N/A";
                const auditableArea = item?.auditable_area || "N/A";
                const activities = item?.activities || [];

                return (
                  <TableRow key={item.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Workflow className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{departmentName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{pillarName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{auditableArea}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {activities.slice(0, 3).map((activity: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                            {activity}
                          </span>
                        ))}
                        {activities.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{activities.length - 3} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            setFormData(item);
                            setSelectedId(item.id);
                            setOpenModal(true);
                            e.stopPropagation();
                          }}
                          className="h-8 gap-1.5">
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            handleDeleteClick(String(item.id));
                            e.stopPropagation();
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateOrUpdate
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={formData}
        selectedId={selectedId}
        setInitialData={setFormData}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Process/Activity"
        description="Are you sure you want to delete this process? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

function CreateOrUpdate({
  showTrigger,
  openModal,
  setOpenModal,
  initialData = null,
  selectedId = null,
  setInitialData
}: {
  showTrigger?: boolean;
  openModal?: boolean;
  selectedId: string | null;
  initialData?: ProcessFormData | null;
  setInitialData?: React.Dispatch<React.SetStateAction<ProcessFormData | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<ProcessFormData>(() => {
    if (initialData && selectedId) {
      return {
        name: initialData.name || "",
        department_id: initialData.department_id || "",
        auditable_area_id: (initialData as any).auditable_area_id || "",
        pillar_id: (initialData as any).pillar_id || "",
        description: initialData.description || "",
        activities: (initialData as any).activities || [""]
      };
    }
    return INIT_FORM_DATA;
  });

  const { data } = useDepartments({
    isActive: true,
    page_size: 100,
    page: 1
  });

  const departments = (data?.data?.data || []) as Department[];

  // Mock data - replace with actual API calls
  const auditableAreas = [
    { id: "1", name: "Financial Management" },
    { id: "2", name: "IT Security" },
    { id: "3", name: "Compliance" }
  ];

  const pillars = [
    { id: "1", name: "Customer Excellence" },
    { id: "2", name: "Operational Efficiency" }
  ];

  useEffect(() => {
    if (openModal) {
      if (initialData && selectedId) {
        setFormData({
          name: initialData.name || "",
          department_id: initialData.department_id || "",
          auditable_area_id: (initialData as any).auditable_area_id || "",
          pillar_id: (initialData as any).pillar_id || "",
          description: initialData.description || "",
          activities: (initialData as any).activities || [""]
        });
      } else if (!initialData) {
        setFormData(INIT_FORM_DATA);
      }
      setError({ status: false, message: "" });
    }
  }, [initialData, selectedId, openModal]);

  useEffect(() => {
    if (!openModal && setOpenModal) {
      const timer = setTimeout(() => {
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });
        setInitialData?.(null);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [openModal, setOpenModal, setInitialData]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return initialData && selectedId
        ? updateProcessActivity({ ...data, id: String(selectedId) })
        : createProcessActivity(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Process/Activity ${initialData ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
        router.refresh();
        setOpenModal?.(false);
        setInitialData?.(null);
        setFormData(INIT_FORM_DATA);
        setError({ status: false, message: "" });
      } else {
        toast.error(response.message);
        setError({ status: true, message: response.message });
      }
    },
    onError: (error) => {
      toast.error("An error occurred");
      setError({ status: true, message: "An unexpected error occurred" });
      console.error("Error saving process:", error);
    }
  });

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(formData);
  }

  const departmentOptions = useMemo(() => {
    return departments.map((dept) => ({
      id: dept?.id as string,
      name: dept?.name
    }));
  }, [departments]);

  const auditableAreaOptions = useMemo(() => {
    return auditableAreas.map((area) => ({
      id: area.id,
      name: area.name
    }));
  }, []);

  const pillarOptions = useMemo(() => {
    return pillars.map((pillar) => ({
      id: pillar.id,
      name: pillar.name
    }));
  }, []);

  const handleAddActivity = () => {
    setFormData((prev) => ({
      ...prev,
      activities: [...(prev.activities || []), ""]
    }));
  };

  const handleRemoveActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities?.filter((_, i) => i !== index) || []
    }));
  };

  const handleActivityChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities?.map((activity, i) => (i === index ? value : activity)) || []
    }));
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {initialData ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update Process/Activity
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Process/Activity
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Process/Activity" : "Add Process/Activity"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <SearchSelectField
            label="Functional Area"
            placeholder="--Select Functional Area--"
            value={formData?.department_id || ""}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, department_id: value }));
            }}
            options={departmentOptions}
          />
          <SearchSelectField
            label="Strategic Pillar"
            placeholder="--Select Strategic Pillar--"
            value={formData?.pillar_id || ""}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, pillar_id: value }));
            }}
            options={pillarOptions}
          />
          <SearchSelectField
            label="Auditable Area"
            placeholder="--Select Auditable Area--"
            value={formData?.auditable_area_id || ""}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, auditable_area_id: value }));
            }}
            options={auditableAreaOptions}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Process/Activity Title(s)</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddActivity}
                className="h-7 text-xs">
                + Add Another Process
              </Button>
            </div>
            <div className="space-y-2">
              {formData.activities?.map((activity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`process/activity title ${index + 1}`}
                    value={activity}
                    onChange={(e) => handleActivityChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.activities && formData.activities.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveActivity(index)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Textarea
            label="Process/Activity Description"
            placeholder="process/activity description"
            value={formData.description || ""}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, description: e.target.value }));
            }}
          />
          {error.status && <CustomAlert type="error" message={error.message} Icon={ShieldAlert} />}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  setOpenModal?.(false);
                  setFormData(INIT_FORM_DATA);
                  setError({ status: false, message: "" });
                }}>
                 Close
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={saveMutation.isPending || !formData.activities?.some((a) => a.trim())}
              isLoading={saveMutation.isPending}
              loadingText="Saving...">
               Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
