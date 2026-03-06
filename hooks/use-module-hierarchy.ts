import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useModulesStore, type Module } from "@/lib/stores/modules-store";
import { getModules } from "@/app/_actions/config-actions";
import { QUERY_KEYS } from "@/lib/constants";

/**
 * Hook to fetch and manage module hierarchy
 * Automatically populates the Zustand store with normalized module data
 */
export function useModuleHierarchy() {
  const {
    modules,
    flatModules,
    isInitialized,
    setModules,
    getModulesByParent,
    getParentModules,
    getModuleById,
    getModulesByCategory,
    getRiskGroup,
    getAuditGroup,
    getCoreSettingsGroup,
    getModuleSettingsGroup,
    getAllGroups
  } = useModulesStore();

  // Fetch modules from API
  const {
    data: modulesResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [QUERY_KEYS.MODULES],
    queryFn: () => getModules(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true
  });

  // Update store when modules are fetched
  useEffect(() => {
    if (modulesResponse?.success && modulesResponse?.data?.data) {
      const rawModules = modulesResponse.data.data as Module[];

      // Only update if we have modules and they're different from what's in store
      if (rawModules.length > 0 && (!isInitialized || flatModules.length !== rawModules.length)) {
        console.log("🔄 Updating modules store from API");
        setModules(rawModules);
      }
    }
  }, [modulesResponse, setModules, isInitialized, flatModules.length]);

  return {
    // Data
    modules,
    flatModules,
    isInitialized,
    isLoading,
    error,

    // Actions
    refetch,

    // Selectors
    getModulesByParent,
    getParentModules,
    getModuleById,
    getModulesByCategory,

    // Grouped data for UI
    riskGroup: getRiskGroup(),
    auditGroup: getAuditGroup(),
    coreSettingsGroup: getCoreSettingsGroup(),
    moduleSettingsGroup: getModuleSettingsGroup(),
    allGroups: getAllGroups()
  };
}

/**
 * Hook to get modules for a specific department
 * Filters the global module hierarchy by department assignment
 */
export function useDepartmentModules(departmentId?: string) {
  const { flatModules } = useModulesStore();

  // This would need to be enhanced to filter by department
  // For now, returns all modules
  // TODO: Implement department filtering when department_modules data is available

  return {
    modules: flatModules,
    isLoading: false
  };
}
