import { Budget, BudgetItem } from "@/lib/types/audit-types";

export const mockBudgets: Budget[] = [
  {
    id: "1",
    name: "Departmental Budget",
    amount: 1000000,
    description: "This is the annual budget for all departments in the company",
    status: "BUDGET_CREATION",
    start_date: "2025-10-27",
    end_date: "2026-10-27",
    budget_lines: [
      {
        id: "1-1",
        name: "Operations",
        amount: 350000,
        description: "Budget under operations department",
        start_date: "2025-10-29",
        end_date: "2026-10-21"
      },
      {
        id: "1-2",
        name: "Finance",
        amount: 200000,
        description: "Budget under finance department",
        start_date: "2025-10-27",
        end_date: "2026-10-14"
      }
    ]
  },
  {
    id: "2",
    name: "Scheduled Budget",
    amount: 200000,
    description: "Quarterly scheduled budget allocations",
    status: "UNDER_REVIEW",
    start_date: "2025-10-22",
    end_date: "2027-02-27",
    budget_lines: [
      {
        id: "2-1",
        name: "Supplies",
        amount: 120000,
        description: "Office and operational supplies",
        start_date: "2025-10-22",
        end_date: "2027-02-27"
      },
      {
        id: "2-2",
        name: "Contingency",
        amount: 80000,
        description: "Emergency and contingency fund",
        start_date: "2025-10-22",
        end_date: "2027-02-27"
      }
    ]
  },
  {
    id: "3",
    name: "Latest Budget",
    amount: 200000,
    description: "Most recent budget allocation",
    status: "APPROVED",
    start_date: "2025-10-21",
    end_date: "2026-07-15",
    budget_lines: [
      {
        id: "3-1",
        name: "Training and Certifications",
        amount: 120000,
        description: "Employee development programs",
        start_date: "2025-10-21",
        end_date: "2026-07-15"
      },
      {
        id: "3-2",
        name: "Transport",
        amount: 80000,
        description: "Transportation and logistics",
        start_date: "2025-10-21",
        end_date: "2026-07-15"
      }
    ]
  }
];

export const mockBudgetItems: BudgetItem[] = [
  {
    id: "item-1",
    budget_line_id: "1-1",
    name: "Office Equipment",
    amount: 50000,
    description: "New computers and furniture",
    date: "2025-11-15"
  },
  {
    id: "item-2",
    budget_line_id: "1-1",
    name: "Software Licenses",
    amount: 30000,
    description: "Annual software subscriptions",
    date: "2025-12-01"
  },
  {
    id: "item-3",
    budget_line_id: "1-2",
    name: "Audit Services",
    amount: 75000,
    description: "External audit engagement",
    date: "2026-03-15"
  }
];