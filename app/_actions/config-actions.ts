"use server";

import { APIResponse, Branch, Department, Pagination } from "@/lib/types";
import authenticatedApiClient, {
  axios,
  handleBadRequest,
  handleError,
  successResponse
} from "./api-config";
import { revalidatePath } from "next/cache";
import { RiskCategoryInput } from "./risk-module-actions";

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
  page?: number;
  page_size?: number;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  queryParams.append("page_size", String(params?.page_size || 10));
  queryParams.append("page", String(params?.page || 1));

  if (params?.provinceId) queryParams.append("province_id", params.provinceId);
  if (params?.townId) queryParams.append("town_id", params.townId);
  if (params?.isActive !== undefined) queryParams.append("is_active", String(params.isActive));

  const url = `/api/v1/branches${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient({
      url: url,
      method: "GET"
    });
    return successResponse(response?.data?.data, "Branches fetched successfully");
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
    const response = await authenticatedApiClient({ url });
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
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        name,
        code,
        town_id: townId,
        province_id: provinceId,
        address,
        is_active: isActive
      }
    });
    revalidatePath("/dashboard/system-configs/locations");
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
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        name,
        code,
        town_id: townId,
        province_id: provinceId,
        address,
        is_active: isActive,
        manager_id: null // Optional field from API docs
      }
    });
    revalidatePath("/dashboard/system-configs/locations");
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
    await authenticatedApiClient({ url, method: "DELETE" });
    revalidatePath("/dashboard/system-configs/locations");
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
export async function getDepartments(
  params?: Partial<Pagination> & {
    parentId?: string;
    isActive?: boolean;
  }
): Promise<APIResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append("page_size", String(params?.page_size || 10));
  queryParams.append("page", String(params?.page || 1));

  if (params?.parentId) queryParams.append("parent_id", params.parentId);
  if (params?.isActive !== undefined) queryParams.append("is_active", String(params.isActive));

  const url = `/api/v1/departments${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient({ url });
    return successResponse(response?.data?.data, "Departments fetched successfully");
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
    const response = await authenticatedApiClient({ url });
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

  if (!name) {
    return handleBadRequest("Name and code are required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        name,
        code: name.toUpperCase().replace(/\s+/g, "_"), // Generate code from name,
        description,
        parent_id: parentId || null
      }
    });
    revalidatePath("/dashboard/system-configs/departments");
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
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        name,
        code,
        description,
        parent_id: parentId || null,
        is_active: isActive
      }
    });
    revalidatePath("/dashboard/system-configs/departments");
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
    await authenticatedApiClient({
      url,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/departments");
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
    const response = await authenticatedApiClient({ url });
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
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        module_id: moduleId
      }
    });
    revalidatePath("/dashboard/system-configs/departments");
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
    await authenticatedApiClient({ url, method: "DELETE" });
    revalidatePath("/dashboard/system-configs/departments");
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
    const response = await authenticatedApiClient({ url });
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
    const response = await authenticatedApiClient({ url });
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
  module_code,
  name,
  description,
  parent_module_id,
  href,
  icon,
  sortOrder
}: {
  module_code: string;
  name: string;
  description?: string;
  parent_module_id?: string | null;
  href?: string | null;
  icon?: string;
  sortOrder?: number;
}): Promise<APIResponse> {
  const url = `/api/v1/modules`;

  if (!module_code || !name) {
    return handleBadRequest("Module code and name are required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        module_code: module_code,
        name,
        description,
        parent_module_id: parent_module_id || null,
        href: href || null,
        icon,
        sort_order: sortOrder
      }
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
  module_code,
  name,
  description,
  parent_module_id,
  href,
  icon,
  sortOrder,
  isActive
}: {
  id: string;
  module_code: string;
  name: string;
  description?: string;
  parent_module_id?: string | null;
  href?: string | null;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<APIResponse> {
  const url = `/api/v1/modules/${id}`;

  if (!id || !module_code || !name) {
    return handleBadRequest("ID, module code, and name are required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        module_code: module_code,
        name,
        description,
        parent_module_id: parent_module_id || null,
        href: href || null,
        icon,
        sort_order: sortOrder,
        is_active: isActive
      }
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
    await authenticatedApiClient({ url });
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
export async function getSubModules(parent_module_id: string): Promise<APIResponse> {
  const url = `/api/v1/modules/${parent_module_id}/submodules`;

  if (!parent_module_id) {
    return handleBadRequest("Parent module ID is required");
  }

  try {
    const response = await authenticatedApiClient({ url });
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
    const response = await authenticatedApiClient({
      url: url,
      method: "GET"
    });
    return successResponse(response?.data?.data, "Roles fetched successfully");
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
    const response = await authenticatedApiClient({ url });
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
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        department_id: departmentId,
        name,
        code,
        description
      }
    });
    revalidatePath("/dashboard/system-configs/departments");
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
    const response = await authenticatedApiClient({
      url,
      method: "PUT",
      data: {
        name,
        code,
        description,
        is_active: isActive
      }
    });
    revalidatePath("/dashboard/system-configs/departments");
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
    await authenticatedApiClient({ url, method: "DELETE" });
    revalidatePath("/dashboard/system-configs/departments");
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
    const response = await authenticatedApiClient({ url });
    return successResponse(response?.data?.data, "Provinces with towns fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}

/**
 * Get all provinces
 * Endpoint: GET /api/v1/provinces
 * Status: ✅ Documented in API
 */
export async function getProvinces(params?: {
  isActive?: boolean;
  page?: number;
  page_size?: number;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.isActive !== undefined) queryParams.append("is_active", String(params.isActive));
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.page_size) queryParams.append("page_size", String(params.page_size));

  const url = `/api/v1/provinces${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient({ url });
    return successResponse(response?.data?.data, "Provinces fetched successfully");
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
    const response = await authenticatedApiClient({ url });
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
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        name,
        code,
        is_active: isActive
      }
    });
    revalidatePath("/dashboard/system-configs/locations");
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
  page_size?: number;
  page?: number;
}): Promise<APIResponse> {
  const queryParams = new URLSearchParams();

  if (params?.provinceId) queryParams.append("province_id", params.provinceId);
  if (params?.isActive !== undefined) queryParams.append("is_active", String(params.isActive));
  if (params?.page_size !== undefined) queryParams.append("page_size", String(params.page_size));
  if (params?.page !== undefined) queryParams.append("page", String(params.page));

  const url = `/api/v1/towns${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await authenticatedApiClient({ url });
    return successResponse(response?.data?.data, "Towns fetched successfully");
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
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data: {
        name,
        province_id: provinceId,
        is_active: isActive
      }
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

/**
 * Create a new risk category
 */
export async function createRiskCategory(input: RiskCategoryInput): Promise<APIResponse> {
  try {
     const response = await authenticatedApiClient({
      url:"/api/v1/risk-categories", 
      data:input,
      method:"POST"
    });
    revalidatePath("/dashboard/system-configs/risk-settings");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "POST | CREATE RISK CATEGORY", "/api/v1/risk-categories");
  }
}

/**
 * Update a risk category
 */
export async function updateRiskCategory(
  id: string,
  input: Partial<RiskCategoryInput>
): Promise<APIResponse> {
  try {
 const response = await authenticatedApiClient({
      url:`/api/v1/risk-categories/${id}`, 
      data:input,
      method:"PUT"
    });
    revalidatePath("/dashboard/system-configs/risk-settings");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "PUT | UPDATE RISK CATEGORY", `/api/v1/risk-categories/${id}`);
  }
}

/**
 * Delete a risk category
 */
export async function deleteRiskCategory(id: string): Promise<APIResponse> {
  try {
     const response = await authenticatedApiClient({
      url:`/api/v1/risk-categories/${id}`, 
      method:"DELETE"
    });
    revalidatePath("/dashboard/system-configs/risk-settings");
    return successResponse(response.data.data);
  } catch (error) {
    return handleError(error, "DELETE | DELETE RISK CATEGORY", `/api/v1/risk-categories/${id}`);
  }
}

// Risk Matrices
export async function getRiskMatrices(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risk-configs/matrix-configs",
      method: "GET"
    });
    console.log("RES:", response);
    
     revalidatePath("/dashboard/system-configs/risk-settings");
    return successResponse(response?.data.data);
  } catch (error: any) {
    return handleError(error, "GET | GET MATRICES", `/api/v1/risk-configs/matrices`);
  }
}

