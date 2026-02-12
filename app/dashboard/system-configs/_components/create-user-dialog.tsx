"use client";

import { PencilLine, Plus, UserPlus } from "lucide-react";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { type SignupFormValues } from "@/app/schemas/auth";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Check, Copy, UserCog, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User, UserType } from "@/lib/types/account";
import { generateRandomString } from "@/lib/utils";
import { useBranches, useDepartments, useRoles } from "@/hooks/use-query-data";
import { useCreateUser, useUpdateUser } from "@/hooks/use-users-query-data";
import { Branch, Department } from "@/lib/types";
import { DialogClose } from "@radix-ui/react-dialog";
import { usePermissions } from "@/hooks/use-permissions";

type SignUpFormProps = {
  user: User | null;
  isOpenModal: boolean;
  handleCloseModal: () => void;
  userType: UserType;
};

type Role = {
  id: string;
  name: string;
  code: string;
  department_id: string;
};

export default function CreateUserForm({
  user_type,
  user,
  showTrigger,
  isOpenModal,
  setIsOpenModal
}: {
  showTrigger?: boolean;
  user_type: UserType;
  user: User | null;
  isOpenModal?: boolean;
  setIsOpenModal?: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { checkPermission } = usePermissions();
  const [copied, setCopied] = useState(false);
  const [internalOpen, setInternalOpen] = useState<boolean>(false);

  const isEditMode = !!user;

  // Use internal state for trigger mode, external state for controlled mode
  const dialogOpen = showTrigger ? internalOpen : isOpenModal;
  const setDialogOpen = showTrigger ? setInternalOpen : setIsOpenModal;

  // TanStack Query hooks for data fetching
  const { data: branchesData, isLoading: branchesLoading } = useBranches({ isActive: true });
  const { data: departmentsData, isLoading: departmentsLoading } = useDepartments({
    isActive: true
  });
  const { data: rolesData, isLoading: rolesLoading } = useRoles({ isActive: true });

  // TanStack Query mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  // Extract data from query responses
  const branches: Branch[] = branchesData?.success ? branchesData.data?.data || [] : [];
  const departments: Department[] = departmentsData?.success
    ? departmentsData.data?.data || []
    : [];
  const roles: Role[] = rolesData?.success ? rolesData.data?.data || [] : [];

  const isLoading = branchesLoading || departmentsLoading || rolesLoading;
  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending;

  // Initialize form with user data if in edit mode to prevent flash
  const initialValues = useMemo(() => {
    if (isEditMode && user) {
      return {
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        branch_id: user.branch_id || "",
        role_id: user.role_id || "",
        department_id: user.department_id || "",
        is_active: user.is_active ?? true,
        user_type,
        password: "",
        mfa_enabled: user.mfa_enabled ?? true
      };
    }
    return {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      branch_id: "",
      role_id: "",
      department_id: "",
      is_active: true,
      user_type,
      password: generateRandomString(),
      mfa_enabled: true
    };
  }, [isEditMode, user?.id]);

  const form = useForm<any>({
    defaultValues: initialValues
  });

  // Filter roles based on selected department
  const selectedDepartmentId = form.watch("department_id");
  const filteredRoles = useMemo(() => {
    if (!selectedDepartmentId || roles.length === 0) return [];
    return roles.filter((role: Role) => role.department_id === selectedDepartmentId);
  }, [selectedDepartmentId, roles]);

  // Reset form when user changes (for edit mode) or when dialog opens/closes
  useEffect(() => {
    if (isEditMode && user) {
      // Pre-fill form with user data in edit mode
      form.reset({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        branch_id: user.branch_id || "",
        role_id: user.role_id || "",
        department_id: user.department_id || "",
        is_active: user.is_active ?? true,
        user_type,
        password: "",
        mfa_enabled: user.mfa_enabled ?? true
      });
    } else if (!isEditMode && dialogOpen) {
      // Reset to empty form in create mode when dialog opens
      form.reset({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        branch_id: "",
        role_id: "",
        department_id: "",
        is_active: true,
        user_type,
        password: generateRandomString(),
        mfa_enabled: true
      });
    }
  }, [user?.id, dialogOpen, isEditMode]);

  // Reset role when department changes (only in create mode)
  useEffect(() => {
    if (!isEditMode && selectedDepartmentId) {
      const currentRole = form.getValues("role_id");
      if (currentRole && !filteredRoles.find((r: Role) => r.id === currentRole)) {
        form.setValue("role_id", "");
      }
    }
  }, [selectedDepartmentId, filteredRoles, isEditMode]);

  const handleCopyPassword = async () => {
    const password = form.getValues("password");
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.info("Password copied to clipboard. ");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy password");
    }
  };

  const resetForm = () => {
    form.reset({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      branch_id: "",
      role_id: "",
      department_id: "",
      is_active: true,
      user_type,
      password: generateRandomString(),
      mfa_enabled: true
    });
    setCopied(false);
  };

  function handleCloseModal() {
    resetForm();
    setDialogOpen?.(false);
  }

  function handleOpenModal() {
    setDialogOpen?.(true);
  }

  const handleGenerateNewPassword = () => {
    const newPassword = generateRandomString();
    form.setValue("password", newPassword);
    setCopied(false);
  };

  const processForm = async (values: SignupFormValues) => {
    const isEdit = !!user;

    try {
      let response;
      if (isEdit) {
        const updateData = {
          username: values.username,
          email: values.email,
          phone: values.phone,
          first_name: values.first_name,
          last_name: values.last_name,
          branch_id: values.branch_id,
          department_id: values.department_id,
          role_id: values.role_id,
          is_active: values.is_active ?? true,
          user_type,
          mfa_enabled: values.mfa_enabled ?? true
        };

        response = await updateUserMutation.mutateAsync({
          userId: user.id,
          data: updateData
        });
      } else {
        response = await createUserMutation.mutateAsync({
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
          first_name: values.first_name,
          last_name: values.last_name,
          branch_id: values.branch_id,
          department_id: values.department_id,
          role_id: values.role_id,
          user_type,
          mfa_enabled: values.mfa_enabled
        });
      }

      if (response.success) {
        toast.success(`User ${isEdit ? "updated" : "created"} successfully`);
        handleCloseModal();
        router.refresh();
      } else {
        console.error("Form submission failed:", response);
        toast.error(response.message || `Failed to ${isEdit ? "update" : "create"} user`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const onSubmit = form.handleSubmit(
    async (data) => {
      console.log("Form validation passed, calling processForm with data:", data);

      // Remove all falsy values from the data object
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => Boolean(value))
      );

      console.log("Cleaned data:", cleanedData);
      await processForm(cleanedData as any);
    },
    (errors) => {
      console.error("Form validation failed:", errors);
      // Show specific field errors
      const errorMessages = Object.entries(errors)
        .map(([field, error]: [string, any]) => `${field}: ${error.message}`)
        .join(", ");
      toast.error(`Validation errors: ${errorMessages}`);
    }
  );

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        console.log(
          "Dialog onOpenChange:",
          open,
          "showTrigger:",
          showTrigger,
          "dialogOpen:",
          dialogOpen
        );
        if (showTrigger) {
          // In trigger mode, manage internal state
          if (open) {
            const action = isEditMode ? "can_edit" : "can_create";
            if (!checkPermission("USER_MGMT", action)) return;
            setInternalOpen(true);
          } else {
            handleCloseModal();
          }
        } else {
          // In controlled mode, just handle close
          if (!open) {
            handleCloseModal();
          }
        }
      }}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button size="sm">
            {user ? (
              <>
                <PencilLine className="mr-2 h-4 w-4" /> Update User
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create New User
              </>
            )}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-h-[90vh] w-full overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/5 text-primary hover:bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full">
              <UserCog className="h-4 w-4" />
            </div>
            <DialogTitle>{isEditMode ? "Edit User" : "Create New User"}</DialogTitle>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="overflow-y-auto px-6 py-6">
              <div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label="First Name"
                            placeholder="Bob"
                            {...field}
                            className="focus-visible:ring-1"
                            disabled={isSubmitting}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label="Last Name"
                            placeholder="Mwale"
                            required
                            {...field}
                            className="focus-visible:ring-1"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label="Username"
                            placeholder="bmwale"
                            {...field}
                            className="focus-visible:ring-1"
                            disabled={isSubmitting}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            label="Email Address"
                            type="email"
                            placeholder="mail@company.com"
                            {...field}
                            className="focus-visible:ring-1"
                            disabled={isSubmitting}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="grid grid-cols-1 gap-4">
                  {user_type === "ORGANIZATION_USER" && (
                    <>
                      <FormField
                        control={form.control}
                        name="branch_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Branch <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isSubmitting || isLoading}>
                              <FormControl>
                                <SelectTrigger className="w-full focus:ring-1">
                                  <SelectValue
                                    placeholder={
                                      isLoading ? "Loading branches..." : "Select branch"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {branches.length === 0 ? (
                                  <div className="text-muted-foreground p-2 text-sm">
                                    No branches available
                                  </div>
                                ) : (
                                  branches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id}>
                                      {branch.name} ({branch.code})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="department_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Department <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isSubmitting || isLoading}>
                              <FormControl>
                                <SelectTrigger className="w-full focus:ring-1">
                                  <SelectValue
                                    placeholder={
                                      isLoading ? "Loading departments..." : "Select department"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.length === 0 ? (
                                  <div className="text-muted-foreground p-2 text-sm">
                                    No departments available
                                  </div>
                                ) : (
                                  departments.map((dept) => (
                                    <SelectItem key={dept.id} value={String(dept.id)}>
                                      {dept.name} ({dept.code})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="role_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Role <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={
                                isSubmitting ||
                                isLoading ||
                                !form.watch("department_id") ||
                                filteredRoles.length === 0
                              }>
                              <FormControl>
                                <SelectTrigger className="w-full focus:ring-1">
                                  <SelectValue
                                    placeholder={
                                      !form.watch("department_id")
                                        ? "Select department first"
                                        : isLoading
                                          ? "Loading roles..."
                                          : "Select role"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredRoles.length === 0 ? (
                                  <div className="text-muted-foreground p-2 text-sm">
                                    No roles available for this department
                                  </div>
                                ) : (
                                  filteredRoles.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                      {role.name} ({role.code})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {isEditMode && (
                    <div className="rounded-lg border p-4">
                      <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Account Status</FormLabel>
                              <FormDescription>
                                {field.value ? "Account is active" : "Account is deactivated"}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mfa_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">MFA</FormLabel>
                              <FormDescription>
                                {field.value ? "MFA is enabled" : "MFA is disabled"}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {!isEditMode && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Password <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex w-full flex-col items-center gap-2 sm:flex-row">
                              <div className="relative flex w-full items-center gap-2">
                                <Input
                                  {...field}
                                  readOnly
                                  className="cursor-default font-mono text-sm focus-visible:ring-1"
                                  disabled={isSubmitting}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleCopyPassword}
                                  className="hover:bg-muted/5 absolute right-1 shrink-0"
                                  disabled={isSubmitting}>
                                  {copied ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <Button
                                type="button"
                                // variant="ghost"
                                onClick={isSubmitting ? undefined : handleGenerateNewPassword}>
                                Generate new password
                              </Button>
                            </div>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3 border-t p-4">
              <div className="flex w-full items-center justify-between gap-3">
                {/* Debug info - remove in production */}
                <div className="bg-red-50 p-2 text-xs text-red-500">
                  {Object.keys(form.formState.errors).length > 0 && (
                    <span className="text-destructive">
                      Errors: {Object.keys(form.formState.errors).join(", ")}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleCloseModal}
                      disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    loadingText={isEditMode ? "Updating..." : "Creating..."}
                    onClick={() => console.log("Submit button clicked!")}>
                    {isEditMode ? "Update User" : "Create User"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
// Convenience wrapper component for just showing the button trigger
export function CreateUserButton({ user_type }: { user_type: UserType }) {
  return <CreateUserForm showTrigger={true} user_type={user_type} user={null} />;
}
