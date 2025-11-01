import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { initializeSystemSetup } from "../_actions/auth-actions";

export default async function HomePage() {
  const { isAuthenticated } = await verifySession();

  if (isAuthenticated) return redirect("/dashboard/home");

  return redirect("/login");
}
