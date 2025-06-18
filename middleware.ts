import NextAuth from 'next-auth';
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = ['/', '/login', '/register', '/movies'].includes(nextUrl.pathname) || nextUrl.pathname.startsWith('/movies/');

  if (isApiAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  const isProtectedRoute = 
    nextUrl.pathname.startsWith('/profile') ||
    nextUrl.pathname.startsWith('/messages') ||
    nextUrl.pathname.startsWith('/settings') ||
    nextUrl.pathname.startsWith('/admin');

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  if (isAdminRoute) {
    const userRole = req.auth?.user?.role;
    
    if (!isLoggedIn || (userRole !== 'ADMIN' && userRole !== 'admin')) {
    return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
} 