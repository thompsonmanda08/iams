// Mock API for dashboard data
import type { User } from "./auth-api"

export interface DashboardStats {
  activeAudits: number
  highPriorityRisks: number
  pendingActions: number
  completionRate: number
  totalUsers?: number
  systemUptime?: number
  openFindings?: number
  overdueActions?: number
}

export interface RecentActivity {
  id: string
  type: "audit" | "risk" | "user" | "report" | "action"
  description: string
  timestamp: Date
  user?: string
}

export interface UpcomingDeadline {
  id: string
  title: string
  date: Date
  status: "not-started" | "planned" | "in-progress" | "review" | "completed"
  priority: "low" | "medium" | "high" | "critical"
}

export interface AuditProgress {
  id: string
  title: string
  progress: number
  status: string
  dueDate: Date
  assignedTo: string
}

export interface RiskDistribution {
  category: string
  count: number
  high: number
  medium: number
  low: number
}

export interface ComplianceMetric {
  area: string
  score: number
  target: number
  trend: "up" | "down" | "stable"
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const dashboardApi = {
  // Get dashboard stats based on user role
  async getStats(role: User["role"]): Promise<DashboardStats> {
    await delay(600)

    const baseStats: DashboardStats = {
      activeAudits: Math.floor(Math.random() * 20) + 10,
      highPriorityRisks: Math.floor(Math.random() * 15) + 5,
      pendingActions: Math.floor(Math.random() * 30) + 15,
      completionRate: Math.floor(Math.random() * 20) + 75,
    }

    if (role === "admin") {
      return {
        ...baseStats,
        totalUsers: Math.floor(Math.random() * 50) + 100,
        systemUptime: 99.8,
      }
    }

    if (role === "audit_manager") {
      return {
        ...baseStats,
        openFindings: Math.floor(Math.random() * 40) + 20,
        overdueActions: Math.floor(Math.random() * 10) + 3,
      }
    }

    return baseStats
  },

  // Get recent activity
  async getRecentActivity(limit = 5): Promise<RecentActivity[]> {
    await delay(500)

    const activities: RecentActivity[] = [
      {
        id: "1",
        type: "audit",
        description: "Q4 Financial Audit report submitted",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: "John Doe",
      },
      {
        id: "2",
        type: "risk",
        description: "High priority risk identified in IT Security",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        user: "Jane Smith",
      },
      {
        id: "3",
        type: "action",
        description: "Action item completed for Compliance Audit",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        user: "Mike Johnson",
      },
      {
        id: "4",
        type: "report",
        description: "Monthly MIS report generated",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        user: "Sarah Williams",
      },
      {
        id: "5",
        type: "user",
        description: "New auditor added to the team",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        user: "Admin User",
      },
      {
        id: "6",
        type: "audit",
        description: "IT Security Review scheduled",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        user: "John Doe",
      },
    ]

    return activities.slice(0, limit)
  },

  // Get upcoming deadlines
  async getUpcomingDeadlines(limit = 5): Promise<UpcomingDeadline[]> {
    await delay(550)

    const deadlines: UpcomingDeadline[] = [
      {
        id: "1",
        title: "Q4 Financial Audit",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: "in-progress",
        priority: "high",
      },
      {
        id: "2",
        title: "IT Security Review",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: "planned",
        priority: "high",
      },
      {
        id: "3",
        title: "Compliance Assessment",
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: "planned",
        priority: "medium",
      },
      {
        id: "4",
        title: "Risk Assessment Report",
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: "not-started",
        priority: "medium",
      },
      {
        id: "5",
        title: "Vendor Audit",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "not-started",
        priority: "low",
      },
    ]

    return deadlines.slice(0, limit)
  },

  // Get audit progress for current user
  async getMyAudits(limit = 4): Promise<AuditProgress[]> {
    await delay(650)

    const audits: AuditProgress[] = [
      {
        id: "1",
        title: "Q4 Financial Audit",
        progress: 75,
        status: "In Progress",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        assignedTo: "You",
      },
      {
        id: "2",
        title: "IT Security Review",
        progress: 30,
        status: "Planning",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        assignedTo: "You",
      },
      {
        id: "3",
        title: "Compliance Assessment",
        progress: 10,
        status: "Not Started",
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        assignedTo: "You",
      },
      {
        id: "4",
        title: "Vendor Audit",
        progress: 0,
        status: "Scheduled",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        assignedTo: "You",
      },
    ]

    return audits.slice(0, limit)
  },

  // Get risk distribution
  async getRiskDistribution(): Promise<RiskDistribution[]> {
    await delay(700)

    return [
      { category: "Financial", count: 24, high: 8, medium: 10, low: 6 },
      { category: "Operational", count: 32, high: 12, medium: 15, low: 5 },
      { category: "Compliance", count: 18, high: 6, medium: 8, low: 4 },
      { category: "Strategic", count: 15, high: 5, medium: 7, low: 3 },
      { category: "IT Security", count: 28, high: 10, medium: 12, low: 6 },
    ]
  },

  // Get compliance metrics
  async getComplianceMetrics(): Promise<ComplianceMetric[]> {
    await delay(650)

    return [
      { area: "Financial Reporting", score: 92, target: 95, trend: "up" },
      { area: "Data Privacy", score: 88, target: 90, trend: "up" },
      { area: "IT Security", score: 85, target: 90, trend: "stable" },
      { area: "Regulatory Compliance", score: 78, target: 85, trend: "down" },
      { area: "Operational Controls", score: 90, target: 90, trend: "stable" },
    ]
  },

  // Get chart data for trends
  async getTrendData(months = 6): Promise<Array<{ month: string; audits: number; risks: number; actions: number }>> {
    await delay(600)

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()

    return Array.from({ length: months }, (_, i) => {
      const monthIndex = (currentMonth - months + i + 1 + 12) % 12
      return {
        month: monthNames[monthIndex],
        audits: Math.floor(Math.random() * 15) + 5,
        risks: Math.floor(Math.random() * 25) + 10,
        actions: Math.floor(Math.random() * 40) + 20,
      }
    })
  },
}
