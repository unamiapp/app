import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/error'];

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

  // Get user role from token
  const userRole = ((token as any).role || '').toLowerCase();
  
  // If user is accessing a dashboard route
  if (pathname.startsWith('/dashboard/')) {
    const pathParts = pathname.split('/');
    const roleFromPath = pathParts[2]?.toLowerCase(); // e.g., /dashboard/admin -> admin
    
    // Admin can access any dashboard
    if (userRole === 'admin') {
      return NextResponse.next();
    }
    
    // For non-admin users, check if they're accessing their role's dashboard or sub-routes
    if (roleFromPath && roleFromPath !== userRole) {
      console.log(`User with role ${userRole} attempting to access ${roleFromPath} dashboard. Redirecting to ${userRole} dashboard.`);
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
    }
    
    // Allow access to sub-routes within user's role
    return NextResponse.next();
  }

  // If user is authenticated but accessing the root, redirect to their dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
  }

  return NextResponse.next();
}

// Configure matcher for middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};