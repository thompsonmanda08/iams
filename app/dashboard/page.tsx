import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { initializeSystemSetup } from "../_actions/auth-actions";

export default async function HomePage() {
  const session = await verifySession();

  if (session?.isAuthenticated) {
    await initializeSystemSetup();
    redirect("/dashboard/home");
  }

  redirect("/login");
}
