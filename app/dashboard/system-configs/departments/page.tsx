"use client";

import { useState, useEffect, PropsWithChildren, useMemo } from "react";
import { configApi } from "@/lib/api/config-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Edit, Trash2, MapPin, PencilLineIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Props } from "@dnd-kit/core/dist/components/DragOverlay";
import { Department, DepartmentUser, ErrorState } from "@/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { createNewDepartment, updateDepartment } from "@/app/_actions/config-actions";
import { useRouter } from "next/navigation";
import { useDepartments } from "@/hooks/use-query-data";

export default function DepartmentsConfigPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingCategory, setEditingDepartment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // const { data, isLoading: isLoadingDepartments } = useDepartments();

  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [provincesData] = await Promise.all([configApi.getProvinces()]);
      setDepartments(provincesData as any);
    } catch (error) {
      toast.error("Failed to load office configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm("Are you sure? This will affect related towns and branches.")) return;

    try {
      await configApi.deleteProvince(id);
      toast.success("Province deleted successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Department Setup</h1>
          <p className="text-muted-foreground mt-1">Manage your departments across the country</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Departments</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingDepartment(null);
              setOpenModal(true);
            }}>
            <Plus className="h-4 w-4" /> Create New Department
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="bg-muted h-20 animate-pulse rounded" />
                </TableCell>
              </TableRow>
            ) : (
              departments.map((department) => (
                <TableRow
                  key={department.id}
                  onClick={() => {
                    console.info("Row Clicked...", department?.code);
                    router.push(`/dashboard/system-configs/departments/${department.id}`);
                  }}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">{department.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {department.description || "No description provided"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{department.code}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        department.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      )}>
                      {department.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          setEditingDepartment(department);
                          setOpenModal(true);
                          e.stopPropagation();
                        }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          handleDeleteDepartment(String(department.id));
                          e.stopPropagation();
                        }}
                        className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateOrUpdateDepartment
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={editingCategory}
        setInitialData={setEditingDepartment}
      />
    </div>
  );
}

function CreateOrUpdateDepartment({
  showTrigger,
  openModal,
  setOpenModal,
  initialData = null,
  setInitialData
}: PropsWithChildren & {
  showTrigger?: boolean;
  openModal?: boolean;
  initialData?: Department | null;
  setInitialData?: React.Dispatch<React.SetStateAction<Department | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Department>(
    initialData ?? {
      id: undefined,
      name: "",
      code: "",
      description: ""
    }
  );

  // Improved useEffect to handle initialData changes
  useEffect(() => {
    if (openModal) {
      if (initialData) {
        // Update form when editing existing department
        setFormData({
          id: initialData.id,
          name: initialData.name || "",
          code: initialData.code || "",
          description: initialData.description || ""
        });
      } else {
        // Reset form when creating new department
        setFormData({
          id: undefined,
          name: "",
          code: "",
          description: ""
        });
      }
      // Reset error state when modal opens
      setError({ status: false, message: "" });
    }
  }, [openModal, initialData]); // Added openModal as dependency

  // Reset form when modal closes
  useEffect(() => {
    if (!openModal) {
      // Small delay to allow animation to complete
      const timer = setTimeout(() => {
        setFormData({
          id: undefined,
          name: "",
          code: "",
          description: ""
        });
        setError({ status: false, message: "" });
        setInitialData?.(null);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [openModal, setInitialData]);

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // Validate parent category is selected
    if (!formData.parentId) {
      setError({
        status: true,
        message: "Please select a parent category",
        onParentId: true
      });
      setIsLoading(false);
      return;
    }

    const res = initialData
      ? await updateDepartment({ ...formData, id: String(initialData?.id) })
      : await createNewDepartment({ ...formData });

    if (res.success) {
      toast.success(`Department ${initialData ? "updated" : "created"}`);
      setOpenModal?.(false);
      setInitialData?.(null);
      setFormData({ id: undefined, name: "", code: "", description: "" });
    } else {
      toast.error(res.message);
      setError({ status: true, message: res.message });
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {" "}
            {initialData ? (
              <>
                <PencilLineIcon className="mr-2 h-4 w-4" /> Update Department
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Department
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Department" : "Create New Department"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
          <Input
            label="Name"
            placeholder="Department Name"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
            }}
            required
            // descriptionText="A unique code will be automatically generated from the name"
          />
          <Input
            label="Description"
            placeholder="Department description (optional)"
            value={formData.description}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, description: e.target.value }));
            }}
          />
          {error.status && (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => setOpenModal?.(false)}
                className="">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !formData.parentId || !formData.name}
              isLoading={isLoading}
              loadingText="Saving..."
              className="">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
