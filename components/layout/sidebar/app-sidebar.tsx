"use client";

import * as React from "react";
import { useEffect } from "react";
import { ChevronsUpDown, HistoryIcon, ShoppingBagIcon, UserCircle2Icon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useIsTablet } from "@/hooks/use-mobile";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/components/layout/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useSystemSetup } from "@/hooks/use-users-query-data";

export function AppSidebar({
  user: userData,
  isAuthenticated,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: any; isAuthenticated: boolean }) {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();

  const isLoadingUser = !userData || Object.keys(userData).length <= 0; // USER OBJECT HAS NO KEYS

  const { data: session } = useSystemSetup(isLoadingUser);

  const user = React.useMemo(() => {
    return {
      ...userData,
      ...session?.data?.user
    };
  }, [session?.data, userData, isLoadingUser]);

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain user={user} isAuthenticated={isAuthenticated} />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {/* NAV USER */}
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
