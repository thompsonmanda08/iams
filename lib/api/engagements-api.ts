import { delay } from "@/lib/utils/delay"

export interface AuditEngagement {
  id: string
  auditId: string
  auditTitle: string
  status: "planning" | "fieldwork" | "reporting" | "completed"
  leadAuditor: string
  teamMembers: string[]
  startDate: string
  endDate: string
  progress: number
  findings: number
  workpapers: number
  observations: number
}

export interface Finding {
  id: string
  engagementId: string
  title: string
  description: string
  category: string
  severity: "critical" | "high" | "medium" | "low"
  condition: string
  criteria: string
  cause: string
  consequence: string
  recommendation: string
  status: "draft" | "submitted" | "under_review" | "closed"
  assignedTo: string
  dueDate: string
  createdAt: string
  attachments: number
}

export interface Workpaper {
  id: string
  engagementId: string
  name: string
  type: "document" | "spreadsheet" | "image" | "pdf"
  size: number
  uploadedBy: string
  uploadedAt: string
  version: number
  status: "draft" | "reviewed" | "approved"
}

const mockEngagements: AuditEngagement[] = [
  {
    id: "1",
    auditId: "AUD-2024-001",
    auditTitle: "IT Security Audit - Q1 2024",
    status: "fieldwork",
    leadAuditor: "Jane Smith",
    teamMembers: ["John Doe", "Mike Johnson", "Sarah Williams"],
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    progress: 65,
    findings: 12,
    workpapers: 45,
    observations: 8,
  },
  {
    id: "2",
    auditId: "AUD-2024-002",
    auditTitle: "Financial Controls Review",
    status: "reporting",
    leadAuditor: "Mike Johnson",
    teamMembers: ["Jane Smith", "Sarah Williams"],
    startDate: "2024-02-01",
    endDate: "2024-04-01",
    progress: 85,
    findings: 18,
    workpapers: 62,
    observations: 15,
  },
  {
    id: "3",
    auditId: "AUD-2024-003",
    auditTitle: "Procurement Process Audit",
    status: "planning",
    leadAuditor: "Sarah Williams",
    teamMembers: ["John Doe", "Mike Johnson"],
    startDate: "2024-03-01",
    endDate: "2024-05-01",
    progress: 25,
    findings: 3,
    workpapers: 15,
    observations: 2,
  },
]

const mockFindings: Finding[] = [
  {
    id: "F001",
    engagementId: "1",
    title: "Weak Password Policy Implementation",
    description: "Current password policy does not enforce complexity requirements",
    category: "Access Control",
    severity: "high",
    condition: "Users can set simple passwords without complexity requirements",
    criteria: "ISO 27001 requires strong password policies with minimum 12 characters",
    cause: "System configuration not properly set during initial deployment",
    consequence: "Increased risk of unauthorized access through password guessing",
    recommendation: "Implement strong password policy with complexity requirements",
    status: "submitted",
    assignedTo: "IT Security Manager",
    dueDate: "2024-04-15",
    createdAt: "2024-02-10",
    attachments: 3,
  },
  {
    id: "F002",
    engagementId: "1",
    title: "Missing Multi-Factor Authentication",
    description: "MFA not enabled for privileged accounts",
    category: "Authentication",
    severity: "critical",
    condition: "Admin accounts do not require MFA for login",
    criteria: "Security policy mandates MFA for all privileged access",
    cause: "MFA rollout incomplete for legacy systems",
    consequence: "High risk of account compromise and unauthorized access",
    recommendation: "Enable MFA for all privileged accounts immediately",
    status: "under_review",
    assignedTo: "IT Director",
    dueDate: "2024-03-30",
    createdAt: "2024-02-12",
    attachments: 5,
  },
]

const mockWorkpapers: Workpaper[] = [
  {
    id: "WP001",
    engagementId: "1",
    name: "User Access Review.xlsx",
    type: "spreadsheet",
    size: 245000,
    uploadedBy: "Jane Smith",
    uploadedAt: "2024-02-05",
    version: 2,
    status: "reviewed",
  },
  {
    id: "WP002",
    engagementId: "1",
    name: "Security Configuration Report.pdf",
    type: "pdf",
    size: 1200000,
    uploadedBy: "John Doe",
    uploadedAt: "2024-02-08",
    version: 1,
    status: "approved",
  },
  {
    id: "WP003",
    engagementId: "1",
    name: "Network Diagram.png",
    type: "image",
    size: 850000,
    uploadedBy: "Mike Johnson",
    uploadedAt: "2024-02-10",
    version: 1,
    status: "draft",
  },
]

export const engagementsApi = {
  getAll: async (): Promise<AuditEngagement[]> => {
    await delay(500)
    return Promise.resolve(mockEngagements)
  },

  getById: async (id: string): Promise<AuditEngagement> => {
    await delay(400)
    const engagement = mockEngagements.find((e) => e.id === id)
    if (!engagement) throw new Error("Engagement not found")
    return Promise.resolve(engagement)
  },

  getFindings: async (engagementId: string): Promise<Finding[]> => {
    await delay(500)
    return Promise.resolve(mockFindings.filter((f) => f.engagementId === engagementId))
  },

  createFinding: async (data: Partial<Finding>): Promise<Finding> => {
    await delay(600)
    const newFinding: Finding = {
      id: `F${String(mockFindings.length + 1).padStart(3, "0")}`,
      engagementId: data.engagementId!,
      title: data.title!,
      description: data.description!,
      category: data.category!,
      severity: data.severity!,
      condition: data.condition!,
      criteria: data.criteria!,
      cause: data.cause!,
      consequence: data.consequence!,
      recommendation: data.recommendation!,
      status: "draft",
      assignedTo: data.assignedTo!,
      dueDate: data.dueDate!,
      createdAt: new Date().toISOString(),
      attachments: 0,
    }
    mockFindings.push(newFinding)
    return Promise.resolve(newFinding)
  },

  getWorkpapers: async (engagementId: string): Promise<Workpaper[]> => {
    await delay(500)
    return Promise.resolve(mockWorkpapers.filter((w) => w.engagementId === engagementId))
  },

  uploadWorkpaper: async (engagementId: string, file: File): Promise<Workpaper> => {
    await delay(1000)
    const newWorkpaper: Workpaper = {
      id: `WP${String(mockWorkpapers.length + 1).padStart(3, "0")}`,
      engagementId,
      name: file.name,
      type: file.type.includes("pdf")
        ? "pdf"
        : file.type.includes("image")
          ? "image"
          : file.type.includes("sheet")
            ? "spreadsheet"
            : "document",
      size: file.size,
      uploadedBy: "Current User",
      uploadedAt: new Date().toISOString(),
      version: 1,
      status: "draft",
    }
    mockWorkpapers.push(newWorkpaper)
    return Promise.resolve(newWorkpaper)
  },
}
