import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ModuleSelection } from "../../_components";
import { FolderCogIcon, Plus, UserCog, UserLock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Department, DepartmentUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getUsers } from "@/app/_actions/user-actions";
import { getDepartmentById } from "@/app/_actions/config-actions";
import { notFound } from "next/navigation";
import DepartmentUsersConfig, {
  CreateOrUpdateDepartment
} from "../../_components/department-users";
import { User } from "@/lib/types/account";
import UserRolesConfig from "../../_components/user-roles-config";

export default async function DepartmentDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const departmentId = (await params).id;

  const [userResponse, departmentResponse] = await Promise.all([
    getUsers({ page: 1, page_size: 100, departmentId }),
    getDepartmentById(departmentId)
  ]);

  const users = userResponse.success
    ? ((userResponse?.data?.data || []) as DepartmentUser[])
    : ([] as DepartmentUser[]);
  const department = departmentResponse.success
    ? ((departmentResponse?.data || {}) as Department)
    : null;

  if (!department || !departmentId) {
    return notFound();
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">
            {department.name} - {department.code}
          </h1>
          <p className="text-muted-foreground mt-1">{department.description}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <FolderCogIcon className="h-4 w-4" />
            General Config
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Department Users
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <UserLock className="h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        {/* General Configs */}
        <TabsContent value="general">
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Department Configurations</h3>
                <p className="text-muted-foreground text-sm">
                  General configurations for this department
                </p>
              </div>

              <CreateOrUpdateDepartment
                showTrigger
                initialData={department}
                departmentId={departmentId}
              />
            </div>

            <ModuleSelection departmentId={departmentId} department={department} />
            {/* <Separator className="my-4" /> */}
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <DepartmentUsersConfig users={users} />
        </TabsContent>

        {/* Roles & Permissions */}

        <TabsContent value="permissions">
          <UserRolesConfig departmentId={departmentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
