import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = ['/collection', '/open-boosters'];
  
  // Routes admin qui nécessitent le rôle ADMIN
  const adminRoutes = ['/admin'];

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!token && protectedRoutes.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si l'utilisateur n'est pas admin et essaie d'accéder à une route admin
  if (token && adminRoutes.some(route => path.startsWith(route)) && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/collection/:path*', '/open-boosters/:path*', '/admin/:path*'],
};