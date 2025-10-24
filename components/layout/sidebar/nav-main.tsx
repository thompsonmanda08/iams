"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ActivityIcon,
  ChevronRight,
  SettingsIcon,
  type LucideIcon,
  MonitorCogIcon,
  LucideShieldCheck,
  BookOpenCheck
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type NavGroup = {
  title: string;
  items: NavItem;
};

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: NavItem;
}[];

export const navItems: NavGroup[] = [
  {
    title: "Modules",
    items: [
      {
        title: "Risk",
        href: "/dashboard/risks",
        icon: ActivityIcon,
        items: [
          { title: "Overview", href: "/dashboard/risks" },
          { title: "Risk Register", href: "/dashboard/risks/risk-register" },
          { title: "Heat Map", href: "/dashboard/risks/heat-map" },
          { title: "KRI Dashboard", href: "/dashboard/risks/kri" },
          { title: "Actions", href: "/dashboard/risks/actions" }
        ]
      },

      {
        title: "Audit",
        href: "/dashboard/audit",
        icon: BookOpenCheck,
        isNew: true,
        items: [
          { title: "Overview", href: "/dashboard/audit" },
          { title: "Audit Plans", href: "/dashboard/audit/plans" },
          { title: "Workpapers", href: "/dashboard/audit/workpapers" },
          { title: "Reports", href: "/dashboard/audit/reports" }
        ]
      }
    ]
  },
  {
    title: "System Setup",
    items: [
      {
        title: "Configurations",
        href: "#",
        icon: SettingsIcon,
        items: [
          { title: "Branches", href: "/dashboard/system-configs/branches" },
          { title: "Departments", href: "/dashboard/system-configs/departments" },
          { title: "Users Management", href: "/dashboard/system-configs/users" },
          { title: "Modules", href: "/dashboard/system-configs/modules" },
        ]
      }
      // {
      //   title: "Workflows",
      //   href: "#",
      //   icon: MonitorCogIcon,
      //   items: [
      //     { title: "Branches", href: "/dashboard/ecommerce" },
      //     { title: "Departments", href: "/dashboard/pages/products" },
      //     { title: "Risk Configs", href: "/dashboard/pages/products/1" },
      //     { title: "Audit Configs", href: "/dashboard/pages/products/create" }
      //   ]
      // }
      // {
      //   title: "Security",
      //   href: "#",
      //   icon: LucideShieldCheck,
      //   items: [
      //     { title: "Branches", href: "/dashboard/ecommerce" },
      //     { title: "Departments", href: "/dashboard/pages/products" },
      //     { title: "Risk Configs", href: "/dashboard/pages/products/1" },
      //     { title: "Audit Configs", href: "/dashboard/pages/products/create" }
      //   ]
      // }
    ]
  }
];

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <>
      {navItems.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {nav.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {Array.isArray(item.items) && item.items.length > 0 ? (
                    <>
                      <div className="hidden group-data-[collapsible=icon]:block">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side={isMobile ? "bottom" : "right"}
                            align={isMobile ? "end" : "start"}
                            className="min-w-48 rounded-lg">
                            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                            {item.items?.map((item) => (
                              <DropdownMenuItem
                                className="hover:text-foreground active:text-foreground active:bg-primary/10! hover:bg-primary/10!"
                                asChild
                                key={item.title}>
                                <Link href={item.href}>{item.title}</Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Collapsible className="group/collapsible block group-data-[collapsible=icon]:hidden">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="hover:text-foreground active:text-foreground hover:bg-primary/10 active:bg-primary/10"
                            tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item?.items?.map((subItem, key) => (
                              <SidebarMenuSubItem key={key}>
                                <SidebarMenuSubButton
                                  className="hover:text-foreground active:text-foreground hover:bg-primary/10 active:bg-primary/10"
                                  isActive={pathname === subItem.href}
                                  asChild>
                                  <Link href={subItem.href} target={subItem.newTab ? "_blank" : ""}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  ) : (
                    <SidebarMenuButton
                      className="hover:text-foreground active:text-foreground hover:bg-primary/10 active:bg-primary/10"
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      asChild>
                      <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                  {!!item.isComing && (
                    <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                      Coming
                    </SidebarMenuBadge>
                  )}
                  {!!item.isNew && (
                    <SidebarMenuBadge
                      className={cn(
                        "border border-green-400 text-green-600 peer-hover/menu-button:text-green-600",
                        {
                          "absolute top-1.5 right-8 opacity-80":
                            Array.isArray(item.items) && item.items.length > 0
                        }
                      )}>
                      New
                    </SidebarMenuBadge>
                  )}
                  {!!item.isDataBadge && (
                    <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                      {item.isDataBadge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
