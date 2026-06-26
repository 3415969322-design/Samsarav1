import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName, verifySessionToken } from "@/lib/auth/session";

const protectedPrefixes = [
  "/dashboard",
  "/todos",
  "/documents",
  "/notes",
  "/tags",
  "/search",
  "/files",
  "/diary",
  "/ai",
  "/exam-bank",
  "/exam-practice",
  "/exam-upload",
  "/exam-wrongbook",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(sessionCookieName)?.value;
  const session = await verifySessionToken(token);
  const protectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (protectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/todos/:path*",
    "/documents/:path*",
    "/notes/:path*",
    "/tags/:path*",
    "/search/:path*",
    "/files/:path*",
    "/diary/:path*",
    "/ai/:path*",
    "/exam-bank/:path*",
    "/exam-practice/:path*",
    "/exam-upload/:path*",
    "/exam-wrongbook/:path*",
    "/settings/:path*",
  ],
};
