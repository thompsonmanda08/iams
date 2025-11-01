import { redirect } from "next/navigation";

/**
 * Root "/" page - Simplified routing
 *
 * Authentication and routing logic is now handled by:
 * - proxy.ts: Fast cookie check and basic redirects
 * - (auth)/layout.tsx: Handles MFA and authenticated user routing
 * - dashboard/layout.tsx: Protects dashboard routes
 *
 * This root page just redirects to dashboard home.
 * If user is unauthenticated, proxy will intercept and redirect to /login.
 */
export default async function HomePage() {
  // Direct redirect to dashboard
  // Proxy ensures only authenticated users reach here
  redirect("/dashboard/home");
}
