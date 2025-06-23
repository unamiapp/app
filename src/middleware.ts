import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/error', '/signin', '/api/auth/signin', '/api/auth/callback', '/test-auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Check if the route is public
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // Get the user's session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token and not on a public route, redirect to login
  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Get user role from token, default to 'admin' if not set
  const userRole = ((token as any).role || 'admin').toLowerCase();
  
  // If user is accessing a dashboard route
  if (pathname.startsWith('/dashboard/')) {
    const pathParts = pathname.split('/');
    const roleFromPath = pathParts[2]?.toLowerCase();
    
    // If accessing /dashboard without a role, redirect to user's role dashboard
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
    }
    
    // Admin can access any dashboard
    if (userRole === 'admin') {
      return NextResponse.next();
    }
    
    // For non-admin users, check if they're accessing their role's dashboard
    if (roleFromPath && roleFromPath !== userRole) {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
    }
  }

  return NextResponse.next();
}

// Configure matcher for middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};