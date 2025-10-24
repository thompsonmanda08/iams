"use client";

import type React from "react";
import { useState } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Plus, Search, AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

type RiskRegister = {
  id: string;
  name: string;
  startDate: string;
  dueDate: string;
  status: "Overdue" | "Open" | "Closed";
  branch: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

const mockData: RiskRegister[] = [
  {
    id: "1",
    name: "Q4 2024 Enterprise Risk Assessment",
    startDate: "2024-10-01",
    dueDate: "2024-12-31",
    status: "Open",
    branch: "Corporate",
    createdAt: "2024-09-15",
    updatedAt: "2024-10-20",
    createdBy: "Sarah Williams"
  },
  {
    id: "2",
    name: "Cybersecurity Risk Register 2024",
    startDate: "2024-01-01",
    dueDate: "2024-06-30",
    status: "Closed",
    branch: "IT Security",
    createdAt: "2023-12-10",
    updatedAt: "2024-07-01",
    createdBy: "Mike Johnson"
  },
  {
    id: "3",
    name: "Supply Chain Risk Analysis",
    startDate: "2024-08-01",
    dueDate: "2024-10-15",
    status: "Overdue",
    branch: "Operations",
    createdAt: "2024-07-20",
    updatedAt: "2024-10-23",
    createdBy: "Jane Smith"
  }
];

export default function RiskRegistersPage() {
  const router = useRouter();
  const [registers, setRegisters] = useState<RiskRegister[]>(mockData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    dueDate: ""
  });

  // DATE STATES
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const filteredRegisters = registers.filter((register) => {
    const matchesSearch = register.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || register.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRegisters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRegisters.length);
  const paginatedRegisters = filteredRegisters.slice(startIndex, endIndex);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRegister: RiskRegister = {
      id: String(registers.length + 1),
      name: formData.name,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      status: "Open",
      branch: "Corporate",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      createdBy: "Current User"
    };
    setRegisters([...registers, newRegister]);
    setFormData({ name: "", startDate: "", dueDate: "" });
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: RiskRegister["status"]) => {
    const colors = {
      Open: "bg-blue-100 text-blue-700",
      Overdue: "bg-purple-100 text-purple-700",
      Closed: "bg-gray-100 text-gray-700"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Risk Registers</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your risk assessment registers
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Risk Register
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Registers</p>
              <p className="text-2xl font-bold">{registers.length}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Open</p>
              <p className="text-2xl font-bold">
                {registers.filter((r) => r.status === "Open").length}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Overdue</p>
              <p className="text-2xl font-bold">
                {registers.filter((r) => r.status === "Overdue").length}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Closed</p>
              <p className="text-2xl font-bold">
                {registers.filter((r) => r.status === "Closed").length}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search risk registers..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">OPTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRegisters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <p className="text-muted-foreground">No risk registers found</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRegisters.map((register) => (
                <TableRow
                  key={register.id}
                  onClick={() =>
                    router.push(`/dashboard/module/risks/risk-registers/${register.id}`)
                  }
                  className="cursor-pointer">
                  <TableCell>
                    <p className="text-foreground font-medium">{register.name}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{register.startDate}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{register.dueDate}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium capitalize",
                        getStatusColor(register.status)
                      )}>
                      {register.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{register.branch}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">{register.createdAt}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">{register.updatedAt}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{register.createdBy}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="cursor-pointer font-normal">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {paginatedRegisters.length > 0 && (
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-muted-foreground text-sm">
              Showing {startIndex + 1} to {endIndex} of {filteredRegisters.length} risk registers
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>New Risk Register</DialogTitle>
              <DialogDescription>
                Add a new risk register to track and manage organizational risks.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter risk register name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="startDate"
                      className="w-full justify-between font-normal">
                      {startDate ? startDate.toLocaleDateString() : "Select date"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setStartDate(date);
                        setStartDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="dueDate"
                      className="w-full justify-between font-normal">
                      {dueDate ? dueDate.toLocaleDateString() : "Select date"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setDueDate(date);
                        setDueDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Register</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
