// Logout API route
import { NextRequest, NextResponse } from "next/server";
import { logUserOut } from "@/app/_actions/auth-actions";

/**
 * POST /api/logout - Logout endpoint for AJAX calls
 *
 * Request body:
 * {
 *   reason?: string  // Optional reason for logout (e.g., "User session timed out")
 * }
 *
 * Query parameters:
 * - callback: URL to redirect to after logout (default: /login)
 *
 * Response:
 * {
 *   success: boolean
 *   message: string
 *   redirect: string  // URL to redirect to after logout
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Extract optional callback URL from query params
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get("callback") || "/login";

    // Parse request body for optional logout reason
    const body = await request.json().catch(() => ({}));
    const reason = body?.reason || "API logout request";

    // ✅ Use server action for proper session cleanup
    const result = await logUserOut(reason);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Logout successful",
        redirect: callbackUrl
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          redirect: callbackUrl
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ Logout endpoint error:", {
      endpoint: "POST /api/logout",
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
