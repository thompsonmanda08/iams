export type LoginPayload = {
  emailusername: string;
  password: string;
};

export type Branch = {
  id: string;
  name: string;
  code: string;
  town_id: string | null;
  province_id: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Department = {
  id: string;
  name: string;
  code: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type Role = {
  id: string;
  department_id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type User = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  branch_id: string;
  department_id: string;
  role_id: string;
  is_active: boolean;
  is_ldap_user: boolean;
  last_login: string | null;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  branch: Branch;
  department: Department;
  role: Role;
};

export type AccountOwner = User & {
  role: 'owner';
  password: string;
  changePassword: string;
};
