// Mock API for user management
import type { User } from "./auth-api"

export interface UserListItem extends User {
  status: "active" | "inactive"
  lastLogin: Date
  createdAt: Date
}

export interface CreateUserInput {
  email: string
  name: string
  role: User["role"]
  department?: string
  status: "active" | "inactive"
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  id: string
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: User["role"]
  status?: "active" | "inactive"
  department?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Mock users database
const mockUsersDb: UserListItem[] = [
  {
    id: "1",
    email: "admin@iams.com",
    name: "Admin User",
    role: "admin",
    department: "IT",
    avatar: "/admin-interface.png",
    status: "active",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    email: "manager@iams.com",
    name: "Audit Manager",
    role: "audit_manager",
    department: "Internal Audit",
    avatar: "/diverse-team-manager.png",
    status: "active",
    lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    email: "auditor@iams.com",
    name: "Senior Auditor",
    role: "auditor",
    department: "Internal Audit",
    avatar: "/auditor-desk.png",
    status: "active",
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    email: "auditee@iams.com",
    name: "Department Head",
    role: "auditee",
    department: "Finance",
    avatar: "/auditee.jpg",
    status: "active",
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    email: "executive@iams.com",
    name: "Chief Executive",
    role: "executive",
    department: "Executive",
    avatar: "/diverse-executive-team.png",
    status: "active",
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
  },
  {
    id: "6",
    email: "john.smith@iams.com",
    name: "John Smith",
    role: "auditor",
    department: "Internal Audit",
    status: "active",
    lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
  },
  {
    id: "7",
    email: "sarah.jones@iams.com",
    name: "Sarah Jones",
    role: "auditor",
    department: "Internal Audit",
    status: "active",
    lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
  },
  {
    id: "8",
    email: "mike.wilson@iams.com",
    name: "Mike Wilson",
    role: "auditee",
    department: "Operations",
    status: "active",
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    id: "9",
    email: "emily.brown@iams.com",
    name: "Emily Brown",
    role: "auditee",
    department: "HR",
    status: "inactive",
    lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000),
  },
  {
    id: "10",
    email: "david.lee@iams.com",
    name: "David Lee",
    role: "auditor",
    department: "Internal Audit",
    status: "active",
    lastLogin: new Date(Date.now() - 18 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const usersApi = {
  // Get all users with pagination and filters
  async getAll(params: UserQueryParams = {}): Promise<PaginatedResponse<UserListItem>> {
    await delay(600)

    let filtered = [...mockUsersDb]

    // Apply search filter
    if (params.search) {
      const search = params.search.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.department?.toLowerCase().includes(search),
      )
    }

    // Apply role filter
    if (params.role) {
      filtered = filtered.filter((user) => user.role === params.role)
    }

    // Apply status filter
    if (params.status) {
      filtered = filtered.filter((user) => user.status === params.status)
    }

    // Apply department filter
    if (params.department) {
      filtered = filtered.filter((user) => user.department === params.department)
    }

    // Apply sorting
    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[params.sortBy as keyof UserListItem]
        const bVal = b[params.sortBy as keyof UserListItem]

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

  // Get single user by ID
  async getById(id: string): Promise<UserListItem> {
    await delay(400)

    const user = mockUsersDb.find((u) => u.id === id)
    if (!user) {
      throw new Error("User not found")
    }

    return user
  },

  // Create new user
  async create(data: CreateUserInput): Promise<UserListItem> {
    await delay(800)

    // Check if email already exists
    if (mockUsersDb.find((u) => u.email === data.email)) {
      throw new Error("Email already exists")
    }

    const newUser: UserListItem = {
      id: `${mockUsersDb.length + 1}`,
      ...data,
      avatar: `/placeholder.svg?height=40&width=40&query=${data.name}`,
      lastLogin: new Date(),
      createdAt: new Date(),
    }

    mockUsersDb.push(newUser)
    return newUser
  },

  // Update user
  async update(id: string, data: Partial<CreateUserInput>): Promise<UserListItem> {
    await delay(700)

    const index = mockUsersDb.findIndex((u) => u.id === id)
    if (index === -1) {
      throw new Error("User not found")
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== mockUsersDb[index].email) {
      if (mockUsersDb.find((u) => u.email === data.email)) {
        throw new Error("Email already exists")
      }
    }

    mockUsersDb[index] = {
      ...mockUsersDb[index],
      ...data,
    }

    return mockUsersDb[index]
  },

  // Delete user
  async delete(id: string): Promise<void> {
    await delay(500)

    const index = mockUsersDb.findIndex((u) => u.id === id)
    if (index === -1) {
      throw new Error("User not found")
    }

    mockUsersDb.splice(index, 1)
  },

  // Bulk update status
  async bulkUpdateStatus(ids: string[], status: "active" | "inactive"): Promise<void> {
    await delay(800)

    ids.forEach((id) => {
      const user = mockUsersDb.find((u) => u.id === id)
      if (user) {
        user.status = status
      }
    })
  },

  // Get unique departments
  async getDepartments(): Promise<string[]> {
    await delay(300)

    const departments = new Set(mockUsersDb.map((u) => u.department).filter(Boolean) as string[])
    return Array.from(departments).sort()
  },
}
