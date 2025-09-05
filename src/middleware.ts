// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  console.log("MIDDLEWARE HIT:", req.nextUrl.pathname); // Debug
  const ua = req.headers.get("user-agent") || "";

  // Check for force-web bypass parameter
  const forceWeb = req.nextUrl.searchParams.get("force-web");

  // Comprehensive mobile detection
  const isMobile =
    /android|iphone|ipod|blackberry|opera mini|iemobile|mobile|windows phone/i.test(
      ua.toLowerCase()
    );

  // Separate tablet detection - you might want to allow tablets
  const isTablet = /ipad|tablet|kindle|silk/i.test(ua.toLowerCase());

  // Block mobile devices (but potentially allow tablets) unless force-web is used
  if (isMobile && !isTablet && !forceWeb) {
    // Redirect to a dedicated "mobile-blocked" page with app download info
    return NextResponse.redirect(new URL("/mobile-blocked", req.url));
  }

  // Optional: Also block tablets (uncomment if needed)
  // if (isTablet && !forceWeb) {
  //   return NextResponse.redirect(new URL('/mobile-blocked', req.url));
  // }

  return NextResponse.next();
}

export const config = {
  // Apply to all pages except API routes, Next.js internals, static files, and the mobile-blocked page itself
  matcher: ["/((?!api|_next|static|favicon.ico|mobile-blocked|images).*)", "/"],
};
