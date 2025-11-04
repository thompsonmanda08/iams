import { redirect } from "next/navigation";
import { RiskDashboardClient } from "./_components/risk-dashboard-client";
import { initializeSystemSetup } from "@/app/_actions/auth-actions";
import { User } from "@/lib/types/account";
import { getUserSession, verifySession } from "@/lib/session";

export default async function RiskDashboard() {
  const { session, isAuthenticated, user_type } = await verifySession();
  const user = session?.user as User;

  if (!isAuthenticated) return redirect("/login");

  if (user_type === "BACKOFFICE_ADMIN") return redirect("/admin/home");

  // Create a minimal user object if user is not available
  const enrichedUser = user || {
    id: session?.user_id || "",
    email: session?.user?.email || "",
    user_type: user_type,
  } as User;

  return <RiskDashboardClient user={enrichedUser} />;
}
