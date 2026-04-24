import "server-only";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { fetchSystemSetup } from "@/app/_actions/auth-actions";
import { buildPermissionMap } from "@/lib/permissions/build-permission-map";
import type { ModuleCode } from "@/lib/constants/module-codes";

/**
 * Gate a server component / layout by the current user's can_view permission on a module.
 *
 * - Redirects to /login when unauthenticated.
 * - Short-circuits for BACKOFFICE_ADMIN (matching the client-side bypass in usePermissions).
 * - Redirects to /dashboard/home when the user lacks can_view on the module.
 *
 * Uses `fetchSystemSetup` (read-only, no cookie writes) so it's safe to call
 * from Server Components. Wrapped in React.cache() so repeated calls inside
 * one request share a single HTTP fetch.
 */
export async function requireModuleView(moduleCode: ModuleCode): Promise<void> {
  const { isAuthenticated, user_type } = await verifySession();
  if (!isAuthenticated) redirect("/login");
  if (user_type === "BACKOFFICE_ADMIN") return;

  const setup = await fetchSystemSetup();
  const perms = (setup?.data?.permissions as any[] | undefined) ?? [];
  const map = buildPermissionMap(perms);

  if (map.get(moduleCode)?.can_view !== true) {
    redirect("/dashboard/home");
  }
}
