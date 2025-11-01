import React from "react";
import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import { getUserSession, verifySession } from "@/lib/session";
import { User } from "@/lib/types/account";
import { SessionInitializer } from "./_components/session-initializer";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen =
    cookieStore.get("sidebar_state")?.value === "true" ||
    cookieStore.get("sidebar_state") === undefined;

  const { session, isAuthenticated } = await verifySession();

  // Fallback to backup if user is missing from main session
  // This handles edge cases during session updates
  let finalSession = session;
  if (!session?.user || Object.keys(session.user).length === 0) {
    console.warn("⚠️ User missing from main session, checking backup...");
    const backup = await getUserSession();
    if (backup?.user) {
      console.log("✅ User restored from backup");
      finalSession = {
        ...session,
        user: backup.user,
        permissions: backup.permissions || session?.permissions
      } as typeof session;
    } else {
      console.info("❌ No user in main session or backup!");
    }
  }

  // console.log("📊 DASHBOARD SESSION:", {
  //   hasUser: !!finalSession?.user,
  //   userName: finalSession?.user?.first_name,
  //   userKeys: finalSession?.user ? Object.keys(finalSession.user) : []
  // });

  const hasUser = !!(finalSession?.user && Object.keys(finalSession.user).length > 0);

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)"
        } as React.CSSProperties
      }>
      {/* Initialize session if user data is missing */}
      <SessionInitializer hasUser={hasUser} />

      <AppSidebar variant="inset" session={finalSession} isAuthenticated={isAuthenticated} />
      <SidebarInset>
        <SiteHeader user={finalSession?.user as User} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
