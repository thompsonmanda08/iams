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
  Lock,
  LockOpen,
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
import { PermissionDropdownMenuItem } from "@/components/ui/permission-dropdown-menu-item";
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
import { updateUser, deactivateUser, resetUserPassword, lockUser, unlockUser } from "@/app/_actions/user-actions";
import { CustomPagination } from "@/components/ui/pagination";
import Search from "@/components/ui/search-field";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateUserForm from "../_components/create-user-dialog";
import { usePermissions } from "@/hooks/use-permissions";
import { useTableSearch } from "@/hooks/use-table-search";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/store/session-store";

import { MODULE_CODES } from "@/lib/constants/module-codes";

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
};

const getColumns = (
  onToggleStatus: (id: string, isActive: boolean) => void,
  onToggleLock: (user: User) => void,
  onEdit: (user: User) => void,
  onResetPassword: (id: string) => void,
  onViewProfile: (id: string) => void,
  isCurrentUser: (u: User) => boolean
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
            <DropdownMenuContent align="end" className="min-w-48 w-full">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewProfile(user.id)}>
                <View className="h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <PermissionDropdownMenuItem
                moduleCode={MODULE_CODES.USER_MGMT}
                action="can_edit"
                onClick={() => onEdit(user)}>
                <PencilLine className="h-4 w-4" />
                Edit User Details
              </PermissionDropdownMenuItem>
              <DropdownMenuSeparator />
              <PermissionDropdownMenuItem
                moduleCode={MODULE_CODES.USER_MGMT}
                action="can_edit"
                onClick={() => onResetPassword(user.id)}>
                <TimerReset className="h-4 w-4" />
                Reset Password
              </PermissionDropdownMenuItem>
              <PermissionDropdownMenuItem
                moduleCode={MODULE_CODES.USER_MGMT}
                action="can_edit"
                onClick={() => {
                  if (isCurrentUser(user) && user.is_active) return;
                  onToggleStatus(user.id, !user.is_active);
                }}
                disabled={isCurrentUser(user) && user.is_active}
                className={user.is_active ? "text-destructive focus:text-destructive" : ""}>
                {!user.is_active ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <ShieldX className="text-destructive h-4 w-4" />
                )}
                {isCurrentUser(user) && user.is_active
                  ? "Cannot deactivate own account"
                  : `${user.is_active ? "Deactivate" : "Activate"} Account`}
              </PermissionDropdownMenuItem>
              <PermissionDropdownMenuItem
                moduleCode={MODULE_CODES.USER_MGMT}
                action="can_edit"
                onClick={() => {
                  if (isCurrentUser(user) && !user.is_locked) return;
                  onToggleLock(user);
                }}
                disabled={isCurrentUser(user) && !user.is_locked}
                className={!user.is_locked ? "text-destructive focus:text-destructive" : ""}>
                {user.is_locked ? (
                  <LockOpen className="h-4 w-4" />
                ) : (
                  <Lock className="text-destructive h-4 w-4" />
                )}
                {isCurrentUser(user) && !user.is_locked
                  ? "Cannot lock own account"
                  : `${user.is_locked ? "Unlock" : "Lock"} Account`}
              </PermissionDropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
  }
];

