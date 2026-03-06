import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Module {
  id: string;
  module_code: string;
  name: string;
  description: string;
  parent_module_id: string | null;
  href?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ModuleHierarchy extends Module {
  children: ModuleHierarchy[];
  displayName: string; // Formatted name for display
  category: "risk" | "audit" | "core-settings" | "module-settings" | "other";
}

export interface ModuleGroup {
  id: string;
  name: string;
  icon: string;
  parent: ModuleHierarchy | null;
  children: ModuleHierarchy[];
  category: "risk" | "audit" | "core-settings" | "module-settings" | "other";
}

interface ModulesStore {
  modules: ModuleHierarchy[];
  flatModules: Module[];
  isInitialized: boolean;

  // Dynamically discovered parent IDs
  riskParentId: string | null;
  auditParentId: string | null;
  coreSettingsParentId: string | null;
  moduleSettingsParentId: string | null;

  // Actions
  setModules: (modules: Module[]) => void;
  clearModules: () => void;

  // Selectors
  getModulesByParent: (parentId: string) => ModuleHierarchy[];
  getParentModules: () => ModuleHierarchy[];
  getModuleById: (id: string) => ModuleHierarchy | undefined;
  getModulesByCategory: (category: string) => ModuleHierarchy[];

  // Computed groups for UI
  getRiskGroup: () => ModuleGroup;
  getAuditGroup: () => ModuleGroup;
  getCoreSettingsGroup: () => ModuleGroup;
  getModuleSettingsGroup: () => ModuleGroup;
  getAllGroups: () => ModuleGroup[];
}

/**
 * Discover parent module IDs dynamically from known child modules
 * This avoids hardcoding IDs and makes the system more flexible
 */
const discoverParentIds = (modules: Module[]) => {
  let riskParentId: string | null = null;
  let auditParentId: string | null = null;
  let coreSettingsParentId: string | null = null;
  let moduleSettingsParentId: string | null = null;

  // Find Risk parent by looking for "Risk Registers" module
  const riskRegisters = modules.find(
    (m) =>
      m.module_code?.toUpperCase() === "RISK_REGISTERS" ||
      m.name.toLowerCase().includes("risk register")
  );
  if (riskRegisters?.parent_module_id) {
    riskParentId = riskRegisters.parent_module_id;
  }

  // Find Audit parent by looking for "Audit Plans" module
  const auditPlans = modules.find(
    (m) =>
      m.module_code?.toUpperCase() === "AUDIT_PLANS" || m.name.toLowerCase().includes("audit plan")
  );
  if (auditPlans?.parent_module_id) {
    auditParentId = auditPlans.parent_module_id;
  }

  // Find Core Settings parent by looking for modules with "System Configuration" or similar
  const systemConfig = modules.find(
    (m) =>
      m.module_code?.toUpperCase().includes("SYS_CONFIG") ||
      m.module_code?.toUpperCase().includes("SYSTEM_CONFIG") ||
      m.name.toLowerCase().includes("system configuration")
  );
  if (systemConfig?.parent_module_id) {
    coreSettingsParentId = systemConfig.parent_module_id;
  }

  // Fallback: Look for parent modules by name if we couldn't find via children
  if (!riskParentId) {
    const riskParent = modules.find(
      (m) =>
        !m.parent_module_id &&
        (m.module_code?.toUpperCase() === "RISK" ||
          m.name.toLowerCase() === "risk" ||
          m.name.toLowerCase() === "risk management")
    );
    riskParentId = riskParent?.id || null;
  }

  if (!auditParentId) {
    const auditParent = modules.find(
      (m) =>
        !m.parent_module_id &&
        (m.module_code?.toUpperCase() === "AUDIT" ||
          m.name.toLowerCase() === "audit" ||
          m.name.toLowerCase() === "audit management")
    );
    auditParentId = auditParent?.id || null;
  }

  if (!coreSettingsParentId) {
    const coreParent = modules.find(
      (m) =>
        !m.parent_module_id &&
        (m.module_code?.toUpperCase().includes("CORE") ||
          m.module_code?.toUpperCase().includes("SETTINGS") ||
          m.name.toLowerCase().includes("core settings") ||
          m.name.toLowerCase().includes("system configuration"))
    );
    coreSettingsParentId = coreParent?.id || null;
  }

  // Find Module Settings parent — the container for per-module configuration modules
  const moduleSettingsParent = modules.find(
    (m) =>
      !m.parent_module_id &&
      (m.module_code?.toUpperCase() === "MODULE_SETTINGS" ||
        m.name.toLowerCase().includes("module settings"))
  );
  moduleSettingsParentId = moduleSettingsParent?.id || null;

  console.log("🔍 Discovered parent IDs:", {
    risk: riskParentId,
    audit: auditParentId,
    coreSettings: coreSettingsParentId,
    moduleSettings: moduleSettingsParentId
  });

  return { riskParentId, auditParentId, coreSettingsParentId, moduleSettingsParentId };
};

/**
 * Categorize a module based on its parent_module_id
 */
const categorizeModule = (
  module: Module,
  riskParentId: string | null,
  auditParentId: string | null,
  coreSettingsParentId: string | null,
  moduleSettingsParentId: string | null
): {
  parentId: string | null;
  category: "risk" | "audit" | "core-settings" | "module-settings" | "other";
} => {
  // Use actual parent_module_id — no frontend overrides needed
  const parentId = module.parent_module_id;

  // Determine category based on parent
  if (parentId === riskParentId) {
    return { parentId, category: "risk" };
  }

  if (parentId === auditParentId) {
    return { parentId, category: "audit" };
  }

  if (parentId === coreSettingsParentId) {
    return { parentId, category: "core-settings" };
  }

  if (parentId === moduleSettingsParentId) {
    return { parentId, category: "module-settings" };
  }

  // Handle parent modules themselves (root nodes with no parent)
  if (!parentId) {
    if (module.id === riskParentId) return { parentId: null, category: "risk" };
    if (module.id === auditParentId) return { parentId: null, category: "audit" };
    if (module.id === coreSettingsParentId) return { parentId: null, category: "core-settings" };
    if (module.id === moduleSettingsParentId)
      return { parentId: null, category: "module-settings" };
  }

  return { parentId, category: "other" };
};

/**
 * Format module name for display
 * Special handling for "Overview" modules to use module_code instead
 */
const formatModuleName = (name: string, moduleCode?: string): string => {
  if (name.toLowerCase().trim() === "overview" && moduleCode) {
    // Format: "RISK_OVERVIEW" -> "Risk Overview"
    return moduleCode
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  return name;
};

/**
 * Recursively find a module by ID in the hierarchy
 */
function findModuleById(modules: ModuleHierarchy[], id: string): ModuleHierarchy | undefined {
  for (const module of modules) {
    if (module.id === id) return module;
    if (module.children.length > 0) {
      const found = findModuleById(module.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Zustand store for managing module hierarchy
 * Persists to localStorage for performance
 */
export const useModulesStore = create<ModulesStore>()(
  persist(
    (set, get) => ({
      modules: [],
      flatModules: [],
      isInitialized: false,
      riskParentId: null,
      auditParentId: null,
      coreSettingsParentId: null,
      moduleSettingsParentId: null,

      setModules: (rawModules: Module[]) => {
        console.log("📦 Setting modules in store:", rawModules.length);

        // Discover parent IDs dynamically
        const { riskParentId, auditParentId, coreSettingsParentId, moduleSettingsParentId } =
          discoverParentIds(rawModules);

        // Build hierarchy with corrected parent relationships
        const modulesMap = new Map<string, ModuleHierarchy>();

        // First pass: create all modules with corrected parents
        rawModules.forEach((module) => {
          const { parentId, category } = categorizeModule(
            module,
            riskParentId,
            auditParentId,
            coreSettingsParentId,
            moduleSettingsParentId
          );

          modulesMap.set(module.id, {
            ...module,
            parent_module_id: parentId, // Use corrected parent
            children: [],
            displayName: formatModuleName(module.name, module.module_code),
            category
          });
        });

        // Second pass: build parent-child relationships
        const rootModules: ModuleHierarchy[] = [];

        modulesMap.forEach((module) => {
          if (module.parent_module_id) {
            const parent = modulesMap.get(module.parent_module_id);
            if (parent) {
              parent.children.push(module);
              // Sort children by sort_order
              parent.children.sort((a, b) => a.sort_order - b.sort_order);
            } else {
              console.warn(`⚠️ Parent not found for module ${module.name} (${module.id})`);
            }
          } else {
            rootModules.push(module);
          }
        });

        // Sort root modules by sort_order
        rootModules.sort((a, b) => a.sort_order - b.sort_order);

        console.log("✅ Module hierarchy built:", {
          total: rawModules.length,
          parents: rootModules.length,
          risk: rootModules.find((m) => m.id === riskParentId)?.children.length || 0,
          audit: rootModules.find((m) => m.id === auditParentId)?.children.length || 0,
          coreSettings:
            rootModules.find((m) => m.id === coreSettingsParentId)?.children.length || 0,
          moduleSettings:
            rootModules.find((m) => m.id === moduleSettingsParentId)?.children.length || 0
        });

        // Build flatModules from the processed map, stripping ModuleHierarchy-only fields
        // (children, displayName, category) to produce a clean Module[] with corrected parent_module_id
        const processedFlatModules: Module[] = Array.from(modulesMap.values()).map(
          ({ children, displayName, category, ...rest }) => rest
        );

        set({
          modules: rootModules,
          flatModules: processedFlatModules,
          isInitialized: true,
          riskParentId,
          auditParentId,
          coreSettingsParentId,
          moduleSettingsParentId
        });
      },

      clearModules: () => {
        set({
          modules: [],
          flatModules: [],
          isInitialized: false,
          riskParentId: null,
          auditParentId: null,
          coreSettingsParentId: null,
          moduleSettingsParentId: null
        });
      },

      getModulesByParent: (parentId: string) => {
        const modules = get().modules;
        const parent = findModuleById(modules, parentId);
        return parent?.children || [];
      },

      getParentModules: () => {
        return get().modules;
      },

      getModuleById: (id: string) => {
        return findModuleById(get().modules, id);
      },

      getModulesByCategory: (category: string) => {
        const modules = get().modules;
        return modules.filter((m) => m.category === category);
      },

      getRiskGroup: () => {
        const { modules, riskParentId } = get();
        const riskParent = modules.find((m) => m.id === riskParentId);

        return {
          id: riskParentId || "risk",
          name: "Risk Management",
          icon: "ShieldAlert",
          parent: riskParent || null,
          children: riskParent?.children || [],
          category: "risk"
        };
      },

      getAuditGroup: () => {
        const { modules, auditParentId } = get();
        const auditParent = modules.find((m) => m.id === auditParentId);

        return {
          id: auditParentId || "audit",
          name: "Audit Management",
          icon: "ClipboardCheck",
          parent: auditParent || null,
          children: auditParent?.children || [],
          category: "audit"
        };
      },

      getCoreSettingsGroup: () => {
        const { modules, coreSettingsParentId } = get();
        const coreParent = modules.find((m) => m.id === coreSettingsParentId);

        return {
          id: coreSettingsParentId || "core-settings",
          name: "Core Settings",
          icon: "Settings",
          parent: coreParent || null,
          children: coreParent?.children || [],
          category: "core-settings"
        };
      },

      getModuleSettingsGroup: () => {
        const { modules, moduleSettingsParentId } = get();
        const moduleSettingsParent = modules.find((m) => m.id === moduleSettingsParentId);

        return {
          id: moduleSettingsParentId || "module-settings",
          name: "Module Settings",
          icon: "Sliders",
          parent: moduleSettingsParent || null,
          children: moduleSettingsParent?.children || [],
          category: "module-settings"
        };
      },

      getAllGroups: () => {
        const { getRiskGroup, getAuditGroup, getCoreSettingsGroup, getModuleSettingsGroup } = get();
        return [getRiskGroup(), getAuditGroup(), getModuleSettingsGroup(), getCoreSettingsGroup()];
      }
    }),
    {
      name: "modules-store",
      version: 2, // Bumped: added module-settings group; flatModules stores corrected parent_module_id
      partialize: (state) => ({
        modules: state.modules,
        flatModules: state.flatModules,
        isInitialized: state.isInitialized,
        riskParentId: state.riskParentId,
        auditParentId: state.auditParentId,
        coreSettingsParentId: state.coreSettingsParentId,
        moduleSettingsParentId: state.moduleSettingsParentId
      })
    }
  )
);
