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
import { cn, notify } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createKRIRegister,
  updateKRIRegister,
  deleteKRIRegister
} from "@/app/_actions/risk-module-actions";
import Search from "@/components/ui/search-field";
import { useTableSearch } from "@/hooks/use-table-search";
import { CustomPagination } from "@/components/ui/pagination";
import { ConfirmationModal } from "@/components/confirmation-modal";
import PageHeader from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { KRIStatsSection } from "./kri-stats-section";
import { is } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

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
  is_active?: boolean;
};

type Props = {
  initialRegisters: KRIRegister[];
  initialPagination: Pagination;
  stats: any;
};

export default function KRIRegistersClient({
  initialRegisters,
  initialPagination,
  stats
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateRegisterForm>({
    name: "",
    description: "",
    is_active: true
  });
  const [errors, setErrors] = useState<Partial<CreateRegisterForm>>({});

  const [editingRegister, setEditingRegister] = useState<KRIRegister | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [registerToDelete, setRegisterToDelete] = useState<KRIRegister | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { checkPermission, hasPermission } = usePermissions();

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
        notify({ description: response.message || "KRI Register created successfully", type: "success" });
        router.refresh();
      } else {
        notify({ description: response.message || "Failed to create register", type: "error" });
      }
    } catch (error) {
      console.error("Failed to create register:", error);
      notify({ description: "An unexpected error occurred", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClick = () => {
    if (!checkPermission(MODULE_CODES.KRI_DASHBOARD, "can_create")) return;
    setDialogOpen(true);
  };

  const handleEditClick = (register: KRIRegister) => {
    if (!checkPermission(MODULE_CODES.KRI_DASHBOARD, "can_edit")) return;
    setEditingRegister(register);
    setFormData({
      name: register.name,
      description: register.description,
      is_active: register.is_active
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
        setFormData({ name: "", description: "", is_active: true });
        setErrors({});
        notify({ description: response.message || "KRI Register updated successfully", type: "success" });
        router.refresh();
      } else {
        notify({ description: response.message || "Failed to update register", type: "error" });
      }
    } catch (error) {
      console.error("Failed to update register:", error);
      notify({ description: "An unexpected error occurred", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (register: KRIRegister) => {
    if (!checkPermission(MODULE_CODES.KRI_DASHBOARD, "can_delete")) return;
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
        notify({ description: response.message || "KRI Register deleted successfully", type: "success" });
        router.refresh();
      } else {
        notify({ description: response.message || "Failed to delete register", type: "error" });
      }
    } catch (error) {
      console.error("Failed to delete register:", error);
      notify({ description: "An unexpected error occurred", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigateToRegister = (registerId: string) => {
    router.push(`/dashboard/risks/kri/${registerId}`);
  };

  const { searchValue: localSearch, setSearchValue: setLocalSearch, filteredData: filteredRegisters } = useTableSearch({
    data: initialRegisters,
    filterFn: (register, query) => {
      const q = query.toLowerCase();
      return (
        register.name.toLowerCase().includes(q) ||
        (register.description?.toLowerCase().includes(q) ?? false)
      );
    },
    debounceMs: 200,
  });

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
            <PageHeader
              title="KRI Registers"
              description="Manage your Key Risk Indicator registers and reports"
              Icon={FileText}
            />
            <Button size="sm" onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              New KRI Register
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
      <KRIStatsSection stats={stats} />

      <div className="container mx-auto px-4 pt-6">
        <Card className="p-4">
          <Search
            placeholder="Search registers..."
            value={localSearch}
            onChange={setLocalSearch}
            disabled={isPending}
          />
        </Card>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader className="uppercase">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Last Updated Date</TableHead>
                <TableHead className="text-right">Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegisters?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FolderOpen className="text-muted-foreground mx-auto h-12 w-12" />
                      <h3 className="mt-4 text-lg font-semibold">No registers found</h3>
                      <p className="text-muted-foreground mt-2 text-sm">
                        {localSearch
                          ? "Try adjusting your search criteria"
                          : "Get started by creating your first KRI register"}
                      </p>
                      {!localSearch && (
                        <Button className="mt-4" onClick={handleCreateClick}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Register
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegisters?.map((register) => (
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
                      <StatusBadge
                        className={`${register.is_active ? "border-none bg-[#28A745] text-white hover:bg-[#28A745]" : ""}`}
                        status={register.is_active ? "Active" : "Inactive"}
                      />
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
                          View KRI Register
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
          {filteredRegisters?.length > 0 && (
            <CustomPagination
              pagination={customPaginationData}
              updatePagination={updatePagination}
              allowSetPageSize={true}
              showDetails={true}
              className="border-t"
            />
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-[500px]">
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
            <div className="bg-muted space-y-2 rounded-md p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is-active"
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked === true })
                  }
                  disabled={isSubmitting}
                  className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Label
                  htmlFor="edit-is-active"
                  className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Active Status
                </Label>
              </div>
              <p className="text-muted-foreground ml-6 text-xs">
                {formData.is_active
                  ? "This register is currently active and visible to users"
                  : "This register is inactive and will be hidden from the main view"}
              </p>
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
