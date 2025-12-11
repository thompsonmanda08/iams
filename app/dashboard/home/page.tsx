import { redirect } from "next/navigation";

import { initializeSystemSetup } from "@/app/_actions/auth-actions";
import { User } from "@/lib/types/account";
import {  verifySession } from "@/lib/session";
import Dashboard from "./_components/dashboard";

export default async function RiskDashboard() {
  const { session, isAuthenticated, user_type } = await verifySession();
  const user = session?.user as User;

  if (!isAuthenticated) return redirect("/login");

  if (user_type === "BACKOFFICE_ADMIN") return redirect("/admin/home");

  // Create a minimal user object if user is not available
  const enrichedUser =
    user ||
    ({
      id: session?.user_id || "",
      email: session?.user?.email || "",
      user_type: user_type
    } as User);

  return <Dashboard />;
}
