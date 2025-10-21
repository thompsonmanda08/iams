"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { InfoIcon, ShieldIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function RolesPermissions() {
  // Define permission modules
  const modules = ["risk", "audit", "reports"];

  // Define roles
  const roles = [
    {
      id: "admin",
      name: "Admin",
      description: "Full access to all features and settings"
    },
    {
      id: "organizer",
      name: "Organizer",
      description: "Can create and manage risk and audit"
    },
    {
      id: "moderator",
      name: "Moderator",
      description: "Can moderate content and approve submissions"
    },
    {
      id: "editor",
      name: "Editor",
      description: "Can edit event and activity content"
    },
    {
      id: "admitter",
      name: "Admitter",
      description: "Can manage attendee check-ins and admissions"
    },
    {
      id: "staff",
      name: "Staff",
      description: "Limited access to help with event operations"
    }
  ];

  // Define permissions matrix - in a real app, this would come from your API
  const [permissionsMatrix, setPermissionsMatrix] = useState({
    // Risks Module Permissions
    "risk.view": {
      admin: true,
      organizer: true,
      moderator: true,
      editor: true,
      admitter: true,
      staff: true
    },
    "risk.create": {
      admin: true,
      organizer: true,
      moderator: false,
      editor: false,
      admitter: false,
      staff: false
    },
    "risk.edit": {
      admin: true,
      organizer: true,
      moderator: false,
      editor: true,
      admitter: false,
      staff: false
    },
    "risk.delete": {
      admin: true,
      organizer: true,
      moderator: false,
      editor: false,
      admitter: false,
      staff: false
    },

    // Audit Module Permissions
    "audit.view": {
      admin: true,
      organizer: true,
      moderator: true,
      editor: true,
      admitter: true,
      staff: true
    },
    "audit.create": {
      admin: true,
      organizer: true,
      moderator: false,
      editor: false,
      admitter: false,
      staff: false
    },
    "audit.edit": {
      admin: true,
      organizer: true,
      moderator: true,
      editor: true,
      admitter: false,
      staff: false
    },
    "audit.delete": {
      admin: true,
      organizer: true,
      moderator: false,
      editor: false,
      admitter: false,
      staff: false
    },

    // Reports Module Permissions
    "reports.view": {
      admin: true,
      organizer: true,
      moderator: true,
      editor: false,
      admitter: true,
      staff: false
    },
    "reports.export": {
      admin: true,
      organizer: true,
      moderator: false,
      editor: false,
      admitter: false,
      staff: false
    }
  });

  // Function to toggle permission
  const togglePermission = (permission: string, role: string) => {
    setPermissionsMatrix((prev) => ({
      ...prev,
      [permission]: {
        ...prev[permission],
        [role]: !prev[permission][role]
      }
    }));
  };

  // Group permissions by name
  const getPermissionsByCategory = (name: string) => {
    return Object.keys(permissionsMatrix).filter((permission) => permission.startsWith(`${name}.`));
  };

  // Get permission display name
  const getPermissionDisplayName = (permission: string) => {
    const action = permission.split(".")[1];
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  return (
    <div className="container mx-auto px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Roles Overview</CardTitle>
          <CardDescription>
            Manage permissions for different user roles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div key={role.id} className="rounded-md border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldIcon className="h-5 w-5" />
                  <h3 className="font-medium">{role.name}</h3>
                </div>
                <p className="text-muted-foreground text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={modules[0]}>
        <TabsList className="mb-4 flex flex-wrap">
          {modules.map((name) => (
            <TabsTrigger key={name} value={name} className="capitalize">
              {name} Module
            </TabsTrigger>
          ))}
        </TabsList>

        {modules.map((name) => (
          <TabsContent key={name} value={name}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{name} Permissions</CardTitle>
                <CardDescription>Configure which roles can access {name} features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        {roles.map((role) => (
                          <TableHead key={role.id}>{role.name}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPermissionsByCategory(name).map((permission) => (
                        <TableRow key={permission}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getPermissionDisplayName(permission)}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <InfoIcon className="text-muted-foreground h-4 w-4" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Permission: {permission}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          {roles.map((role) => (
                            <TableCell key={role.id}>
                              <Switch
                                checked={permissionsMatrix[permission][role.id]}
                                onCheckedChange={() => togglePermission(permission, role.id)}
                                disabled={role.id === "admin"} // Admin always has all permissions
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