export async function createRiskMatrix(data: {
  name: string;
  description: string;
  is_default: boolean;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risk-configs/matrix-configs",
      method: "POST",
      data
    });
    revalidatePath("/dashboard/system-configs/risk-configs");
    return  successResponse(response?.data);
  } catch (error: any) {
    return handleError(error,"POST | CREATE MATRICES", "/api/v1/risk-configs/matrices");
  }
}

export async function updateRiskMatrix(
  id: string,
  data: Partial<{ name: string; description: string; is_default: boolean }>
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/matrix-configs/${id}`,
      method: "PUT",
      data
    });
    revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE MATRICES", `/api/v1/risk-configs/matrices/${id}`);
  }
}
export async function getRiskMatrix(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/matrix-configs/${id}`,
      method: "GET"
    });
    return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "GET | RISK MATRIX", `/api/v1/risk-configs/matrices/${id}`);
  }
}

export async function deleteRiskMatrix(id: string): Promise<APIResponse> {
  try {
    const response =  await authenticatedApiClient({
      url: `/api/v1/risk-configs/matrix-configs/${id}`,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/risk-configs");
   return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "DELETE | DELETE MATRICES", `/api/v1/risk-configs/matrix-configs/${id}`);
  }
}

// Risk Responses
export async function getRiskResponses(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risk-responses",
      method: "GET"
    });
     return successResponse(response.data?.data);
  } catch (error: any) {
    return handleError(error, "GET | GET RESPONSE", "/api/v1/risk-responses");
  }
}

