/**
 * Middleware - Kimlik Doğrulama ve Yetkilendirme
 * 
 * Kullanıcıların sayfalara erişim yetkilerini kontrol eder.
 * Korumalı sayfalar için giriş kontrolü yapar.
 */

import NextAuth from 'next-auth';
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Auth API route'ları (giriş, çıkış, kayıt işlemleri)
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  
  // Herkese açık sayfalar
  const isPublicRoute = ['/', '/login', '/register', '/movies'].includes(nextUrl.pathname) || nextUrl.pathname.startsWith('/movies/');

  // Public route'lar için kontrol yapmadan geçir
  if (isApiAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  // Giriş gerektiren korumalı sayfalar
  const isProtectedRoute = 
    nextUrl.pathname.startsWith('/profile') ||
    nextUrl.pathname.startsWith('/messages') ||
    nextUrl.pathname.startsWith('/settings') ||
    nextUrl.pathname.startsWith('/admin');

  // Korumalı sayfaya giriş yapmadan erişim kontrolü
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  
  // Admin sayfaları için ek yetki kontrolü
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  if (isAdminRoute) {
    const userRole = req.auth?.user?.role;
    
    // Admin olmayan kullanıcıları ana sayfaya yönlendir
    if (!isLoggedIn || (userRole !== 'ADMIN' && userRole !== 'admin')) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  return NextResponse.next();
});

// Middleware konfigürasyonu
// Static dosyalar ve Next.js internal route'ları hariç tüm sayfalarda çalışır
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
} 