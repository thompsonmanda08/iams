import {
  ShieldAlert,
  ClipboardCheck,
  Building,
  MapPin,
  Users,
  Package,
  type LucideIcon,
  Settings,
  BookTemplate,
  Sliders,
  LayoutDashboard,
  Workflow
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

export const adminNavItems: NavGroup[] = [
  {
    title: "Dashboards",
    items: [
      {
        title: "Overview",
        href: "/admin/home",
        icon: LayoutDashboard
      }
      // {
      //   title: "Risk Module",
      //   href: "/dashboard/system-configs/risk-settings",
      //   icon: Package
      // }
    ]
  },

  // GLOBALLY AVAILABLE MODULES
  {
    title: "Global System",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users
      },
      {
        title: "Companies",
        href: "/admin/companies",
        icon: Building
      }
    ]
  },

  // SYSTEM CONFIGS
  {
    title: "System Configurations",
    items: [
      {
        title: "Locations",
        href: "/admin/configurations",
        icon: MapPin
        // items: [
        //   { title: "Countries", href: "/admin/locations/countries" },
        //   { title: "Provinces", href: "/admin/locations/provinces" },
        //   { title: "Towns", href: "/admin/locations/towns" }
        // ]
      }
    ]
  }
];

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
          { title: "Actions", href: "/dashboard/risks/actions" },
          { title: "Incidents", href: "/dashboard/risks/incidents" },
          { title: "Risk Acceptances", href: "/dashboard/risks/risk-acceptances" }
        ]
      },
      {
        title: "Audit",
        href: "/dashboard/audit",
        icon: ClipboardCheck,
        items: [
          { title: "Overview", href: "/dashboard/audit" },
          { title: "Audit Universes", href: "/dashboard/audit/universe" },
          { title: "Budgets", href: "/dashboard/audit/budgets" },
          { title: "Plans & Executions", href: "/dashboard/audit/plans" },
          { title: "Tasks & Actions", href: "/dashboard/audit/tasks" } // WORKFLOW
          // { title: "Workpapers", href: "/dashboard/audit/workpapers" }
          // { title: "Findings", href: "/dashboard/audit/findings" },
          // { title: "Reports", href: "/dashboard/audit/reports" }
        ]
      }
    ]
  },
  {
    title: "System Configuration",
    items: [
      {
        title: "Core Settings",
        href: "/dashboard/system-configs",
        icon: Settings,
        items: [
          {
            title: "Branches",
            href: "/dashboard/system-configs/branches",
            icon: MapPin
          },
          {
            title: "Departments",
            href: "/dashboard/system-configs/departments",
            icon: Building
          },

          {
            title: "Workflow",
            href: "/dashboard/system-configs/workflow",
            icon: Workflow
          },
          {
            title: "Users",
            href: "/dashboard/system-configs/users",
            icon: Users
          },
          {
            title: "Mail Settings",
            href: "/dashboard/system-configs/mail-settings",
            icon: Users
          }
        ]
      },
      {
        title: "Module Settings",
        href: "/dashboard/system-configs",
        icon: Sliders,
        items: [
          {
            title: "Audit Module Configs",
            href: "/dashboard/system-configs/audit-settings",
            icon: BookTemplate
          },
          {
            title: "Risk Module Configs",
            href: "/dashboard/system-configs/risk-settings",
            icon: Package
          }
        ]
      }
    ]
  }
];

// Legacy export for backward compatibility (if needed elsewhere)
export const page_routes = navItems;
