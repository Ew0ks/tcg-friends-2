import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = [
  "/collection",
  "/open-boosters",
  "/admin",
  "/api/collection",
  "/api/boosters",
  "/api/admin",
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Autoriser l'accès à la page d'accueil, login et signup
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return NextResponse.next();
  }

  // Vérifier si le chemin est protégé
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/collection/:path*",
    "/open-boosters/:path*",
    "/admin/:path*",
    "/api/collection/:path*",
    "/api/boosters/:path*",
    "/api/admin/:path*",
    "/login",
    "/signup",
  ],
}; 