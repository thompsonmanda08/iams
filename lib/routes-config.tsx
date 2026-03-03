import {
  ShieldAlert,
  ClipboardCheck,
  Building,
  MapPin,
  Users,
  type LucideIcon,
  LayoutDashboard,
  Workflow,
  Home,
  ShieldCheck,
  FileUserIcon,
  ShieldQuestion,
  ClipboardListIcon,
  BriefcaseBusiness,
  MailCheck,
  ChartPieIcon,
  CompassIcon,
  SquareAsterisk,
  Signature,
  Settings,
  UserCog2
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
    title: "Dashboard",
    items: [
      {
        title: "Home",
        href: "/dashboard/home",
        icon: Home
      }
    ]
  },
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
          { title: "KRI Registers", href: "/dashboard/risks/kri" },
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
          { title: "Universes", href: "/dashboard/audit/universe" },
          { title: "Budgets", href: "/dashboard/audit/budgets" },
          { title: "Plans & Executions", href: "/dashboard/audit/plans" }
        ]
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: ChartPieIcon
      }
    ]
  },

  {
    title: "Workflow & Actions",
    items: [
      {
        title: "Actions",
        href: "/dashboard/actions",
        icon: FileUserIcon,
        items: [
          { title: "Risk Actions", href: "/dashboard/actions/risk" },
          { title: "Audit Actions & Logs", href: "/dashboard/actions/audit" }
        ]
      },

      {
        title: "Manage Workflow",
        href: "/dashboard/workflow/manage",
        icon: Workflow,
        items: [
          {
            title: "Tasks & Approvals",
            href: "/dashboard/approvals",
            icon: ShieldCheck
          },

          {
            title: "Workflow Designer",
            href: "/dashboard/workflow/manage",
            icon: ShieldCheck
          }
        ]
      }
    ]
  },
  {
    title: "Module Configurations",
    items: [
      {
        title: "Risk Module Settings",
        href: "/dashboard/system-configs/risk-settings",
        icon: ShieldQuestion,
        items: [
          {
            title: "Risk Settings",
            href: "/dashboard/system-configs/risk-settings",
            icon: Signature
          },
          {
            title: "Risk Acceptance Signatories",
            href: "/dashboard/system-configs/risk-acceptance-signatories",
            icon: Signature
          }
        ]
      },
      {
        title: "Audit Module Settings",
        href: "/dashboard/system-configs/audit-settings",
        icon: ClipboardListIcon,
        items: [
          {
            title: "Audit Settings",
            href: "/dashboard/system-configs/audit-settings",
            icon: Signature
          },
          {
            title: "Audit Workpaper Templates",
            href: "/dashboard/system-configs/audit-settings/templates",
            icon: Signature
          }
        ]
      },
      {
        title: "Report Guides Settings",
        href: "/dashboard/system-configs/report-guides-settings",
        icon: CompassIcon
      }
    ]
  },
  {
    title: "System Configuration",
    items: [
      {
        title: "Setup",
        href: "/dashboard/system-configs/departments",
        icon: UserCog2,
        items: [
          {
            title: "Branches",
            href: "/dashboard/system-configs/branches",
            icon: MapPin
          },
          {
            title: "Departments",
            href: "/dashboard/system-configs/departments",
            icon: BriefcaseBusiness
          },
          {
            title: "Users",
            href: "/dashboard/system-configs/users",
            icon: Users
          }
        ]
      },

      {
        title: "General Settings",
        href: "/dashboard/system-configs",
        icon: Settings,
        isNew: true,
        items: [
          {
            title: "Mail Settings",
            href: "/dashboard/system-configs/mail-settings",
            icon: MailCheck
          },
          {
            title: "Password Policy",
            href: "/dashboard/system-configs/password-policy",
            icon: SquareAsterisk
          }
        ]
      }
    ]
  }
];

// Legacy export for backward compatibility (if needed elsewhere)
export const page_routes = navItems;
