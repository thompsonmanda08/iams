// Mock API for risk management

export interface Risk {
  id: string
  riskId: string
  title: string
  description: string
  category: string
  businessUnit: string
  process: string
  inherentImpact: number
  inherentLikelihood: number
  inherentScore: number
  residualImpact: number
  residualLikelihood: number
  residualScore: number
  riskMagnitude: "low" | "medium" | "high" | "critical"
  status: "open" | "closed" | "monitoring"
  owner: string
  mitigationStrategy: string
  controls: string[]
  createdAt: Date
  updatedAt: Date
}

export interface RiskQueryParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: string
  magnitude?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface HeatMapData {
  impact: number
  likelihood: number
  count: number
  risks: Array<{ id: string; title: string }>
}

export interface KRI {
  id: string
  name: string
  description: string
  category: string
  currentValue: number
  targetValue: number
  threshold: number
  unit: string
  trend: "up" | "down" | "stable"
  status: "normal" | "warning" | "critical"
  lastUpdated: Date
}

// Mock risks database
const mockRisks: Risk[] = [
  {
    id: "1",
    riskId: "RSK-2024-001",
    title: "Cybersecurity Breach",
    description: "Potential unauthorized access to sensitive data systems",
    category: "IT Security",
    businessUnit: "Information Technology",
    process: "Data Management",
    inherentImpact: 5,
    inherentLikelihood: 4,
    inherentScore: 20,
    residualImpact: 3,
    residualLikelihood: 2,
    residualScore: 6,
    riskMagnitude: "high",
    status: "open",
    owner: "John Doe",
    mitigationStrategy: "Implement multi-factor authentication and regular security audits",
    controls: ["Firewall", "Antivirus", "Access Controls"],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    riskId: "RSK-2024-002",
    title: "Regulatory Non-Compliance",
    description: "Failure to comply with new financial regulations",
    category: "Compliance",
    businessUnit: "Finance",
    process: "Financial Reporting",
    inherentImpact: 4,
    inherentLikelihood: 3,
    inherentScore: 12,
    residualImpact: 2,
    residualLikelihood: 2,
    residualScore: 4,
    riskMagnitude: "medium",
    status: "monitoring",
    owner: "Jane Smith",
    mitigationStrategy: "Regular compliance training and policy updates",
    controls: ["Compliance Monitoring", "Policy Framework"],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    riskId: "RSK-2024-003",
    title: "Supply Chain Disruption",
    description: "Potential delays in critical supply deliveries",
    category: "Operational",
    businessUnit: "Operations",
    process: "Supply Chain Management",
    inherentImpact: 4,
    inherentLikelihood: 4,
    inherentScore: 16,
    residualImpact: 3,
    residualLikelihood: 3,
    residualScore: 9,
    riskMagnitude: "high",
    status: "open",
    owner: "Mike Johnson",
    mitigationStrategy: "Diversify suppliers and maintain buffer inventory",
    controls: ["Supplier Agreements", "Inventory Management"],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    riskId: "RSK-2024-004",
    title: "Market Volatility",
    description: "Significant fluctuations in market conditions affecting revenue",
    category: "Strategic",
    businessUnit: "Strategy",
    process: "Strategic Planning",
    inherentImpact: 5,
    inherentLikelihood: 3,
    inherentScore: 15,
    residualImpact: 4,
    residualLikelihood: 3,
    residualScore: 12,
    riskMagnitude: "high",
    status: "open",
    owner: "Sarah Williams",
    mitigationStrategy: "Diversify revenue streams and hedge against volatility",
    controls: ["Market Analysis", "Risk Hedging"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    riskId: "RSK-2024-005",
    title: "Fraud Risk",
    description: "Potential internal or external fraudulent activities",
    category: "Financial",
    businessUnit: "Finance",
    process: "Financial Controls",
    inherentImpact: 5,
    inherentLikelihood: 2,
    inherentScore: 10,
    residualImpact: 2,
    residualLikelihood: 1,
    residualScore: 2,
    riskMagnitude: "low",
    status: "monitoring",
    owner: "David Lee",
    mitigationStrategy: "Strengthen internal controls and conduct regular audits",
    controls: ["Segregation of Duties", "Audit Trail", "Approval Workflows"],
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
]

const mockKRIs: KRI[] = [
  {
    id: "1",
    name: "System Downtime",
    description: "Percentage of unplanned system downtime",
    category: "IT Security",
    currentValue: 2.5,
    targetValue: 1.0,
    threshold: 3.0,
    unit: "%",
    trend: "down",
    status: "warning",
    lastUpdated: new Date(),
  },
  {
    id: "2",
    name: "Compliance Violations",
    description: "Number of regulatory compliance violations",
    category: "Compliance",
    currentValue: 0,
    targetValue: 0,
    threshold: 2,
    unit: "count",
    trend: "stable",
    status: "normal",
    lastUpdated: new Date(),
  },
  {
    id: "3",
    name: "Fraud Incidents",
    description: "Number of detected fraud incidents",
    category: "Financial",
    currentValue: 1,
    targetValue: 0,
    threshold: 3,
    unit: "count",
    trend: "stable",
    status: "warning",
    lastUpdated: new Date(),
  },
  {
    id: "4",
    name: "Supplier Delays",
    description: "Percentage of delayed supplier deliveries",
    category: "Operational",
    currentValue: 8,
    targetValue: 5,
    threshold: 10,
    unit: "%",
    trend: "up",
    status: "warning",
    lastUpdated: new Date(),
  },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const risksApi = {
  // Get all risks with pagination and filters
  async getAll(params: RiskQueryParams = {}): Promise<{ data: Risk[]; meta: any }> {
    await delay(600)

    let filtered = [...mockRisks]

    // Apply filters
    if (params.search) {
      const search = params.search.toLowerCase()
      filtered = filtered.filter(
        (risk) =>
          risk.title.toLowerCase().includes(search) ||
          risk.description.toLowerCase().includes(search) ||
          risk.riskId.toLowerCase().includes(search),
      )
    }

    if (params.category) {
      filtered = filtered.filter((risk) => risk.category === params.category)
    }

    if (params.status) {
      filtered = filtered.filter((risk) => risk.status === params.status)
    }

    if (params.magnitude) {
      filtered = filtered.filter((risk) => risk.riskMagnitude === params.magnitude)
    }

    // Apply sorting
    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[params.sortBy as keyof Risk]
        const bVal = b[params.sortBy as keyof Risk]
        if (aVal === undefined || bVal === undefined) return 0
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        return params.sortOrder === "desc" ? -comparison : comparison
      })
    }

    // Apply pagination
    const page = params.page || 1
    const limit = params.limit || 10
    const start = (page - 1) * limit
    const end = start + limit

    return {
      data: filtered.slice(start, end),
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    }
  },

  // Get single risk
  async getById(id: string): Promise<Risk> {
    await delay(400)
    const risk = mockRisks.find((r) => r.id === id)
    if (!risk) throw new Error("Risk not found")
    return risk
  },

  // Get heat map data
  async getHeatMap(): Promise<HeatMapData[]> {
    await delay(700)

    const heatMapData: HeatMapData[] = []

    for (let impact = 1; impact <= 5; impact++) {
      for (let likelihood = 1; likelihood <= 5; likelihood++) {
        const risks = mockRisks.filter((r) => r.residualImpact === impact && r.residualLikelihood === likelihood)

        heatMapData.push({
          impact,
          likelihood,
          count: risks.length,
          risks: risks.map((r) => ({ id: r.id, title: r.title })),
        })
      }
    }

    return heatMapData
  },

  // Get KRIs
  async getKRIs(): Promise<KRI[]> {
    await delay(600)
    return mockKRIs
  },

  // Create risk
  async create(data: Omit<Risk, "id" | "createdAt" | "updatedAt">): Promise<Risk> {
    await delay(800)
    const newRisk: Risk = {
      ...data,
      id: `${mockRisks.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockRisks.push(newRisk)
    return newRisk
  },

  // Update risk
  async update(id: string, data: Partial<Risk>): Promise<Risk> {
    await delay(700)
    const index = mockRisks.findIndex((r) => r.id === id)
    if (index === -1) throw new Error("Risk not found")
    mockRisks[index] = { ...mockRisks[index], ...data, updatedAt: new Date() }
    return mockRisks[index]
  },

  // Delete risk
  async delete(id: string): Promise<void> {
    await delay(500)
    const index = mockRisks.findIndex((r) => r.id === id)
    if (index === -1) throw new Error("Risk not found")
    mockRisks.splice(index, 1)
  },
}
