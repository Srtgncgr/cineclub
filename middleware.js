import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  console.log('🔴 MIDDLEWARE - Path:', request.nextUrl.pathname);
  
  const pathname = request.nextUrl.pathname;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  console.log('🔍 Token durumu:', { 
    exists: !!token, 
    userId: token?.id, 
    role: token?.role,
    email: token?.email 
  });

  // Korumalı sayfaları tanımla
  const protectedRoutes = {
    // Sadece giriş yapmış kullanıcılar erişebilir
    authenticated: [
      '/profile',
      '/messages', 
      '/watchlist',
      '/movies/favorites'
    ],
    
    // Sadece admin kullanıcıları erişebilir  
    admin: [
      '/admin'
    ]
  };

  // Admin sayfaları kontrolü
  if (protectedRoutes.admin.some(route => pathname.startsWith(route))) {
    console.log('🔒 Admin sayfasına erişim girişimi');
    
    if (!token) {
      console.log('❌ Token yok, login sayfasına yönlendiriliyor');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (token.role !== 'ADMIN' && token.role !== 'admin') {
      console.log('❌ Admin yetkisi yok, ana sayfaya yönlendiriliyor');
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(homeUrl);
    }
    
    console.log('✅ Admin erişimi onaylandı');
    return NextResponse.next();
  }

  // Giriş yapmış kullanıcı sayfaları kontrolü
  if (protectedRoutes.authenticated.some(route => pathname.startsWith(route))) {
    console.log('🔒 Korumalı sayfaya erişim girişimi');
    
    if (!token) {
      console.log('❌ Giriş yapmamış kullanıcı, login sayfasına yönlendiriliyor');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('✅ Kimlik doğrulama başarılı');
    return NextResponse.next();
  }

  // Giriş yapmış kullanıcıların login/register sayfalarına erişimini engelle
  if ((pathname === '/login' || pathname === '/register') && token) {
    console.log('🔄 Zaten giriş yapmış kullanıcı, ana sayfaya yönlendiriliyor');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  console.log('✅ Sayfa erişimine izin verildi');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Şu yolları hariç tut:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 