import { Suspense } from "react";
import UsersDataTable from "./data-table";
import { Card, CardContent } from "@/components/ui/card";
import { getUsers } from "@/app/_actions/user-actions";
import { User } from "@/lib/types/account";
import PageHeader from "@/components/page-header";
import CreateUserForm from "../_components/create-user-dialog";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    role?: string;
    page?: string;
    page_size?: string;
  }>;
};

export default async function UsersPage({ searchParams }: PageProps) {
  const {
    search = "",
    status = "all",
    role = "all",
    page = "1",
    page_size = "10"
  } = await searchParams;

  const response = await getUsers({
    search: search || undefined,
    isActive: status !== "all" ? status === "active" : undefined,
    role: role !== "all" ? role : undefined,
    page: Number(page),
    page_size: Number(page_size)
  });

  const users = (response?.data?.data || []) as User[];

  const pagination = response?.data?.pagination ?? {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Users Management"
              description="Manage your team members and their account roles"
              icon="UserCog"
            />
            <div>
              <CreateUserForm user={null} showTrigger user_type="ORGANIZATION_USER" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto flex flex-col space-y-6 p-4">
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
