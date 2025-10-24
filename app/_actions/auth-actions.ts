"use server";

import { APIResponse } from "@/types";
import {
  axios,
  handleBadRequest,
  handleError,
  successResponse,
  unauthorizedResponse
} from "./api-config";
import { createAuthSession } from "@/lib/session";

export async function loginUser({
  username,
  password
}: {
  username: string;
  password: string;
}): Promise<APIResponse> {
  const url = `/api/auth/login`;

  try {
    const response = await axios.post(url, { username, password });

    // Set authentication cookie
    await createAuthSession(response.data.tokenData);

    return successResponse(response?.data, "Login successful");
  } catch (error: Error | any) {
    return handleError(error, "POST | AUTH LOGIN ~ /api/auth/login", url);
  }
}

export async function resetPassword({
  newPassword,
  token
}: {
  newPassword: string;
  token: string;
}): Promise<APIResponse> {
  const url = `/api/auth/password-reset`;

  try {
    const response = await axios.post(url, { newPassword, token });

    return successResponse(response?.data, "Password reset successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | RESET PASSWORD", url);
  }
}
