import { ActionsTable } from "./actions-table";
import PageHeader from "@/components/page-header";
import { verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";

interface RiskOwner {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  color: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Risk {
  id: string;
  title: string;
  description: string;
  category: Category;
  department: Department;
  risk_owner: RiskOwner;
  status: string;
  department_status: string;
  inherent_likelihood: number;
  inherent_impact: number;
  residual_likelihood: number;
  residual_impact: number;
  risk_response: string;
  target_closing_date: string;
  treatment_plan: string;
  control_effectiveness: number;
  mitigation_cost: number;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}

export default async function ActionsPage() {
  // const systemInit = await initializeSystemSetup();
  // const user = systemInit?.data?.user as User;
  await verifySession();

  // TODO: Uncomment when ready to use real API
  // const { session } = await verifySession();
  // const user = session?.user as User;
  // Get risks where current user is the action owner (responsible for submitting findings)
  // const response = await getRisks({
  //   risk_action_owner_id: user?.id
  // });
  // const data = response.success && response.data ? response.data : null;

  // MOCK DATA: Using hardcoded mock data for testing UI/UX
  const mockRisks: Risk[] = [
    {
      id: "1",
      title: "Cyber Security Breach Risk",
      description: "Risk of unauthorized access to systems and data theft. Potential for significant system downtime and data loss.",
      category: {
        id: "cat-tech-1",
        name: "Technology",
        code: "TECH",
        color: "#FF6B6B"
      },
      department: {
        id: "dept-it-1",
        name: "IT Department",
        code: "IT"
      },
      risk_owner: {
        id: "user-sec-mgr-1",
        email: "security@company.com",
        first_name: "John",
        last_name: "Smith"
      },
      status: "OPEN",
      department_status: "OPEN",
      inherent_likelihood: 4,
      inherent_impact: 5,
      residual_likelihood: 2,
      residual_impact: 4,
      risk_response: "REDUCE",
      target_closing_date: "2024-12-31",
      treatment_plan: "Implement multi-factor authentication and enhance network security",
      control_effectiveness: 3,
      mitigation_cost: 50000,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-11-07T10:00:00Z"
    },
    {
      id: "3",
      title: "Data Privacy Incident Risk",
      description: "Risk of unauthorized data disclosure and privacy breaches. Impact on customer trust and brand reputation.",
      category: {
        id: "cat-dp-1",
        name: "Data Protection",
        code: "DP",
        color: "#4ECDC4"
      },
      department: {
        id: "dept-it-1",
        name: "IT Department",
        code: "IT"
      },
      risk_owner: {
        id: "user-dpo-1",
        email: "dpo@company.com",
        first_name: "Jane",
        last_name: "Doe"
      },
      status: "OPEN",
      department_status: "OPEN",
      inherent_likelihood: 3,
      inherent_impact: 5,
      residual_likelihood: 2,
      residual_impact: 4,
      risk_response: "REDUCE",
      target_closing_date: "2025-01-15",
      treatment_plan: "Implement data encryption and access controls",
      control_effectiveness: 2,
      mitigation_cost: 75000,
      created_at: "2024-02-10T10:00:00Z",
      updated_at: "2024-11-07T10:00:00Z"
    }
  ];

  const actions = mockRisks;
  const pagination: Pagination = {
    total: 2,
    page: 1,
    page_size: 10,
    total_pages: 1,
    has_next: false,
    has_prev: false
  };
  return (
    <main className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="My Actions"
            description="View risks assigned to you and submit evidence of mitigation actions taken"
            icon="AlertTriangle"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <ActionsTable actions={actions} pagination={pagination} />
      </div>
    </main>
  );
}
