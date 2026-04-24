"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Signature, RotateCw } from "lucide-react";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { notify } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useRoles } from "@/hooks/use-query-data";
import { MultiSelectField } from "@/components/ui/multi-select-field";
import {
  getRiskAcceptanceConfig,
  updateRiskAcceptanceConfig,
  type RiskAcceptanceConfig,
  type RiskAcceptanceConfigInput
} from "@/app/_actions/risk-module-actions";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

export default function RiskAcceptanceSignatoriesPage() {
  const { checkPermission } = usePermissions();
  const [config, setConfig] = useState<Partial<RiskAcceptanceConfig>>({
    signoff_role_ids: [],
    is_enabled: false
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useRoles({ isActive: true });

  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ["risk_acceptance_config"],
    queryFn: async () => {
      try {
        const response = await getRiskAcceptanceConfig();
        if (response.success && response.data) {
          setConfig(response.data as RiskAcceptanceConfig);
        } else {
          // Initialize with empty config if none exists
          setConfig({
            signoff_role_ids: [],
            is_enabled: false
          });
        }
      } catch (error) {
        // Initialize with empty config on error
        setConfig({
          signoff_role_ids: [],
          is_enabled: false
        });
      } finally {
        setIsInitializing(false);
      }
      return null;
    },
    retry: 1
  });

  const { mutate: handleSaveConfig, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const input: RiskAcceptanceConfigInput = {
        signoff_role_ids: config.signoff_role_ids || [],
        is_enabled: config.is_enabled || false
      };
      const response = await updateRiskAcceptanceConfig(input);
      if (!response.success) {
        throw new Error(response.message || "Failed to save configuration");
      }
      return response;
    },
    onSuccess: (response) => {
      notify({ description: response.message || "Risk acceptance configuration updated successfully", type: "success" });
      setHasChanges(false);
    },
    onError: (error: any) => {
      notify({ description: error.message || "Failed to save configuration", type: "error" });
    }
  });

  const handleConfigChange = (key: keyof RiskAcceptanceConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleRoleChange = (selectedRoleIds: string[]) => {
    handleConfigChange("signoff_role_ids", selectedRoleIds);
  };

  // Convert roles data to select options
  const roleOptions =
    rolesData?.data?.data?.map((role: any) => ({
      value: role.id,
      label: role.name
    })) || [];

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-t-primary h-8 w-8 animate-spin rounded-full border-4 border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Risk Acceptance Signatories"
            description="Configure roles authorized to sign off on risk acceptances"
            Icon={Signature}
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Risk Acceptance Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signatory Configuration</CardTitle>
                <CardDescription>
                  Define which roles are authorized to sign off on risk acceptances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <label className="cursor-pointer text-sm font-medium">
                      Enable Risk Acceptance Signatories
                    </label>
                    <p className="text-muted-foreground text-xs">
                      Require authorized signatories to approve risk acceptances
                    </p>
                  </div>
                  <Switch
                    checked={config.is_enabled || false}
                    onCheckedChange={(checked) => handleConfigChange("is_enabled", checked)}
                  />
                </div>

                <Separator />

                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Authorized Signatory Roles</label>
                  <p className="text-muted-foreground text-xs">
                    Select one or more roles that can sign off on risk acceptances
                  </p>
                  {rolesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <MultiSelectField
                      options={roleOptions}
                      value={config.signoff_role_ids || []}
                      onValueChange={handleRoleChange}
                      placeholder="Select roles..."
                      disabled={!config.is_enabled}
                    />
                  )}
                  {(config.signoff_role_ids?.length || 0) === 0 && config.is_enabled && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      At least one role must be selected when signatories are enabled
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="text-base text-blue-900 dark:text-blue-100">
                  How it works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                <p>
                  When enabled, risk acceptances will require approval from users with the selected
                  roles before they can be finalized.
                </p>
                <ul className="list-inside list-disc space-y-2">
                  <li>Users with selected roles will receive approval requests</li>
                  <li>Acceptances cannot be completed without proper authorization</li>
                  <li>All sign-offs are tracked for audit purposes</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-mono font-medium">
                    {config.is_enabled ? (
                      <span className="text-green-600 dark:text-green-400">Enabled</span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">Disabled</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authorized Roles:</span>
                  <span className="font-mono font-medium">
                    {config.signoff_role_ids?.length || 0}
                  </span>
                </div>
                {(config.signoff_role_ids?.length || 0) > 0 && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <p className="text-muted-foreground text-xs font-medium">Selected Roles:</p>
                    <div className="space-y-1">
                      {(config.signoff_role_ids || []).map((roleId) => {
                        const role = rolesData?.data?.data?.find((r: any) => r.id === roleId);
                        return (
                          <div
                            key={roleId}
                            className="bg-background flex items-center gap-2 rounded px-2 py-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs">{role?.name || roleId}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="sticky top-6 space-y-2">
              <Button
                onClick={() => {
                  if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_configure")) return;
                  handleSaveConfig();
                }}
                disabled={!hasChanges || isSaving}
                className="w-full"
                size="lg">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
              {hasChanges && (
                <p className="text-center text-xs text-amber-600 dark:text-amber-400">
                  You have unsaved changes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
