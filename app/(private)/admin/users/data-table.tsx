"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Columns3, MoreHorizontal, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generateAvatarFallback } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types/account";
import { deleteUser, toggleUserStatus } from "@/app/_actions/user-actions";

const getColumns = (
  onDelete: (id: string) => void,
  onToggleStatus: (id: string, isActive: boolean) => void
): ColumnDef<User>[] => [
  {
    id: "#",
    header: "#",
    cell: ({ row }) => (
      <div className="text-sm font-medium text-gray-500">{row.index + 1}</div>
    ),
  },
  {
    accessorKey: "username",
    id: "username",
    header: "Name",
    cell: ({ row }) => {
      const fullName = `${row.original.first_name} ${row.original.last_name}`;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs font-medium">
              {generateAvatarFallback(fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{fullName}</div>
            <div className="text-xs text-gray-500">{row.original.email}</div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const fullName = `${row.original.first_name} ${row.original.last_name}`.toLowerCase();
      const email = row.original.email.toLowerCase();
      const username = row.original.username.toLowerCase();
      const searchValue = value.toLowerCase();
      return fullName.includes(searchValue) || email.includes(searchValue) || username.includes(searchValue);
    },
  },
  {
    id: "role",
    accessorFn: (row) => row.role.name,
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Role
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-gray-700">{row.original.role.name}</div>
    ),
    filterFn: (row, id, value) => {
      return row.original.role.name === value;
    },
  },
  {
    id: "department",
    accessorFn: (row) => row.department.name,
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Department
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-gray-700">{row.original.department.name}</div>
    ),
  },
  {
    id: "branch",
    accessorFn: (row) => row.branch.name,
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Branch
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-gray-700">{row.original.branch.name}</div>
    ),
  },
  {
    id: "status",
    accessorKey: "is_active",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
            isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      return row.original.is_active === value;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Edit User</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Reset Password</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(user.id, !user.is_active)}>
                {user.is_active ? "Deactivate" : "Activate"} Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user.id)}
                className="text-red-600 focus:text-red-600"
              >
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function UsersDataTable({ data }: { data: User[] }) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await deleteUser(id);
      if (response.success) {
        toast.success("User deleted successfully");
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await toggleUserStatus(id, isActive);
      if (response.success) {
        toast.success(`User ${isActive ? "activated" : "deactivated"} successfully`);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to update user status");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const columns = getColumns(handleDelete, handleToggleStatus);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Apply filters
  React.useEffect(() => {
    if (statusFilter !== "all") {
      const filterValue = statusFilter === "active";
      table.getColumn("status")?.setFilterValue(filterValue);
    } else {
      table.getColumn("status")?.setFilterValue(undefined);
    }
  }, [statusFilter, table]);

  React.useEffect(() => {
    if (roleFilter !== "all") {
      table.getColumn("role")?.setFilterValue(roleFilter);
    } else {
      table.getColumn("role")?.setFilterValue(undefined);
    }
  }, [roleFilter, table]);

  const hasFilters = statusFilter !== "all" || roleFilter !== "all";

  const clearFilters = () => {
    setStatusFilter("all");
    setRoleFilter("all");
    table.getColumn("username")?.setFilterValue("");
  };

  // Get unique roles from data
  const uniqueRoles = React.useMemo(() => {
    return Array.from(new Set(data.map((user) => user.role.name))).sort();
  }, [data]);

  return (
    <Card className="shadow-none">
      <CardContent className="p-0">
        <div className="space-y-4 border-b border-gray-200 p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("username")?.setFilterValue(event.target.value)
                }
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Columns3 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {hasFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {table.getFilteredRowModel().rows.length} of {data.length} users
            </span>
            {hasFilters && (
              <Badge variant="secondary" className="text-xs text-white">
                <Filter className="mr-1 h-3 w-3" />
                Filters active
              </Badge>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-gray-50">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="mb-4 h-12 w-12 text-gray-300" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Rows per page:</span>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}