"use server";

import type { APIResponse } from "@/lib/types";
import authenticatedApiClient, {
  handleError,
  successResponse
} from "./api-config";

interface DashboardData {
  overview: {
    total_risks: number;
    total_audit_plans: number;
    total_kris: number;
    total_users: number;
    total_departments: number;
    total_branches: number;
    total_incidents: number;
  };
  risk_summary: {
    total_risks: number;
    risks_by_rating: {
      High: number;
      Low: number;
      Normal: number;
    };
    risks_by_status: {
      DRAFT: number;
      OPEN: number;
    };
    risks_by_department: Array<{
      department_id: string;
      department_name: string;
      risk_count: number;
      open_risk_count: number;
    }>;
  };
  audit_summary: {
    total_audit_plans: number;
    audit_plans_by_status: Record<string, number>;
    active_audit_plans: number;
    completed_audit_plans: number;
    total_findings: number;
    findings_by_severity: Record<string, number>;
    open_findings: number;
    overdue_action_plans: number;
    recent_audit_plans: Array<{
      title: string;
      status: string;
      start_date: string;
      progress_percentage: number;
      created_at: string;
    }>;
  };
  kri_summary: {
    total_kris: number;
    kris_by_status: Record<string, number>;
    kris_in_breach: number;
    kris_due_measurement: number;
    total_kri_registers: number;
    recent_kris: Array<{
      id: string;
      name: string;
      last_status: string;
      updated_at: string;
    }>;
  };
  system_health: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    locked_users: number;
    recent_logins: any[];
  };
  audit_findings: Array<{
    finding_number: string;
    status: string;
    due_date: string;
    conclusion: string;
    severity: string;
  }>;
}
// GET DASHBAORD STATISTICS
export async function getDashboardStats(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: '/api/v1/dashboard/summary',
      method: "GET"
    });
    return successResponse(response?.data);
  } catch (error: any) {
    return handleError(error, "GET | GET DASHBAORD STATS", "/api/v1/dashboard/summary");
  }
}