export interface MockUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department?: string;
}

export const mockUsers: MockUser[] = [
  // AUDITORS
  {
    id: "user-1",
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@company.com",
    role: "AUDITOR",
    department: "Internal Audit"
  },
  {
    id: "user-2",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@company.com",
    role: "AUDITOR",
    department: "Internal Audit"
  },
  {
    id: "user-3",
    first_name: "Michael",
    last_name: "Williams",
    email: "michael.williams@company.com",
    role: "AUDITOR",
    department: "Internal Audit"
  },

  // HIAR (Head of Internal Audit and Risk)
  {
    id: "user-4",
    first_name: "Patricia",
    last_name: "Brown",
    email: "patricia.brown@company.com",
    role: "HIAR",
    department: "Internal Audit & Risk"
  },
  {
    id: "user-5",
    first_name: "Robert",
    last_name: "Davis",
    email: "robert.davis@company.com",
    role: "HIAR",
    department: "Internal Audit & Risk"
  },

  // CEO
  {
    id: "user-6",
    first_name: "Jennifer",
    last_name: "Martinez",
    email: "jennifer.martinez@company.com",
    role: "CEO",
    department: "Executive"
  },

  // CFO
  {
    id: "user-7",
    first_name: "David",
    last_name: "Garcia",
    email: "david.garcia@company.com",
    role: "CFO",
    department: "Finance"
  },

  // RISK MANAGERS
  {
    id: "user-8",
    first_name: "Emily",
    last_name: "Rodriguez",
    email: "emily.rodriguez@company.com",
    role: "RISK_MANAGER",
    department: "Risk Management"
  },
  {
    id: "user-9",
    first_name: "James",
    last_name: "Wilson",
    email: "james.wilson@company.com",
    role: "RISK_MANAGER",
    department: "Risk Management"
  },

  // COMPLIANCE OFFICERS
  {
    id: "user-10",
    first_name: "Linda",
    last_name: "Taylor",
    email: "linda.taylor@company.com",
    role: "COMPLIANCE_OFFICER",
    department: "Compliance"
  },
  {
    id: "user-11",
    first_name: "Christopher",
    last_name: "Anderson",
    email: "christopher.anderson@company.com",
    role: "COMPLIANCE_OFFICER",
    department: "Compliance"
  },

  // DEPARTMENT HEADS
  {
    id: "user-12",
    first_name: "Jessica",
    last_name: "Thomas",
    email: "jessica.thomas@company.com",
    role: "DEPARTMENT_HEAD",
    department: "Operations"
  },
  {
    id: "user-13",
    first_name: "Daniel",
    last_name: "Jackson",
    email: "daniel.jackson@company.com",
    role: "DEPARTMENT_HEAD",
    department: "IT"
  }
];

export const getUsersByRole = (role: string): MockUser[] => {
  return mockUsers.filter((user) => user.role === role);
};

export const getUserById = (id: string): MockUser | undefined => {
  return mockUsers.find((user) => user.id === id);
};

export const getRandomUserByRole = (role: string): MockUser | undefined => {
  const users = getUsersByRole(role);
  if (users.length === 0) return undefined;
  return users[Math.floor(Math.random() * users.length)];
};
