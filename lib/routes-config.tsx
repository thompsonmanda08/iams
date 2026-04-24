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
  ChartPieIcon,
  CompassIcon,
  Signature,
  Settings,
  UserCog2
} from "lucide-react";
import { MODULE_CODES, type ModuleCode } from "@/lib/constants/module-codes";

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
  moduleCode?: ModuleCode;
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
          { title: "Overview", href: "/dashboard/risks", moduleCode: MODULE_CODES.RISK_OVERVIEW },
          {
            title: "Risk Registers",
            href: "/dashboard/risks/risk-registers",
            moduleCode: MODULE_CODES.RISK_REGISTERS
          },
          {
            title: "Heat Map",
            href: "/dashboard/risks/heat-map",
            moduleCode: MODULE_CODES.RISK_HEATMAP
          },
          {
            title: "KRI Registers",
            href: "/dashboard/risks/kri",
            moduleCode: MODULE_CODES.KRI_DASHBOARD
          },
          {
            title: "Incidents",
            href: "/dashboard/risks/incidents",
            moduleCode: MODULE_CODES.RISK_INCIDENTS
          },
          {
            title: "Risk Acceptances",
            href: "/dashboard/risks/risk-acceptances",
            moduleCode: MODULE_CODES.RISK_ACCEPTANCES
          }
        ]
      },
      {
        title: "Audit",
        href: "/dashboard/audit",
        icon: ClipboardCheck,
        items: [
          { title: "Overview", href: "/dashboard/audit", moduleCode: MODULE_CODES.AUDIT_OVERVIEW },
          {
            title: "Universes",
            href: "/dashboard/audit/universe",
            moduleCode: MODULE_CODES.AUDIT_PLANS
          },
          {
            title: "Budgets",
            href: "/dashboard/audit/budgets",
            moduleCode: MODULE_CODES.AUDIT_PLANS
          },
          {
            title: "Plans & Executions",
            href: "/dashboard/audit/plans",
            moduleCode: MODULE_CODES.AUDIT_PLANS
          }
        ]
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: ChartPieIcon,
        moduleCode: MODULE_CODES.AUDIT_REPORTS
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
          {
            title: "Risk Actions",
            href: "/dashboard/actions/risk",
            moduleCode: MODULE_CODES.RISK_ACTIONS
          },
          {
            title: "Audit Actions & Logs",
            href: "/dashboard/actions/audit",
            moduleCode: MODULE_CODES.AUDIT_PLANS
          }
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
            icon: ShieldCheck,
            moduleCode: MODULE_CODES.WORKFLOW_CONFIG
          },

          {
            title: "Workflow Designer",
            href: "/dashboard/workflow/manage",
            icon: ShieldCheck,
            moduleCode: MODULE_CODES.WORKFLOW_CONFIG
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
            icon: Signature,
            moduleCode: MODULE_CODES.RISK_MODULE_CONFIGS
          },
          {
            title: "Acceptance Signatories",
            href: "/dashboard/system-configs/risk-acceptance-signatories",
            icon: Signature,
            moduleCode: MODULE_CODES.RISK_MODULE_CONFIGS
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
            icon: Signature,
            moduleCode: MODULE_CODES.AUDIT_MODULE_CONFIG
          },
          {
            title: "Workpaper Templates",
            href: "/dashboard/system-configs/audit-settings/templates",
            icon: Signature,
            moduleCode: MODULE_CODES.AUDIT_MODULE_CONFIG
          }
        ]
      },
      {
        title: "Report Guides Settings",
        href: "/dashboard/system-configs/report-guides-settings",
        icon: CompassIcon,
        moduleCode: MODULE_CODES.AUDIT_MODULE_CONFIG
      }
    ]
  },
  {
    title: "System Configuration",
    items: [
      {
        title: "System Setup",
        href: "/dashboard/system-configs/setup",
        icon: UserCog2,
        items: [
          {
            title: "Branches",
            href: "/dashboard/system-configs/setup?tab=branches",
            icon: MapPin,
            moduleCode: MODULE_CODES.BRANCH_MGMT
          },
          {
            title: "Departments",
            href: "/dashboard/system-configs/setup?tab=departments",
            icon: BriefcaseBusiness,
            moduleCode: MODULE_CODES.DEPT_MGMT
          },
          {
            title: "Users",
            href: "/dashboard/system-configs/setup?tab=users",
            icon: Users,
            moduleCode: MODULE_CODES.USER_MGMT
          }
        ]
      },

      {
        title: "General Settings",
        href: "/dashboard/system-configs",
        icon: Settings
      }
    ]
  }
];

// Legacy export for backward compatibility (if needed elsewhere)
export const page_routes = navItems;
