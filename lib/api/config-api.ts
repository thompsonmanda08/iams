// Mock API for system configuration

export interface RiskCategory {
  id: string
  name: string
  description: string
  color: string
  order: number
  isActive: boolean
}

export interface RiskLevel {
  id: string
  level: number
  name: string
  description: string
  color: string
  minScore: number
  maxScore: number
}

export interface Province {
  id: string
  name: string
  code: string
  isActive: boolean
}

export interface Town {
  id: string
  name: string
  provinceId: string
  isActive: boolean
}

export interface Branch {
  id: string
  name: string
  code: string
  townId: string
  address?: string
  isActive: boolean
}

// Mock data
const mockRiskCategories: RiskCategory[] = [
  {
    id: "1",
    name: "Financial",
    description: "Risks related to financial operations and reporting",
    color: "#3b82f6",
    order: 1,
    isActive: true,
  },
  {
    id: "2",
    name: "Operational",
    description: "Risks in day-to-day business operations",
    color: "#10b981",
    order: 2,
    isActive: true,
  },
  {
    id: "3",
    name: "Compliance",
    description: "Regulatory and legal compliance risks",
    color: "#f59e0b",
    order: 3,
    isActive: true,
  },
  {
    id: "4",
    name: "Strategic",
    description: "Risks affecting long-term business strategy",
    color: "#8b5cf6",
    order: 4,
    isActive: true,
  },
  {
    id: "5",
    name: "IT Security",
    description: "Information technology and cybersecurity risks",
    color: "#ef4444",
    order: 5,
    isActive: true,
  },
]

const mockRiskLevels: RiskLevel[] = [
  { id: "1", level: 1, name: "Very Low", description: "Minimal impact", color: "#10b981", minScore: 1, maxScore: 4 },
  { id: "2", level: 2, name: "Low", description: "Minor impact", color: "#84cc16", minScore: 5, maxScore: 9 },
  { id: "3", level: 3, name: "Medium", description: "Moderate impact", color: "#f59e0b", minScore: 10, maxScore: 14 },
  { id: "4", level: 4, name: "High", description: "Significant impact", color: "#f97316", minScore: 15, maxScore: 19 },
  {
    id: "5",
    level: 5,
    name: "Critical",
    description: "Severe impact",
    color: "#ef4444",
    minScore: 20,
    maxScore: 25,
  },
]

const mockProvinces: Province[] = [
  { id: "1", name: "Lusaka", code: "LSK", isActive: true },
  { id: "2", name: "Copperbelt", code: "CPB", isActive: true },
  { id: "3", name: "Southern", code: "STH", isActive: true },
  { id: "4", name: "Eastern", code: "EST", isActive: true },
  { id: "5", name: "Western", code: "WST", isActive: true },
]

const mockTowns: Town[] = [
  { id: "1", name: "Lusaka City", provinceId: "1", isActive: true },
  { id: "2", name: "Chilanga", provinceId: "1", isActive: true },
  { id: "3", name: "Kafue", provinceId: "1", isActive: true },
  { id: "4", name: "Ndola", provinceId: "2", isActive: true },
  { id: "5", name: "Kitwe", provinceId: "2", isActive: true },
  { id: "6", name: "Chingola", provinceId: "2", isActive: true },
  { id: "7", name: "Livingstone", provinceId: "3", isActive: true },
  { id: "8", name: "Choma", provinceId: "3", isActive: true },
  { id: "9", name: "Chipata", provinceId: "4", isActive: true },
  { id: "10", name: "Mongu", provinceId: "5", isActive: true },
]

