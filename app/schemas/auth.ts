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
  username: z.string().trim().min(1, "Username is required"),
  branch_id: z.string().min(1, "Branch is required"),
  role_id: z.string().min(1, "Role is required"),
  department_id: z.string().min(1, "Department is required"),
  is_active: z.boolean().optional().default(true),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  user_type: z.string().optional()
});

// Schema for editing user (password is optional)
export const updateUserSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().trim().min(1, "Username is required"),
  branch_id: z.string().min(1, "Branch is required"),
  role_id: z.string().min(1, "Role is required"),
  department_id: z.string().min(1, "Department is required"),
  is_active: z.boolean().optional(),
  password: z.string().optional(),
  phone: z.string().optional(),
  user_type: z.string().optional()
});

export type SignupFormValues = z.infer<typeof signupSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
