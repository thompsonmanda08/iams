// Mock API for audit planning and management

export interface AuditableArea {
  id: string
  name: string
  description: string
  department: string
  riskScore: number
  lastAuditDate: Date | null
  nextAuditDate: Date | null
  auditFrequency: "annual" | "biannual" | "quarterly" | "adhoc"
  priority: "low" | "medium" | "high" | "critical"
  isActive: boolean
}

export interface AuditPlan {
  id: string
  title: string
  fiscalYear: string
  status: "draft" | "submitted" | "approved" | "rejected" | "in-progress" | "completed"
  startDate: Date
  endDate: Date
  totalAudits: number
  completedAudits: number
  budget: number
  approvedBy?: string
  approvedDate?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface AuditEngagement {
  id: string
  auditPlanId: string
  auditableAreaId: string
  title: string
  auditType: "internal" | "compliance" | "performance" | "financial" | "operational"
  status: "planned" | "in-progress" | "fieldwork" | "reporting" | "completed"
  startDate: Date
  endDate: Date
  leadAuditor: string
  teamMembers: string[]
  estimatedHours: number
  actualHours?: number
  priority: "low" | "medium" | "high"
}

// Mock data
const mockAuditableAreas: AuditableArea[] = [
  {
    id: "1",
    name: "Financial Reporting",
    description: "Review of financial statement preparation and reporting processes",
    department: "Finance",
    riskScore: 85,
    lastAuditDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    nextAuditDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000),
    auditFrequency: "annual",
    priority: "high",
    isActive: true,
  },
  {
    id: "2",
    name: "IT Security Controls",
    description: "Assessment of information security controls and cybersecurity measures",
    department: "IT",
    riskScore: 92,
    lastAuditDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    nextAuditDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    auditFrequency: "biannual",
    priority: "critical",
    isActive: true,
  },
  {
    id: "3",
    name: "Procurement Process",
    description: "Review of procurement policies, procedures, and vendor management",
    department: "Operations",
    riskScore: 72,
    lastAuditDate: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000),
    nextAuditDate: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000),
    auditFrequency: "annual",
    priority: "medium",
    isActive: true,
  },
  {
    id: "4",
    name: "HR Payroll",
    description: "Audit of payroll processing and employee benefits administration",
    department: "HR",
    riskScore: 68,
    lastAuditDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    nextAuditDate: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000),
    auditFrequency: "annual",
    priority: "medium",
    isActive: true,
  },
  {
    id: "5",
    name: "Regulatory Compliance",
    description: "Assessment of compliance with regulatory requirements",
    department: "Compliance",
    riskScore: 88,
    lastAuditDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    nextAuditDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    auditFrequency: "biannual",
    priority: "high",
    isActive: true,
  },
]

