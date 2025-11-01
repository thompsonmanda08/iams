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
  Book,
  BookOpenCheckIcon,
  Building,
  Calendar,
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  Eye,
  FileText,
  FolderOpen,
  Grid,
  LucideIcon,
  MapPin,
  Puzzle,
  Settings,
  ShieldAlert,
  TrendingUp,
  Users
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
import { adminNavItems, navItems } from "@/lib/routes-config";
import { useQuery } from "@tanstack/react-query";
import { getModules } from "@/app/_actions/config-actions";
import { useMemo } from "react";
import { useSystemSetup } from "@/hooks/use-users-query-data";
import { Skeleton } from "@/components/ui/skeleton";

// Icon mapping based on the icon strings from API
const iconMap: Record<string, LucideIcon> = {
  "exclamation-triangle": ShieldAlert,
  "file-alt": ClipboardCheck,
  users: Users,
  sitemap: Building,
  building: MapPin,
  "map-pin": MapPin,
  "puzzle-piece": Puzzle,
  cog: Settings,
  eye: Eye,
  book: BookOpenCheckIcon,
  th: Grid,
  "chart-line": TrendingUp,
  tasks: CheckSquare,
  "calendar-alt": Calendar,
  "folder-open": FolderOpen,
  "file-pdf": FileText,
  "clipboard-list": ClipboardCheck
};

// Type definitions
interface ApiModule {
  id: string;
  module_code: string;
  name: string;
  description: string;
  parent_module_id: string | null;
  href: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  items?: NavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Transforms API module response into navigation structure
 */
export function transformModulesToNav(apiModules: ApiModule[]): NavGroup[] {
  // Filter only active modules
  const activeModules = apiModules.filter((m) => m.is_active);

  // Separate parent modules from child modules
  const parentModules = activeModules.filter((m) => m.parent_module_id === null);
  const childModules = activeModules.filter((m) => m.parent_module_id !== null);

  // Group children by parent_module_id
  const childrenByParent = childModules.reduce(
    (acc, child) => {
      const parentId = child.parent_module_id!;
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(child);
      return acc;
    },
    {} as Record<string, ApiModule[]>
  );

  // Sort children within each parent by sort_order
  Object.keys(childrenByParent).forEach((parentId) => {
    childrenByParent[parentId].sort((a, b) => a.sort_order - b.sort_order);
  });

  // Categorize parent modules
  const configModule = parentModules.find((m) => m.module_code === "CONFIGS");
  const otherModules = parentModules
    .filter((m) => m.module_code !== "CONFIGS")
    .sort((a, b) => a.sort_order - b.sort_order);

  const navGroups: NavGroup[] = [];

  // Create "Modules" group for non-config parents
  if (otherModules.length > 0) {
    navGroups.push({
      title: "Modules",
      items: otherModules.map((parent) => {
        const children = childrenByParent[parent.id] || [];
        const firstChild = children[0];

        return {
          title: parent.name,
          href: firstChild?.href || "/dashboard",
          icon: iconMap[parent.icon] || Settings,
          items: children.map((child) => ({
            title: child.name,
            href: child.href || "#"
          }))
        };
      })
    });
  }

  // Create "System Configuration" group for config module
  if (configModule) {
    const configChildren = childrenByParent[configModule.id] || [];

    navGroups.push({
      title: "System Configuration",
      items: configChildren.map((child) => ({
        title: child.name,
        href: child.href || "#",
        icon: iconMap[child.icon] || Settings
      }))
    });
  }

  return navGroups;
}

/**
 * Alternative: Transform with custom grouping logic
 * Use this if you want more control over how modules are grouped
 */
export function transformModulesToNavCustom(
  apiModules: ApiModule[],
  options?: {
    modulesGroupTitle?: string;
    configGroupTitle?: string;
    configModuleCode?: string;
  }
): NavGroup[] {
  const {
    modulesGroupTitle = "Modules",
    configGroupTitle = "System Configuration",
    configModuleCode = "CONFIGS"
  } = options || {};

  return transformModulesToNav(apiModules);
}

export function NavMain({ session, isAuthenticated }: { session: any; isAuthenticated: boolean }) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { data: setup, isLoading } = useSystemSetup();
  // const routes = setup?.data?.navigation || [];
  // console.log("NAV", setup);

  const routes = useMemo(() => {
    return session?.user?.user_type === "BACKOFFICE_USER" && pathname.startsWith("/admin/")
      ? adminNavItems // ADMIN ROUTES
      : navItems; // DEFAULT ROUTES
  }, [navItems, session?.user?.user_type]);

  return isLoading ? (
    <div className="space-y-2 px-1 pt-2 pb-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  ) : (
    <>
      {routes &&
        routes.map((nav: NavGroup) => (
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
                                    <Link
                                      href={subItem.href}
                                      // target={subItem.newTab ? "_blank" : ""}
                                    >
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
                        <Link
                          href={item.href}
                          // target={item.newTab ? "_blank" : ""}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                    {/* {!!item.isComing && (
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
                    )} */}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
    </>
  );
}
