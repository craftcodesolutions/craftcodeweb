import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookies or headers
  const authToken = request.cookies.get('authToken')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');
  
  const userEmail = request.cookies.get('userEmail')?.value;

  // Routes that require authentication
  const protectedRoutes = [
     '/profile',
    '/reset-password',
    '/forgot-password'
  ];

  // Routes that should not be accessible when authenticated
  const authRoutes = [
    '/login',
    '/register'
  ];

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if current route is an auth route (login/register)
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If accessing protected route without authentication
  if (isProtectedRoute && (!authToken || !userEmail)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes while authenticated
  if (isAuthRoute && authToken && userEmail) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 