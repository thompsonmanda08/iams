import { Suspense } from "react";
import UsersDataTable from "./data-table";

import { Card, CardContent } from "@/components/ui/card";
import { getUsers } from "@/app/_actions/user-actions";
import CreateUserButton from "@/app/dashboard/system-configs/_components/create-user-dialog";
import PageHeader from "@/components/page-header";
import CreateUserForm from "@/app/dashboard/system-configs/_components/create-user-dialog";
import { Spinner } from "@/components/ui/spinner";

interface AdminUsersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    role?: string;
    page?: string;
    page_size?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "all";
  const role = params.role || "all";
  const page = parseInt(params.page || "1", 10);
  const page_size = parseInt(params.page_size || "10", 10);

  // Build API params
  const apiParams: any = {
    page,
    page_size
  };

  if (search) {
    apiParams.search = search;
  }

  if (status !== "all") {
    apiParams.isActive = status === "active";
  }

  if (role !== "all") {
    apiParams.role = role;
  }

  const response = await getUsers(apiParams);
  const users = response.success && response.data.data ? response.data.data : [];
  const pagination =
    response.success && response.data.pagination
      ? response.data.pagination
      : {
          total: 0,
          page: 1,
          page_size: 10,
          total_pages: 0,
          has_next: false,
          has_prev: false
        };

  return (
    <div>
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Admin User Management"
              description="Manage backoffice users and their account roles"
              icon="ShieldUser"
            />
            <div>
              <CreateUserForm user={null} showTrigger user_type="BACKOFFICE_ADMIN" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto flex flex-col space-y-6 p-6">
        <Suspense
          fallback={
            <Card className="shadow-none">
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <Spinner className="mx-auto mb-4 h-12 w-12" />
                    <p className="text-sm text-gray-500">Loading users...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          }>
          <UsersDataTable
            data={users}
            pagination={pagination}
            currentSearch={search}
            currentStatus={status}
            currentRole={role}
          />
        </Suspense>
      </div>
    </div>
  );
}
