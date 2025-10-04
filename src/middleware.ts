import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET); // Convert secret to Uint8Array for jose

interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

interface User {
  userId: string;
  email: string;
  bio: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  profileImage: string;
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const normalizedPathname = pathname.toLowerCase().replace(/\/+$/, '');

  // Extract token from cookies or Authorization header
  const authToken =
    request.cookies.get('authToken')?.value ||
    (request.headers.get('authorization')?.startsWith('Bearer ')
      ? request.headers.get('authorization')?.replace('Bearer ', '')
      : null);

  let user: User | null = null;

  if (authToken) {
    try {
      // Verify JWT using jose
      const { payload } = await jwtVerify(authToken, SECRET_KEY);
      const decoded = payload as unknown as JwtPayload;
      if (!decoded.userId || !decoded.email || typeof decoded.isAdmin !== 'boolean') {
        throw new Error('Invalid token structure');
      }

      // Use JWT data directly (now synchronized with database changes)
      user = {
        userId: decoded.userId,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
        bio: '', // Not needed for middleware decisions
        firstName: null, // Not needed for middleware decisions
        lastName: null, // Not needed for middleware decisions
        profileImage: '', // Not needed for middleware decisions
      };

      console.log(`Middleware using JWT data for user ${decoded.userId}: isAdmin=${decoded.isAdmin}`);
    } catch (err) {
      console.error('Middleware auth error:', err);
      
      // If JWT verification fails, try to get fresh data as fallback
      // This handles cases where JWT might be corrupted but user is still logged in
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // Shorter timeout for fallback

        const res = await fetch(`${baseUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const freshUser = await res.json();
          if (freshUser && freshUser.userId && typeof freshUser.isAdmin === 'boolean') {
            user = freshUser;
            console.log(`Middleware fallback: Using fresh data for user ${freshUser.userId}`);
          } else {
            throw new Error('Invalid fresh user data');
          }
        } else {
          throw new Error(`Fallback API call failed: ${res.status}`);
        }
      } catch (fallbackErr) {
        console.error('Middleware fallback also failed:', fallbackErr);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', encodeURIComponent(pathname));
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Define route groups
  const protectedRoutes = [
    '/profile', 
    '/reset-password', 
    '/conferance',    // Conference system requires authentication
    '/messenger',     // Messaging system requires authentication
    '/dashboard'      // Main dashboard requires authentication (but not admin)
  ];
  const adminRoutes = [
    '/admin', 
    '/dashboard',
    '/users',           // User management
    '/insights',        // Analytics
    '/deployments',     // Deployment management
    '/professionals',   // Professional management
    '/reviews',
    "/messenger",         // Review management
    "/meeting"         // Review management
  ];
  const authRoutes = ['/login', '/register'];

  const isProtectedRoute = protectedRoutes.some((route) => normalizedPathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => normalizedPathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => normalizedPathname.startsWith(route));

  // Protected route: require authenticated user
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }

  // Admin route: require authenticated user with isAdmin: true
  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }
    if (!user.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Auth route: redirect authenticated users to /profile
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Proceed with request
  const duration = Date.now() - startTime;
  console.log(`Middleware completed for ${pathname} in ${duration}ms - User: ${user ? `${user.userId} (admin: ${user.isAdmin})` : 'none'}`);
  
  // Create response with user headers for components to access
  const response = NextResponse.next();
  
  if (user) {
    response.headers.set('x-user-id', user.userId);
    response.headers.set('x-user-email', user.email);
    response.headers.set('x-user-admin', user.isAdmin.toString());
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public/.*).*)'],
};