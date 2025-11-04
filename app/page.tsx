import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";

/**
 * Root "/" page - Entry point routing
 *
 * Routes users based on authentication status:
 * - Authenticated users: Redirect to their appropriate dashboard
 * - Unauthenticated users: Redirect to login
 */
export default async function HomePage() {
  const { isAuthenticated, session } = await verifySession();

  if (isAuthenticated) {
    // Redirect authenticated users to their dashboard
    if (session?.user_type === "BACKOFFICE_ADMIN") {
      redirect("/admin/home");
    }
    redirect("/dashboard/home");
  }

  // Redirect unauthenticated users to login
  redirect("/login");
}
