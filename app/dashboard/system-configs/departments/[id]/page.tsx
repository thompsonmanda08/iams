import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ModuleSelection, UpdateDepartmentForm } from "../../_components";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import RolesPermissions from "../../_components/roles-permissions";
import { DepartmentUser } from "@/types";
import { cn } from "@/lib/utils";

const users: DepartmentUser[] = [
  {
    id: "ZM001",
    fullName: "Chanda Banda",
    role: "Software Developer",
    department: "IT",
    isActive: true
  },
  {
    id: "ZM002",
    fullName: "Mulenga Phiri",
    role: "HR Manager",
    department: "Human Resources",
    isActive: true
  },
  {
    id: "ZM003",
    fullName: "Nchimunya Mwila",
    role: "Accountant",
    department: "Finance",
    isActive: true
  },
  {
    id: "ZM004",
    fullName: "Tukiya Kunda",
    role: "Marketing Specialist",
    department: "Marketing",
    isActive: false
  },
  {
    id: "ZM005",
    fullName: "Mwape Ng'andu",
    role: "Sales Executive",
    department: "Sales",
    isActive: true
  },
  {
    id: "ZM006",
    fullName: "Bwalya Chilufya",
    role: "Operations Manager",
    department: "Operations",
    isActive: true
  },
  {
    id: "ZM007",
    fullName: "Chileshe Mumba",
    role: "Data Analyst",
    department: "Analytics",
    isActive: true
  },
  {
    id: "ZM008",
    fullName: "Katongo Soko",
    role: "Customer Service Rep",
    department: "Customer Service",
    isActive: false
  },
  {
    id: "ZM009",
    fullName: "Musonda Tembo",
    role: "Project Manager",
    department: "Project Management",
    isActive: true
  },
  {
    id: "ZM010",
    fullName: "Namukolo Zulu",
    role: "Quality Assurance",
    department: "IT",
    isActive: true
  },
  {
    id: "ZM011",
    fullName: "Kondwani Banda",
    role: "Network Administrator",
    department: "IT",
    isActive: true
  },
  {
    id: "ZM012",
    fullName: "Webby Mwale",
    role: "Finance Officer",
    department: "Finance",
    isActive: false
  },
  {
    id: "ZM013",
    fullName: "Esther Lungu",
    role: "Recruitment Specialist",
    department: "Human Resources",
    isActive: true
  },
  {
    id: "ZM014",
    fullName: "Davies Kapembwa",
    role: "Business Analyst",
    department: "Strategy",
    isActive: true
  },
  {
    id: "ZM015",
    fullName: "Sylvia Mwansa",
    role: "Content Writer",
    department: "Marketing",
    isActive: true
  },
  {
    id: "ZM016",
    fullName: "Peter Chisanga",
    role: "Logistics Coordinator",
    department: "Operations",
    isActive: false
  },
  {
    id: "ZM017",
    fullName: "Ruth Mwango",
    role: "UI/UX Designer",
    department: "Design",
    isActive: true
  },
  {
    id: "ZM018",
    fullName: "Kennedy Simbeye",
    role: "Database Administrator",
    department: "IT",
    isActive: true
  },
  {
    id: "ZM019",
    fullName: "Agnes Mwape",
    role: "Training Coordinator",
    department: "Human Resources",
    isActive: true
  },
  {
    id: "ZM020",
    fullName: "Joseph Mwila",
    role: "Technical Support",
    department: "IT",
    isActive: false
  }
];

export default async function DepartmentDetailsPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">[Department Name]</h1>
          <p className="text-muted-foreground mt-1">[Department Description]</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General Config</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Roles & Permissions</TabsTrigger>
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

              {/* <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Province
              </Button> */}
            </div>

            <UpdateDepartmentForm />

            <Separator className="my-4" />

            <div className="space-y-1">
              <h4 className="text-sm leading-none font-medium">Department Modules</h4>
              <p className="text-muted-foreground text-sm">
                List of all the modules accessible to this department
              </p>
            </div>

            <ModuleSelection modules={[]} />
            {/* <Separator className="my-4" /> */}
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Users</h3>
                <p className="text-muted-foreground text-sm">
                  List of all the users in this department
                </p>
              </div>
              {/* <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Town
              </Button> */}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead className="w-24">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {false ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="bg-muted h-32 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <span className="font-medium">{user.fullName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">{user.role}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">{user.department}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-medium",
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          )}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      {/* <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTown(user.id)}
                            className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell> */}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Roles & Permissions */}

        <TabsContent value="permissions">
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Roles & Permissions</h3>
                <p className="text-muted-foreground text-sm">
                  List of all the roles and permissions in this department
                </p>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add New Role
              </Button>
            </div>

            <div>
              <RolesPermissions /> <Separator className="my-4" />
            </div>
            {/* 
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="bg-muted h-20 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ) : (
                  towns.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <span className="font-medium">{user.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">
                          {getProvinceName(user.provinceId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-medium",
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          )}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTown(user.id)}
                            className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table> */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
