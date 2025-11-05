"use client";
import { useState } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Eye, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import { AuditUniverse, AuditUniverseStatus } from "@/lib/types/audit-types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CustomPagination } from "@/components/ui/pagination";
import { Pagination } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import Search from "@/components/ui/search-field";
import { deleteUniverse } from "@/app/_actions/audit-module-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from "@/components/ui/empty";

// Mock data removed - using real backend data only

export default function AuditUniverseList({
  universes = [],
  universeItemsMap = {},
  pagination
}: {
  universes?: any[];
  universeItemsMap?: Record<string, any[]>;
  pagination?: Pagination;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUniverse, setSelectedUniverse] = useState<{ id: string; name: string } | null>(
    null
  );

  // Use only real data from backend, no mock data fallback
  const data = universes || [];

  const filteredData = data.filter((item: any) => {
    const universeName = item.universe_name || item.universeName || "";
    const searchLower = searchQuery.toLowerCase();

    return (
      universeName.toLowerCase().includes(searchLower) ||
      (item.functionalAreas &&
        item.functionalAreas.some((area: string) => area.toLowerCase().includes(searchLower))) ||
      (item.auditableAreas &&
        item.auditableAreas.some((area: string) => area.toLowerCase().includes(searchLower)))
    );
  });

  const totalPages = Math.ceil(filteredData.length / parseInt(entriesPerPage));
  const startIndex = (currentPage - 1) * parseInt(entriesPerPage);
  const endIndex = startIndex + parseInt(entriesPerPage);
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedUniverse({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUniverse) return;

    setIsDeleting(true);
    const result = await deleteUniverse(selectedUniverse.id);

    if (result.success) {
      toast.success("Universe deleted successfully");
      router.refresh();
      setDeleteConfirmOpen(false);
    } else {
      toast.error(result.message || "Failed to delete universe");
    }
    setIsDeleting(false);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/audit/universe/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/audit/universe/${id}`);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-8 px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="p-6 transition-shadow hover:shadow-lg">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Total Universes</p>
              <p className="text-foreground text-3xl font-bold">{data.length}</p>
            </div>
          </Card>
          <Card className="p-6 transition-shadow hover:shadow-lg">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Approved</p>
              <p className="text-success text-3xl font-bold">
                {data.filter((d) => d.status === "APPROVED").length}
              </p>
            </div>
          </Card>
          <Card className="p-6 transition-shadow hover:shadow-lg">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Under Review</p>
              <p className="text-warning text-3xl font-bold">
                {data.filter((d) => d.status === "UNDER_REVIEW").length}
              </p>
            </div>
          </Card>
          <Card className="p-6 transition-shadow hover:shadow-lg">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">In Progress</p>
              <p className="text-info text-3xl font-bold">
                {data.filter((d) => d.status === "UNIVERSE_CREATION").length}
              </p>
            </div>
          </Card>
        </div>

        {data.length === 0 ? (
          <Empty className="animate-fade-in">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Globe />
              </EmptyMedia>
              <EmptyTitle>No Universes Yet</EmptyTitle>
              <EmptyDescription>
                Get started by creating your first audit universe. Universes help you organize and
                manage your audit scope.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/dashboard/audit/universe/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Universe
                </Button>
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <Card className="animate-fade-in">
            <div className="bg-card border-b p-6">
              <div className="max-w-md flex-1">
                <Search
                  placeholder="Search universes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e)}
                />
              </div>
            </div>

            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-foreground h-14 font-semibold">
                      Universe Name
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Functional Areas
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">Auditable Areas</TableHead>
                    <TableHead className="text-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-foreground font-semibold">Date Created</TableHead>
                    <TableHead className="text-foreground text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground py-12 text-center">
                        No universes match your search. Try a different search term.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((item: any) => {
                      const universeName = item.universe_name || item.universeName || "Unnamed";
                      const functionalAreas = item.functionalAreas || [];
                      const auditableAreas = item.auditableAreas || [];
                      const status = item.status || "UNIVERSE_CREATION";
                      const dateCreated =
                        item.date_created ||
                        item.dateCreated ||
                        item.created_at ||
                        new Date().toISOString().split("T")[0];
                      const itemCount = universeItemsMap[item.id]?.length || 0;

                      return (
                        <TableRow key={item.id} className="hover:bg-muted/20 transition-all">
                          <TableCell className="text-foreground py-4 font-semibold">
                            <div className="flex flex-col gap-1">
                              <span>{universeName}</span>
                              {itemCount > 0 && (
                                <span className="text-muted-foreground text-xs">
                                  {itemCount} {itemCount === 1 ? "item" : "items"}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                              {functionalAreas.length > 0 ? (
                                functionalAreas.map((area: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-primary bg-primary/10 rounded-md px-2.5 py-1 text-xs font-medium">
                                    {area}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-xs">No areas</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                              {auditableAreas.length > 0 ? (
                                auditableAreas.map((area: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="bg-primary/70 rounded-md px-2.5 py-1 text-xs font-medium text-white">
                                    {area}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-xs">No areas</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(dateCreated).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  handleView(item.id);
                                  e.stopPropagation();
                                }}
                                className="h-8 gap-1.5">
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  handleEdit(item.id);
                                  e.stopPropagation();
                                }}
                                className="h-8 gap-1.5">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  handleDeleteClick(item.id, universeName);
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
            </div>

            <div className="bg-card flex items-center justify-between border-t p-6">
              <CustomPagination
                pagination={
                  pagination ||
                  ({
                    page: 1,
                    page_size: 10,
                    total_pages: Math.ceil(filteredData.length / 10),
                    totalCount: filteredData.length
                  } as Pagination)
                }
                updatePagination={({ page, page_size }) => setCurrentPage(page)}
                showDetails
                allowSetPageSize
              />
            </div>
          </Card>
        )}
      </div>

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUniverse(null);
            setDeleteConfirmOpen(false);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Universe"
        description={`Are you sure you want to delete "${selectedUniverse?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="delete"
        isLoading={isDeleting}
      />

      {/* <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUniverse(null);
            setDeleteConfirmOpen(false);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Universe"
        description={`Are you sure you want to delete "${selectedUniverse?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
        type="delete"
      /> */}
    </div>
  );
}
