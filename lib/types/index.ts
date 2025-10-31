import { JWTPayload } from "jose";

import { Role, User } from "./account";

export type PageProps = {
  params?: Promise<{ [key: string]: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type APIResponse = {
  success: boolean;
  message: string;
  data: any;
  status?: number;
  [x: string]: unknown;
};

export type ErrorState = {
  status?: boolean;
  message?: string;
  [x: string]: any;
};

export type GenericJSONB = {
  id?: string;
  key: string;
  name: string;
};

export type Workspace = {
  ID?: string;
  workspace: string;
  workspace_type: string;
  [x: string]: any;
};

export type DocumentType = GenericJSONB & {
  key: string;
  name: string;
  file_types: string[];
  max_size_mb: number;
  description?: string;
  required?: boolean;
};

export type AuthSession = JWTPayload & {
  accessToken: string;
  refreshToken?: string;
  screen_locked?: boolean;
  user?: Partial<User> | null;
  permissions?: any[];
  [x: string]: any;
};

export type UserSession = {
  user: Partial<User> | null;
  permissions: object[];
  [x: string]: unknown;
};

export type Department = {
  id: string | undefined;
  name: string;
  code: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

export type DepartmentUser = {
  id: string;
  fullName: string;
  role: Role;
  department: string;
  isActive: boolean;

  [key: string]: any;
};
export type AppModule = {
  id: string;
  name: string;
  module_code?: string;
  href?: string;
  parent_module_id?: string | null;
  description?: string;
  department: string;
  backendKey: string;
  isActive: boolean;
  [key: string]: any;
};
export type Branch = {
  name: string;
  code: string;
  province: string;
  city: string;
  physical_address: string;
  [key: string]: any;
};

export type DateRangeFilter = {
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  [x: string]: any;
};

export type Pagination = {
  page: number;
  page_size: number;
  total?: number; // TOTAL NUMBER OF RECORDS
  total_pages: number;
  has_next?: boolean;
  has_prev?: boolean;
  [x: string]: any;
};

export type AuditableArea = {
  id: string | undefined;
  name: string;
  description: string;
  department_id: string | null;
  // code: string;
  // is_active: boolean;
};

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  created_at?: string;
}

export interface Province {
  id: string;
  country_id: string;
  name: string;
  created_at?: string;
}

export interface Town {
  id: string;
  province_id: string;
  name: string;
  created_at?: string;
}

export interface CompanyLocation {
  id: string;
  company_id: string;
  country_id: string;
  province_id: string | null;
  town_id: string | null;
  created_at?: string;
}
