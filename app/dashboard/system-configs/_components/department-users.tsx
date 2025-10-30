"use client";

import { useState, useEffect, PropsWithChildren, useCallback, useMemo } from "react";
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
import {
  Plus,
  Edit,
  Trash2,
  Building,
  PencilLine,
  ShieldAlert,
  ArrowRight,
  ArrowUpRightIcon,
  Users2
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { Department, DepartmentUser } from "@/lib/types";
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
  updateDepartment,
  deleteDepartment,
  createDepartment
} from "@/app/_actions/config-actions";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { useDepartments } from "@/hooks/use-query-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/lib/types/account";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DepartmentUsersConfig({ users }: { users: DepartmentUser[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Users</h3>
            <p className="text-muted-foreground text-sm">
              List of all the users in this department
            </p>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add users
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              {/* <TableHead className="w-24">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <div className="col-span-full">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Users2 />
                        </EmptyMedia>
                        <EmptyTitle>No Users Yet</EmptyTitle>
                        <EmptyDescription>
                          You haven&apos;t created any modules yet. Get started by creating your
                          first module.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <div className="flex gap-2">
                          <Link href="/dashboard/system-configs/users">
                            <Button>Add Department Users</Button>
                          </Link>
                        </div>
                      </EmptyContent>
                      <Button variant="link" asChild className="text-muted-foreground" size="sm">
                        <Link href="/dashboard/system-configs/users">
                          Configure Users <ArrowUpRightIcon />
                        </Link>
                      </Button>
                    </Empty>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <span className="font-medium">
                      {user.first_name} {user.last_name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">{user.role}</span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      )}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  {/* <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTown(user.id)}
                                  className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

type ErrorState = {
  status: boolean;
  message: string;
  onParentId?: boolean;
};

const INIT_DEPARTMENT: Department = {
  id: undefined,
  name: "",
  code: "",
  description: "",
  parent_id: null,
  is_active: true
};

export function CreateOrUpdateDepartment({
  showTrigger,
  openModal,
  setOpenModal,
  initialData = null,
  departmentId,
  setInitialData
}: {
  showTrigger?: boolean;
  openModal?: boolean;
  departmentId?: string;
  initialData?: Department | null;
  setInitialData?: React.Dispatch<React.SetStateAction<Department | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [formData, setFormData] = useState<Department>(INIT_DEPARTMENT);

  const { data } = useDepartments({
    isActive: true,
    page_size: 100,
    page: 1
  });

  const departments = (data?.data?.data || []) as Department[];

  // PRE-POPULATE FORM DATA - Fixed to respond to prop changes
  useEffect(() => {
    if (initialData && departmentId) {
      setFormData({
        id: initialData.id,
        name: initialData.name || "",
        code: initialData.code || "",
        description: initialData.description || "",
        parent_id: initialData.parent_id || null,
        is_active: initialData.is_active || true
      });
    } else {
      setFormData(INIT_DEPARTMENT);
    }
    setError({ status: false, message: "" });
  }, [initialData, departmentId, openModal]); // Added dependencies

  console.log("Initial Data:", initialData);
  console.log("Form Data:", formData);

  // Reset form when modal closes
  useEffect(() => {
    if (!openModal) {
      // Small delay to allow animation to complete
      const timer = setTimeout(() => {
        setFormData(INIT_DEPARTMENT);
        setError({ status: false, message: "" });
        setInitialData?.(null);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [openModal, setInitialData]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: Department) => {
      return initialData && departmentId
        ? updateDepartment({ ...data, id: String(departmentId) })
        : createDepartment(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Department ${initialData ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEPARTMENTS] });
        setOpenModal?.(false);
        setInitialData?.(null);
        setFormData(INIT_DEPARTMENT);
        setError({ status: false, message: "" });
      } else {
        toast.error(response.message);
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

  const departmentOptions = useMemo(() => {
    return departments
      .filter((dept) => dept.id !== departmentId) // Prevent self-parenting
      .map((item) => ({
        id: item?.id as string,
        name: item?.name
      }));
  }, [departments, departmentId]);

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {initialData ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update Department
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
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <SearchSelectField
            label="Parent Unit"
            placeholder="Select parent unit (optional)"
            value={formData.parent_id || ""}
            onValueChange={(value) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, parent_id: value || null }));
            }}
            options={departmentOptions}
          />
          <Input
            label="Name"
            placeholder="Department Name"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
            }}
            required
            descriptionText="A unique code will be automatically generated from the name"
          />
          <Textarea
            label="Description"
            placeholder="Department description (optional)"
            value={formData.description || ""}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, description: e.target.value }));
            }}
          />
          <div className="flex items-center space-x-2 self-end pl-2">
            <Checkbox
              id="is_active"
              checked={formData?.is_active}
              title="Define whether this department is currently active"
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked }) as any)
              }
            />
            <Label
              htmlFor="is_active"
              className="text-foreground cursor-pointer text-sm font-medium text-nowrap">
              Is Active Department
            </Label>
          </div>
          {error.status && <CustomAlert type="error" message={error.message} Icon={ShieldAlert} />}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setOpenModal?.(false);
                  setFormData(INIT_DEPARTMENT);
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
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
