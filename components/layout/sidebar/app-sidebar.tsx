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
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="hover:text-foreground h-10 items-center overflow-visible group-data-[collapsible=icon]:px-0! hover:bg-(--primary)/5">
                  <Logo />
                  <span className="mt-1 text-lg font-bold group-data-[collapsible=icon]:hidden">
                    IAMS
                  </span>
                  <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="mt-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}>
                <DropdownMenuLabel>All Dashboards</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={"/dashboard/home"} className="flex items-center gap-3">
                    <UserCircle2Icon className="text-muted-foreground size-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Personal Risk Profile</span>
                      {/* <span className="text-muted-foreground text-xs">Active</span> */}
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={"/dashboard/home/operations"} className="flex items-center gap-3">
                    <ShoppingBagIcon className="text-muted-foreground size-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Operational Risk</span>
                      {/* <span className="text-muted-foreground text-xs">Inactive</span> */}
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={"/dashboard/home/audit"} className="flex items-center gap-3">
                    <HistoryIcon className="text-muted-foreground size-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Audit & Assurance</span>
                      {/* <span className="text-muted-foreground text-xs">Inactive</span> */}
                    </div>
                  </Link>
                </DropdownMenuItem>

                {/*   <DropdownMenuSeparator /> <DropdownMenuItem asChild>
                  <Button className="w-full" variant="secondary">
                    <PlusIcon />
                    Add New Project
                  </Button>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
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
