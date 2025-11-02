import { Suspense } from "react";
import UsersDataTable from "./data-table";

import { Card, CardContent } from "@/components/ui/card";
import { getUsers } from "@/app/_actions/user-actions";
import CreateUserButton from "@/app/dashboard/system-configs/_components/create-user-dialog";
import PageHeader from "@/components/page-header";

export default async function UsersPage() {
  const response = await getUsers();
  const users = response.success && response.data.data ? response.data.data : [];

  return (
    <div className="container mx-auto flex flex-col space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeader
          title="Admin User Management"
          description="Manage your team members and their account roles"
          icon="ShieldUser"
        />
        <CreateUserButton user_type="BACKOFFICE_USER" />
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
        <UsersDataTable data={users} />
      </Suspense>
    </div>
  );
}
