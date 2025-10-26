import {
  ShieldAlert,
  ClipboardCheck,
  Building,
  MapPin,
  Users,
  Package,
  type LucideIcon
} from "lucide-react";

export type NavGroup = {
  title: string;
  items: NavItem;
};

export type NavItem = {
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
        icon: ShieldAlert,
        items: [
          { title: "Overview", href: "/dashboard/risks" },
          { title: "Risk Registers", href: "/dashboard/risks/risk-registers" },
          { title: "Heat Map", href: "/dashboard/risks/heat-map" },
          { title: "KRI Dashboard", href: "/dashboard/risks/kri" },
          { title: "Actions", href: "/dashboard/risks/actions" }
        ]
      },
      {
        title: "Audit",
        href: "/dashboard/audit",
        icon: ClipboardCheck,
        items: [
          { title: "Dashboard", href: "/dashboard/audit" },
          { title: "Plans", href: "/dashboard/audit/plans" },
          { title: "Workpapers", href: "/dashboard/audit/workpapers" },
          { title: "Findings", href: "/dashboard/audit/findings" },
          { title: "Reports", href: "/dashboard/audit/reports" }
        ]
      }
    ]
  },
  {
    title: "System Configuration",
    items: [
      {
        title: "Users",
        href: "/dashboard/system-configs/users",
        icon: Users
      },
      {
        title: "Departments",
        href: "/dashboard/system-configs/departments",
        icon: Building
      },
      {
        title: "Branches",
        href: "/dashboard/system-configs/locations",
        icon: MapPin
      },
      {
        title: "Modules",
        href: "/dashboard/system-configs/modules",
        icon: Package
      }
    ]
  }
];

// Legacy export for backward compatibility (if needed elsewhere)
export const page_routes = navItems;
