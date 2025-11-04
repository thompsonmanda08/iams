"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Building2, Upload, X, Pencil } from "lucide-react";
import { Company, Country } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { cn, notify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrganizations,
  createOrganization,
  updateOrganization
} from "@/app/_actions/backoffice-actions";
import { Spinner } from "@/components/ui/spinner";
import { ACCEPTABLE_FILE_TYPES, SingleFileDropzone } from "@/components/ui/file-dropzone";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { MultiStepCompanyForm } from "@/components/forms/multi-step-company-form";
import { Card } from "@/components/ui/card";

export default function Companies({ initialCountries }: { initialCountries?: Country[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Omit<Company, "id">>({
    name: "",
    email: "",
    phone: "",
    status: "active" as "active" | "inactive",
    logo_url: "",
    logo: ""
  });

  // Fetch companies
  const { data: companiesResponse, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => getOrganizations(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const companies = companiesResponse?.success ? companiesResponse.data?.data : [];

  // Filter companies
  const filteredCompanies = companies.filter(
    (company: Company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        notify({
          title: "Success",
          description: "Company created successfully.",
          type: "success"
        });
        closeModal();
      } else {
        notify({
          title: "Error",
          description: response.message || "Failed to create company.",
          type: "error"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to create company.",
        type: "error"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateOrganization,
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        notify({
          title: "Success",
          description: "Company updated successfully.",
          type: "success"
        });
        closeModal();
      } else {
        notify({
          title: "Error",
          description: response.message || "Failed to update company.",
          type: "error"
        });
      }
    },
    onError: (error: any) => {
      notify({
        title: "Error",
        description: error.message || "Failed to update company.",
        type: "error"
      });
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingCompany) {
      updateMutation.mutate({
        id: editingCompany.id,
        ...formData
      } as unknown as Company);
    } else {
      createMutation.mutate(formData as unknown as Company);
    }
  }

  async function handleFileUpload(file: File, recordID?: string) {
    setUploading(true);

    const response = await uploadFile(file, recordID);

    if (response?.success) {
      notify({
        type: "success",
        title: "Logo Uploaded!",
        description: "Logo File uploaded successfully!"
      });
      setFormData((prev) => ({
        ...prev,
        logo: response?.data?.file_name,
        logo_url: response?.data?.file_url,
        recordID: response?.data?.file_record_id
      }));
      setUploading(false);

      return response?.data;
    }

    notify({
      title: "Error",
      type: "error",
      description: "Failed to upload file."
    });
    setUploading(false);

    return {};
  }

  // async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   if (!file.type.startsWith("image/")) {
  //     notify({
  //       title: "Invalid File",
  //       description: "Please upload an image file.",
  //       type: "error"
  //     });
  //     return;
  //   }

  //   setUploading(true);

  //   // TODO: Implement real file upload to PocketBase or similar
  //   // For now, simulate file upload delay
  //   await new Promise((resolve) => setTimeout(resolve, 1500));

  //   // Use a placeholder image service
  //   const placeholderUrl = `https://placehold.co/100x100/e2e8f0/475569?text=${formData.name
  //     .substring(0, 2)
  //     .toUpperCase()}`;

  //   setFormData({ ...formData, logo_url: placeholderUrl });

  //   setUploading(false);
  // }

  function openModal(company?: Company) {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        email: company.email || "",
        phone: company.phone || "",
        status: company.status,
        logo_url: company.logo_url || ""
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        status: "active",
        logo_url: ""
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCompany(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      status: "active",
      logo_url: ""
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Companies</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Add Company
        </Button>
      </div>

      <Card className="rounded-lg p-6">
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 transform text-slate-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500">
                    {searchTerm
                      ? "No companies found matching your search."
                      : "No companies yet. Click 'Add Company' to create one."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company: Company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-200">
                          <Building2 size={20} className="text-slate-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.email || "-"}</TableCell>
                    <TableCell>{company.phone || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={company.status === "active" ? "ACTIVE" : "INACTIVE"} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModal(company)}
                          className="h-8 gap-1.5">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCompany ? "Edit Company" : "Add Company"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <label
                  className={cn("text-foreground/70 mb-1 pl-1 text-sm font-medium text-nowrap")}>
                  Logo (Optional)
                </label>
                <SingleFileDropzone
                  showPreview
                  preview={formData?.logo_url}
                  value={formData?.logo_url}
                  isLoading={uploading}
                  // dropzoneOptions={{
                  //   accept: { "image/png": [".png"] }
                  // }}
                  onChange={async (file) =>
                    await handleFileUpload(file as File, formData?.recordID)
                  }
                />
                {/* {formData.logo_url && (
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="h-16 w-16 rounded-md border object-contain"
                  />
                )}
                <Button asChild variant="outline" type="button">
                  <Label className="cursor-pointer">
                    <Upload size={18} />
                    <span className="ml-2 text-sm">{uploading ? "Uploading..." : "Upload"}</span>
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </Label>
                </Button> */}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "active" | "inactive" })
                }>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingCompany
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Multi-Step Company Creation Form */}
      <MultiStepCompanyForm
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          // Invalidate cache and trigger refetch
          queryClient.invalidateQueries({ queryKey: ["organizations"] });
          router.refresh();
        }}
      />
    </div>
  );
}