const mockAuditPlans: AuditPlan[] = [
  {
    id: "1",
    title: "Annual Audit Plan 2024",
    fiscalYear: "2024",
    status: "in-progress",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    totalAudits: 12,
    completedAudits: 7,
    budget: 500000,
    approvedBy: "Chief Executive",
    approvedDate: new Date("2023-12-15"),
    createdBy: "Audit Manager",
    createdAt: new Date("2023-11-01"),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Annual Audit Plan 2025",
    fiscalYear: "2025",
    status: "draft",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    totalAudits: 15,
    completedAudits: 0,
    budget: 550000,
    createdBy: "Audit Manager",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
]

const mockAuditEngagements: AuditEngagement[] = [
  {
    id: "1",
    auditPlanId: "1",
    auditableAreaId: "1",
    title: "Q4 Financial Reporting Audit",
    auditType: "financial",
    status: "in-progress",
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    leadAuditor: "John Doe",
    teamMembers: ["Jane Smith", "Mike Johnson"],
    estimatedHours: 120,
    actualHours: 65,
    priority: "high",
  },
  {
    id: "2",
    auditPlanId: "1",
    auditableAreaId: "2",
    title: "IT Security Assessment",
    auditType: "compliance",
    status: "planned",
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    leadAuditor: "Sarah Williams",
    teamMembers: ["David Lee"],
    estimatedHours: 160,
    priority: "high",
  },
  {
    id: "3",
    auditPlanId: "1",
    auditableAreaId: "3",
    title: "Procurement Process Review",
    auditType: "operational",
    status: "completed",
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    leadAuditor: "Mike Johnson",
    teamMembers: ["Emily Brown"],
    estimatedHours: 80,
    actualHours: 85,
    priority: "medium",
  },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const auditsApi = {
  // Auditable Areas
  async getAuditableAreas(): Promise<AuditableArea[]> {
    await delay(600)
    return mockAuditableAreas
  },

  async createAuditableArea(data: Omit<AuditableArea, "id">): Promise<AuditableArea> {
    await delay(700)
    const newArea: AuditableArea = {
      ...data,
      id: `${mockAuditableAreas.length + 1}`,
    }
    mockAuditableAreas.push(newArea)
    return newArea
  },

  async updateAuditableArea(id: string, data: Partial<AuditableArea>): Promise<AuditableArea> {
    await delay(700)
    const index = mockAuditableAreas.findIndex((a) => a.id === id)
    if (index === -1) throw new Error("Auditable area not found")
    mockAuditableAreas[index] = { ...mockAuditableAreas[index], ...data }
    return mockAuditableAreas[index]
  },

  async deleteAuditableArea(id: string): Promise<void> {
    await delay(500)
    const index = mockAuditableAreas.findIndex((a) => a.id === id)
    if (index === -1) throw new Error("Auditable area not found")
    mockAuditableAreas.splice(index, 1)
  },

  // Audit Plans
  async getAuditPlans(): Promise<AuditPlan[]> {
    await delay(600)
    return mockAuditPlans
  },

  async getAuditPlanById(id: string): Promise<AuditPlan> {
    await delay(400)
    const plan = mockAuditPlans.find((p) => p.id === id)
    if (!plan) throw new Error("Audit plan not found")
    return plan
  },

  async createAuditPlan(data: Omit<AuditPlan, "id" | "createdAt" | "updatedAt">): Promise<AuditPlan> {
    await delay(800)
    const newPlan: AuditPlan = {
      ...data,
      id: `${mockAuditPlans.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockAuditPlans.push(newPlan)
    return newPlan
  },

  async updateAuditPlan(id: string, data: Partial<AuditPlan>): Promise<AuditPlan> {
    await delay(700)
    const index = mockAuditPlans.findIndex((p) => p.id === id)
    if (index === -1) throw new Error("Audit plan not found")
    mockAuditPlans[index] = { ...mockAuditPlans[index], ...data, updatedAt: new Date() }
    return mockAuditPlans[index]
  },

  async deleteAuditPlan(id: string): Promise<void> {
    await delay(500)
    const index = mockAuditPlans.findIndex((p) => p.id === id)
    if (index === -1) throw new Error("Audit plan not found")
    mockAuditPlans.splice(index, 1)
  },

  // Audit Engagements
  async getAuditEngagements(planId?: string): Promise<AuditEngagement[]> {
    await delay(600)
    if (planId) {
      return mockAuditEngagements.filter((e) => e.auditPlanId === planId)
    }
    return mockAuditEngagements
  },

  async createAuditEngagement(data: Omit<AuditEngagement, "id">): Promise<AuditEngagement> {
    await delay(700)
    const newEngagement: AuditEngagement = {
      ...data,
      id: `${mockAuditEngagements.length + 1}`,
    }
    mockAuditEngagements.push(newEngagement)
    return newEngagement
  },

  async updateAuditEngagement(id: string, data: Partial<AuditEngagement>): Promise<AuditEngagement> {
    await delay(700)
    const index = mockAuditEngagements.findIndex((e) => e.id === id)
    if (index === -1) throw new Error("Audit engagement not found")
    mockAuditEngagements[index] = { ...mockAuditEngagements[index], ...data }
    return mockAuditEngagements[index]
  },

  async deleteAuditEngagement(id: string): Promise<void> {
    await delay(500)
    const index = mockAuditEngagements.findIndex((e) => e.id === id)
    if (index === -1) throw new Error("Audit engagement not found")
    mockAuditEngagements.splice(index, 1)
  },
}
