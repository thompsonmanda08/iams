"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Columns3, MoreHorizontal, Filter, X, MoreVertical, SlidersVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generateAvatarFallback } from "@/lib/utils";
import { toast } from "sonner";
import { User } from "@/lib/types/account";
import { deleteUser, toggleUserStatus } from "@/app/_actions/user-actions";
import { CustomPagination } from "@/components/ui/pagination";
import Search from "@/components/ui/search-field";
import { ConfirmationModal } from "@/components/confirmation-modal";

type Pagination = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

type UsersDataTableProps = {
  data: User[];
  pagination: Pagination;
  currentSearch: string;
  currentStatus: string;
  currentRole: string;
};

const getColumns = (
  onDelete: (id: string) => void,
  onToggleStatus: (id: string, isActive: boolean) => void
): ColumnDef<User>[] => [
  {
    id: "#",
    header: "#",
    cell: ({ row }) => <div className="text-sm font-medium text-gray-500">{row.index + 1}</div>
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
    }
  },
  {
    id: "role",
    accessorFn: (row) => row.role?.name || "N/A",
    header: "Role",
    cell: ({ row }) => (
      <div className="text-sm text-gray-700">
        {row.original.role?.name || <span className="text-gray-400 italic">No role assigned</span>}
      </div>
    )
  },
  {
    id: "department",
    accessorFn: (row) => row.department?.name || "N/A",
    header: "Department",
    cell: ({ row }) => (
      <div className="text-sm text-gray-700">
        {row.original.department?.name || (
          <span className="text-gray-400 italic">No department</span>
        )}
      </div>
    )
  },
  {
    id: "branch",
    accessorFn: (row) => row.branch?.name || "N/A",
    header: "Branch",
    cell: ({ row }) => (
      <div className="text-sm text-gray-700">
        {row.original.branch?.name || <span className="text-gray-400 italic">No branch</span>}
      </div>
    )
  },
  {
    id: "status",
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
            isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
          }`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    }
  },
  {
    id: "options",
    header: () => <div className="pr-6 text-right">Actions</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-primary">
                <span className="sr-only">Open menu</span>
                <SlidersVertical className="h-4 w-4" />
                Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
                className="text-red-600 focus:text-red-600">
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
  }
];

export default function UsersDataTable({
  data,
  pagination,
  currentSearch,
  currentStatus,
  currentRole
}: UsersDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    userId: string | null;
    userName: string | null;
  }>({
    open: false,
    userId: null,
    userName: null
  });

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.userId) return;

    try {
      const response = await deleteUser(deleteDialog.userId);
      if (response.success) {
        toast.success(response.message || "User deleted successfully");
        router.refresh();
        setDeleteDialog({ open: false, userId: null, userName: null });
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const handleDeleteClick = (id: string) => {
    const user = data.find((u) => u.id === id);
    if (user) {
      setDeleteDialog({
        open: true,
        userId: id,
        userName: `${user.first_name} ${user.last_name}`
      });
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

  const columns = getColumns(handleDeleteClick, handleToggleStatus);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility
    },
    manualPagination: true, // Important for server-side pagination
    pageCount: pagination.total_pages
  });

  // Update search params
  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key !== "page") {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    updateSearchParams("search", value);
  };

  const handleStatusChange = (value: string) => {
    updateSearchParams("status", value);
  };

  const handleRoleChange = (value: string) => {
    updateSearchParams("role", value);
  };

  // Pagination handler
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

  const hasFilters = currentStatus !== "all" || currentRole !== "all" || currentSearch !== "";

  const clearFilters = () => {
    const params = new URLSearchParams();
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  // Get unique roles from data
  const uniqueRoles = React.useMemo(() => {
    return Array.from(
      new Set(data.filter((user) => user.role?.name).map((user) => user.role.name))
    ).sort();
  }, [data]);

  // Transform pagination for CustomPagination
  const customPaginationData = {
    page: pagination.page,
    page_size: pagination.page_size,
    total_pages: pagination.total_pages,
    totalCount: pagination.total,
    has_prev: pagination.has_prev,
    has_next: pagination.has_next
  };

  return (
    <Card className="shadow-none">
      <CardContent className="p-0">
        <div className="space-y-4 border-b border-gray-200 p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Search
              placeholder="Search users by name or email..."
              defaultValue={currentSearch}
              onChange={(event) => handleSearchChange(event)}
              disabled={isPending}
            />

            <div className="flex items-center gap-2">
              <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currentRole} onValueChange={handleRoleChange} disabled={isPending}>
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
                        onCheckedChange={(value) => column.toggleVisibility(value)}>
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

          <div className="flex items-center justify-end text-sm text-gray-500">
            {hasFilters && (
              <Badge variant="secondary" className="text-xs">
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
                    className="transition-colors hover:bg-gray-50">
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

        {/* CustomPagination */}
        {data.length > 0 && (
          <CustomPagination
            pagination={customPaginationData}
            updatePagination={updatePagination}
            allowSetPageSize={true}
            showDetails={true}
            className="border-t"
          />
        )}
      </CardContent>
      <ConfirmationModal
        open={deleteDialog.open}
        description={`Are you sure you want to delete the user "${deleteDialog.userName?.toLocaleUpperCase()}"? This action cannot be undone.`}
        onOpenChange={(open) => setDeleteDialog({ open, userId: null, userName: null })}
        onConfirm={handleDeleteConfirm}
        type="delete"
      />
    </Card>
  );
}
