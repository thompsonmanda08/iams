import { verifySession } from "@/lib/session";
import { APIResponse } from "@/types";
import axiosClient, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { cookies } from "next/headers";

export const axios = axiosClient.create({
  baseURL:
    process.env.NODE_ENV !== "development"
      ? process.env.NEXT_PUBLIC_SERVER_URL ||
        process.env.SERVER_URL ||
        "https://console.cloud.xclsv.shop"
      : "http://localhost:3002"
});

// Reusable error handler following DRY principle
const createErrorHandler = () => async (error: Error | any) => {
  // Timeout error
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    throw {
      ...error,
      type: "Timeout Error",
      message: "Request timed out! Please try again"
    };
  }

  // Network error
  if (error.code === "ECONNREFUSED" || error.code === "ECONNRESET" || error.code === "ENOTFOUND") {
    return Promise.reject({
      ...error,
      type: "Network Error",
      message: "Please check your internet connection."
    });
  }

  // No response error
  if (!error.response) {
    return Promise.reject({
      ...error,
      type: "No Response Error",
      message: "No response from server."
    });
  }

  const { status, data } = error.response;

  // Handle specific error codes
  const errorMap: { [x: string]: string } = {
    400: "Bad request",
    403: "Forbidden",
    404: "Resource not found",
    500: "Internal server error",
    502: "Bad gateway",
    503: "Service unavailable"
  };

  return Promise.reject({
    ...error,
    // details: data?.errors || {},
    type: "API",
    status,
    message: data?.message || data?.error || errorMap[status] || "Request failed"
  });
};

// Shared response and error handlers
const responseHandler = (response: any) => response;
const errorHandler = createErrorHandler();

// Apply the same interceptors to both API clients
axios.interceptors.response.use(responseHandler, errorHandler);
// externalApiClient.interceptors.response.use(responseHandler, errorHandler);

export type RequestType = AxiosRequestConfig & {
  contentType?: AxiosRequestHeaders["Content-Type"];
};

const authenticatedApiClient = async (request: RequestType) => {
  const { session } = await verifySession();

  const config = {
    method: "GET",
    headers: {
      "Content-type": request.contentType ? request.contentType : "application/json",
      Authorization: `Bearer ${session?.accessToken}`
    },
    withCredentials: true,
    ...request
  };

  return await axios(config);
};

export default authenticatedApiClient;

/**
 * Constructs a standardized API response object for a successful operation.
 *
 * @param {any | null} data - The data to include in the response object, or null if no data is provided.
 * @param {string} [message="Action completed successfully"] - The message to include in the response object.
 * @returns {APIResponse} - The standardized API response object.
 */

export function successResponse(
  data: any | null,
  message: string = "Action completed successfully"
): APIResponse {
  return {
    success: true,
    message,
    data,
    status: 200,
    statusText: "OK"
  };
}

/**
 * Returns an API response indicating that a request has bad parameters.
 * @param {string} [message="Missing required parameters"] The message to return
 * @returns {APIResponse} The API response
 */
export function handleBadRequest(message: string = "Missing required parameters"): APIResponse {
  return {
    success: false,
    message,
    data: null,
    status: 400,
    statusText: "BAD_REQUEST"
  };
}

/**
 * Constructs a standardized API response object for a 401 UNAUTHORIZED status.
 * Used when a request cannot be authenticated.
 *
 * @param {string} [message="Unauthorized"] - The message to include in the response object.
 * @returns {APIResponse} - The standardized API response object.
 */
export function unauthorizedResponse(message: string = "Unauthorized"): APIResponse {
  return {
    success: false,
    message,
    data: null,
    status: 401,
    statusText: "UNAUTHORIZED"
  };
}

/**
 * Constructs a standardized API response object for a 404 NOT FOUND status.
 * Used when the requested resource could not be found.
 *
 * @param {string} message - The error message to be sent in the response.
 * @returns {APIResponse} - An object containing the success status, error message, and status details.
 */
export function notFoundResponse(message: string): APIResponse {
  return {
    success: false,
    message,
    data: null,
    status: 404,
    statusText: "NOT FOUND"
  };
}

/**
 * Handles and logs errors from API requests, constructs a standardized API response object.
 * Logs the error details, including endpoint information, status, headers, and data.
 *
 * @param {any} error - The error object caught from an API request.
 * @param {string} [method="GET"] - The HTTP method used for the request.
 * @param {string} url - The URL endpoint of the API request.
 * @returns {APIResponse} - An object containing the success status, error message, and status details.
 */

export function handleError(error: any, method: string = "GET", url: string): APIResponse {
  console.error({
    // error,
    config: error?.config,
    status: error?.response?.status || 500,
    endpoint: `${method} | ~ ${url}`,
    apiRoute: `${error?.config?.baseURL || error?.request?.baseURL}/${error?.config?.url || error?.request?.url}`,
    code: error?.code,
    type: error?.type,
    message: error?.message,
    data: error?.response?.data || null
  });

  return {
    success: false,
    message:
      error?.response?.data?.error || // SERVER API ERROR
      error?.response?.data?.message || // CLIENT API ERROR
      error?.message ||
      "No Server Response",
    data: null,
    error: error?.response?.data?.error || error?.message,
    status: error?.response?.status || 500,
    statusText: error?.response?.statusText || error?.code || "INTERNAL SERVER ERROR"
  };
}
