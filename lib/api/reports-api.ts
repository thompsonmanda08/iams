import { delay } from "@/lib/utils/delay"

export interface Report {
  id: string
  title: string
  auditId: string
  auditTitle: string
  type: "draft" | "final" | "executive"
  status: "draft" | "review" | "approved" | "distributed"
  createdBy: string
  createdAt: string
  lastModified: string
  findings: number
  recipients: string[]
  version: number
}

export interface ActionItem {
  id: string
  auditId: string
  auditTitle: string
  finding: string
  actionRequired: string
  responsiblePerson: string
  department: string
  originalDueDate: string
  revisedDueDate?: string
  overdueDays: number
  status: "not_started" | "in_progress" | "completed" | "overdue"
  priority: "low" | "medium" | "high" | "critical"
  completionPercentage: number
  evidenceAttachments: number
  lastUpdate: string
}

const mockReports: Report[] = [
  {
    id: "RPT-2024-001",
    title: "IT Security Audit Report - Q1 2024",
    auditId: "AUD-2024-001",
    auditTitle: "IT Security Audit",
    type: "draft",
    status: "review",
    createdBy: "Jane Smith",
    createdAt: "2024-03-10",
    lastModified: "2024-03-15",
    findings: 12,
    recipients: ["IT Director", "CEO", "Audit Committee"],
    version: 2,
  },
  {
    id: "RPT-2024-002",
    title: "Financial Controls Review Report",
    auditId: "AUD-2024-002",
    auditTitle: "Financial Controls Review",
    type: "final",
    status: "approved",
    createdBy: "Mike Johnson",
    createdAt: "2024-02-20",
    lastModified: "2024-03-01",
    findings: 18,
    recipients: ["CFO", "Finance Manager", "Audit Committee"],
    version: 3,
  },
  {
    id: "RPT-2024-003",
    title: "Procurement Process Audit - Executive Summary",
    auditId: "AUD-2024-003",
    auditTitle: "Procurement Process Audit",
    type: "executive",
    status: "distributed",
    createdBy: "Sarah Williams",
    createdAt: "2024-01-15",
    lastModified: "2024-01-20",
    findings: 8,
    recipients: ["CEO", "Board of Directors"],
    version: 1,
  },
]

const mockActionItems: ActionItem[] = [
  {
    id: "ACT-001",
    auditId: "AUD-2024-001",
    auditTitle: "IT Security Audit",
    finding: "Weak Password Policy Implementation",
    actionRequired: "Implement strong password policy with complexity requirements",
    responsiblePerson: "IT Security Manager",
    department: "IT",
    originalDueDate: "2024-04-15",
    overdueDays: 0,
    status: "in_progress",
    priority: "high",
    completionPercentage: 60,
    evidenceAttachments: 2,
    lastUpdate: "2024-03-18",
  },
  {
    id: "ACT-002",
    auditId: "AUD-2024-001",
    auditTitle: "IT Security Audit",
    finding: "Missing Multi-Factor Authentication",
    actionRequired: "Enable MFA for all privileged accounts",
    responsiblePerson: "IT Director",
    department: "IT",
    originalDueDate: "2024-03-30",
    revisedDueDate: "2024-04-10",
    overdueDays: 0,
    status: "in_progress",
    priority: "critical",
    completionPercentage: 80,
    evidenceAttachments: 5,
    lastUpdate: "2024-03-19",
  },
  {
    id: "ACT-003",
    auditId: "AUD-2024-002",
    auditTitle: "Financial Controls Review",
    finding: "Inadequate Segregation of Duties",
    actionRequired: "Redesign approval workflow to ensure proper segregation",
    responsiblePerson: "Finance Manager",
    department: "Finance",
    originalDueDate: "2024-02-28",
    overdueDays: 20,
    status: "overdue",
    priority: "high",
    completionPercentage: 30,
    evidenceAttachments: 1,
    lastUpdate: "2024-03-05",
  },
  {
    id: "ACT-004",
    auditId: "AUD-2024-002",
    auditTitle: "Financial Controls Review",
    finding: "Missing Vendor Master Data Controls",
    actionRequired: "Implement vendor verification process",
    responsiblePerson: "Procurement Manager",
    department: "Procurement",
    originalDueDate: "2024-05-15",
    overdueDays: 0,
    status: "not_started",
    priority: "medium",
    completionPercentage: 0,
    evidenceAttachments: 0,
    lastUpdate: "2024-03-01",
  },
  {
    id: "ACT-005",
    auditId: "AUD-2023-015",
    auditTitle: "HR Process Audit",
    finding: "Incomplete Employee Onboarding Documentation",
    actionRequired: "Update and complete all employee files",
    responsiblePerson: "HR Manager",
    department: "HR",
    originalDueDate: "2024-01-31",
    overdueDays: 48,
    status: "overdue",
    priority: "medium",
    completionPercentage: 45,
    evidenceAttachments: 3,
    lastUpdate: "2024-02-15",
  },
]

