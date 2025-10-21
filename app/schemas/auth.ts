import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email().trim().min(1, "user name is required"),
  password: z.string().min(6,"6 or more characters are required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const  signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  branch: z.string().min(1, "Branch is required"),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

