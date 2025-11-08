export type RiskCategory = {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  is_active: boolean;
  department_id: string;
};

export type SubProcess = {
  id: string;
  name: string;
};

export type BusinessProcess = {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  sub_processes: SubProcess[];
};

export type RiskMatrix = {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  is_default: boolean;
  likelihood_min?: number;
  likelihood_max?: number;
  impact_min?: number;
  impact_max?: number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  organization_id: string;
  department_id: string;
  name: string;
  code: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
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
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  department_id: string;
  is_active: boolean;
};

export type Risk = {
  id: string;
  risk_matrix_id: string;
  organization_id: string;
  title: string;
  description: string;
  category_id: string;
  department_id: string;
  matrix_id: string | null;
  risk_register_id: string;
  macro_process_id: string;
  sub_process_id: string;
  strategic_objective_id: string;
  root_cause: string;
  recurrence: "ongoing" | "one-time";
  step: number;
  department_status: string;
  inherent_likelihood: number;
  inherent_impact: number;
  inherent_score: number;
  inherent_rating: string;
  residual_likelihood: number;
  residual_impact: number;
  residual_score: number;
  residual_rating: string;
  existing_controls: string;
  control_effectiveness: number;
  treatment_plan: string;
  risk_response_id?: string;
  risk_owner_id: string;
  risk_appetite_status: "WITHIN" | "ABOVE";
  target_closing_date: string;
  revised_target_date: string;
  date_closed: string;
  status: string;
  overdue_days: number;
  review_date: string;
  mitigation_cost: number;
  latest_update: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  category: Category;
  department: Department;
};

export type StepOneData = {
  title: string;
  description: string;
  category_id: string;
  department_id: string;
  macro_process_id: string;
  sub_process_id: string;
  strategic_objective_id: string;
  root_cause: string;
  recurrence: "ongoing" | "one-time";
  status?: string;
};

export type StepTwoData = {
  risk_matrix_id: string;
  inherent_likelihood: number;
  inherent_impact: number;
  existing_controls: string;
  control_effectiveness: number;
};

export type StepThreeData = {
  residual_likelihood?: number;
  residual_impact?: number;
  treatment_plan?:string;
  risk_response_id?: string;
  risk_owner_id?: string;
  risk_appetite_status?: "WITHIN" | "ABOVE";
  target_closing_date?: string;
  mitigation_cost?: number;
  response_id?:string;
  appetite_id?:string;
  control_id?:string;
};

export type RiskResponse = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};
export type RiskControls = {
  id: string;
  name: string;
  value:number;
  description: string;
  created_at: string;
  updated_at: string;
};