export const reportsApi = {
  getAll: async (): Promise<Report[]> => {
    await delay(500)
    return Promise.resolve(mockReports)
  },

  getById: async (id: string): Promise<Report> => {
    await delay(400)
    const report = mockReports.find((r) => r.id === id)
    if (!report) throw new Error("Report not found")
    return Promise.resolve(report)
  },

  create: async (data: Partial<Report>): Promise<Report> => {
    await delay(600)
    const newReport: Report = {
      id: `RPT-2024-${String(mockReports.length + 1).padStart(3, "0")}`,
      title: data.title!,
      auditId: data.auditId!,
      auditTitle: data.auditTitle!,
      type: data.type || "draft",
      status: "draft",
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      findings: data.findings || 0,
      recipients: data.recipients || [],
      version: 1,
    }
    mockReports.push(newReport)
    return Promise.resolve(newReport)
  },

  distribute: async (id: string, recipients: string[]): Promise<void> => {
    await delay(800)
    const report = mockReports.find((r) => r.id === id)
    if (report) {
      report.status = "distributed"
      report.recipients = recipients
    }
    return Promise.resolve()
  },
}

export const actionsApi = {
  getAll: async (): Promise<ActionItem[]> => {
    await delay(500)
    return Promise.resolve(mockActionItems)
  },

  getById: async (id: string): Promise<ActionItem> => {
    await delay(400)
    const action = mockActionItems.find((a) => a.id === id)
    if (!action) throw new Error("Action not found")
    return Promise.resolve(action)
  },

  updateProgress: async (id: string, percentage: number): Promise<ActionItem> => {
    await delay(500)
    const action = mockActionItems.find((a) => a.id === id)
    if (!action) throw new Error("Action not found")
    action.completionPercentage = percentage
    action.lastUpdate = new Date().toISOString()
    if (percentage === 100) {
      action.status = "completed"
    } else if (percentage > 0) {
      action.status = "in_progress"
    }
    return Promise.resolve(action)
  },

  complete: async (id: string, evidence: File[]): Promise<ActionItem> => {
    await delay(800)
    const action = mockActionItems.find((a) => a.id === id)
    if (!action) throw new Error("Action not found")
    action.status = "completed"
    action.completionPercentage = 100
    action.evidenceAttachments += evidence.length
    action.lastUpdate = new Date().toISOString()
    return Promise.resolve(action)
  },

  getAgeAnalysis: async () => {
    await delay(500)
    return Promise.resolve({
      lessThan30: mockActionItems.filter((a) => a.overdueDays >= 0 && a.overdueDays < 30).length,
      between30And60: mockActionItems.filter((a) => a.overdueDays >= 30 && a.overdueDays < 60).length,
      between60And90: mockActionItems.filter((a) => a.overdueDays >= 60 && a.overdueDays < 90).length,
      moreThan90: mockActionItems.filter((a) => a.overdueDays >= 90).length,
    })
  },
}
