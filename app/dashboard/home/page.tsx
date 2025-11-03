import { redirect } from "next/navigation";
import { RiskDashboardClient } from "./_components/risk-dashboard-client";
import { initializeSystemSetup } from "@/app/_actions/auth-actions";
import { User } from "@/lib/types/account";
import { getUserSession, verifySession } from "@/lib/session";

export default async function RiskDashboard() {
  // const systemInit = await initializeSystemSetup();
  // const user = systemInit?.data?.user as User;

  const { session } = await verifySession();
  const user = session?.user as User;

  return <RiskDashboardClient user={user} />;
}
