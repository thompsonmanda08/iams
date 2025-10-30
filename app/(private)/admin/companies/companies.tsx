"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Building2, Upload, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Company } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { notify } from "@/lib/utils";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockCompanies: Company[] = [
  {
    id: "comp-1",
    name: "Innovatech Solutions",
    email: "contact@innovatech.com",
    phone: "123-456-7890",
    status: "active",
    logo_url: "https://placehold.co/100x100/e2e8f0/475569?text=IS",
    created_at: new Date().toISOString()
  },
  {
    id: "comp-2",
    name: "Quantum Logistics",
    email: "support@quantumlog.com",
    phone: "987-654-3210",
    status: "inactive",
    logo_url: "",
    created_at: new Date().toISOString()
  }
];

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active" as "active" | "inactive",
    logo_url: ""
  });

  useEffect(() => {
    const filtered = companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingCompany) {
      // Simulate update
      setCompanies(
        companies.map((c) =>
          c.id === editingCompany.id
            ? { ...c, ...formData, updated_at: new Date().toISOString() }
            : c
        )
      );
      notify({ title: "Success", description: "Company updated successfully.", type: "success" });
    } else {
      // Simulate create
      const newCompany: Company = {
        id: uuidv4(),
        ...formData,
        created_at: new Date().toISOString()
      };
      setCompanies([newCompany, ...companies]);
      notify({ title: "Success", description: "Company created successfully.", type: "success" });
    }
    closeModal();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify({
        title: "Invalid File",
        description: "Please upload an image file.",
        type: "error"
      });
      return;
    }

    setUploading(true);

    // Simulate file upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Use a placeholder image service
    const placeholderUrl = `https://placehold.co/100x100/e2e8f0/475569?text=${formData.name
      .substring(0, 2)
      .toUpperCase()}`;

    setFormData({ ...formData, logo_url: placeholderUrl });

    setUploading(false);
  }

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Companies</h2>
        <Button onClick={() => openModal()}>
          <Plus size={20} />
          Add Company
        </Button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
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
                <TableHead>
                  Company Name
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
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
                    <StatusBadge
                      status={company.status === "active" ? "ACTIVE" : "INACTIVE"}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openModal(company)}>
                      <Edit2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
                {editingCompany ? "Edit Company" : "Add Company"}
            </DialogTitle>
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
                  {formData.logo_url && (
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
                  </label>
                </Button>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                  value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as "active" | "inactive" })
                  }
                >
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
              <Button type="submit">
                  {editingCompany ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
