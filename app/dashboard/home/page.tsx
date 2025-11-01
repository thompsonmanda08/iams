import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { RiskDashboardClient } from "./_components/risk-dashboard-client";

export default async function RiskDashboard() {
  const { isAuthenticated, session } = await verifySession();

  if (!isAuthenticated || !session) {
    redirect("/login");
  }

  const user = session.user;

  return <RiskDashboardClient user={user} />;
}