const mockBranches: Branch[] = [
  { id: "1", name: "Head Office", code: "HO001", townId: "1", address: "Cairo Road, Lusaka", isActive: true },
  { id: "2", name: "Lusaka Branch 1", code: "LSK001", townId: "1", address: "Great East Road", isActive: true },
  { id: "3", name: "Chilanga Branch", code: "CHL001", townId: "2", address: "Main Street", isActive: true },
  { id: "4", name: "Ndola Branch", code: "NDL001", townId: "4", address: "Broadway", isActive: true },
  { id: "5", name: "Kitwe Branch", code: "KTW001", townId: "5", address: "Independence Avenue", isActive: true },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const configApi = {
  // Risk Categories
  async getRiskCategories(): Promise<RiskCategory[]> {
    await delay(500)
    return mockRiskCategories
  },

  async createRiskCategory(data: Omit<RiskCategory, "id">): Promise<RiskCategory> {
    await delay(600)
    const newCategory: RiskCategory = {
      ...data,
      id: `${mockRiskCategories.length + 1}`,
    }
    mockRiskCategories.push(newCategory)
    return newCategory
  },

  async updateRiskCategory(id: string, data: Partial<RiskCategory>): Promise<RiskCategory> {
    await delay(600)
    const index = mockRiskCategories.findIndex((c) => c.id === id)
    if (index === -1) throw new Error("Category not found")
    mockRiskCategories[index] = { ...mockRiskCategories[index], ...data }
    return mockRiskCategories[index]
  },

  async deleteRiskCategory(id: string): Promise<void> {
    await delay(500)
    const index = mockRiskCategories.findIndex((c) => c.id === id)
    if (index === -1) throw new Error("Category not found")
    mockRiskCategories.splice(index, 1)
  },

  // Risk Levels
  async getRiskLevels(): Promise<RiskLevel[]> {
    await delay(500)
    return mockRiskLevels
  },

  async updateRiskLevel(id: string, data: Partial<RiskLevel>): Promise<RiskLevel> {
    await delay(600)
    const index = mockRiskLevels.findIndex((l) => l.id === id)
    if (index === -1) throw new Error("Level not found")
    mockRiskLevels[index] = { ...mockRiskLevels[index], ...data }
    return mockRiskLevels[index]
  },

  // Provinces
  async getProvinces(): Promise<Province[]> {
    await delay(500)
    return mockProvinces
  },

  async createProvince(data: Omit<Province, "id">): Promise<Province> {
    await delay(600)
    const newProvince: Province = {
      ...data,
      id: `${mockProvinces.length + 1}`,
    }
    mockProvinces.push(newProvince)
    return newProvince
  },

  async updateProvince(id: string, data: Partial<Province>): Promise<Province> {
    await delay(600)
    const index = mockProvinces.findIndex((p) => p.id === id)
    if (index === -1) throw new Error("Province not found")
    mockProvinces[index] = { ...mockProvinces[index], ...data }
    return mockProvinces[index]
  },

  async deleteProvince(id: string): Promise<void> {
    await delay(500)
    const index = mockProvinces.findIndex((p) => p.id === id)
    if (index === -1) throw new Error("Province not found")
    mockProvinces.splice(index, 1)
  },

  // Towns
  async getTowns(provinceId?: string): Promise<Town[]> {
    await delay(500)
    if (provinceId) {
      return mockTowns.filter((t) => t.provinceId === provinceId)
    }
    return mockTowns
  },

  async createTown(data: Omit<Town, "id">): Promise<Town> {
    await delay(600)
    const newTown: Town = {
      ...data,
      id: `${mockTowns.length + 1}`,
    }
    mockTowns.push(newTown)
    return newTown
  },

  async updateTown(id: string, data: Partial<Town>): Promise<Town> {
    await delay(600)
    const index = mockTowns.findIndex((t) => t.id === id)
    if (index === -1) throw new Error("Town not found")
    mockTowns[index] = { ...mockTowns[index], ...data }
    return mockTowns[index]
  },

  async deleteTown(id: string): Promise<void> {
    await delay(500)
    const index = mockTowns.findIndex((t) => t.id === id)
    if (index === -1) throw new Error("Town not found")
    mockTowns.splice(index, 1)
  },

  // Branches
  async getBranches(townId?: string): Promise<Branch[]> {
    await delay(500)
    if (townId) {
      return mockBranches.filter((b) => b.townId === townId)
    }
    return mockBranches
  },

  async createBranch(data: Omit<Branch, "id">): Promise<Branch> {
    await delay(600)
    const newBranch: Branch = {
      ...data,
      id: `${mockBranches.length + 1}`,
    }
    mockBranches.push(newBranch)
    return newBranch
  },

  async updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
    await delay(600)
    const index = mockBranches.findIndex((b) => b.id === id)
    if (index === -1) throw new Error("Branch not found")
    mockBranches[index] = { ...mockBranches[index], ...data }
    return mockBranches[index]
  },

  async deleteBranch(id: string): Promise<void> {
    await delay(500)
    const index = mockBranches.findIndex((b) => b.id === id)
    if (index === -1) throw new Error("Branch not found")
    mockBranches.splice(index, 1)
  },
}
