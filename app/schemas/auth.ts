import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email().trim().min(1, "user name is required"),
  password: z.string().min(6,"6 or more characters are required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email(),
  user_name: z.string().trim().min(1, "user name is required"),
  company_name: z.string().trim().min(1, "company name is required"),
  company_size: z.string().min(1),
  plan: z.string().min(1),
  password: z.string().min(6),
  timezone: z.string().optional(),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

