"use server";

import { getUploadAuthParams } from "@imagekit/next/server";

import axios, {
  handleBadRequest,
  handleError,
  successResponse,
  unauthorizedResponse
} from "./api-config";

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

export async function createNewAccount({
  email,
  username,
  name,
  phone,
  password,
  accountType = "DEFAULT",
  isBusinessAccount = false,
  businessName,
  businessType,
  description,
  referral
}: {
  email: string;
  username: string;
  name: string;
  phone?: string;
  password: string;
  accountType?: "DEFAULT" | "EVENT_HOST";
  isBusinessAccount?: boolean;
  businessName?: string;
  businessType?: string;
  description?: string;
  referral?: string | null;
}): Promise<APIResponse> {
  const url = `/api/auth/signup`;

  try {
    const response = await axios.post(url, {
      email,
      username,
      name,
      phone,
      password,
      accountType,
      isBusinessAccount,
      businessName,
      businessType,
      description,
      referral
    });

    // Set authentication cookie
    await createAuthSession(response.data.tokenData);

    return successResponse(response.data?.userData || "Account created successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | AUTH SIGNUP", url);
  }
}

export async function sendResetEmail({
  username,
  email
}: {
  username?: string;
  email?: string;
}): Promise<APIResponse> {
  const url = `/api/auth/forgot-password`;

  if (!username && !email) {
    return handleBadRequest("Please enter your username or email");
  }

  try {
    const response = await axios.post(url, { username, email });

    return successResponse(response?.data, "Reset email sent successfully");
  } catch (error: Error | any) {
    return handleError(error, "POST | SEND RESET PASSWORD EMAIL", url);
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

export async function checkSignupAvailability(): Promise<APIResponse> {
  const url = `/api/settings/signup-enabled`;

  try {
    const response = await axios.get(url);

    return successResponse(response?.data, "Signup settings fetched successfully");
  } catch (error: Error | any) {
    return handleError(error, "GET | CHECK SIGNUP AVAILABILITY", url);
  }
}

export async function uploadImageAuth(): Promise<APIResponse> {
  // Verify the authenticated seller owns this product
  const session = await verifySession();

  if (!session) {
    return unauthorizedResponse("Please sign in to upload images");
  }

  try {
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string
    });

    return successResponse(
      {
        token,
        expire,
        signature,
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY
      },
      "Image upload auth fetched successfully"
    );
  } catch (error: Error | any) {
    return handleError(error, "GET | UPLOAD IMAGE AUTH", "/api/upload-auth");
  }
}
