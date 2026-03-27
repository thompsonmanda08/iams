"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Eye,
  EyeOff,
  Building2,
  Users,
  GitBranch,
  ShieldCheck,
  Camera
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/lib/utils";
import { updateUser } from "@/app/_actions/user-actions";
import { changePassword } from "@/app/_actions/auth-actions";
import { uploadFile } from "@/app/_actions/pocketbase-actions";
import { generateAvatarFallback, getAvatarSrc } from "@/lib/utils";
import { useSystemSetup } from "@/hooks/use-users-query-data";
import CustomAlert from "@/components/ui/custom-alert";

export function ProfileTab() {
  const queryClient = useQueryClient();
  const { data: setupResponse, isLoading } = useSystemSetup(true);
  const session = setupResponse?.data;

  const sessionUser = session?.user;
  const branch = session?.branch;
  const department = session?.department;
  const role = session?.role;
  const orgName: string = session?.organization_name ?? "";

  const fullName = `${sessionUser?.first_name ?? ""} ${sessionUser?.last_name ?? ""}`.trim();

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    (sessionUser as any)?.profile_picture ?? null
  );

  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useMutation({
    mutationFn: async (file: File) => {
      if (!sessionUser?.id) throw new Error("User ID missing");
      if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
      if (file.size > 2 * 1024 * 1024) throw new Error("Image must be under 2 MB");

      const uploadResponse = await uploadFile(file);
      if (!uploadResponse.success) throw new Error(uploadResponse.message || "Upload failed");

      const fileUrl: string = uploadResponse.data.file_url;

      const updateResponse = await updateUser(sessionUser.id, {
        first_name: sessionUser.first_name,
        last_name: sessionUser.last_name,
        email: sessionUser.email,
        username: sessionUser.username,
        branch_id: sessionUser.branch_id,
        department_id: sessionUser.department_id,
        role_id: sessionUser.role_id,
        is_active: sessionUser.is_active ?? true,
        profile_picture: fileUrl
      });
      if (!updateResponse.success)
        throw new Error(updateResponse.message || "Failed to save avatar");

      return fileUrl;
    },
    onSuccess: (fileUrl) => {
      setAvatarUrl(fileUrl);
      queryClient.invalidateQueries();
      notify({ description: "Profile picture updated", type: "success" });
    },
    onError: (err: any) => {
      notify({ description: err.message || "Failed to update avatar", type: "error" });
    }
  });

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar(file);
    e.target.value = "";
  };

  // Profile edit state — seeded from session data once loaded
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: ""
  });
  const [profileSeeded, setProfileSeeded] = useState(false);
  const [profileChanged, setProfileChanged] = useState(false);

  useEffect(() => {
    if (sessionUser && !profileSeeded) {
      setProfile({
        first_name: sessionUser.first_name ?? "",
        last_name: sessionUser.last_name ?? "",
        email: sessionUser.email ?? ""
      });
      setProfileSeeded(true);
    }
  }, [sessionUser, profileSeeded]);

  // Password state
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: saveProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: async () => {
      if (!sessionUser?.id) throw new Error("User ID missing");
      const response = await updateUser(sessionUser.id, {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        username: sessionUser.username,
        branch_id: sessionUser.branch_id,
        department_id: sessionUser.department_id,
        role_id: sessionUser.role_id,
        is_active: sessionUser.is_active ?? true
      });
      if (!response.success) throw new Error(response.message || "Failed to update profile");
      queryClient.invalidateQueries();
      return response;
    },
    onSuccess: (res) => {
      notify({ description: res.message || "Profile updated successfully", type: "success" });
      setProfileChanged(false);
    },
    onError: (err: any) => {
      notify({ description: err.message || "Failed to update profile", type: "error" });
    }
  });

  const { mutate: savePassword, isPending: isSavingPassword } = useMutation({
    mutationFn: async () => {
      if (passwords.newPassword !== passwords.confirmPassword) {
        throw new Error("New passwords do not match");
      }
      if (passwords.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }
      const response = await changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      if (!response.success) throw new Error(response.message || "Failed to change password");
      return response;
    },
    onSuccess: (res) => {
      notify({ description: res.message || "Password changed successfully", type: "success" });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err: any) => {
      notify({ description: err.message || "Failed to change password", type: "error" });
    }
  });

  const handleProfileChange = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setProfileChanged(true);
  };

  const passwordsValid =
    passwords.oldPassword.length > 0 &&
    passwords.newPassword.length > 0 &&
    passwords.confirmPassword.length > 0;

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3 pb-4 text-center">
              <button
                type="button"
                className="group relative h-20 w-20 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                title="Change profile picture">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    className="object-cover"
                    src={avatarUrl ?? getAvatarSrc(fullName)}
                    alt={fullName}
                  />
                  <AvatarFallback className="text-xl">
                    {generateAvatarFallback(fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {isUploadingAvatar ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled // Disable for the time being
                onChange={handleAvatarFileChange}
              />
              <div>
                <p className="font-semibold">{fullName || "—"}</p>
                <p className="text-muted-foreground text-sm">{sessionUser?.email}</p>
                {orgName && <p className="text-muted-foreground mt-1 text-xs">{orgName}</p>}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">
                  {sessionUser?.user_type === "BACKOFFICE_ADMIN"
                    ? "Back Office Admin"
                    : "Organization User"}
                </Badge>
                <Badge variant={session?.change_password ? "destructive" : "default"}>
                  {session?.change_password ? "Password Reset Required" : "Active"}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <dl className="space-y-3 text-sm">
              {role?.name && (
                <div className="flex items-center gap-3">
                  <Users className="text-muted-foreground h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-xs">Role</p>
                    <p className="truncate font-medium">{role.name}</p>
                  </div>
                </div>
              )}
              {department?.name && (
                <div className="flex items-center gap-3">
                  <Building2 className="text-muted-foreground h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-xs">Department</p>
                    <p className="truncate font-medium">{department.name}</p>
                  </div>
                </div>
              )}
              {branch?.name && (
                <div className="flex items-center gap-3">
                  <GitBranch className="text-muted-foreground h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-xs">Branch</p>
                    <p className="truncate font-medium">{branch.name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-muted-foreground h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">MFA</p>
                  <p className="font-medium">{sessionUser?.mfa_enabled ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
            <CardDescription>Update your display name and email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profile.first_name}
                  onChange={(e) => handleProfileChange("first_name", e.target.value)}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profile.last_name}
                  onChange={(e) => handleProfileChange("last_name", e.target.value)}
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange("email", e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={sessionUser?.username ?? ""} disabled className="bg-muted/50" />
            </div>
            <div className="flex items-center justify-between pt-2">
              {/* {profileChanged && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  You have unsaved changes
                </p>
              )} */}
              {/* <Button
                variant={"link"}
                className="ml-auto"
                onClick={() => saveProfile()}
                disabled={!profileChanged || isSavingProfile}>
                {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </Button> */}
              <CustomAlert
                title=""
                message="Contact system administrator to update your profile information"
                type="info"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
            <CardDescription>
              Update your password. You'll need to provide your current password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password">Current Password</Label>
              <div className="relative">
                <Input
                  id="old_password"
                  type={showOld ? "text" : "password"}
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, oldPassword: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  onClick={() => setShowOld((v) => !v)}>
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showNew ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  onClick={() => setShowNew((v) => !v)}>
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwords.confirmPassword.length > 0 &&
                passwords.newPassword !== passwords.confirmPassword && (
                  <p className="text-destructive text-xs">Passwords do not match</p>
                )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => savePassword()} disabled={!passwordsValid || isSavingPassword}>
                {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSavingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
