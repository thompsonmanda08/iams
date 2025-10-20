// Mock API for authentication - simulates backend calls
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "audit_manager" | "auditor" | "auditee" | "executive"
  department?: string
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: User["role"]
  department?: string
}

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@iams.com",
    name: "Admin User",
    role: "admin",
    department: "IT",
    avatar: "/admin-interface.png",
  },
  {
    id: "2",
    email: "manager@iams.com",
    name: "Audit Manager",
    role: "audit_manager",
    department: "Internal Audit",
    avatar: "/diverse-team-manager.png",
  },
  {
    id: "3",
    email: "auditor@iams.com",
    name: "Senior Auditor",
    role: "auditor",
    department: "Internal Audit",
    avatar: "/auditor-desk.png",
  },
  {
    id: "4",
    email: "auditee@iams.com",
    name: "Department Head",
    role: "auditee",
    department: "Finance",
    avatar: "/auditee.jpg",
  },
  {
    id: "5",
    email: "executive@iams.com",
    name: "Chief Executive",
    role: "executive",
    department: "Executive",
    avatar: "/diverse-executive-team.png",
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const authApi = {
  // Simulate login
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    await delay(800) // Simulate network delay

    const user = mockUsers.find((u) => u.email === credentials.email)

    if (!user) {
      throw new Error("Invalid email or password")
    }

    // In real app, verify password hash
    // For demo, accept any password

    return {
      user,
      token: `mock_token_${user.id}_${Date.now()}`,
    }
  },

  // Simulate registration
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    await delay(1000)

    // Check if email already exists
    if (mockUsers.find((u) => u.email === data.email)) {
      throw new Error("Email already registered")
    }

    const newUser: User = {
      id: `${mockUsers.length + 1}`,
      email: data.email,
      name: data.name,
      role: data.role,
      department: data.department,
      avatar: `/placeholder.svg?height=40&width=40&query=${data.name}`,
    }

    mockUsers.push(newUser)

    return {
      user: newUser,
      token: `mock_token_${newUser.id}_${Date.now()}`,
    }
  },

  // Simulate logout
  async logout(): Promise<void> {
    await delay(300)
    // Clear session
  },

  // Simulate getting current user from token
  async getCurrentUser(token: string): Promise<User> {
    await delay(400)

    // Extract user ID from mock token
    const userId = token.split("_")[2]
    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      throw new Error("Invalid session")
    }

    return user
  },

  // Simulate password reset request
  async requestPasswordReset(email: string): Promise<void> {
    await delay(800)

    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      throw new Error("Email not found")
    }

    // In real app, send reset email
    console.log(`[Mock] Password reset email sent to ${email}`)
  },

  // Get all mock users (for demo purposes)
  getMockUsers(): User[] {
    return mockUsers
  },
}
