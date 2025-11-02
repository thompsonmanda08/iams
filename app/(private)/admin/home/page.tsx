import PageHeader from "@/components/page-header";
import AdminDashboardHome from "./home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Home",
  description: "Administrator dashboard"
};

async function AdminDashboardHomePage() {
  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Dashboard Overview"
              description="A summary of key metrics and statistics for your dashboard."
              icon="LayoutDashboard"
            />
            {/* <div className="flex gap-2">
              <Link href="/dashboard/audit/budgets/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Budget
                </Button>
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AdminDashboardHome />
      </div>
    </div>
  );
}

export default AdminDashboardHomePage;
