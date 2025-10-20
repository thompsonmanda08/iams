import { delay } from "@/lib/utils/delay"

export interface AnalyticsData {
  plannedVsActual: {
    month: string
    planned: number
    actual: number
  }[]
  completionRate: {
    type: string
    completed: number
    total: number
    percentage: number
  }[]
  riskDistribution: {
    category: string
    count: number
    percentage: number
  }[]
  findingsBySeverity: {
    month: string
    critical: number
    high: number
    medium: number
    low: number
  }[]
  staffUtilization: {
    auditor: string
    utilization: number
    audits: number
  }[]
  complianceStatus: {
    department: string
    compliant: number
    nonCompliant: number
    pending: number
  }[]
}

const mockAnalyticsData: AnalyticsData = {
  plannedVsActual: [
    { month: "Jan", planned: 8, actual: 7 },
    { month: "Feb", planned: 10, actual: 9 },
    { month: "Mar", planned: 12, actual: 11 },
    { month: "Apr", planned: 9, actual: 8 },
    { month: "May", planned: 11, actual: 10 },
    { month: "Jun", planned: 10, actual: 9 },
    { month: "Jul", planned: 8, actual: 8 },
    { month: "Aug", planned: 12, actual: 10 },
    { month: "Sep", planned: 10, actual: 9 },
    { month: "Oct", planned: 11, actual: 10 },
    { month: "Nov", planned: 9, actual: 8 },
    { month: "Dec", planned: 10, actual: 9 },
  ],
  completionRate: [
    { type: "Internal Audit", completed: 45, total: 50, percentage: 90 },
    { type: "Compliance Audit", completed: 28, total: 35, percentage: 80 },
    { type: "Performance Audit", completed: 18, total: 20, percentage: 90 },
    { type: "Financial Audit", completed: 22, total: 25, percentage: 88 },
    { type: "IT Audit", completed: 15, total: 20, percentage: 75 },
  ],
  riskDistribution: [
    { category: "Operational", count: 45, percentage: 30 },
    { category: "Financial", count: 38, percentage: 25 },
    { category: "Compliance", count: 30, percentage: 20 },
    { category: "Strategic", count: 23, percentage: 15 },
    { category: "Reputational", count: 15, percentage: 10 },
  ],
  findingsBySeverity: [
    { month: "Jan", critical: 2, high: 5, medium: 8, low: 12 },
    { month: "Feb", critical: 3, high: 6, medium: 10, low: 15 },
    { month: "Mar", critical: 1, high: 4, medium: 9, low: 14 },
    { month: "Apr", critical: 2, high: 7, medium: 11, low: 16 },
    { month: "May", critical: 4, high: 8, medium: 12, low: 18 },
    { month: "Jun", critical: 2, high: 5, medium: 10, low: 15 },
    { month: "Jul", critical: 3, high: 6, medium: 9, low: 13 },
    { month: "Aug", critical: 1, high: 4, medium: 8, low: 14 },
    { month: "Sep", critical: 2, high: 7, medium: 11, low: 17 },
    { month: "Oct", critical: 3, high: 5, medium: 10, low: 16 },
    { month: "Nov", critical: 2, high: 6, medium: 9, low: 15 },
    { month: "Dec", critical: 1, high: 4, medium: 8, low: 12 },
  ],
  staffUtilization: [
    { auditor: "Jane Smith", utilization: 95, audits: 12 },
    { auditor: "Mike Johnson", utilization: 88, audits: 10 },
    { auditor: "Sarah Williams", utilization: 92, audits: 11 },
    { auditor: "John Doe", utilization: 85, audits: 9 },
    { auditor: "Emily Brown", utilization: 78, audits: 8 },
  ],
  complianceStatus: [
    { department: "IT", compliant: 45, nonCompliant: 8, pending: 5 },
    { department: "Finance", compliant: 52, nonCompliant: 5, pending: 3 },
    { department: "HR", compliant: 38, nonCompliant: 12, pending: 8 },
    { department: "Operations", compliant: 41, nonCompliant: 10, pending: 6 },
    { department: "Procurement", compliant: 35, nonCompliant: 15, pending: 10 },
  ],
}

export const analyticsApi = {
  getAll: async (): Promise<AnalyticsData> => {
    await delay(800)
    return Promise.resolve(mockAnalyticsData)
  },

  exportReport: async (reportType: string, format: string): Promise<{ url: string; filename: string }> => {
    await delay(1500)
    return Promise.resolve({
      url: `/downloads/${reportType}-${Date.now()}.${format}`,
      filename: `${reportType}-report-${new Date().toISOString().split("T")[0]}.${format}`,
    })
  },
}
