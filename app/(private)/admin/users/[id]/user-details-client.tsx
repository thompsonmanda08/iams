"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types/account";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/ui/permission-button";
import { MODULE_CODES } from "@/lib/constants/module-codes";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Mail,
  Building2,
  Briefcase,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  User as UserIcon,
  Calendar,
  Edit,
  ShieldCheck,
  Key
} from "lucide-react";
import { generateAvatarFallback, getAvatarSrc } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import CreateUserForm from "@/app/dashboard/system-configs/_components/create-user-dialog";

interface UserDetailsClientProps {
  user: User;
}

export function UserDetailsClient({ user }: UserDetailsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingUser, setIsEditingUser] = useState(false);

  const fullName = `${user.first_name} ${user.last_name}`;
  const avatarFallback = generateAvatarFallback(fullName);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <>
      {/* Header Section */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                className="from-primary to-primary/80 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg">
                <ArrowLeft className="text-primary-foreground h-7 w-7" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Backoffice User Details</h1>
                <p className="text-muted-foreground text-sm">
                  View and manage admin user information
                </p>
              </div>
            </div>
            <PermissionButton
              moduleCode={MODULE_CODES.USER_MGMT}
              action="can_edit"
              onClick={() => setIsEditingUser(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </PermissionButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-4 py-6">
        {/* User Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={getAvatarSrc(fullName)} />
                <AvatarFallback className="text-2xl">{avatarFallback}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{fullName}</h1>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {user.mfa_enabled && (
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        MFA Enabled
                      </Badge>
                    )}
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Backoffice User
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1">@{user.username}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <Mail className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Email</p>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <Building2 className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Branch</p>
                      <p className="text-sm font-medium">{user.branch?.name || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <Briefcase className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Department</p>
                      <p className="text-sm font-medium">{user.department?.name || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <UserIcon className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Role</p>
                      <p className="text-sm font-medium">{user.role?.name || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined{" "}
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  {user.last_login && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Last login: {formatTimestamp(new Date(user.last_login))}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security & Access</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>Basic account details and status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Account Type</span>
                      <Badge variant="outline">
                        {user.user_type?.replace("_", " ") || "BACKOFFICE USER"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">LDAP User</span>
                      <Badge variant={user.is_ldap_user ? "default" : "secondary"}>
                        {user.is_ldap_user ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">MFA Status</span>
                      <Badge variant={user.mfa_enabled ? "default" : "secondary"}>
                        {user.mfa_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Account Status</span>
                      <Badge variant={user.is_active ? "success" : "destructive"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-muted-foreground">Created At</span>
                      <span className="font-medium">
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">
                        {new Date(user.updated_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>User contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Email Address</p>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Username</p>
                      <p className="text-sm">@{user.username}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Full Name</p>
                      <p className="text-sm">{fullName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Authentication Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-5 w-5" />
                    Authentication & Security
                  </CardTitle>
                  <CardDescription>User authentication and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">Multi-Factor Authentication</p>
                        <p className="text-muted-foreground text-xs">
                          {user.mfa_enabled ? "MFA is enabled" : "MFA is disabled"}
                        </p>
                      </div>
                      <Badge variant={user.mfa_enabled ? "default" : "secondary"}>
                        {user.mfa_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">LDAP Authentication</p>
                        <p className="text-muted-foreground text-xs">
                          {user.is_ldap_user
                            ? "User authenticates via LDAP"
                            : "Local authentication"}
                        </p>
                      </div>
                      <Badge variant={user.is_ldap_user ? "default" : "secondary"}>
                        {user.is_ldap_user ? "LDAP" : "Local"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">Account Status</p>
                        <p className="text-muted-foreground text-xs">
                          {user.is_active ? "Account is active" : "Account is inactive"}
                        </p>
                      </div>
                      <Badge variant={user.is_active ? "success" : "destructive"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Access History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5" />
                    Access Information
                  </CardTitle>
                  <CardDescription>Login and access history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Last Login</p>
                          <p className="text-muted-foreground text-xs">
                            {user.last_login
                              ? new Date(user.last_login).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "Never logged in"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Account Created</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(user.created_at).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit User Modal */}
        <CreateUserForm
          showTrigger={false}
          user_type="BACKOFFICE_ADMIN"
          isOpenModal={isEditingUser}
          user={user}
          setIsOpenModal={(open) => {
            if (!open) {
              setIsEditingUser(false);
              router.refresh();
            }
          }}
        />
      </div>
    </>
  );
}
