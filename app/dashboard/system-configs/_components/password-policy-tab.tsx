"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, SquareAsterisk, RotateCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { notify } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { getPasswordPolicy, updatePasswordPolicy } from "@/app/_actions/config-actions";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

import { PermissionButton } from "@/components/ui/permission-button";

interface PasswordPolicyConfig {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  max_failed_attempts: number;
  lockout_duration_mins: number;
  password_expiry_days: number;
  otp_length: number;
  otp_expiry_mins: number;
  require_mfa: boolean;
  session_timeout_mins: number;
}

interface PasswordPolicyTabProps {
  initialData?: PasswordPolicyConfig;
}

export function PasswordPolicyTab({ initialData }: PasswordPolicyTabProps) {
  const { checkPermission, hasPermission } = usePermissions();
  const [policy, setPolicy] = useState<PasswordPolicyConfig | null>(initialData ?? null);
  const [hasChanges, setHasChanges] = useState(false);

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ["password_policy"],
    queryFn: async () => {
      const response = await getPasswordPolicy();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch policy");
      }
      setPolicy(response.data as PasswordPolicyConfig);
      return response.data as PasswordPolicyConfig;
    },
    initialData: initialData,
    enabled: !initialData,
    retry: 1
  });

  const { mutate: handleSavePolicy, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!policy) throw new Error("No policy data");
      const response = await updatePasswordPolicy(policy);
      if (!response.success) {
        throw new Error(response.message || "Failed to save policy");
      }
      return response;
    },
    onSuccess: (response) => {
      notify({ description: response.message || "Password policy updated successfully", type: "success" });
      setHasChanges(false);
    },
    onError: (error: any) => {
      notify({ description: error.message || "Failed to save password policy", type: "error" });
    }
  });

  const handlePolicyChange = (key: keyof PasswordPolicyConfig, value: any) => {
    setPolicy((prev) => (prev ? { ...prev, [key]: value } : null));
    setHasChanges(true);
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-t-primary h-8 w-8 animate-spin rounded-full border-4 border-gray-300" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border py-12 text-center">
        <div className="bg-muted mb-4 rounded-full p-4">
          <SquareAsterisk className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          Failed to load password policy configuration
        </h3>
        <p className="text-muted-foreground mb-6 text-center text-sm">
          Maintenance mode — try again later.
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          <RotateCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="space-y-6 lg:col-span-2">
        {/* Password Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Password Requirements</CardTitle>
            <CardDescription>
              Define the password complexity and validation rules for all users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="min_length">Minimum Password Length</Label>
              <Input
                id="min_length"
                type="number"
                min="4"
                max="32"
                value={policy.min_length}
                onChange={(e) => handlePolicyChange("min_length", parseInt(e.target.value))}
                className="max-w-xs"
              />
              <p className="text-muted-foreground text-xs">
                Minimum number of characters required (4-32)
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Complexity Requirements</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <Label htmlFor="require_uppercase" className="cursor-pointer text-sm font-medium">
                      Require Uppercase Letters
                    </Label>
                    <p className="text-muted-foreground text-xs">Users must include A-Z</p>
                  </div>
                  <Switch
                    id="require_uppercase"
                    checked={policy.require_uppercase}
                    onCheckedChange={(checked) => handlePolicyChange("require_uppercase", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <Label htmlFor="require_lowercase" className="cursor-pointer text-sm font-medium">
                      Require Lowercase Letters
                    </Label>
                    <p className="text-muted-foreground text-xs">Users must include a-z</p>
                  </div>
                  <Switch
                    id="require_lowercase"
                    checked={policy.require_lowercase}
                    onCheckedChange={(checked) => handlePolicyChange("require_lowercase", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <Label htmlFor="require_numbers" className="cursor-pointer text-sm font-medium">
                      Require Numbers
                    </Label>
                    <p className="text-muted-foreground text-xs">Users must include 0-9</p>
                  </div>
                  <Switch
                    id="require_numbers"
                    checked={policy.require_numbers}
                    onCheckedChange={(checked) => handlePolicyChange("require_numbers", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="require_special_chars"
                      className="cursor-pointer text-sm font-medium">
                      Require Special Characters
                    </Label>
                    <p className="text-muted-foreground text-xs">Users must include !@#$%^&*</p>
                  </div>
                  <Switch
                    id="require_special_chars"
                    checked={policy.require_special_chars}
                    onCheckedChange={(checked) =>
                      handlePolicyChange("require_special_chars", checked)
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="password_expiry_days">Password Expiry (Days)</Label>
              <Input
                id="password_expiry_days"
                type="number"
                min="0"
                max="365"
                value={policy.password_expiry_days}
                onChange={(e) =>
                  handlePolicyChange("password_expiry_days", parseInt(e.target.value))
                }
                className="max-w-xs"
              />
              <p className="text-muted-foreground text-xs">
                {policy.password_expiry_days === 0
                  ? "Passwords never expire"
                  : `Passwords must be changed every ${policy.password_expiry_days} days`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Security</CardTitle>
            <CardDescription>Configure account lockout and authentication rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="max_failed_attempts">Maximum Failed Login Attempts</Label>
              <Input
                id="max_failed_attempts"
                type="number"
                min="1"
                max="20"
                value={policy.max_failed_attempts}
                onChange={(e) =>
                  handlePolicyChange("max_failed_attempts", parseInt(e.target.value))
                }
                className="max-w-xs"
              />
              <p className="text-muted-foreground text-xs">
                Account will be locked after {policy.max_failed_attempts} failed attempts
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="lockout_duration_mins">Account Lockout Duration (Minutes)</Label>
              <Input
                id="lockout_duration_mins"
                type="number"
                min="5"
                max="1440"
                value={policy.lockout_duration_mins}
                onChange={(e) =>
                  handlePolicyChange("lockout_duration_mins", parseInt(e.target.value))
                }
                className="max-w-xs"
              />
              <p className="text-muted-foreground text-xs">
                Account will be unlocked after {policy.lockout_duration_mins} minutes
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="session_timeout_mins">Session Timeout (Minutes)</Label>
              <Input
                id="session_timeout_mins"
                type="number"
                min="5"
                max="1440"
                value={policy.session_timeout_mins}
                onChange={(e) =>
                  handlePolicyChange("session_timeout_mins", parseInt(e.target.value))
                }
                className="max-w-xs"
              />
              <p className="text-muted-foreground text-xs">
                Sessions will be automatically logged out after {policy.session_timeout_mins} minutes
                of inactivity
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <Label htmlFor="require_mfa" className="cursor-pointer text-sm font-medium">
                  Require Multi-Factor Authentication
                </Label>
                <p className="text-muted-foreground text-xs">
                  All users must enable MFA for their accounts
                </p>
              </div>
              <Switch
                id="require_mfa"
                checked={policy.require_mfa}
                onCheckedChange={(checked) => handlePolicyChange("require_mfa", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* OTP Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">One-Time Password (OTP) Settings</CardTitle>
            <CardDescription>Configure OTP generation and validation rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp_length">OTP Length (Digits)</Label>
              <Input
                id="otp_length"
                type="number"
                min="4"
                max="8"
                value={policy.otp_length}
                onChange={(e) => handlePolicyChange("otp_length", parseInt(e.target.value))}
                className="max-w-xs"
                disabled
              />
              <p className="text-muted-foreground text-xs">
                One-Time Passwords will be {policy.otp_length} digits long
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="otp_expiry_mins">OTP Expiry Time (Minutes)</Label>
              <Input
                id="otp_expiry_mins"
                type="number"
                min="1"
                max="60"
                value={policy.otp_expiry_mins}
                onChange={(e) => handlePolicyChange("otp_expiry_mins", parseInt(e.target.value))}
                className="max-w-xs"
              />
              <p className="text-muted-foreground text-xs">
                OTPs will expire after {policy.otp_expiry_mins} minute
                {policy.otp_expiry_mins !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Policy Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min. Password Length:</span>
              <span className="font-mono font-medium">{policy.min_length} characters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complexity:</span>
              <span className="font-mono font-medium">
                {[
                  policy.require_uppercase && "Upper",
                  policy.require_lowercase && "Lower",
                  policy.require_numbers && "Numbers",
                  policy.require_special_chars && "Special"
                ]
                  .filter(Boolean)
                  .join(", ") || "None"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Password Expiry:</span>
              <span className="font-mono font-medium">
                {policy.password_expiry_days === 0 ? "Never" : `${policy.password_expiry_days}d`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Failed Attempts:</span>
              <span className="font-mono font-medium">{policy.max_failed_attempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lockout Duration:</span>
              <span className="font-mono font-medium">{policy.lockout_duration_mins} mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Timeout:</span>
              <span className="font-mono font-medium">{policy.session_timeout_mins} mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MFA Required:</span>
              <span className="font-mono font-medium">{policy.require_mfa ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">OTP Length:</span>
              <span className="font-mono font-medium">{policy.otp_length} digits</span>
            </div>
          </CardContent>
        </Card>

        <div className="sticky top-6 space-y-2">
          <PermissionButton moduleCode={MODULE_CODES.USER_MGMT} action="can_configure"
            onClick={() => {
  handleSavePolicy();
}}
            disabled={!hasChanges || isSaving}
            className="w-full"
            size="lg">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Policy"}
          </PermissionButton>
          {hasChanges && (
            <p className="text-center text-xs text-amber-600 dark:text-amber-400">
              You have unsaved changes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
