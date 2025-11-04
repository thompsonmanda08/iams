"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Pencil, View } from "lucide-react";
import { Company, Country } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganizations } from "@/app/_actions/backoffice-actions";
import { Spinner } from "@/components/ui/spinner";
import { MultiStepCompanyForm } from "@/components/forms/multi-step-company-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { QUERY_KEYS } from "@/lib/constants";

export default function Companies({ initialCountries }: { initialCountries?: Country[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Fetch companies
  const { data: companiesResponse, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.COMPANIES],
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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
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
                <TableHead>Physical Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="center" className="text-right">
                  Actions
                </TableHead>
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
                    <TableCell>{company.contact_email || "-"}</TableCell>
                    <TableCell>{company.contact_phone || "-"}</TableCell>
                    <TableCell>{company.address || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={true ? "ACTIVE" : "INACTIVE"} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {/* {process.env.NODE_ENV !== "production" && (
                          <Link href={`/admin/companies/mapping`}>
                            <Button
                              size="sm"
                              variant="outline"
                              // onClick={() => {
                              //   setEditingCompany(company);
                              //   setShowEditModal(true);
                              // }}
                              className="h-8 gap-1.5">
                              <View className="h-3.5 w-3.5" />
                              View Mapping
                            </Button>
                          </Link>
                        )} */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCompany(company);
                            setShowEditModal(true);
                          }}
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

      {/* Multi-Step Company Creation Form */}
      <MultiStepCompanyForm open={showCreateModal} onOpenChange={setShowCreateModal} />

      {/* Multi-Step Company Edit Form */}
      <MultiStepCompanyForm
        open={showEditModal}
        onOpenChange={setShowEditModal}
        company={editingCompany}
      />
    </div>
  );
}