export default function UsersDataTable({
  data,
  pagination
}: UsersDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkPermission, hasPermission } = usePermissions();
  const { user: currentUser, session } = useSession();
  // JWT-backed user_id is always populated after login, unlike the React-Query
  // currentUser.id which may still be loading on first render.
  const currentUserId = session?.user_id ?? currentUser?.id;
  // Fallback identity fields: guard against the case where the users-list endpoint
  // returns IDs that don't match the login-response ID (happens on some backends
  // where setup.user.id !== users.list[].id). Username/email are uniquely identifying.
  const currentLoginIdentifier = (session?.username ?? currentUser?.email ?? "").toLowerCase();
  const isCurrentUser = React.useCallback(
    (u: User) => {
      if (currentUserId && u.id === currentUserId) return true;
      if (!currentLoginIdentifier) return false;
      return (
        u.email?.toLowerCase() === currentLoginIdentifier ||
        u.username?.toLowerCase() === currentLoginIdentifier
      );
    },
    [currentUserId, currentLoginIdentifier]
  );
  const [isPending, startTransition] = useTransition();
  const [columnVisibility, setColumnVisibility] = React.useState({});
  // Tab state lives in the URL so server-side pagination filters by status.
  const activeTab = (searchParams.get("status") === "inactive" ? "inactive" : "active") as
    | "active"
    | "inactive";
  const [selectedRole, setSelectedRole] = React.useState("all");
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [toggleStatusDialog, setToggleStatusDialog] = React.useState<{
    open: boolean;
    userId: string | null;
    userName: string | null;
    activate: boolean | null;
    user: User | null;
  }>({ open: false, userId: null, userName: null, activate: null, user: null });

  const [lockDialog, setLockDialog] = React.useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

  const [resetPasswordDialog, setResetPasswordDialog] = React.useState<{
    open: boolean;
    userId: string | null;
    userName: string | null;
  }>({
    open: false,
    userId: null,
    userName: null
  });

  const handleToggleStatusClick = (id: string, activate: boolean) => {
    if (!checkPermission(MODULE_CODES.USER_MGMT, "can_edit")) return;
    const user = data.find((u) => u.id === id);
    if (user && isCurrentUser(user) && !activate) {
      notify({ description: "You cannot deactivate your own account", type: "warning" });
      return;
    }
    if (user) {
      setToggleStatusDialog({
        open: true,
        userId: id,
        userName: `${user.first_name} ${user.last_name}`,
        activate,
        user
      });
    }
  };

  const handleToggleStatusConfirm = async () => {
    if (toggleStatusDialog.userId === null || toggleStatusDialog.activate === null) {
      return;
    }

    try {
      let response;
      if (toggleStatusDialog.activate && toggleStatusDialog.user) {
        const u = toggleStatusDialog.user;
        response = await updateUser(toggleStatusDialog.userId, {
          username: u.username,
          email: u.email,
          first_name: u.first_name,
          last_name: u.last_name,
          branch_id: u.branch_id,
          department_id: u.department_id,
          role_id: u.role_id,
          mfa_enabled: u.mfa_enabled,
          is_active: true
        });
      } else {
        response = await deactivateUser(toggleStatusDialog.userId);
      }

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
            activate: null,
            user: null
          });
        }, 300);
      } else {
        notify({ description: response.message || "Failed to update user status", type: "error" });
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };
  const handleToggleLockClick = (user: User) => {
    if (!checkPermission("USER_MGMT", "can_edit")) return;
    if (isCurrentUser(user) && !user.is_locked) {
      notify({ description: "You cannot lock your own account", type: "warning" });
      return;
    }
    setLockDialog({ open: true, user });
  };

  const handleToggleLockConfirm = async () => {
    if (!lockDialog.user) return;
    const { user } = lockDialog;
    const response = user.is_locked ? await unlockUser(user.id) : await lockUser(user.id);
    if (response.success) {
      notify({ description: `User ${user.is_locked ? "unlocked" : "locked"} successfully`, type: "success" });
      router.refresh();
      setLockDialog((prev) => ({ ...prev, open: false }));
      setTimeout(() => setLockDialog({ open: false, user: null }), 300);
    } else {
      notify({ description: response.message || "Failed to update lock status", type: "error" });
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
    if (!checkPermission(MODULE_CODES.USER_MGMT, "can_edit")) return;
    setEditingUser(user);
  };

  const handleViewProfile = (id: string) => {
    router.push(`/dashboard/system-configs/users/${id}`);
  };

  const columns = getColumns(
    handleToggleStatusClick,
    handleToggleLockClick,
    handleEditClick,
    handleResetPasswordClick,
    handleViewProfile,
    isCurrentUser
  );

  const { searchValue: localSearch, setSearchValue: setLocalSearch, filteredData: filteredUsers } = useTableSearch<User>({
    data,
    filterFn: (user, query) => {
      const lower = query.toLowerCase();
      return (
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(lower) ||
        user.email?.toLowerCase().includes(lower) ||
        user.username?.toLowerCase().includes(lower)
      );
    },
    debounceMs: 200,
  });

  // is_active is filtered server-side via ?status=; don't double-filter here
  // (that previously made "10 per page" render as fewer rows).
  const displayedUsers = filteredUsers.filter(user => {
    const matchesRole = selectedRole === "all" || user.role?.name === selectedRole;
    return matchesRole;
  });

  const table = useReactTable({
    data: displayedUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility
    },
    manualPagination: true,
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

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
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

  const hasFilters = selectedRole !== "all" || localSearch !== "";

  const clearFilters = () => {
    setLocalSearch("");
    setSelectedRole("all");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("page");
    startTransition(() => router.push(`?${params.toString()}`));
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
        <div className="border-b px-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              const params = new URLSearchParams(searchParams.toString());
              if (v === "inactive") params.set("status", "inactive");
              else params.delete("status");
              params.delete("page");
              startTransition(() => router.push(`?${params.toString()}`));
            }}>
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active Users</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Users</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="space-y-4 border-b p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Search
              placeholder="Search users by name or email..."
              value={localSearch}
              onChange={setLocalSearch}
              disabled={isPending}
            />

            <div className="flex items-center gap-2">
              <Select value={selectedRole} onValueChange={handleRoleChange}>
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
              {isPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-6" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-44" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
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
        open={toggleStatusDialog.open}
        title={`${toggleStatusDialog.activate ? "Activate" : "Deactivate"} User`}
        description={`Are you sure you want to ${
          toggleStatusDialog.activate ? "activate" : "deactivate"
        } the user "${toggleStatusDialog.userName?.toLocaleUpperCase()}"?`}
        onOpenChange={(open) =>
          setToggleStatusDialog({ open, userId: null, userName: null, activate: null, user: null })
        }
        onConfirm={handleToggleStatusConfirm}
        type={toggleStatusDialog.activate ? "default" : "delete"}
      />
      <ConfirmationModal
        open={lockDialog.open}
        title={`${lockDialog.user?.is_locked ? "Unlock" : "Lock"} User`}
        description={`Are you sure you want to ${lockDialog.user?.is_locked ? "unlock" : "lock"} the account of "${`${lockDialog.user?.first_name} ${lockDialog.user?.last_name}`.toLocaleUpperCase()}"?`}
        onOpenChange={(open) => setLockDialog({ open, user: null })}
        onConfirm={handleToggleLockConfirm}
        type={lockDialog.user?.is_locked ? "default" : "delete"}
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
