import PageHeader from "@/components/page-header";
import { getActions } from "@/app/_actions/risk-module-actions";
import { ActionsLogsCards } from "@/app/dashboard/(modules)/risks/_components/actions-logs-cards";
import type { ActionDefinition } from "@/app/_actions/risk-module-actions";

export const dynamic = "force-dynamic";

// Mock data for demonstration
const MOCK_ACTIONS: ActionDefinition[] = [
  {
    action: {
      id: "act-001",
      organization_id: "org-123",
      risk: "Data Breach Risk",
      risk_id: "risk-001",
      instructions:
        "Implement encryption for sensitive data storage and implement multi-factor authentication for all admin accounts",
      executer_id: "user-001",
      reviewer_id: "user-003",
      due_date: "2025-01-15",
      overdue_by: 0,
      status: "COMPLETED",
      completion_date: "2024-12-20",
      created_by: "user-002",
      created_at: "2024-11-01",
      updated_by: "user-003",
      updated_at: "2024-12-20"
    },
    task: {
      id: "task-001",
      organization_id: "org-123",
      action_id: "act-001",
      assigned_to: "user-001",
      task_type: "EXECUTION",
      status: "COMPLETED",
      due_date: "2025-01-15",
      created_at: "2024-11-01",
      updated_at: "2024-12-20"
    },
    execution: {
      id: "exec-001",
      organization_id: "org-123",
      action_id: "act-001",
      executor_id: "user-001",
      evidence_description:
        "Implemented AES-256 encryption for database at rest. Configured AWS KMS for key management. All admin accounts now require 2FA via Google Authenticator.",
      evidence_file_url: "https://example.com/encryption-report.pdf",
      evidence_file_name: "encryption-implementation-report.pdf",
      evidence_file_type: "application/pdf",
      status: "SUBMITTED",
      submitted_at: "2024-12-15T10:30:00Z",
      created_by: "user-001",
      created_at: "2024-12-15T10:30:00Z",
      updated_by: "user-003",
      updated_at: "2024-12-20T14:22:00Z"
    },
    executer_name: "Alice Johnson",
    executer_email: "alice.johnson@infratel.com",
    reviewer_name: "Bob Smith",
    reviewer_email: "bob.smith@infratel.com"
  },
  {
    action: {
      id: "act-002",
      organization_id: "org-123",
      risk: "Operational Downtime",
      risk_id: "risk-002",
      instructions:
        "Establish redundant systems and disaster recovery procedures for critical infrastructure",
      executer_id: "user-002",
      reviewer_id: "user-004",
      due_date: "2025-02-10",
      overdue_by: 0,
      status: "IN_PROGRESS",
      completion_date: null,
      created_by: "user-002",
      created_at: "2024-11-05",
      updated_by: null,
      updated_at: "2024-12-01"
    },
    task: {
      id: "task-002",
      organization_id: "org-123",
      action_id: "act-002",
      assigned_to: "user-002",
      task_type: "EXECUTION",
      status: "IN_PROGRESS",
      due_date: "2025-02-10",
      created_at: "2024-11-05",
      updated_at: "2024-12-01"
    },
    execution: {
      id: "exec-002",
      organization_id: "org-123",
      action_id: "act-002",
      executor_id: "user-002",
      evidence_description:
        "Completed Phase 1: Deployed secondary database cluster in AWS region. Phase 2: Testing failover mechanism scheduled for next week. RTO: 15 minutes, RPO: 5 minutes.",
      evidence_file_url: "https://example.com/dr-plan-phase1.docx",
      evidence_file_name: "disaster-recovery-plan-phase1.docx",
      evidence_file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      status: "SUBMITTED",
      submitted_at: "2024-12-10T15:45:00Z",
      created_by: "user-002",
      created_at: "2024-12-10T15:45:00Z",
      updated_by: null,
      updated_at: "2024-12-10T15:45:00Z"
    },
    executer_name: "Charlie Brown",
    executer_email: "charlie.brown@infratel.com",
    reviewer_name: "Diana Prince",
    reviewer_email: "diana.prince@infratel.com"
  },
  {
    action: {
      id: "act-003",
      organization_id: "org-123",
      risk: "Compliance Violation",
      risk_id: "risk-003",
      instructions:
        "Conduct compliance audit and implement necessary controls to meet GDPR requirements",
      executer_id: "user-005",
      reviewer_id: "user-006",
      due_date: "2025-01-30",
      overdue_by: 0,
      status: "PENDING",
      completion_date: null,
      created_by: "user-002",
      created_at: "2024-11-10",
      updated_by: null,
      updated_at: "2024-11-10"
    },
    task: {
      id: "task-003",
      organization_id: "org-123",
      action_id: "act-003",
      assigned_to: "user-005",
      task_type: "EXECUTION",
      status: "PENDING",
      due_date: "2025-01-30",
      created_at: "2024-11-10",
      updated_at: "2024-11-10"
    },
    execution: null,
    executer_name: "Emma Davis",
    executer_email: "emma.davis@infratel.com",
    reviewer_name: "Frank Wilson",
    reviewer_email: "frank.wilson@infratel.com"
  },
  {
    action: {
      id: "act-004",
      organization_id: "org-123",
      risk: "Third-Party Vendor Risk",
      risk_id: "risk-004",
      instructions:
        "Conduct vendor security assessment and implement vendor risk management framework",
      executer_id: "user-007",
      reviewer_id: "user-008",
      due_date: "2025-01-20",
      overdue_by: 0,
      status: "IN_PROGRESS",
      completion_date: null,
      created_by: "user-002",
      created_at: "2024-11-08",
      updated_by: null,
      updated_at: "2024-12-05"
    },
    task: {
      id: "task-004",
      organization_id: "org-123",
      action_id: "act-004",
      assigned_to: "user-007",
      task_type: "EXECUTION",
      status: "IN_PROGRESS",
      due_date: "2025-01-20",
      created_at: "2024-11-08",
      updated_at: "2024-12-05"
    },
    execution: null,
    executer_name: "Grace Lee",
    executer_email: "grace.lee@infratel.com",
    reviewer_name: "Henry Martinez",
    reviewer_email: "henry.martinez@infratel.com"
  },
  {
    action: {
      id: "act-005",
      organization_id: "org-123",
      risk: "System Vulnerability",
      risk_id: "risk-005",
      instructions: "Apply security patches and conduct vulnerability assessment for all systems",
      executer_id: "user-009",
      reviewer_id: "user-010",
      due_date: "2024-12-31",
      overdue_by: 8,
      status: "PENDING",
      completion_date: null,
      created_by: "user-002",
      created_at: "2024-10-20",
      updated_by: null,
      updated_at: "2024-10-20"
    },
    task: {
      id: "task-005",
      organization_id: "org-123",
      action_id: "act-005",
      assigned_to: "user-009",
      task_type: "EXECUTION",
      status: "PENDING",
      due_date: "2024-12-31",
      created_at: "2024-10-20",
      updated_at: "2024-10-20"
    },
    execution: null,
    executer_name: "Iris Johnson",
    executer_email: "iris.johnson@infratel.com",
    reviewer_name: "Jack Thompson",
    reviewer_email: "jack.thompson@infratel.com"
  },
  {
    action: {
      id: "act-006",
      organization_id: "org-123",
      risk: "Staff Training Gap",
      risk_id: "risk-006",
      instructions: "Develop and deliver security awareness training program for all staff",
      executer_id: "user-011",
      reviewer_id: "user-012",
      due_date: "2025-03-15",
      overdue_by: 0,
      status: "COMPLETED",
      completion_date: "2024-12-22",
      created_by: "user-002",
      created_at: "2024-11-12",
      updated_by: "user-012",
      updated_at: "2024-12-22"
    },
    task: {
      id: "task-006",
      organization_id: "org-123",
      action_id: "act-006",
      assigned_to: "user-011",
      task_type: "EXECUTION",
      status: "COMPLETED",
      due_date: "2025-03-15",
      created_at: "2024-11-12",
      updated_at: "2024-12-22"
    },
    execution: {
      id: "exec-006",
      organization_id: "org-123",
      action_id: "act-006",
      executor_id: "user-011",
      evidence_description:
        "Completed security awareness training for all 250+ employees. Training covered phishing awareness, password management, data handling, and incident reporting. Completion rate: 100%. Average score: 92/100.",
      evidence_file_url: "https://example.com/training-completion-report.xlsx",
      evidence_file_name: "training-completion-report.xlsx",
      evidence_file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      status: "SUBMITTED",
      submitted_at: "2024-12-18T09:15:00Z",
      created_by: "user-011",
      created_at: "2024-12-18T09:15:00Z",
      updated_by: "user-012",
      updated_at: "2024-12-22T11:30:00Z"
    },
    executer_name: "Karen White",
    executer_email: "karen.white@infratel.com",
    reviewer_name: "Leo Anderson",
    reviewer_email: "leo.anderson@infratel.com"
  }
];

