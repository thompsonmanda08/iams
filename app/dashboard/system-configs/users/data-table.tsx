"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  Columns3,
  Filter,
  X,
  SlidersVertical,
  TimerReset,
  ShieldX,
  ShieldCheck,
  Trash2,
  View,
  PencilLine
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generateAvatarFallback, generateRandomString, getAvatarSrc, notify } from "@/lib/utils";
import { User } from "@/lib/types/account";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  resetUserPassword
} from "@/app/_actions/user-actions";
import { CustomPagination } from "@/components/ui/pagination";
import Search from "@/components/ui/search-field";
import { ConfirmationModal } from "@/components/confirmation-modal";
import CreateUserForm from "../_components/create-user-dialog";
import { usePermissions } from "@/hooks/use-permissions";
import { useTableSearch } from "@/hooks/use-table-search";

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
  onToggleStatus: (id: string, isActive: boolean) => void,
  onEdit: (user: User) => void,
  onResetPassword: (id: string) => void,
  onViewProfile: (id: string) => void
): ColumnDef<User>[] => [
  {
    id: "#",
    header: "#",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm font-medium">{row.index + 1}</div>
    )
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
            <AvatarImage src={getAvatarSrc(fullName)} alt={`${fullName} - Image`} />
            <AvatarFallback className="text-xs font-medium">
              {generateAvatarFallback(fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-foreground font-medium">{fullName}</div>
            <div className="text-muted-foreground text-xs">{row.original.email}</div>
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
      <div className="text-foreground text-sm">
        {row.original.role?.name || (
          <span className="text-muted-foreground italic">No role assigned</span>
        )}
      </div>
    )
  },
  {
    id: "department",
    accessorFn: (row) => row.department?.name || "N/A",
    header: "Department",
    cell: ({ row }) => (
      <div className="text-foreground text-sm">
        {row.original.department?.name || (
          <span className="text-muted-foreground italic">No department</span>
        )}
      </div>
    )
  },
  {
    id: "branch",
    accessorFn: (row) => row.branch?.name || "N/A",
    header: "Branch",
    cell: ({ row }) => (
      <div className="text-foreground text-sm">
        {row.original.branch?.name || (
          <span className="text-muted-foreground italic">No branch</span>
        )}
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
            isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-secondary text-secondary-foreground"
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
              <DropdownMenuItem onClick={() => onViewProfile(user.id)}>
                <View className="h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(user)}>
                {" "}
                <PencilLine className="h-4 w-4" />
                Edit User Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
                <TimerReset className="h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(user.id, !user.is_active)}>
                {" "}
                {!user.is_active ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <ShieldX className="h-4 w-4" />
                )}
                {user.is_active ? "Deactivate" : "Activate"} Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user.id)}
                className="text-destructive hover:bg-destructive/10 focus:text-destructive">
                {" "}
                <Trash2 className="text-destructive h-4 w-4" />
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
  const { checkPermission } = usePermissions();
  const [isPending, startTransition] = useTransition();
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    userId: string | null;
    userName: string | null;
  }>({
    open: false,
    userId: null,
    userName: null
  });
  const [toggleStatusDialog, setToggleStatusDialog] = React.useState<{
    open: boolean;
    userId: string | null;
    userName: string | null;
    activate: boolean | null;
  }>({ open: false, userId: null, userName: null, activate: null });

  const [resetPasswordDialog, setResetPasswordDialog] = React.useState<{
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
        notify({ description: response.message || "User deleted successfully", type: "success" });
        router.refresh();
        // Close dialog first, then reset state after animation
        setDeleteDialog((prev) => ({ ...prev, open: false }));
        setTimeout(() => {
          setDeleteDialog({ open: false, userId: null, userName: null });
        }, 300);
      } else {
        notify({ description: response.message || "Failed to delete user", type: "error" });
      }
    } catch (error) {
      notify({ description: "An unexpected error occurred", type: "error" });
    }
  };

  const handleDeleteClick = (id: string) => {
    if (!checkPermission("USER_MGMT", "can_delete")) return;
    const user = data.find((u) => u.id === id);
    if (user) {
      setDeleteDialog({
        open: true,
        userId: id,
        userName: `${user.first_name} ${user.last_name}`
      });
    }
  };

  const handleToggleStatusClick = (id: string, activate: boolean) => {
    if (!checkPermission("USER_MGMT", "can_edit")) return;
    const user = data.find((u) => u.id === id);
    if (user) {
      setToggleStatusDialog({
        open: true,
        userId: id,
        userName: `${user.first_name} ${user.last_name}`,
        activate
      });
    }
  };

  const handleToggleStatusConfirm = async () => {
    if (toggleStatusDialog.userId === null || toggleStatusDialog.activate === null) {
      return;
    }

    try {
      const action = toggleStatusDialog.activate ? activateUser : deactivateUser;
      const response = await action(toggleStatusDialog.userId);

      if (response.success) {
        const statusText = toggleStatusDialog.activate ? "activated" : "deactivated";
        notify({ description: `User ${statusText} successfully`, type: "success" });

        router.refresh();

        setToggleStatusDialog((prev) => ({ ...prev, open: false }));

        setTimeout(() => {
          setToggleStatusDialog({
            open: false,
            userId: null,
            userName: null,
            activate: null
          });
        }, 300);
      } else {
        notify({ description: response.message || "Failed to update user status", type: "error" });
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };
  const handleResetPasswordClick = (id: string) => {
    const user = data.find((u) => u.id === id);
    if (user) {
      setResetPasswordDialog({
        open: true,
        userId: id,
        userName: `${user.first_name} ${user.last_name}`
      });
    }
  };

  const handleResetPasswordConfirm = async () => {
    const password = generateRandomString();

    if (!resetPasswordDialog.userId || !password) return;

    const response = await resetUserPassword(resetPasswordDialog.userId, password);
    if (response.success) {
      notify({ description: response.message || "Password reset successfully", type: "success" });
    } else {
      notify({ description: response.message || "Failed to reset password", type: "error" });
    }
    // Close dialog first, then reset state after animation
    setResetPasswordDialog((prev) => ({ ...prev, open: false }));
    setTimeout(() => {
      setResetPasswordDialog({ open: false, userId: null, userName: null });
    }, 300);
  };

  const handleEditClick = (user: User) => {
    if (!checkPermission("USER_MGMT", "can_edit")) return;
    setEditingUser(user);
  };

  const handleViewProfile = (id: string) => {
    router.push(`/dashboard/system-configs/users/${id}`);
  };

  const columns = getColumns(
    handleDeleteClick,
    handleToggleStatusClick,
    handleEditClick,
    handleResetPasswordClick,
    handleViewProfile
  );

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


  const handleStatusChange = (value: string) => {
    updateSearchParams("status", value);
  };

  const handleRoleChange = (value: string) => {
    updateSearchParams("role", value);
  };

  // Pagination handler
  const updatePagination = ({ page, page_size }: { page: number; page_size?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    // Always set the page
    params.set("page", String(page));

    if (page_size !== undefined) {
      params.set("page_size", String(page_size));
      // Reset to page 1 when page size changes
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

  const { searchValue: localSearch, setSearchValue: setLocalSearch } = useTableSearch({
    initialValue: currentSearch,
    onDebouncedChange: (v) => updateSearchParams("search", v),
  });

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
        <div className="space-y-4 border-b p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Search
              placeholder="Search users by name or email..."
              value={localSearch}
              onChange={setLocalSearch}
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

          <div className="text-muted-foreground flex items-center justify-end text-sm">
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
                    <TableHead key={header.id} className="bg-muted/50">
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
                    className="hover:bg-muted/50 transition-colors">
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
                    <div className="text-muted-foreground flex flex-col items-center justify-center">
                      <Search className="text-muted-foreground/50 mb-4 h-12 w-12" />
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
      <ConfirmationModal
        open={toggleStatusDialog.open}
        title={`${toggleStatusDialog.activate ? "Activate" : "Deactivate"} User`}
        description={`Are you sure you want to ${
          toggleStatusDialog.activate ? "activate" : "deactivate"
        } the user "${toggleStatusDialog.userName?.toLocaleUpperCase()}"?`}
        onOpenChange={(open) =>
          setToggleStatusDialog({ open, userId: null, userName: null, activate: null })
        }
        onConfirm={handleToggleStatusConfirm}
        type={toggleStatusDialog.activate ? "default" : "delete"}
      />
      <ConfirmationModal
        open={resetPasswordDialog.open}
        title="Reset Password"
        description={`Are you sure you want to reset the password for "${resetPasswordDialog.userName?.toLocaleUpperCase()}"? A new password will be generated and the user will need to be notified.`}
        onOpenChange={(open) => setResetPasswordDialog({ open, userId: null, userName: null })}
        onConfirm={handleResetPasswordConfirm}
        type="default"
      />
      <CreateUserForm
        showTrigger={false}
        user_type="ORGANIZATION_USER"
        isOpenModal={!!editingUser}
        user={editingUser}
        setIsOpenModal={(open) => {
          if (!open) {
            setEditingUser(null);
          }
        }}
      />
    </Card>
  );
}
