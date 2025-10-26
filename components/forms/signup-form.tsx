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
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { signupSchema, type SignupFormValues } from "@/app/schemas/auth";
import { useCallback, useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getBranches, getDepartments, getRoles } from "@/app/_actions/config-actions";
import { registerUser } from "@/app/_actions/auth-actions";

type SignUpFormProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

type Branch = {
  id: string;
  name: string;
  code: string;
};

type Department = {
  id: string;
  name: string;
  code: string;
};

type Role = {
  id: string;
  name: string;
  code: string;
  department_id: string;
};

export function SignUpForm({ isOpen, setIsOpen }: SignUpFormProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);

  const generatePass = useCallback(() => {
    let pass = "";
    const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789@#$";
    for (let i = 1; i <= 12; i++) {
      const char = Math.floor(Math.random() * str.length);
      pass += str.charAt(char);
    }
    return pass;
  }, []);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      branch_id: "",
      role_id: "",
      department_id: "",
      password: ""
    }
  });

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadData();
      resetForm();
    }
  }, [isOpen]);

  // Filter roles based on selected department
  useEffect(() => {
    const department = form.watch("department_id");
    if (department && roles.length > 0) {
      const filtered = roles.filter((role) => role.department_id === department);
      setFilteredRoles(filtered);

      // Reset role if current selection is not in filtered roles
      const currentRole = form.getValues("role_id");
      if (currentRole && !filtered.find((r) => r.id === currentRole)) {
        form.setValue("role_id", "");
      }
    } else {
      setFilteredRoles([]);
    }
  }, [form.watch("department_id"), roles]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [branchesRes, departmentsRes, rolesRes] = await Promise.all([
        getBranches({ isActive: true }),
        getDepartments({ isActive: true }),
        getRoles({ isActive: true })
      ]);

      if (branchesRes.success && branchesRes.data) {
        setBranches(branchesRes.data);
      }

      if (departmentsRes.success && departmentsRes.data) {
        setDepartments(departmentsRes.data);
      }

      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
    } catch (error) {
      toast.error("Failed to load form data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    const password = form.getValues("password");
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
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
      password: generatePass()
    });
    setCopied(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleGenerateNewPassword = () => {
    const newPassword = generatePass();
    form.setValue("password", newPassword);
    setCopied(false);
  };

  const onSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        branch_id: values.branch_id,
        department_id: values.department_id,
        role_id: values.role_id
      });

      if (response.success) {
        toast.success("User created successfully");
        handleCancel();
        router.refresh();
      } else {
        toast.error(response.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] w-full min-w-2xl overflow-hidden p-0 [&>button]:hidden">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">Create New User</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8 rounded-full"
              disabled={isSubmitting}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                              <SelectValue placeholder="Select branch">
                                {isLoading
                                  ? "Loading branches..."
                                  : field.value
                                    ? branches.find((b) => b.id === field.value)?.name
                                    : "Select branch"}
                              </SelectValue>
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
                              <SelectValue placeholder="Select department">
                                {isLoading
                                  ? "Loading departments..."
                                  : field.value
                                    ? departments.find((d) => d.id === field.value)?.name
                                    : "Select department"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.length === 0 ? (
                              <div className="text-muted-foreground p-2 text-sm">
                                No departments available
                              </div>
                            ) : (
                              departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
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
                              <SelectValue placeholder="Select role">
                                {!form.watch("department_id")
                                  ? "Select department first"
                                  : isLoading
                                    ? "Loading roles..."
                                    : field.value
                                      ? filteredRoles.find((r) => r.id === field.value)?.name
                                      : "Select role"}
                              </SelectValue>
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

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Password <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              {...field}
                              readOnly
                              className="cursor-default font-mono text-sm focus-visible:ring-1"
                              disabled={isSubmitting}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleCopyPassword}
                              className="shrink-0"
                              disabled={isSubmitting}>
                              {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <span
                          onClick={isSubmitting ? undefined : handleGenerateNewPassword}
                          className={`text-primary mt-1 block text-center text-xs ${
                            isSubmitting
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer hover:underline"
                          }`}>
                          Generate new password
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
