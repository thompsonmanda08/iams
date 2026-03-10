"use client";

import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession } from "@/store/session-store";

const AUTHORIZED_ROLES = ["system administrator", "sys admin", "system admin"];

function isSystemAdmin(roleName?: string): boolean {
  if (!roleName) return false;
  return AUTHORIZED_ROLES.includes(roleName.trim().replaceAll("_", " ").toLowerCase());
}

interface SettingsAccessGuardProps {
  children: React.ReactNode;
  settingName?: string;
}

export function SettingsAccessGuard({
  children,
  settingName = "these settings"
}: SettingsAccessGuardProps) {
  const { user, isLoading } = useSession();

  const authorized = isLoading || isSystemAdmin(user?.role?.name);

  return (
    <div className="space-y-4">
      {!isLoading && !authorized && (
        <Alert
          variant="destructive"
          className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 [&>svg]:text-amber-500">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Restricted — View Only</AlertTitle>
          <AlertDescription>
            Contact your system administrator to request changes. You are not authorized to modify{" "}
            {settingName}.
          </AlertDescription>
        </Alert>
      )}

      <div
        className={!authorized && !isLoading ? "pointer-events-none opacity-60 select-none" : ""}>
        {children}
      </div>
    </div>
  );
}
