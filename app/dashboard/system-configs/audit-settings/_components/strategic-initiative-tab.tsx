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
import { Plus, Edit, Trash2, Lightbulb, PencilLine, ShieldAlert } from "lucide-react";
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
  createStrategicInitiative,
  updateStrategicInitiative,
  deleteStrategicInitiative,
  getStrategicPillars,
  getStrategicInitiatives
} from "@/app/_actions/audit-settings-actions";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Spinner } from "@/components/ui/spinner";
import Loader from "@/components/ui/loader";

interface InitiativeFormData extends Omit<AuditConfigurableItem, "id"> {
  pillar_id?: string;
}

const INIT_FORM_DATA: InitiativeFormData = {
  title: "",
  description: "",
  department_id: null,
  pillar_id: "",
  start_date: new Date().toISOString(),
  end_date: new Date().toISOString()
};

export default function StrategicInitiativeTab({
  // initiatives = [],
  // pagination
  departments
}: {
  initiatives: AuditConfigurableItem[];
  pagination?: Pagination;
  departments: Department[];
}) {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState<InitiativeFormData | null>(INIT_FORM_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // const [items, setItems] = useState<AuditConfigurableItem[]>(initiatives);

  // useEffect(() => {
  //   setItems(initiatives);
  // }, [initiatives]);

  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStrategicInitiative(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Strategic Initiative deleted successfully");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_INITIATIVES] });
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete initiative");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete initiative");
      console.error("Error deleting initiative:", error);
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
  const [pillarId, setPillarId] = useState<string | null>(null);

  const { data: initiativesResponse, isLoading: loadingInitiatives } = useQuery({
    queryKey: [QUERY_KEYS.STRATEGIC_INITIATIVES, pillarId],
    queryFn: () => getStrategicInitiatives(String(pillarId), { page: 1, page_size: 100 }),
    enabled: !!pillarId
  });

  const initiatives = initiativesResponse?.data?.data || [];
  const pagination = initiativesResponse?.data?.pagination || null;

  const { data: pillarsResponse, isLoading: loadingPillars } = useQuery({
    queryKey: [QUERY_KEYS.STRATEGIC_PILLARS],
    queryFn: () => getStrategicPillars(undefined, { page: 1, page_size: 100 })
    // enabled: !!formData?.department_id
  });

  const pillars = pillarsResponse?.data?.data || [];

  const pillarOptions = useMemo(() => {
    return pillars.map((pillar: any) => ({
      id: pillar.id,
      name: pillar.title
    }));
  }, [pillars]);

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((d) => d.id === departmentId);
    return department ? department.name : "No department assigned - Global";
  };

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">Strategic Initiatives</h4>
            <p className="text-muted-foreground text-sm">
              Manage strategic initiatives aligned with your organization&apos;s pillars
            </p>
          </div>
          <div className="flex items-end gap-2">
            <SearchSelectField
              placeholder="--Select Strategic Pillar--"
              value={pillarId || ""}
              onValueChange={setPillarId}
              isLoading={loadingPillars}
              options={pillarOptions}
              className="min-w-60"
              classNames={{
                wrapper: "min-w-60"
              }}
            />
            <Button
              size="sm"
              className="h-9"
              onClick={() => {
                setFormData(null);
                setOpenModal(true);
              }}>
              <Plus className="h-4 w-4" />
              New Strategic Initiative
            </Button>
          </div>
        </div>

        {loadingInitiatives ? (
          <Loader className="flex items-center justify-center">
            {/* <Spinner className="h-8 w-8 " /> */}
          </Loader>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Strategic Initiative</TableHead>
                <TableHead>Strategic Pillar</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="w-24" align="center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initiatives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Lightbulb />
                        </EmptyMedia>
                        <EmptyTitle>No strategic pillar selected yet</EmptyTitle>
                        <EmptyDescription>
                          If you haven&apos;t created any strategic initiatives yet. Get started by
                          creating your first strategic initiative.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <div className="flex items-center gap-2">
                          <SearchSelectField
                            placeholder="--Select Strategic Pillar--"
                            value={pillarId || ""}
                            onValueChange={setPillarId}
                            isLoading={loadingPillars}
                            options={pillarOptions}
                            className="min-w-60"
                            classNames={{
                              wrapper: "min-w-40"
                            }}
                          />
                          <Button
                            size="sm"
                            className="h-9"
                            onClick={() => {
                              setFormData(null);
                              setOpenModal(true);
                            }}>
                            <Plus className="h-4 w-4" />
                            New Strategic Initiative
                          </Button>
                        </div>
                      </EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                initiatives.map((item: any) => {
                  return (
                    <TableRow key={item.id} className="cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Lightbulb className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {item?.pillar || "No pillar assigned"}
                        </span>
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
        )}
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
        title="Delete Strategic Initiative"
        description="Are you sure you want to delete this strategic initiative? This action cannot be undone."
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
  initialData?: InitiativeFormData | null;
  setInitialData?: React.Dispatch<React.SetStateAction<InitiativeFormData | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<InitiativeFormData>(() => {
    if (initialData && selectedId) {
      return {
        title: initialData.title || "",
        department_id: initialData.department_id || "",
        pillar_id: (initialData as any).pillar_id || "",
        description: initialData.description || ""
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

  const { data: pillarsResponse, isLoading: loadingPillars } = useQuery({
    queryKey: [QUERY_KEYS.STRATEGIC_PILLARS],
    queryFn: () => getStrategicPillars(undefined, { page: 1, page_size: 100 }),
    enabled: !!formData?.department_id
  });

  const pillars = pillarsResponse?.data?.data || [];

  const pillarOptions = useMemo(() => {
    return pillars.map((pillar) => ({
      id: pillar.id,
      name: pillar.title
    }));
  }, []);

  useEffect(() => {
    if (openModal) {
      if (initialData && selectedId) {
        setFormData({
          title: initialData.title || "",
          department_id: initialData.department_id || "",
          pillar_id: (initialData as any).pillar_id || "",
          description: initialData.description || ""
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
        ? updateStrategicInitiative({ ...data, id: String(selectedId) })
        : createStrategicInitiative(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Strategic Initiative ${initialData ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STRATEGIC_INITIATIVES] });
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
      console.error("Error saving initiative:", error);
    }
  });

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();

    console.log("Form data:", formData);

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
                <PencilLine className="mr-2 h-4 w-4" /> Update Strategic Initiative
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Strategic Initiative
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update Strategic Initiative" : "Add Strategic Initiative"}
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
            isLoading={loadingPillars}
            options={departmentOptions}
          />
          <SearchSelectField
            label="Strategic Pillar"
            placeholder="--Select Strategic Pillar--"
            value={formData?.pillar_id || ""}
            isDisabled={!formData?.department_id}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, pillar_id: value }));
            }}
            options={pillarOptions}
          />
          <Input
            label="Strategic Initiative"
            placeholder="Strategic Initiative"
            value={formData.title}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, title: e.target.value }));
            }}
            required
          />
          <Textarea
            label="Strategic Initiative Description"
            placeholder="Strategic Initiative description"
            value={formData.description || ""}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, description: e.target.value }));
            }}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Strategic Initiative Duration (Start - End Dates)
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