export async function createRiskResponse(data: {
  name: string;
  description: string;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risk-responses",
      method: "POST",
      data
    });
    revalidatePath("/dashboard/system-configs/risk-configs");
   return successResponse(response.data );
  } catch (error: any) {
     return handleError(error, "POST | CREATE RESPONSE", "/api/v1/risk-responses");
  }
}

export async function updateRiskResponse(
  id: string,
  data: Partial<{ name: string; description: string }>
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-responses/${id}`,
      method: "PUT",
      data
    });
    revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data );
  } catch (error: any) {
   return handleError(error, "PUT | UPDATE RESPONSE", `/api/v1/risk-responses/${id}`)
  }
}

export async function deleteRiskResponse(id: string): Promise<APIResponse> {
  try {
   const response =  await authenticatedApiClient({
      url: `/api/v1/risk-responses/${id}`,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/risk-configs");
return successResponse(response.data );
  } catch (error: any) {
     return handleError(error, "DELETE | DELETE RESPONSE", `/api/v1/risk-responses/${id}`);
  }
}

export async function getMatrixScales(
  matrixId: string,
  scaleType?: "LIKELIHOOD" | "IMPACT"
): Promise<APIResponse> {
  try {
    const params = new URLSearchParams({ matrix_id: matrixId });
    if (scaleType) {
      params.append("scale_type", scaleType);
    }
    
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/matrix-scales?${params.toString()}`,
      method: "GET"
    });
    
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(
      error, 
      "GET | MATRIX SCALES", 
      `/api/v1/risk-configs/matrix-scales?matrix_id=${matrixId}`
    );
  }
}
export async function createScale(
  matrixId: string,
  data: {
    scale_type: "LIKELIHOOD" | "IMPACT";
    level: number;
    name: string;
    description: string;
    matrix_id: string;
  }
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/matrix-scales`,
      method: "POST",
      data
    });
    revalidatePath(`/dashboard/system-configs/risk-configs/matrices/${matrixId}/scales`);
    return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "POST | CREATE SCALE", `/api/v1/risk-configs/matrix-scales`);
  }
}

export async function updateScale(
  id: string,
  data: Partial<{ name: string; description: string }>
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/matrix-scales/${id}`,
      method: "PUT",
      data
    });
    revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE SCALE", `/api/v1/risk-configs/scales/${id}`);
  }
}

