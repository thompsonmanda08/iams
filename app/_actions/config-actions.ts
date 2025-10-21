"use server";

import { APIResponse, Branch, Department } from "@/types";
import {
  axios,
  handleBadRequest,
  handleError,
  successResponse,
  unauthorizedResponse
} from "./api-config";

export async function getBranches(): Promise<APIResponse> {
  const url = `/api/configs/branches`;

  try {
    const response = await axios.get(url);

    return successResponse(response?.data, "Branches fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | AUTH LOGIN ~ /api/auth/login", url);
  }
}

export async function createNewBranch({
  name,
  code,
  province,
  city,
  physical_address
}: Branch): Promise<APIResponse> {
  const url = `/api/auth/signup`;

  try {
    const response = await axios.post(url, {
      name,
      code,
      province,
      city,
      physical_address
    });

    return successResponse(response.data || "Branch created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | NEW BRANCH", url);
  }
}

export async function updateBranch({
  name,
  code,
  province,
  city,
  physical_address
}: Branch): Promise<APIResponse> {
  const url = `/api/auth/signup`;

  try {
    const response = await axios.patch(url, {
      name,
      code,
      province,
      city,
      physical_address
    });

    return successResponse(response.data || "Branch created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | NEW BRANCH", url);
  }
}

export async function getDepartments(): Promise<APIResponse> {
  const url = `/api/configs/departments`;

  try {
    const response = await axios.get(url);

    return successResponse(response?.data, "Departments fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | AUTH LOGIN ~ /api/auth/login", url);
  }
}

export async function createNewDepartment({ name, description }: Department): Promise<APIResponse> {
  const url = `/api/configs/department`;

  try {
    const response = await axios.post(url, {
      name,
      description
    });

    return successResponse(response.data || "Department created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | NEW DEPARTMENT", url);
  }
}
export async function updateDepartment({ name, description }: Department): Promise<APIResponse> {
  const url = `/api/configs/department`;

  try {
    const response = await axios.patch(url, {
      name,
      description
    });

    return successResponse(response.data || "Department created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | NEW DEPARTMENT", url);
  }
}
