export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;

export const POCKET_BASE_URL =
  process.env.POCKET_BASE_URL || process.env.NEXT_PUBLIC_POCKET_BASE_URL;

export const AUTH_SESSION = "__com.bgs.IAMS-infratel-portal.com__";
export const USER_SESSION = "__com.bgs.IAMS-infratel-user__";
export const PERMISSIONS_SESSION = "__com.bgs.IAMS-infratel-pem__";
export const SCREEN_LOCK_SESSION = "__com.bgs.IAMS-infratel-screen-lock__"; // Persists screen lock state across reloads

export const placeHolderImage = "/images/placeholder-image.webp";
export const DefaultCover = "/images/profile-cover.jpg";
export const backgroundAuthImage = "/images/background-auth.jpg";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // MB
export const DEFAULT_DATE_RANGE_DAYS = 30; // 30 DAYS
export const DEFAULT_PAGINATION = { page: 1, limit: 20 };

export const DEFAULT_DATE_RANGE = {
  start_date: new Date(new Date().getTime() - DEFAULT_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  end_date: new Date().toISOString().split("T")[0],
  range: ""
};

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const rowsPerPageOptions = [
  {
    ID: 5,
    label: "5"
  },
  {
    ID: 8,
    label: "8"
  },
  {
    ID: 10,
    label: "10"
  },
  {
    ID: 15,
    label: "15"
  },
  {
    ID: 20,
    label: "20"
  }
];

// QUERY KEYS
export const QUERY_KEYS = {
  USER_DATA: "user",
  USERS: "users",
  CONFIGS: "configs",
  USER_ROLES: "user-roles",
  DEPARTMENTS: "departments",
  BRANCHES: "branches",
  MODULES: "modules",
  DEPARTMENT_MODULES: "department-modules",
  ROLES: "roles",
  ROLE_PERMISSIONS: "role-permissions",
  COUNTRIES: "countries",
  PROVINCES: "provinces",
  TOWNS: "towns",
  COMPANIES: "companies",
  STRATEGIC_PILLARS: "strategic-pillars",
  STRATEGIC_INITIATIVES: "strategic-initiatives",
  FINDINGS_CATEGORIES: "findings-categories",
  PROCESS_ACTIVITIES: "process-activities",
  INDICATIVE_TARGETS: "indicative-targets",
  AUDITABLE_AREAS: "auditable-areas",
  WORKPAPER_TEMPLATES: "workpaper-templates",
  UNIVERSES: "universes",
  UNIVERSE_ITEMS: "universe-items",
  BUDGETS: "budgets",
  RISKS: "risks",
  RISK_REGISTERS: "risk-registers",
  KRI: "KRI",
  KRI_REGISTERS: "kri-registers",
  RISK_CATEGORIES: "risk-categories",
  ACTIONS: "actions",
  ACTION_FINDINGS: "action-findings",
  ACTION_TASKS: "action-tasks",
  ACTION_EXECUTIONS: "action-executions",
  ACTION_LOGS: "action-logs",
  AUDIT_PLANS: "audit-plans",
  WORKPAPER_FINDINGS: "workpaper-findings"
};

// ANIMATION_VARIANTS
export const containerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      // staggerChildren: 0.25,
    }
  },
  exit: { opacity: 0 }
};

export const staggerContainerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      // staggerChildren: 0.25,
    }
  },
  exit: { opacity: 0 }
};

export const staggerContainerItemVariants = {
  hidden: { opacity: 0, y: -60 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 60 }
};

export const slideDownInView = {
  hidden: {
    opacity: 0,
    y: -100,
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};
// const NRC_PASSPORT = /^(ZN[0-9]{6}|[0-9]{6}/[0-9]{2}/[1]{1})$/

// REGEX
export const MTN_NO = /^(?:\+?26|26)?0(96|76)\d{7}$/;
export const AIRTEL_NO = /^(?:\+?26|26)?0(97|77)\d{7}$/;
export const ZAMTEL_NO = /^(?:\+?26|26)?0(95|75)\d{7}$/;

export const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

export const TRANSACTION_STATUS_COLOR_MAP = {
  submitted: "from-primary/10 to-primary-700/10 text-primary-700",
  processing: "from-primary to-primary-700 text-white",
  partial_payment: "from-primary/10 to-primary-700/10 text-primary-700",

  pending: "from-secondary/10 to-orange-600/10 text-orange-700",
  review: "from-secondary/10 to-orange-600/10 text-orange-700",
  ready: "from-secondary to-orange-600 text-white",

  failed: "from-red-500/10 to-red-600/10 text-red-700",
  canceled: "from-red-500/10 to-red-600/10 text-red-700",
  rejected: "from-red-500/10 to-red-600/10 text-red-700",

  // LIGHT GREEN WITH OPACITY
  succeeded: "from-[#58FF5F]/10 to-green-500/10 text-green-700",
  successful: "from-[#58FF5F]/10 to-green-500/10 text-green-700",
  approved: "from-[#58FF5F]/10 to-green-500/10 text-green-700",

  // SOLID GREEN
  processed: "from-[#23C760] to-[#23C760] text-white",
  paid: "from-[#23C760] to-[#23C760] text-white",
  prefunded: "from-[#23C760] to-[#23C760] text-white"
};

export const SERVICE_PROVIDER_COLOR_MAP = {
  airtel: "bg-red-500 text-white  ",
  mtn: "bg-yellow-400 text-black",
  zamtel: "bg-green-600 text-white",
  bank: "bg-primary text-white"
};

export const CURRENCIES = [
  { currency: "ZAR", country: "South Africa" },
  { currency: "BWP", country: "Botswana" },
  { currency: "NAD", country: "Namibia" },
  { currency: "ZMW", country: "Zambia" },
  { currency: "ZWL", country: "Zimbabwe" },
  { currency: "MZN", country: "Mozambique" },
  { currency: "MWK", country: "Malawi" },
  { currency: "SZL", country: "Eswatini" },
  { currency: "LSL", country: "Lesotho" },
  { currency: "MUR", country: "Mauritius" },
  { currency: "SCR", country: "Seychelles" },
  { currency: "MGA", country: "Madagascar" },
  { currency: "AOA", country: "Angola" },
  { currency: "TZS", country: "Tanzania" },

  { currency: "USD", country: "United States" },
  { currency: "EUR", country: "European Union" },
  { currency: "GBP", country: "United Kingdom" },
  { currency: "JPY", country: "Japan" },
  { currency: "CHF", country: "Switzerland" },
  { currency: "CAD", country: "Canada" },
  { currency: "AUD", country: "Australia" },
  { currency: "CNY", country: "China" },
  { currency: "INR", country: "India" },
  { currency: "SGD", country: "Singapore" },
  { currency: "HKD", country: "Hong Kong" },
  { currency: "SEK", country: "Sweden" },
  { currency: "NOK", country: "Norway" },
  { currency: "DKK", country: "Denmark" },
  { currency: "NZD", country: "New Zealand" },
  { currency: "KRW", country: "South Korea" },
  { currency: "TRY", country: "Turkey" },
  { currency: "RUB", country: "Russia" },
  { currency: "BRL", country: "Brazil" },
  { currency: "MXN", country: "Mexico" }
];