export default async function ActionLogsPage() {
  // Fetch initial actions
  // const response = await getActions({
  //   page: 1,
  //   page_size: 50
  // });
  // const actions = response.success && response.data?.data ? response.data.data || [] : MOCK_ACTIONS;
  const actions = MOCK_ACTIONS;

  return (
    <main className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Action Logs"
            description="Complete history of all actions with execution status and evidence submissions"
            icon="FileText"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ActionsLogsCards initialActions={MOCK_ACTIONS} />

        {/* Status Legend */}
        <div className="mt-6 rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">📊 Status Legend</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded border-l-4 border-yellow-500 bg-yellow-50 p-3">
              <p className="text-sm font-semibold">OPEN</p>
              <p className="text-xs text-gray-600">Action assigned, waiting for submission</p>
            </div>
            <div className="rounded border-l-4 border-blue-500 bg-blue-50 p-3">
              <p className="text-sm font-semibold">PENDING_REVIEW</p>
              <p className="text-xs text-gray-600">Evidence submitted, awaiting assessment</p>
            </div>
            <div className="rounded border-l-4 border-green-500 bg-green-50 p-3">
              <p className="text-sm font-semibold">COMPLETED</p>
              <p className="text-xs text-gray-600">Approved, risk mitigation confirmed</p>
            </div>
            <div className="rounded border-l-4 border-red-500 bg-red-50 p-3">
              <p className="text-sm font-semibold">NEEDS_REVISION</p>
              <p className="text-xs text-gray-600">Rejected, more action required</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
