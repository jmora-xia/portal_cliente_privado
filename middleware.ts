import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isLoginPage = path.startsWith("/iniciar-sesion");
  const isDashboard = path.startsWith("/dashboard");

  const hasSession = request.cookies.get("firebase-auth")?.value;

  if (isDashboard && !hasSession) {
    return NextResponse.redirect(new URL("/iniciar-sesion", request.url));
  }

  if (isLoginPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/iniciar-sesion"],
};