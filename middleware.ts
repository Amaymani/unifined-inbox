// middleware.ts
export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Skip auth checks for public routes
  const publicRoutes = [
    "/login",
    "/signup",
    "/api/auth",
    "/api/health",
    "/api/webhooks/twilio",
    "/"
  ];

  if (publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ✅ Verify session using Better Auth
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    // No valid session → redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// ✅ Run middleware on all pages except Next internals and static assets
export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico).*)"],
};