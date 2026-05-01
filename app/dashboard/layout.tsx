import React from "react";
import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import { User } from "@/lib/types/account";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { fetchSystemSetup } from "@/app/_actions/auth-actions";

export const dynamic = "force-dynamic";

export default async function DashLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen =
    cookieStore.get("sidebar_state")?.value === "true" ||
    cookieStore.get("sidebar_state") === undefined;

  const { session, isAuthenticated, user_type } = await verifySession();
  const user = session?.user as User;

  if (!isAuthenticated) {
    return redirect("/login");
  }

  // MFA guard: a password-only session must not reach protected routes by URL typing.
  if (session?.mfa_required && !session?.mfa_verified) {
    return redirect("/otp");
  }

  if (user_type === "BACKOFFICE_ADMIN") {
    return redirect("/admin/home");
  }

  // Pre-fetch the system setup server-side so the sidebar renders with
  // permissions and user data already populated — no skeleton flash on reload.
  // Reads from the encrypted PERMISSIONS_SESSION cookie cache when fresh,
  // hits the backend only on cache miss / expiry.
  const setupResponse = await fetchSystemSetup();
  const initialSetup = setupResponse.success ? setupResponse.data : null;

  const enrichedUser = {
    ...user,
    ...(initialSetup?.user ?? {}),
    user_type: user_type || session?.user_type
  } as User;

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)"
        } as React.CSSProperties
      }>
      <AppSidebar
        variant="inset"
        user={enrichedUser}
        isAuthenticated={!!user_type}
        initialSetup={initialSetup}
      />
      <SidebarInset>
        <SiteHeader user={enrichedUser} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main px-6 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
