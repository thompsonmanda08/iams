export type RiskRegisterBranch = {
  id: string;
  name: string;
  code: string;
};

export type RiskRegister = {
  id: string;
  branch_id: string;
  name: string;
  description?: string;
  start_date: string;
  due_date: string;
  status: "OPEN" | "CLOSED";
  timeline_status: "ON_TRACK" | "AT_RISK" | "OVERDUE";
  branch: RiskRegisterBranch;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
};

export type RiskRegistersResponse = {
  registers: RiskRegister[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};