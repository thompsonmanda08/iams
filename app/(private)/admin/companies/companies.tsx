"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { QUERY_KEYS } from "@/lib/constants";
import { CustomPagination } from "@/components/ui/pagination";
import { useState } from "react";

const DEFAULT_PAGE_SIZE = 10;


export default function Companies({ initialCountries }: { initialCountries?: Country[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Read state from URL params
  const currentPage = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("page_size") || String(DEFAULT_PAGE_SIZE));
  const searchTerm = searchParams.get("search") || "";

  const updateParams = useCallback(
    (updates: { page?: number; page_size?: number; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.page !== undefined) params.set("page", String(updates.page));
      if (updates.page_size !== undefined) {
        params.set("page_size", String(updates.page_size));
        params.set("page", "1"); // reset page on page size change
      }
      if (updates.search !== undefined) {
        if (updates.search) params.set("search", updates.search);
        else params.delete("search");
        params.set("page", "1"); // reset page on new search
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Fetch companies — pass page, page_size & search to API
  const { data: companiesResponse, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.COMPANIES, currentPage, pageSize, searchTerm],
    queryFn: () =>
      getOrganizations({
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined
      }),
    staleTime: 5 * 60 * 1000
  });

  const rawData = companiesResponse?.success ? companiesResponse.data : {};
  const companies: Company[] = rawData?.data ?? (Array.isArray(rawData) ? rawData : []);
  // Only trust server pagination if it carries a real total_pages value
  const serverPagination = rawData?.pagination?.total_pages ? rawData.pagination : null;

  // If no server pagination, fall back to client-side
  const filteredCompanies = serverPagination
    ? companies
    : companies.filter(
        (company: Company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const clientTotalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const displayedCompanies = serverPagination
    ? filteredCompanies
    : filteredCompanies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const paginationData = serverPagination ?? {
    page: currentPage,
    page_size: pageSize,
    total: filteredCompanies.length,
    total_pages: clientTotalPages,
    has_prev: currentPage > 1,
    has_next: currentPage < clientTotalPages
  };

  const totalCount = paginationData.total ?? filteredCompanies.length;

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
              defaultValue={searchTerm}
              onChange={(e) => updateParams({ search: e.target.value })}
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
              {displayedCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500">
                    {searchTerm
                      ? "No companies found matching your search."
                      : "No companies yet. Click 'Add Company' to create one."}
                  </TableCell>
                </TableRow>
              ) : (
                displayedCompanies.map((company: Company) => (
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

        {totalCount > 0 && (
          <CustomPagination
            pagination={paginationData}
            updatePagination={({ page, page_size }) => updateParams({ page, page_size })}
            allowSetPageSize
            showDetails
            className="mt-2 border-t"
          />
        )}
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
