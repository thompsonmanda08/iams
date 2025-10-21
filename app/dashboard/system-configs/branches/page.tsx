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
import { Branch, ErrorState } from "@/types";
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
import { createNewBranch, updateBranch } from "@/app/_actions/config-actions";
import { SelectField } from "@/components/ui/select-field";

export default function BranchesConfigPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [x] = await Promise.all([configApi.getBranches()]);
      setBranches(x as any);
    } catch (error) {
      toast.error("Failed to load office configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;

    try {
      await configApi.deleteBranch(id);
      toast.success("Branch deleted successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete branch");
    }
  };

  const [openModal, setOpenModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Branch Setup</h1>
          <p className="text-muted-foreground mt-1">Manage your branches across the country</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Branches</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingBranch(null);
              setOpenModal(true);
            }}>
            <Plus className="h-4 w-4" /> Create New Branch
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>city</TableHead>
              <TableHead>Physical Address</TableHead>
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
              branches.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">{department.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {department.code || "No description provided"}
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
                        onClick={() => {
                          setEditingBranch(department);
                          setOpenModal(true);
                        }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBranch(String(department.id))}
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

      <CreateOrUpdateBranch
        openModal={openModal}
        setOpenModal={setOpenModal}
        initialData={editingBranch}
        setInitialData={setEditingBranch}
      />
    </div>
  );
}

const BRANCH_INITIAL_STATE = {
  id: "",
  name: "",
  code: "",
  province: "",
  city: "",
  physical_address: ""
};

export function CreateOrUpdateBranch({
  showTrigger,
  openModal,
  setOpenModal,
  initialData = null,
  setInitialData
}: PropsWithChildren & {
  showTrigger?: boolean;
  openModal?: boolean;
  initialData?: Branch | null;
  setInitialData?: React.Dispatch<React.SetStateAction<Branch | null>>;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Branch>(initialData ?? BRANCH_INITIAL_STATE);

  // Improved useEffect to handle initialData changes
  useEffect(() => {
    if (openModal) {
      if (initialData) {
        // Update form when editing existing department
        setFormData(BRANCH_INITIAL_STATE);
      } else {
        // Reset form when creating new department
        setFormData(BRANCH_INITIAL_STATE);
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
        setFormData(BRANCH_INITIAL_STATE);
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
      ? await updateBranch({ ...formData, id: String(initialData?.id) })
      : await createNewBranch({ ...formData });

    if (res.success) {
      toast.success(`Branch ${initialData ? "updated" : "created"}`);
      setOpenModal?.(false);
      setInitialData?.(null);
      setFormData(BRANCH_INITIAL_STATE);
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
                <PencilLineIcon className="mr-2 h-4 w-4" /> Update Branch
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create New Branch
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Update Branch" : "Create New Branch"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
          <Input
            label="Branch Name"
            placeholder="Headquarters (HQ)"
            value={formData.name}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, name: e.target.value }));
            }}
            required
            descriptionText="A unique code will be automatically generated from the name"
          />
          <Input
            label="Branch Code"
            placeholder="e.g. KTK10, NDL001"
            value={formData.code}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, code: e.target.value }));
            }}
          />
          <SelectField
            label="Province"
            placeholder="e.g. Western Province, Copperbelt"
            options={[]}
            value={formData.province}
            onValueChange={(province) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, province }));
            }}
          />
          <SelectField
            label="City"
            placeholder="e.g. Western Province, Copperbelt"
            options={[]}
            isLoading={false}
            value={formData.city}
            onValueChange={(city) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, city }));
            }}
          />

          <Input
            label="Physical Address"
            placeholder="e.g. 7th Floor, 4th Street Ibex Hill"
            value={formData.physical_address}
            onChange={(e) => {
              setError({ status: false, message: "" });
              setFormData((c) => ({ ...c, physical_address: e.target.value }));
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
