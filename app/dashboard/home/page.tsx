import { redirect } from "next/navigation";
import { RiskDashboardClient } from "./_components/risk-dashboard-client";
import { initializeSystemSetupCached } from "@/app/_actions/auth-actions";
import { User } from "@/lib/types/account";

export default async function RiskDashboard() {
  const systemInit = await initializeSystemSetupCached();
  const user = systemInit?.data?.user as User;

  return <RiskDashboardClient user={user} />;
}
