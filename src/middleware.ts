import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow the login page itself
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("admin_auth")?.value;
  const password = process.env.ADMIN_PASSWORD;

  if (!password || authCookie !== password) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
