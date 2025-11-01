// Enhanced logout API route
import { NextRequest, NextResponse } from "next/server";
import { deleteSession, verifySession } from "@/lib/session";
import authenticatedApiClient from "@/app/_actions/api-config";

/**
 * POST /api/logout - Logout endpoint for AJAX calls
 * Handles server-side session cleanup without redirect
 */
export async function POST(request: NextRequest) {
  try {
    // Extract optional callback URL from query params
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get("callback") || "/login";

    // Get the current session to extract the access token
    const { session } = await verifySession();

    if (!session?.accessToken) {
      // If no session exists, just return success (already logged out)
      return NextResponse.json({
        success: true,
        message: "Already logged out",
        redirect: callbackUrl
      });
    }

    // Parse request body for optional logout reason
    const body = await request.json().catch(() => ({}));
    const reason = body?.reason;

    const response = await authenticatedApiClient({
      url: "/api/v1/auth/logout"
      // method: "POST",
      // data: { reason }
    });

    console.log("[ LOGOUT ]: ", reason);

    // Check if backend logout succeeded (optional - proceed anyway)
    if (!response.status || response.status !== 200) {
      console.warn("Backend logout failed, proceeding with local session cleanup", {
        status: response.status,
        statusText: response.statusText
      });
    }

    // Delete server-side session (cookies) - this is the critical part
    const result = await deleteSession();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to clear session",
          redirect: callbackUrl
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Logout successful",
      redirect: callbackUrl
    });
  } catch (error: any) {
    console.error({
      endpoint: "POST | LOGOUT ~ /api/logout",
      error: error?.message || error,
      stack: error?.stack
    });

    // Even if there's an error, try to delete the session
    await deleteSession().catch(() => {
      console.warn("Error Occurred: Proceeding with local session cleanup");
    });

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Logout failed",
        redirect: "/login"
      },
      { status: 500 }
    );
  }
}
