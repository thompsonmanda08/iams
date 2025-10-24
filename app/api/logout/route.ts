// Enhanced logout API route
import { NextRequest, NextResponse } from "next/server";

import { deleteSession } from "@/lib/session";

/**
 * GET /api/logout - Logout endpoint for AJAX calls
 * Handles server-side session cleanup without redirect
 */
export async function GET(request: NextRequest) {
  try {
    // Extract optional callback URL from query params
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get("callback") || "/login";

    // Delete server-side sessions (cookies)
    const result = await deleteSession();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to logout properly",
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
      endpoint: "GET | LOGOUT ~ /api/logout",
      error: error?.message || error,
      stack: error?.stack
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

/**
 * POST /api/logout - Logout endpoint for form submissions
 * Handles server-side session cleanup without redirect
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const callbackUrl = body?.callback || "/login";

    // Delete server-side sessions (cookies)
    const result = await deleteSession();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to logout properly",
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
