import { Suspense } from "react";
import { getBranches, getDepartments, getProvincesWithTowns, getTowns } from "@/app/_actions/config-actions";
import { getUsers } from "@/app/_actions/user-actions";
import { BranchesTab } from "../_components/branches-tab";
import DepartmentsConfig from "../_components/departments-config";
import UsersDataTable from "../users/data-table";
import CreateUserForm from "../_components/create-user-dialog";
import PageHeader from "@/components/page-header";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SetupTabsNavigation, type SetupTab } from "../_components/setup-tabs-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/lib/types/account";
import { Pagination } from "@/lib/types";

const VALID_TABS = ["branches", "departments", "users"] as const;

type PageProps = {
  searchParams: Promise<{ tab?: string } & { [key: string]: string }>;
};

export const metadata = {
  title: "System Setup",
  description: "Manage branches, departments, and users"
};

export default async function SystemSetupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = (VALID_TABS.includes(params.tab as SetupTab) ? params.tab : "branches") as SetupTab;

  const page = params.page ? Number(params.page) : 1;
  const page_size = params.page_size ? Number(params.page_size) : 10;

  // Fetch only data for the active tab
  let branchesData = null;
  let provincesData: any[] = [];
  let townsData: any[] = [];
  let departmentsData = null;
  let usersData: User[] = [];
  let pagination: Pagination = { total: 0, page: 1, page_size: 10, total_pages: 0, has_next: false, has_prev: false };

  if (tab === "branches") {
    const [branchesRes, townsRes, provincesRes] = await Promise.all([
      getBranches({ page, page_size }),
      getTowns({ page, page_size }),
      getProvincesWithTowns()
    ]);
    branchesData = branchesRes.success ? branchesRes.data : null;
    provincesData = provincesRes.success ? provincesRes.data : [];
    townsData = townsRes.success ? townsRes.data?.data : [];
    pagination = branchesData?.pagination ?? pagination;
  } else if (tab === "departments") {
    const departmentsRes = await getDepartments({ page, page_size });
    departmentsData = departmentsRes.success ? departmentsRes.data : null;
    pagination = departmentsData?.pagination ?? pagination;
  } else if (tab === "users") {
    const status = params.status === "inactive" ? "inactive" : "active";
    const usersRes = await getUsers({
      search: params.search || undefined,
      isActive: status === "active",
      role: params.role && params.role !== "all" ? params.role : undefined,
      page,
      page_size
    });
    usersData = (usersRes?.data?.data || []) as User[];
    pagination = usersRes?.data?.pagination ?? pagination;
  }

  return (
    <div>
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="System Setup"
              description="Manage your branches, departments, and users"
              icon="Settings"
            />
            {tab === "users" && (
              <div>
                <CreateUserForm user={null} showTrigger user_type="ORGANIZATION_USER" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-4 p-4">
        <Tabs value={tab} className="space-y-4">
          <div className="overflow-x-auto">
            <SetupTabsNavigation activeTab={tab} />
          </div>

          <TabsContent value="branches">
            <BranchesTab
              initialBranches={branchesData?.data || []}
              provinces={provincesData}
              towns={townsData}
              pagination={pagination}
            />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentsConfig
              initialDepartments={departmentsData?.data || []}
              pagination={pagination}
            />
          </TabsContent>

          <TabsContent value="users">
            <Suspense
              fallback={
                <Card className="shadow-none">
                  <CardContent>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                        <p className="text-sm text-gray-500">Loading users...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              }>
              <UsersDataTable
                data={usersData}
                pagination={pagination}
                currentSearch={params.search || ""}
                currentStatus={params.status === "inactive" ? "inactive" : "active"}
                currentRole={params.role || "all"}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
