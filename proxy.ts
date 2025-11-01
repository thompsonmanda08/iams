import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION } from "./lib/constants";

/**
 * Next.js 16 Proxy - Optimized for fast edge checks
 * Per Next.js docs: "Proxy is not intended for slow data fetching"
 *
 * This proxy only checks cookie EXISTENCE (fast) - not JWT decryption (slow).
 * Full session verification happens in layouts/pages where caching works.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  const response = NextResponse.next();

  // Add security headers to all responses
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Exclude public assets like icons, manifest, and images
  if (
    pathname.startsWith("/web-app-manifest") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/manifest.json")
  ) {
    return response;
  }

  // ✅ FAST: Check cookie existence only (no JWT decryption)
  const hasAuthCookie = request.cookies.has(AUTH_SESSION);

  // Define authentication pages (login, register, OTP)
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/otp");

  // If no auth cookie and not on auth page, redirect to login
  if (!hasAuthCookie && !isAuthPage) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If has auth cookie and on auth page, redirect to dashboard
  // (Layouts/pages will handle MFA checks and user routing)
  if (hasAuthCookie && isAuthPage) {
    url.pathname = "/dashboard/home";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|web-app-manifest-192x192.png|web-app-manifest-512x512.png|manifest.json).*)"
  ]
};
