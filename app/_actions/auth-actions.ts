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

    return {
      success: true,
      message: "Login successful",
      data: response?.data?.sellerData,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error: Error | any) {
    console.error({
      endpoint: `POST | AUTH LOGIN ~ ${url}`,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      headers: error?.response?.headers,
      config: error?.response?.config,
      data: error?.response?.data || error
    });

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.message ||
        error?.message ||
        "Oops! Something went wrong. Please try again.",
      data: null,
      status: error?.response?.status,
      statusText: error?.response?.statusText
    };
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
