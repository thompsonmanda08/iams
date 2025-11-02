"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, FileText, Archive, FolderOpen, View, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createKRIRegister,
  updateKRIRegister,
  deleteKRIRegister
} from "@/app/_actions/risk-module-actions";
import { toast } from "sonner";
import Search from "@/components/ui/search-field";
import { CustomPagination } from "@/components/ui/pagination";
import { ConfirmationModal } from "@/components/confirmation-modal";

type KRIRegister = {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Pagination = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

type CreateRegisterForm = {
  name: string;
  description: string;
};

type Props = {
  initialRegisters: KRIRegister[];
  initialPagination: Pagination;
  currentSearch: string;
};

export default function KRIRegistersClient({
  initialRegisters,
  initialPagination,
  currentSearch
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateRegisterForm>({
    name: "",
    description: ""
  });
  const [errors, setErrors] = useState<Partial<CreateRegisterForm>>({});

  const [editingRegister, setEditingRegister] = useState<KRIRegister | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [registerToDelete, setRegisterToDelete] = useState<KRIRegister | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key === "search") {
      params.delete("page");
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    updateSearchParams("search", value);
  };

  const updatePagination = ({ page, page_size }: { page?: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page !== undefined) {
      params.set("page", String(page));
    }
    if (page_size !== undefined) {
      params.set("page_size", String(page_size));
      params.set("page", "1");
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const validateForm = (data: CreateRegisterForm): boolean => {
    const newErrors: Partial<CreateRegisterForm> = {};

    if (!data.name.trim()) {
      newErrors.name = "Register name is required";
    }

    if (!data.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm(formData)) return;

    setIsSubmitting(true);
    try {
      const response = await createKRIRegister(formData);
      if (response.success) {
        setDialogOpen(false);
        setFormData({ name: "", description: "" });
        setErrors({});
        toast.success(response.message || "KRI Register created successfully");
        router.refresh();
      } else {
        toast.error(response.message || "Failed to create register");
      }
    } catch (error) {
      console.error("Failed to create register:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (register: KRIRegister) => {
    setEditingRegister(register);
    setFormData({
      name: register.name,
      description: register.description
    });
    setErrors({});
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingRegister) return;
    if (!validateForm(formData)) return;

    setIsSubmitting(true);
    try {
      const response = await updateKRIRegister(editingRegister.id, formData);
      if (response.success) {
        setEditDialogOpen(false);
        setEditingRegister(null);
        setFormData({ name: "", description: "" });
        setErrors({});
        toast.success(response.message || "KRI Register updated successfully");
        router.refresh();
      } else {
        toast.error(response.message || "Failed to update register");
      }
    } catch (error) {
      console.error("Failed to update register:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (register: KRIRegister) => {
    setRegisterToDelete(register);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!registerToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteKRIRegister(registerToDelete.id);
      if (response.success) {
        setDeleteDialogOpen(false);
        setRegisterToDelete(null);
        toast.success(response.message || "KRI Register deleted successfully");
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete register");
      }
    } catch (error) {
      console.error("Failed to delete register:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigateToRegister = (registerId: string) => {
    router.push(`/dashboard/risks/kri/${registerId}`);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700";
  };

  const customPaginationData = {
    page: initialPagination.page,
    page_size: initialPagination.page_size,
    total_pages: initialPagination.total_pages,
    totalCount: initialPagination.total,
    has_prev: initialPagination.has_prev,
    has_next: initialPagination.has_next
  };

  const totalRegisters = initialPagination.total;
  const activeCount = initialRegisters.filter((r) => r.is_active).length;
  const inactiveCount = initialRegisters.filter((r) => !r.is_active).length;

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">KRI Registers</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage your Key Risk Indicator registers and reports
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Register
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid grid-cols-1 gap-4 px-4 pt-6 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Registers</p>
              <p className="text-2xl font-bold text-blue-600">{totalRegisters}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <FolderOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <Archive className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="container mx-auto px-4 pt-6">
        <Card className="p-4">
          <Search
            placeholder="Search registers..."
            defaultValue={currentSearch}
            onChange={handleSearchChange}
            disabled={isPending}
          />
        </Card>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialRegisters?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FolderOpen className="text-muted-foreground mx-auto h-12 w-12" />
                      <h3 className="mt-4 text-lg font-semibold">No registers found</h3>
                      <p className="text-muted-foreground mt-2 text-sm">
                        {currentSearch
                          ? "Try adjusting your search criteria"
                          : "Get started by creating your first KRI register"}
                      </p>
                      {!currentSearch && (
                        <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Register
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                initialRegisters?.map((register) => (
                  <TableRow key={register.id}>
                    <TableCell>
                      <p className="text-foreground font-medium">{register.name}</p>
                      {register.description && (
                        <div className="mt-1 flex items-center gap-1">
                          <p className="line-clamp-1 text-xs text-gray-500">
                            {register.description}
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium capitalize",
                          getStatusColor(register.is_active)
                        )}>
                        {register.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(register.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(register.updated_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNavigateToRegister(register.id)}
                          className="h-8 gap-1.5">
                          <View className="h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5"
                          onClick={() => handleEditClick(register)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(register)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {initialRegisters?.length > 0 && (
            <CustomPagination
              pagination={customPaginationData}
              updatePagination={updatePagination}
              allowSetPageSize={true}
              showDetails={true}
              className="border-t"
            />
          )}
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New KRI Register</DialogTitle>
            <DialogDescription>
              Create a new register to organize and track your Key Risk Indicators
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Register Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Quarterly EMC Report Q1 2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn(errors.name && "border-destructive")}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and scope of this register..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={cn(errors.description && "border-destructive")}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-destructive text-sm">{errors.description}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setFormData({ name: "", description: "" });
                setErrors({});
              }}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit KRI Register</DialogTitle>
            <DialogDescription>Update the register information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Register Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Quarterly EMC Report Q1 2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn(errors.name && "border-destructive")}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Describe the purpose and scope of this register..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={cn(errors.description && "border-destructive")}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-destructive text-sm">{errors.description}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingRegister(null);
                setFormData({ name: "", description: "" });
                setErrors({});
              }}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        type="delete"
        title="Delete KRI Register"
        description={`Are you sure you want to delete "${registerToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
