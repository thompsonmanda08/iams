/**
 * Incident Status - Uses standardized status values from lib/statuses.ts
 *
 * Allowed statuses:
 * - PENDING: Incident pending review
 * - IN_REVIEW: Incident under review
 * - OPEN: Incident is active
 * - COMPLETED: Incident resolution complete
 * - CLOSED: Incident closed
 *
 * @deprecated Prefer using StandardStatus from lib/statuses.ts for new code
 */
export type IncidentStatus = "PENDING" | "IN_REVIEW" | "OPEN" | "COMPLETED" | "CLOSED" | "IN_PROGRESS" | "RESOLVED";

export type Incident = {
  id: string;
  organization_id: string;
  department_id: string;
  incident_date: string;
  discovery_date: string;
  location: string;
  details: string;
  primary_cause_id: string;
  specific_cause_id: string;
  materiality: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  root_cause: string;
  action_plan: string;
  due_date: string;
  responsible_person_id: string;
  financial_loss_implications: "YES" | "NO";
  status: IncidentStatus;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
};

export type Department = {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string | null;
  parent_id: string | null;
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
  user_type: string;
  organization_id: string;
  branch_id: string;
  department_id: string;
  role_id: string;
  is_active: boolean;
  branch: Branch;
  department: Department;
  role: Role;
};

export type Branch = {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  town_id: string | null;
  province_id: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Role = {
  id: string;
  department_id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  is_department_head: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type Cause = {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  parent_id?: string | null;
  is_active: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type IncidentData = {
  incident: Incident;
  department: Department;
  responsible_person: User;
  primary_cause: Cause;
  specific_cause: Cause;
  created_by_user: User;
  updated_by_user: User;
};

export type IncidentResponse = {
  data: IncidentData[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};