/**
 * 🛡️ GÜVENLİK KAPIISI (MIDDLEWARE) - Web Sitesinin Güvenlik Sistemi
 * 
 * Bu dosya web sitesinin "güvenlik görevlisi" gibidir. 
 * Bir kullanıcı herhangi bir sayfaya gitmek istediğinde, önce bu dosya devreye girer ve şunları sorar:
 * 
 * 1. "Bu kişi sisteme giriş yapmış mı?" 
 * 2. "Bu sayfaya girme izni var mı?"
 * 3. "Eğer admin sayfasıysa, bu kişi admin mi?"
 * 
 * Eğer cevap "HAYIR" ise, kişiyi uygun sayfaya yönlendirir.
 * Eğer cevap "EVET" ise, sayfaya girmesine izin verir.
 * 
 * 🎯 Ne İşe Yarar:
 * - Giriş yapmamış kişilerin profil sayfasına girmesini engeller
 * - Admin olmayanların admin paneline girmesini engeller
 * - Herkesin film sayfalarını görmesine izin verir
 * - Yetkisiz kişileri login sayfasına yönlendirir
 */

import NextAuth from 'next-auth';
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from 'next/server';

export default auth((req) => {
  // 📍 ADIM 1: Kullanıcının hangi sayfaya gitmeye çalıştığını öğren
  // req.nextUrl = kullanıcının gitmek istediği sayfa adresi (örn: /profile, /movies/123)
  const { nextUrl } = req;
  
  // 👤 ADIM 2: Bu kişi sisteme giriş yapmış mı kontrol et
  // req.auth = NextAuth'un verdiği kullanıcı bilgisi (giriş yapmışsa dolu, yapmamışsa null)
  // !! işareti = "null değilse true, null ise false" anlamına gelir
  // Yani: Giriş yapmışsa isLoggedIn = true, yapmamışsa isLoggedIn = false
  const isLoggedIn = !!req.auth;

  // 📋 ADIM 3: Bu sayfa hangi kategoride? (Herkese açık mı, korumalı mı?)
  // Web sitemizdeki sayfaları kategorilere ayırıyoruz:
  
  // 🔧 API Sayfaları (/api/auth ile başlayanlar)
  // Bunlar giriş, çıkış, kayıt gibi sistem işlemleri için kullanılır
  // Örnek: /api/auth/login, /api/auth/register
  // Bu sayfalara herkes erişebilir çünkü giriş yapmak için kullanılır
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  
  // 🌍 Herkese Açık Sayfalar (giriş yapmadan da görülebilir)
  // Bu sayfalara kim olursa olsun bakabilir
  // Örnekler: Ana sayfa (/), Giriş sayfası (/login), Film listesi (/movies)
  const isPublicRoute = ['/', '/login', '/register', '/movies'].includes(nextUrl.pathname) || nextUrl.pathname.startsWith('/movies/');

  // ✅ ADIM 4: Eğer herkese açık sayfa ise, kontrolsüz geçir
  // 
  // Soru: Bu kişi API sayfasına mı yoksa herkese açık sayfaya mı gidiyor?
  // Cevap EVET ise: "Tamam, git bakalım!" de ve hiçbir şey kontrol etme
  // 
  // Mantık: Giriş sayfasına giderken "giriş yapmış mısın?" diye sormak saçma olur!
  if (isApiAuthRoute || isPublicRoute) {
    return NextResponse.next(); // "Geç git!" demek
  }

  // 🔒 ADIM 5: Bu sayfa korumalı mı? (Sadece üyeler girebilir mi?)
  // 
  // Bazı sayfalar özeldir, sadece sisteme giriş yapmış kişiler görebilir:
  
  const isProtectedRoute = 
    nextUrl.pathname.startsWith('/profile') ||     // 👤 Profil sayfaları (/profile/...)
    nextUrl.pathname.startsWith('/messages') ||    // 💬 Mesaj sayfaları (/messages/...)
    nextUrl.pathname.startsWith('/settings') ||    // ⚙️ Ayarlar sayfaları (/settings/...)
    nextUrl.pathname.startsWith('/admin');         // 👨‍💼 Admin sayfaları (/admin/...)

  // 🚫 KONTROL: Korumalı sayfaya giriş yapmadan girmeye çalışıyor mu?
  // 
  // Soru: "Bu korumalı bir sayfa mı?" VE "Bu kişi giriş yapmış mı?"
  // Eğer korumalı sayfa ama giriş yapmamışsa → Login sayfasına gönder!
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl)); // "Önce giriş yap!" demek
  }
  
  // 👑 ADIM 6: Admin kontrolü - Bu kişi admin mi?
  // 
  // Admin sayfaları (/admin/...) çok özeldir, sadece adminler girebilir!
  
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  if (isAdminRoute) {
    // 🔍 Bu kişinin rolünü kontrol et
    // req.auth?.user?.role = kullanıcının sistemdeki rolü ("USER", "ADMIN" vs.)
    const userRole = req.auth?.user?.role;
    
    // ⚠️ ÇİFTE KONTROL: 
    // 1. Giriş yapmış mı? (zaten üstte kontrol ettik ama emin olmak için)
    // 2. Admin rolü var mı?
    // 
    // Eğer ikisinden biri yoksa → Ana sayfaya gönder!
    if (!isLoggedIn || (userRole !== 'ADMIN' && userRole !== 'admin')) {
      return NextResponse.redirect(new URL('/', nextUrl)); // "Bu alan sana göre değil!" demek
    }
  }

  // 🎉 ADIM 7: Tüm kontroller başarılı! 
  // Buraya kadar geldiyse demek ki:
  // - Ya herkese açık sayfaya gidiyor
  // - Ya da giriş yapmış ve yetkisi var
  // O yüzden rahatça geçebilir!
  return NextResponse.next(); // "Hoş geldin, buyur geç!" demek
});

// 🔧 AYARLAR BÖLÜMÜ - Bu güvenlik sistemi nerede çalışsın?
//
// Bu ayar, yukarıdaki güvenlik kontrolünün hangi sayfalarda çalışacağını belirler.
//
// 📝 Basit açıklama:
// "Resim dosyaları, CSS dosyaları, favicon gibi teknik şeyler hariç,
//  kullanıcının gittiği TÜM sayfalarda bu güvenlik kontrolünü yap!"
//
// 🚫 Kontrol ETMEdiği şeyler:
// - /api/... (API endpoint'leri ayrı kontrol edilir)
// - /_next/static/... (CSS, JS dosyaları)
// - /_next/image/... (otomatik optimize edilmiş resimler)  
// - /favicon.ico (site ikonu)
//
// ✅ Kontrol ETTiği şeyler: Bunlar dışında kalan her şey!
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
} 