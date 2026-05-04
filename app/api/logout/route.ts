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
/**
 * Same-origin guard. The cookies that carry the session are already
 * `sameSite: "strict"` so a cross-origin POST cannot send them, but defenders
 * shouldn't rely on a single layer. Reject any POST whose Origin header is
 * present and disagrees with the request URL's origin. Browsers always send
 * Origin on POST, so a missing Origin is suspicious — also reject.
 */
function isSameOriginPost(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const reqUrl = new URL(request.url);
    const originUrl = new URL(origin);
    return reqUrl.origin === originUrl.origin;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginPost(request)) {
      return NextResponse.json(
        { success: false, message: "Forbidden", redirect: "/login" },
        { status: 403 }
      );
    }

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
