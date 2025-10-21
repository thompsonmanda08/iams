import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "./lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone(); // REQUIRED FOR BASE ABSOLUTE URL
  const response = NextResponse.next();

  // // Add security headers to all responses
  // response.headers.set("X-Frame-Options", "DENY");
  // response.headers.set("X-Content-Type-Options", "nosniff");
  // response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // response.headers.set("X-XSS-Protection", "1; mode=block");
  // response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // if (process.env.NODE_ENV === "production") {
  //   response.headers.set(
  //     "Strict-Transport-Security",
  //     "max-age=31536000; includeSubDomains; preload"
  //   );
  // }

  // const { session, isAuthenticated } = await verifySession();

  // const urlRouteParams = pathname.match(/^\/dashboard\/([^\/]+)\/?$/);
  // const accessToken = session?.accessToken || "";

  // // Exclude public assets like icons, manifest, and images
  // if (
  //   pathname.startsWith("/web-app-manifest") ||
  //   pathname.startsWith("/favicon") ||
  //   pathname.startsWith("/_next") ||
  //   pathname.startsWith("/static") ||
  //   pathname.startsWith("/public") ||
  //   pathname.startsWith("/manifest.json")
  // ) {
  //   return response;
  // }

  // // CHECK FOR  ROUTES
  // const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  // const isDashboardRoute = pathname.startsWith("/dashboard");

  // if (isAuthPage && !accessToken && !isAuthenticated) return response;

  // // IF NO ACCESS TOKEN AT ALL>>> REDIRECT BACK TO AUTH PAGE
  // if (!accessToken && isAuthPage) {
  //   url.pathname = "/login";

  //   return NextResponse.redirect(url);
  // }

  // // IF THERE IS AN ACCESS TOKEN EXISTS - REDIRECT TO DASHBOARD
  // if ((accessToken && isAuthPage) || isDashboardRoute) {
  //   url.pathname = `/dashboard/home`;

  //   return NextResponse.redirect(url);
  // }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|web-app-manifest-192x192.png|web-app-manifest-512x512.png|manifest.json).*)"
  ]
};
