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
import { Plus, Edit, Trash2, Target, PencilLine, ShieldAlert } from "lucide-react";
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
  createStrategicPillar,
  updateStrategicPillar,
  deleteStrategicPillar
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
import { DatePicker } from "@/components/ui/date-picker";

interface PillarFormData extends Omit<AuditConfigurableItem, "id"> {
  start_date?: string;
  end_date?: string;
}

const INIT_FORM_DATA: PillarFormData = {
  title: "",
  description: "",
  department_id: null,
  start_date: "",
  end_date: ""
};

export default function StrategicPillarsTab({
  pillars = [],
  departments = [],
  pagination
}: {
  pillars: AuditConfigurableItem[];
  pagination?: Pagination;
  departments: Department[];
}) {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<PillarFormData | null>(INIT_FORM_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [items, setItems] = useState<AuditConfigurableItem[]>(pillars);

  useEffect(() => {
    setItems(pillars);
  }, [pillars]);

  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStrategicPillar(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Strategic Pillar deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete pillar");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete pillar");
      console.error("Error deleting pillar:", error);
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

  console.log("departments:", departments);

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((d) => d.id === departmentId);
    return department ? department.name : "No department assigned - Global";
  };

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Strategic Pillars</h4>
            <p className="text-muted-foreground text-sm">
              Define strategic pillars that guide your organization&apos;s direction
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setFormData(null);
              setOpenModal(true);
            }}>
            <Plus className="h-4 w-4" />
            New Strategic Pillar
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategic Pillar</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-24" align="center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Target />
                      </EmptyMedia>
                      <EmptyTitle>No strategic pillars yet</EmptyTitle>
                      <EmptyDescription>
                        You haven&apos;t created any strategic pillars yet. Get started by creating
                        your first strategic pillar.
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
                          <Plus className="h-4 w-4" /> Create New Strategic Pillar
                        </Button>
                      </div>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item: any) => {
                return (
                  <TableRow key={item.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Target className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {item.description || "No description provided"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {getDepartmentName(item.department_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {item.start_date && item.end_date
                          ? `${new Date(item.start_date).toLocaleDateString()} - ${new Date(item.end_date).toLocaleDateString()}`
                          : "No duration set"}
                      </span>
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
        title="Delete Strategic Pillar"
        description="Are you sure you want to delete this strategic pillar? This action cannot be undone."
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
  initialData?: PillarFormData | null;
  setInitialData?: React.Dispatch<React.SetStateAction<PillarFormData | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<PillarFormData>(() => {
    if (initialData && selectedId) {
      return {
        title: initialData.title || "",
        department_id: initialData.department_id || "",
        description: initialData.description || "",
        start_date: (initialData as any).start_date || "",
        end_date: (initialData as any).end_date || ""
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

  useEffect(() => {
    if (openModal) {
      if (initialData && selectedId) {
        setFormData({
          title: initialData.title || "",
          department_id: initialData.department_id || "",
          description: initialData.description || "",
          start_date: (initialData as any).start_date || "",
          end_date: (initialData as any).end_date || ""
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
        ? updateStrategicPillar({ ...data, id: String(selectedId) })
        : createStrategicPillar(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Strategic Pillar ${initialData ? "updated" : "created"} successfully`);
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
      console.error("Error saving pillar:", error);
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

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {initialData ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update Strategic Pillar
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Strategic Pillar
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Strategic Pillar" : "Add Strategic Pillar"}
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
          <Input
            label="Strategic Pillar"
            placeholder="Strategic Pillar Title"
            value={formData.title}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, title: e.target.value }));
            }}
            required
          />
          <Textarea
            label="Strategic Pillar Description"
            placeholder="strategic pillar description"
            value={formData.description || ""}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, description: e.target.value }));
            }}
          />
          <div>
            <label className="mb-2 block text-sm font-medium">
              Strategic Pillar Duration (Start - End Dates)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <DatePicker
                type="date"
                // label="Start Date"
                placeholder="Start Date"
                value={
                  formData.start_date
                    ? (new Date(formData.start_date) as unknown as any)
                    : undefined
                }
                onValueChange={(date) => {
                  setError({ status: false, message: "" });
                  setFormData((c) => ({
                    ...c,
                    start_date: date?.toISOString() || ""
                  }));
                }}
              />
              <DatePicker
                type="date"
                // label="End Date"
                placeholder="Start Date"
                value={
                  formData.end_date ? (new Date(formData.end_date) as unknown as any) : undefined
                }
                onValueChange={(date) => {
                  setError({ status: false, message: "" });
                  setFormData((c) => ({
                    ...c,
                    end_date: date?.toISOString() || ""
                  }));
                }}
              />
            </div>
          </div>
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
              disabled={saveMutation.isPending || !formData.title.trim()}
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
