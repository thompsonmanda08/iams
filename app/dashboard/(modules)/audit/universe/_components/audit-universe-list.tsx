"use client";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const mockAuditUniverses: AuditUniverse[] = [
  {
    id: "1",
    universeName: "Departmental",
    functionalAreas: ["Accounts"],
    auditableAreas: ["Payments Integrations"],
    status: "UNDER_REVIEW",
    dateCreated: "2025-10-25",
    entries: []
  },
  {
    id: "2",
    universeName: "Organizational Audit Universe",
    functionalAreas: ["Information Technology"],
    auditableAreas: ["Cloud Computing azure stack"],
    status: "UNIVERSE_CREATION",
    dateCreated: "2025-10-24",
    startDate: "2025-10-25T12:00:00",
    endDate: "2026-10-25T12:00:00",
    entries: [
      {
        id: "e1",
        entryName: "Organizational audit universe 1",
        functionalArea: "Information Technology",
        strategicPillar: "Digital Infrastructure Excellence",
        auditableArea: "Cloud Computing azure stack",
        associatedRisk: "Dog Bite",
        indicativeTarget: "Launch SOC by 2025",
        strategicInitiative: "Automation of key business process",
        processActivity: "information security policy"
      }
    ]
  },
  {
    id: "3",
    universeName: "2025 Audit Universe",
    functionalAreas: ["Commercial", "Internal Audit and Risk Management"],
    auditableAreas: ["SLAs", "Audit and Risk Management Framework"],
    status: "APPROVED",
    dateCreated: "2025-10-20",
    entries: []
  },
  {
    id: "4",
    universeName: "2025 Audit Universe",
    functionalAreas: ["Supply Chain Management", "Supply Chain Management"],
    auditableAreas: ["Business Relationships", "Business Relationships"],
    status: "APPROVED",
    dateCreated: "2025-10-19",
    entries: []
  },
  {
    id: "5",
    universeName: "Guy Universe",
    functionalAreas: ["Supply Chain Management", "Accounts"],
    auditableAreas: ["Business Relationships", "Payments Integrations"],
    status: "APPROVED",
    dateCreated: "2025-10-18",
    entries: []
  },
  {
    id: "6",
    universeName: "Commercial & Finance",
    functionalAreas: ["Accounts", "Information Technology"],
    auditableAreas: ["Payments Integrations", "Cloud Computing azure stack"],
    status: "APPROVED",
    dateCreated: "2025-10-17",
    entries: []
  }
];

export default function AuditUniverseList({
  initialData,
  pagination
}: {
  initialData?: AuditUniverse[];
  pagination: Pagination;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(initialData || mockAuditUniverses);

  const filteredData = data.filter(
    (item) =>
      item.universeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.functionalAreas.some((area) => area.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.auditableAreas.some((area) => area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredData.length / parseInt(entriesPerPage));
  const startIndex = (currentPage - 1) * parseInt(entriesPerPage);
  const endIndex = startIndex + parseInt(entriesPerPage);
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setData(data.filter((item) => item.id !== id));
      toast.success("Audit universe deleted successfully");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/audit-universe/${id}/edit`);
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

        <Card className="animate-fade-in shadow-lg">
          <div className="bg-card border-b p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm font-medium">Show</span>
                <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                  <SelectTrigger className="h-9 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-sm font-medium">entries</span>
              </div>

              <div className="relative max-w-md flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search universes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-foreground h-14 font-semibold">
                    Universe Name
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">Functional Areas</TableHead>
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
                      No audit universes found. Click "Add Audit Universe" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/20 transition-all">
                      <TableCell className="text-foreground py-4 font-semibold">
                        {item.universeName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {item.functionalAreas.map((area, idx) => (
                            <span
                              key={idx}
                              className="text-primary bg-primary/10 rounded-md px-2.5 py-1 text-xs font-medium">
                              {area}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {item.auditableAreas.map((area, idx) => (
                            <span
                              key={idx}
                              className="text-accent bg-accent/10 rounded-md px-2.5 py-1 text-xs font-medium">
                              {area}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.dateCreated}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item.id)}
                            className="h-8 gap-1.5">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id, item.universeName)}
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
      </div>
    </div>
  );
}
