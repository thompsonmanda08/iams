import { Suspense } from "react";
import UsersDataTable from "./data-table";
import { Card, CardContent } from "@/components/ui/card";
import { getUsers } from "@/app/_actions/user-actions";
import CreateUserButton from "../_components/create-user-button";

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
    role: role !== "all" ? role : undefined
  });

  const data = response?.data;
  const users = data?.data ?? [];
  const pagination = data?.pagination ?? {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };

  return (
    <div className="container mx-auto flex flex-col space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team members and their account permissions
          </p>
        </div>
        <CreateUserButton />
      </div>

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
  );
}
