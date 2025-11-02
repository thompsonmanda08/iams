// =============================================================================
// FILE: components/forms/signup-form.tsx
// =============================================================================
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { signupSchema, updateUserSchema, type SignupFormValues } from "@/app/schemas/auth";
import { useEffect, useState, useMemo } from "react";
import { Check, Copy, UserCog, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
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

type SignUpFormProps = {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  userType: UserType;
};

type Role = {
  id: string;
  name: string;
  code: string;
  department_id: string;
};

export function SignUpForm({ user, isOpen, onClose, userType: user_type }: SignUpFormProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const isEditMode = !!user;

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

  // Use different schema based on edit mode
  const validationSchema = useMemo(
    () => (isEditMode ? updateUserSchema : signupSchema),
    [isEditMode]
  );

  // Initialize form with user data if in edit mode to prevent flash
  const initialValues = useMemo(() => {
    if (isEditMode && user) {
      return {
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        branch_id: user.branch_id || "",
        role_id: user.role_id || "",
        department_id: user.department_id || "",
        is_active: user.is_active ?? true,
        user_type,
        password: ""
      };
    }
    return {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      branch_id: "",
      role_id: "",
      department_id: "",
      is_active: true,
      user_type,
      password: generateRandomString()
    };
  }, [isEditMode, user?.id]);

  const form = useForm<any>({
    resolver: zodResolver(validationSchema),
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
        branch_id: user.branch_id || "",
        role_id: user.role_id || "",
        department_id: user.department_id || "",
        is_active: user.is_active ?? true,
        user_type,
        password: ""
      });
    } else if (!isEditMode && isOpen) {
      // Reset to empty form in create mode when dialog opens
      form.reset({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        branch_id: "",
        role_id: "",
        department_id: "",
        is_active: true,
        user_type,
        password: generateRandomString()
      });
    }
  }, [user?.id, isOpen, isEditMode]);

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
      branch_id: "",
      role_id: "",
      department_id: "",
      user_type,
      password: generateRandomString()
    });
    setCopied(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleGenerateNewPassword = () => {
    const newPassword = generateRandomString();
    form.setValue("password", newPassword);
    setCopied(false);
  };

  const processForm = async (values: SignupFormValues) => {
    const isEdit = !!user;

    console.log("Processing form:", { isEdit, values, userId: user?.id });

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
          user_type
        };
        console.log("Updating user with data:", updateData);
        response = await updateUserMutation.mutateAsync({
          userId: user.id,
          data: updateData
        });
        console.log("Update response:", response);
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
          user_type
        });
      }

      if (response.success) {
        toast.success(`User ${isEdit ? "updated" : "created"} successfully`);
        handleCancel();
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
      console.log("Form validation passed, calling processForm");
      await processForm(data);
    },
    (errors) => {
      console.error("Form validation failed:", errors);
      toast.error("Please fix the validation errors before submitting");
    }
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-full min-w-2xl overflow-hidden p-0 [&>button]:hidden">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/5 text-primary hover:bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full">
              <UserCog className="h-4 w-4" />
            </div>
            <DialogTitle>{isEditMode ? "Edit User" : "Create New User"}</DialogTitle>
          </div>
          <DialogDescription className="pt-">
            {"Create or update users in your organisation"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="xxx"
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
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="xxx"
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
                        <FormLabel>
                          Username <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="xxx.x"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="xx.xxx@company.com"
                            {...field}
                            className="focus-visible:ring-1"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <div className="grid grid-cols-1 gap-4">
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
                                placeholder={isLoading ? "Loading branches..." : "Select branch"}
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

                  {isEditMode && (
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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

              <div className="flex justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}>
                  {isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update"
                      : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
