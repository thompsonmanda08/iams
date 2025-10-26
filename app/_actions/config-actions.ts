"use server";

import { APIResponse, Branch, Department } from "@/lib/types";
import authenticatedApiClient, {
  axios,
  handleBadRequest,
  handleError,
  successResponse
} from "./api-config";

// ============================================================================
// BRANCH MANAGEMENT
// ============================================================================

/**
 * Get all branches with optional filtering
 * Endpoint: GET /api/v1/branches
 * Status: ✅ Documented in API
 * Query Parameters: province_id, town_id, is_active, limit, offset
 */
export async function getBranches(params?: {
  provinceId?: string;
  townId?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();
  if (params?.provinceId) queryParams.append("province_id", params.provinceId);
  if (params?.townId) queryParams.append("town_id", params.townId);
  if (params?.isActive !== undefined) queryParams.append("is_active", String(params.isActive));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.offset) queryParams.append("offset", String(params.offset));

  const url = `/api/v1/branches${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient( {
      url: url,
      method: "GET",
    });;
    return successResponse(response?.data, "Branches fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Get single branch by ID
 * Endpoint: GET /api/v1/branches/{id}
 * Status: ✅ Documented in API
 */
export async function getBranchById(id: string): Promise<APIResponse> {
  const url = `/api/v1/branches/${id}`;

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Branch fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new branch
 * Endpoint: POST /api/v1/branches
 * Status: ✅ Documented in API
 *
 * NOTE: API expects town_id and province_id (UUIDs), not string names.
 * UI should use dropdowns populated from /api/v1/provinces/with-towns
 */
export async function createBranch({
  name,
  code,
  townId,
  provinceId,
  address,
  isActive = true
}: {
  name: string;
  code: string;
  townId: string;
  provinceId: string;
  address?: string;
  isActive?: boolean;
}): Promise<APIResponse> {
  const url = `/api/v1/branches`;

  if (!name || !code || !townId || !provinceId) {
    return handleBadRequest("Name, code, town ID, and province ID are required");
  }

  try {
    const response = await axios.post(url, {
      name,
      code,
      town_id: townId,
      province_id: provinceId,
      address,
      is_active: isActive
    });

    return successResponse(response?.data, "Branch created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update existing branch
 * Endpoint: PUT /api/v1/branches/{id}
 * Status: ✅ Documented in API
 */
export async function updateBranch({
  id,
  name,
  code,
  townId,
  provinceId,
  address,
  isActive
}: {
  id: string;
  name: string;
  code: string;
  townId: string;
  provinceId: string;
  address?: string;
  isActive?: boolean;
}): Promise<APIResponse> {
  const url = `/api/v1/branches/${id}`;

  if (!id || !name || !code || !townId || !provinceId) {
    return handleBadRequest("ID, name, code, town ID, and province ID are required");
  }

  try {
    const response = await axios.put(url, {
      name,
      code,
      town_id: townId,
      province_id: provinceId,
      address,
      is_active: isActive,
      manager_id: null // Optional field from API docs
    });

    return successResponse(response?.data, "Branch updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete branch
 * Endpoint: DELETE /api/v1/branches/{id}
 * Status: ✅ Documented in API
 */
export async function deleteBranch(id: string): Promise<APIResponse> {
  const url = `/api/v1/branches/${id}`;

  if (!id) {
    return handleBadRequest("Branch ID is required");
  }

  try {
    await axios.delete(url);
    return successResponse(null, "Branch deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}

// ============================================================================
// DEPARTMENT MANAGEMENT
// ============================================================================

/**
 * Get all departments with optional filtering
 * Endpoint: GET /api/v1/departments
 * Status: ✅ Documented in API
 * Query Parameters: parent_id, is_active, limit, offset
 */
export async function getDepartments(params?: {
  parentId?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();
  if (params?.parentId) queryParams.append("parent_id", params.parentId);
  if (params?.isActive !== undefined) queryParams.append("is_active", String(params.isActive));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.offset) queryParams.append("offset", String(params.offset));

  const url = `/api/v1/departments${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient( {
      url: url,
      method: "GET",
    });
    return successResponse(response?.data, "Departments fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Get single department by ID
 * Endpoint: GET /api/v1/departments/{id}
 * Status: ✅ Documented in API
 */
export async function getDepartmentById(id: string): Promise<APIResponse> {
  const url = `/api/v1/departments/${id}`;

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Department fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new department
 * Endpoint: POST /api/v1/departments
 * Status: ✅ Documented in API
 *
 * NOTE: Supports hierarchical departments via parent_id
 */
export async function createDepartment({
  name,
  code,
  description,
  parentId
}: {
  name: string;
  code: string;
  description?: string;
  parentId?: string | null;
}): Promise<APIResponse> {
  const url = `/api/v1/departments`;

  if (!name || !code) {
    return handleBadRequest("Name and code are required");
  }

  try {
    const response = await axios.post(url, {
      name,
      code,
      description,
      parent_id: parentId || null
    });

    return successResponse(response?.data, "Department created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update existing department
 * Endpoint: PUT /api/v1/departments/{id}
 * Status: ✅ Documented in API
 */
export async function updateDepartment({
  id,
  name,
  code,
  description,
  parentId,
  isActive
}: {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string | null;
  isActive?: boolean;
}): Promise<APIResponse> {
  const url = `/api/v1/departments/${id}`;

  if (!id || !name || !code) {
    return handleBadRequest("ID, name, and code are required");
  }

  try {
    const response = await axios.put(url, {
      name,
      code,
      description,
      parent_id: parentId || null,
      is_active: isActive
    });

    return successResponse(response?.data, "Department updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete department
 * Endpoint: DELETE /api/v1/departments/{id}
 * Status: ✅ Documented in API
 */
export async function deleteDepartment(id: string): Promise<APIResponse> {
  const url = `/api/v1/departments/${id}`;

  if (!id) {
    return handleBadRequest("Department ID is required");
  }

  try {
    await axios.delete(url);
    return successResponse(null, "Department deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}

/**
 * Get modules assigned to a department
 * Endpoint: GET /api/v1/departments/{id}/modules
 * Status: ✅ Documented in API
 */
export async function getDepartmentModules(departmentId: string): Promise<APIResponse> {
  const url = `/api/v1/departments/${departmentId}/modules`;

  if (!departmentId) {
    return handleBadRequest("Department ID is required");
  }

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Department modules fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Assign module to department
 * Endpoint: POST /api/v1/departments/{id}/modules
 * Status: ✅ Documented in API
 */
export async function assignModuleToDepartment({
  departmentId,
  moduleId
}: {
  departmentId: string;
  moduleId: string;
}): Promise<APIResponse> {
  const url = `/api/v1/departments/${departmentId}/modules`;

  if (!departmentId || !moduleId) {
    return handleBadRequest("Department ID and Module ID are required");
  }

  try {
    const response = await axios.post(url, { module_id: moduleId });
    return successResponse(response?.data, "Module assigned to department successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Remove module from department
 * Endpoint: DELETE /api/v1/departments/{dept_id}/modules/{module_id}
 * Status: ✅ Documented in API
 */
export async function removeModuleFromDepartment({
  departmentId,
  moduleId
}: {
  departmentId: string;
  moduleId: string;
}): Promise<APIResponse> {
  const url = `/api/v1/departments/${departmentId}/modules/${moduleId}`;

  if (!departmentId || !moduleId) {
    return handleBadRequest("Department ID and Module ID are required");
  }

  try {
    await axios.delete(url);
    return successResponse(null, "Module removed from department successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}

// ============================================================================
// MODULE MANAGEMENT
// ============================================================================

/**
 * Get all modules
 * Endpoint: GET /api/v1/modules
 * Status: ✅ Documented in API
 * Query Parameter: hierarchy=true for parent-child tree structure
 */
export async function getModules(hierarchy: boolean = false): Promise<APIResponse> {
  const url = `/api/v1/modules${hierarchy ? "?hierarchy=true" : ""}`;

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Modules fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Get single module by ID
 * Endpoint: GET /api/v1/modules/{id}
 * Status: ✅ Documented in API
 */
export async function getModuleById(id: string): Promise<APIResponse> {
  const url = `/api/v1/modules/${id}`;

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Module fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new module
 * Endpoint: POST /api/v1/modules
 * Status: ✅ Documented in API
 */
export async function createModule({
  moduleCode,
  name,
  description,
  parentModuleId,
  href,
  icon,
  sortOrder
}: {
  moduleCode: string;
  name: string;
  description?: string;
  parentModuleId?: string | null;
  href?: string | null;
  icon?: string;
  sortOrder?: number;
}): Promise<APIResponse> {
  const url = `/api/v1/modules`;

  if (!moduleCode || !name) {
    return handleBadRequest("Module code and name are required");
  }

  try {
    const response = await axios.post(url, {
      module_code: moduleCode,
      name,
      description,
      parent_module_id: parentModuleId || null,
      href: href || null,
      icon,
      sort_order: sortOrder
    });

    return successResponse(response?.data, "Module created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update existing module
 * Endpoint: PUT /api/v1/modules/{id}
 * Status: ✅ Documented in API
 */
export async function updateModule({
  id,
  moduleCode,
  name,
  description,
  parentModuleId,
  href,
  icon,
  sortOrder,
  isActive
}: {
  id: string;
  moduleCode: string;
  name: string;
  description?: string;
  parentModuleId?: string | null;
  href?: string | null;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<APIResponse> {
  const url = `/api/v1/modules/${id}`;

  if (!id || !moduleCode || !name) {
    return handleBadRequest("ID, module code, and name are required");
  }

  try {
    const response = await axios.put(url, {
      module_code: moduleCode,
      name,
      description,
      parent_module_id: parentModuleId || null,
      href: href || null,
      icon,
      sort_order: sortOrder,
      is_active: isActive
    });

    return successResponse(response?.data, "Module updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete module
 * Endpoint: DELETE /api/v1/modules/{id}
 * Status: ✅ Documented in API
 */
export async function deleteModule(id: string): Promise<APIResponse> {
  const url = `/api/v1/modules/${id}`;

  if (!id) {
    return handleBadRequest("Module ID is required");
  }

  try {
    await axios.delete(url);
    return successResponse(null, "Module deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}

/**
 * Get sub-modules for a parent module
 * Endpoint: GET /api/v1/modules/{id}/submodules
 * Status: ✅ Documented in API
 */
export async function getSubModules(parentModuleId: string): Promise<APIResponse> {
  const url = `/api/v1/modules/${parentModuleId}/submodules`;

  if (!parentModuleId) {
    return handleBadRequest("Parent module ID is required");
  }

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Sub-modules fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

/**
 * Get all roles with optional filtering
 * Endpoint: GET /api/v1/roles
 * Status: ✅ Documented in API
 * Query Parameters: department_id, is_active, limit, offset
 */
export async function getRoles(params?: {
  departmentId?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();
  if (params?.departmentId) queryParams.append("department_id", params.departmentId);
  if (params?.isActive !== undefined) queryParams.append("is_active", String(params.isActive));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.offset) queryParams.append("offset", String(params.offset));

  const url = `/api/v1/roles${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient( {
      url: url,
      method: "GET",
    });;
    return successResponse(response?.data, "Roles fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Get single role by ID
 * Endpoint: GET /api/v1/roles/{id}
 * Status: ✅ Documented in API
 */
export async function getRoleById(id: string): Promise<APIResponse> {
  const url = `/api/v1/roles/${id}`;

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Role fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new role
 * Endpoint: POST /api/v1/roles
 * Status: ✅ Documented in API
 */
export async function createRole({
  departmentId,
  name,
  code,
  description
}: {
  departmentId: string;
  name: string;
  code: string;
  description?: string;
}): Promise<APIResponse> {
  const url = `/api/v1/roles`;

  if (!departmentId || !name || !code) {
    return handleBadRequest("Department ID, name, and code are required");
  }

  try {
    const response = await axios.post(url, {
      department_id: departmentId,
      name,
      code,
      description
    });

    return successResponse(response?.data, "Role created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update existing role
 * Endpoint: PUT /api/v1/roles/{id}
 * Status: ✅ Documented in API
 * NOTE: department_id cannot be changed per API docs
 */
export async function updateRole({
  id,
  name,
  code,
  description,
  isActive
}: {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}): Promise<APIResponse> {
  const url = `/api/v1/roles/${id}`;

  if (!id || !name || !code) {
    return handleBadRequest("ID, name, and code are required");
  }

  try {
    const response = await axios.put(url, {
      name,
      code,
      description,
      is_active: isActive
    });

    return successResponse(response?.data, "Role updated successfully");
  } catch (error: Error | any) {
    return handleError(error, "PUT", url);
  }
}

/**
 * Delete role
 * Endpoint: DELETE /api/v1/roles/{id}
 * Status: ✅ Documented in API
 */
export async function deleteRole(id: string): Promise<APIResponse> {
  const url = `/api/v1/roles/${id}`;

  if (!id) {
    return handleBadRequest("Role ID is required");
  }

  try {
    await axios.delete(url);
    return successResponse(null, "Role deleted successfully");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", url);
  }
}

// ============================================================================
// PROVINCE & TOWN MANAGEMENT
// ============================================================================

/**
 * Get all provinces with their towns nested
 * Endpoint: GET /api/v1/provinces/with-towns
 * Status: ✅ Documented in API
 * IMPORTANT: Use this endpoint to populate branch form dropdowns
 */
export async function getProvincesWithTowns(): Promise<APIResponse> {
  const url = `/api/v1/provinces/with-towns`;

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Provinces with towns fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Get all provinces
 * Endpoint: GET /api/v1/provinces
 * Status: ✅ Documented in API
 */
export async function getProvinces(isActive?: boolean): Promise<APIResponse> {
  const url = `/api/v1/provinces${isActive !== undefined ? `?is_active=${isActive}` : ""}`;

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Provinces fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Get single province by ID
 * Endpoint: GET /api/v1/provinces/{id}
 * Status: ✅ Documented in API
 */
export async function getProvinceById(id: string): Promise<APIResponse> {
  const url = `/api/v1/provinces/${id}`;

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Province fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new province
 * Endpoint: POST /api/v1/provinces
 * Status: ✅ Documented in API
 */
export async function createProvince({
  name,
  code,
  isActive = true
}: {
  name: string;
  code: string;
  isActive?: boolean;
}): Promise<APIResponse> {
  const url = `/api/v1/provinces`;

  if (!name || !code) {
    return handleBadRequest("Name and code are required");
  }

  try {
    const response = await axios.post(url, {
      name,
      code,
      is_active: isActive
    });
    return successResponse(response?.data, "Province created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update province
 * Endpoint: PUT /api/v1/provinces/:id
 * Status: ⚠️ NOT DOCUMENTED - Mock implementation
 */
export async function updateProvince({
  id,
  name,
  code,
  isActive
}: {
  id: string;
  name: string;
  code: string;
  isActive?: boolean;
}): Promise<APIResponse> {
  // TODO: Replace with actual API call when endpoint is available
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    // Mock successful response
    return successResponse(
      {
        id,
        name,
        code,
        is_active: isActive ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      "Province updated successfully (mock)"
    );
  } catch (error: Error | any) {
    return handleError(error, "PUT", `/api/v1/provinces/${id}`);
  }
}

/**
 * Delete province
 * Endpoint: DELETE /api/v1/provinces/:id
 * Status: ⚠️ NOT DOCUMENTED - Mock implementation
 */
export async function deleteProvince(id: string): Promise<APIResponse> {
  // TODO: Replace with actual API call when endpoint is available
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    // Mock successful response
    return successResponse(null, "Province deleted successfully (mock)");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", `/api/v1/provinces/${id}`);
  }
}

/**
 * Get all towns
 * Endpoint: GET /api/v1/towns
 * Status: ✅ Documented in API
 */
export async function getTowns(params?: {
  provinceId?: string;
  isActive?: boolean;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();
  if (params?.provinceId) queryParams.append("province_id", params.provinceId);
  if (params?.isActive !== undefined) queryParams.append("is_active", String(params.isActive));

  const url = `/api/v1/towns${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await axios.get(url);
    return successResponse(response?.data, "Towns fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Create new town
 * Endpoint: POST /api/v1/towns
 * Status: ✅ Documented in API
 */
export async function createTown({
  name,
  provinceId,
  isActive = true
}: {
  name: string;
  provinceId: string;
  isActive?: boolean;
}): Promise<APIResponse> {
  const url = `/api/v1/towns`;

  if (!name || !provinceId) {
    return handleBadRequest("Name and province ID are required");
  }

  try {
    const response = await axios.post(url, {
      name,
      province_id: provinceId,
      is_active: isActive
    });
    return successResponse(response?.data, "Town created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}

/**
 * Update town
 * Endpoint: PUT /api/v1/towns/:id
 * Status: ⚠️ NOT DOCUMENTED - Mock implementation
 */
export async function updateTown({
  id,
  name,
  provinceId,
  isActive
}: {
  id: string;
  name: string;
  provinceId: string;
  isActive?: boolean;
}): Promise<APIResponse> {
  // TODO: Replace with actual API call when endpoint is available
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    // Mock successful response
    return successResponse(
      {
        id,
        name,
        province_id: provinceId,
        is_active: isActive ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      "Town updated successfully (mock)"
    );
  } catch (error: Error | any) {
    return handleError(error, "PUT", `/api/v1/towns/${id}`);
  }
}

/**
 * Delete town
 * Endpoint: DELETE /api/v1/towns/:id
 * Status: ⚠️ NOT DOCUMENTED - Mock implementation
 */
export async function deleteTown(id: string): Promise<APIResponse> {
  // TODO: Replace with actual API call when endpoint is available
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    // Mock successful response
    return successResponse(null, "Town deleted successfully (mock)");
  } catch (error: Error | any) {
    return handleError(error, "DELETE", `/api/v1/towns/${id}`);
  }
}

// ============================================================================
// LEGACY FUNCTIONS (Keeping for backward compatibility with existing UI)
// TODO: Update UI to use new function signatures
// ============================================================================

/**
 * @deprecated Use createDepartment instead
 */
export async function createNewDepartment({ name, description }: Department): Promise<APIResponse> {
  return createDepartment({
    name,
    code: name.toUpperCase().replace(/\s+/g, "_"), // Generate code from name
    description
  });
}

/**
 * @deprecated Use createBranch instead with proper townId and provinceId
 */
export async function createNewBranch({
  name,
  code,
  province,
  city,
  physical_address
}: Branch): Promise<APIResponse> {
  // This function signature is incompatible with API requirements.
  // UI needs to be updated to pass townId and provinceId instead of string names.
  console.warn(
    "createNewBranch is deprecated. Please update UI to use createBranch with townId and provinceId."
  );
  return handleBadRequest(
    "This function requires townId and provinceId (UUIDs). Please use getProvincesWithTowns to populate dropdowns and pass IDs instead of names."
  );
}