export async function deleteScale(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/matrix-scales/${id}`,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "DELETE | DELETE SCALE", `/api/v1/risk-configs/scales/${id}`);
  }
}

export async function getMatrixRatings(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/rating-levels`,
      method: "GET"
    });
    return successResponse(response.data?.data);
  } catch (error: any) {
    return handleError(error, "GET | MATRIX RATINGS", `/api/v1/risk-configs/rating-levels`);
  }
}
export async function getMatrixRatingsById(matrixId:string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/rating-levels?matrix_id=${matrixId}`,
      method: "GET"
    });
    console.log("RES:", response);
    
    return successResponse(response.data?.data);
  } catch (error: any) {
    return handleError(error, "GET | MATRIX RATINGS", `/api/v1/risk-configs/rating-levels?matrix_id=${matrixId}`);
  }
}

export async function createRating(
  matrixId: string,
  data: {
    name: string;
    min_score: number;
    max_score: number;
    color_hex: string;
    description: string;
    matrix_id:string;
  }
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/rating-levels`,
      method: "POST",
      data
    });
    revalidatePath(`/dashboard/system-configs/risk-configs/matrices/${matrixId}/scales`);
    return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "POST | CREATE RATING", `/api/v1/risk-configs/rating-levels`);
  }
}

export async function updateRating(
  id: string,
  data: Partial<{
    name: string;
    min_score: number;
    max_score: number;
    color_hex: string;
    description: string;
  }>
): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/rating-levels/${id}`,
      method: "PUT",
      data
    });
    revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "PUT | UPDATE RATING", `/api/v1/risk-configs/rating-levels/${id}`);
  }
}

export async function deleteRating(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-configs/rating-levels/${id}`,
      method: "DELETE"
    });
    revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data);
  } catch (error: any) {
    return handleError(error, "DELETE | DELETE RATING", `/api/v1/risk-configs/rating-levels/${id}`);
  }
}

// Business Process Actions
export async function getBusinessProcesses(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/business-processes",
      method: "GET"
    });
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "GET | BUSINESS PROCESSES", "/api/v1/business-processes");
  }
}

export async function createBusinessProcess(data: {
  name: string;
  description: string | null;
  parent_id: string | null;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/business-processes",
      method: "POST",
      data
    });
     revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "CREATE | BUSINESS PROCESS", "/api/v1/business-processes");
  }
}

export async function updateBusinessProcess(id: string, data: {
  name: string;
  description: string | null;
  parent_id: string | null;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/business-processes/${id}`,
      method: "PUT",
      data
    });
     revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "UPDATE | BUSINESS PROCESS", `/api/v1/business-processes/${id}`);
  }
}

export async function deleteBusinessProcess(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/business-processes/${id}`,
      method: "DELETE"
    });
     revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "DELETE | BUSINESS PROCESS", `/api/v1/business-processes/${id}`);
  }
}

// Risk Causes Actions
export async function getRiskCauses(): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risk-causes",
      method: "GET"
    });
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "GET | RISK CAUSES", "/api/v1/risk-causes");
  }
}

export async function createRiskCause(data: {
  name: string;
  description: string | null;
  parent_id: string | null;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: "/api/v1/risk-causes",
      method: "POST",
      data
    });
    
    revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "CREATE | RISK CAUSE", "/api/v1/risk-causes");
  }
}

export async function updateRiskCause(id: string, data: {
  name: string;
  description: string | null;
  parent_id: string | null;
}): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-causes/${id}`,
      method: "PUT",
      data
    });
    
    revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "UPDATE | RISK CAUSE", `/api/v1/risk-causes/${id}`);
  }
}

export async function deleteRiskCause(id: string): Promise<APIResponse> {
  try {
    const response = await authenticatedApiClient({
      url: `/api/v1/risk-causes/${id}`,
      method: "DELETE"
    });
    
    revalidatePath("/dashboard/system-configs/risk-configs");
    return successResponse(response.data.data);
  } catch (error: any) {
    return handleError(error, "DELETE | RISK CAUSE", `/api/v1/risk-causes/${id}`);
  }
}