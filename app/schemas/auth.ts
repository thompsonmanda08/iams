import { UserType } from "@/lib/types/account";
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email().trim().min(1, "user name is required"),
  password: z.string().min(6, "6 or more characters are required")
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().trim().min(1, "Username is required").min(3, "Username must be at least 3 characters"),
  branch_id: z.string().min(1, "Branch is required"),
  role_id: z.string().min(1, "Role is required"),
  department_id: z.string().min(1, "Department is required"),
  is_active: z.boolean().optional().default(true),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  user_type: z.string().optional(),
  mfa_enabled: z.boolean().optional().default(true)
});

// Schema for editing user (password is optional)
export const updateUserSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().trim().min(1, "Username is required").min(3, "Username must be at least 3 characters"),
  branch_id: z.string().min(1, "Branch is required"),
  role_id: z.string().min(1, "Role is required"),
  department_id: z.string().min(1, "Department is required"),
  is_active: z.boolean().optional(),
  password: z.string().optional(),
  phone: z.string().optional(),
  user_type: z.string().optional(),
  mfa_enabled: z.boolean().default(false)
});

// Base schema with common fields
const baseUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  is_active: z.boolean().default(true),
  password: z.string().min(8, "Password must be at least 8 characters")
});

// Schema for BACKOFFICE_ADMIN - fields are optional
const backofficeAdminUserSchema = baseUserSchema.extend({
  branch_id: z.string().optional(),
  role_id: z.string().optional(),
  department_id: z.string().optional()
});

// Schema for ORGANISATION_USER - fields are required
const organisationUserSchema = baseUserSchema.extend({
  branch_id: z.string().min(1, "Branch is required"),
  role_id: z.string().min(1, "Role is required"),
  department_id: z.string().min(1, "Department is required")
});

// Function to get the appropriate schema
export const getUserSchema = (userType: UserType) => {
  return userType === "BACKOFFICE_ADMIN" ? backofficeAdminUserSchema : organisationUserSchema;
};

export type SignupFormValues = z.infer<typeof signupSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
