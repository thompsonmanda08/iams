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

type SignUpFormProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function SignUpForm({ isOpen, setIsOpen }: SignUpFormProps) {
  const [copied, setCopied] = useState(false);

  const branches = [
    { label: "New York", value: "NY" },
    { label: "Los Angeles", value: "LA" },
    { label: "Chicago", value: "CHI" },
    { label: "Houston", value: "HOU" },
    { label: "Phoenix", value: "PHX" }
  ];

  const roles = [
    { label: "Admin", value: "ADMIN" },
    { label: "Manager", value: "MANAGER" },
    { label: "Employee", value: "EMPLOYEE" },
    { label: "Contractor", value: "CONTRACTOR" }
  ];

  const departments = [
    { label: "Engineering", value: "ENG" },
    { label: "Sales", value: "SALES" },
    { label: "Marketing", value: "MARKETING" },
    { label: "HR", value: "HR" },
    { label: "Finance", value: "FINANCE" },
    { label: "Operations", value: "OPS" }
  ];

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
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      branch: "",
      role: "",
      department: "",
      password: ""
    }
  });

  const handleCopyPassword = async () => {
    const password = form.getValues("password");
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy password", err);
    }
  };

  const resetForm = () => {
    form.reset({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      branch: "",
      role: "",
      department: "",
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
    try {
      console.log(values);
      // Add your API call here
      handleCancel();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!form.getValues("password")) {
      form.setValue("password", generatePass());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              className="h-8 w-8 rounded-full">
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
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="XXX" {...field} className="focus-visible:ring-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="XXX" {...field} className="focus-visible:ring-1" />
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
                            placeholder="x.xx@company.com"
                            {...field}
                            className="focus-visible:ring-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="XXXX-XXX-XXX"
                            {...field}
                            className="focus-visible:ring-1"
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
                    name="branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Branch <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full focus:ring-1">
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch.value} value={branch.value}>
                                {branch.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Role <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full focus:ring-1">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Department <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full focus:ring-1">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                {dept.label}
                              </SelectItem>
                            ))}
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
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleCopyPassword}
                              className="shrink-0">
                              {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <span
                          onClick={handleGenerateNewPassword}
                          className="text-primary mt-1 cursor-pointer text-xs text-center hover:underline">
                          Generate new password
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t pt-6">
                <Button type="button" variant="destructive" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
