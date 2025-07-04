// ============================================================================
// CineClub Authentication System - NextAuth.js Konfigürasyonu
// ============================================================================

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs"

// Veritabanı bağlantısı - Authentication için ayrı bir instance
const db = new PrismaClient()

/**
 * NextAuth.js Ana Konfigürasyonu
 * 
 * Bu dosya tüm authentication işlemlerinin merkezini oluşturur:
 * - Kullanıcı giriş doğrulaması
 * - JWT token yönetimi
 * - Session callback'leri
 * - Güvenlik ayarları
 */
export const authConfig = NextAuth({
  // Prisma Adapter - Veritabanı entegrasyonu için
  adapter: PrismaAdapter(db),
  
  // Authentication Providers - Giriş yöntemleri
  providers: [
    /**
     * Credentials Provider - Email/Password ile giriş
     * 
     * Bu provider kullanıcıların email ve şifre ile giriş yapmasını sağlar.
     * Şifre doğrulaması bcrypt ile yapılır ve güvenlik için hash'lenir.
     */
    CredentialsProvider({
      name: "Credentials",
      
      // Form alanları tanımı - Login sayfasında kullanılacak
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      
      /**
       * Authorize Fonksiyonu - Kullanıcı doğrulama mantığı
       * 
       * Bu fonksiyon her giriş denemesinde çalışır ve şu adımları izler:
       * 1. Credentials kontrolü
       * 2. Veritabanından kullanıcı sorgulama
       * 3. Şifre doğrulama (bcrypt)
       * 4. Başarılı ise user objesi döndürme
       * 
       * @param credentials - Login formundan gelen email ve password
       * @returns User object veya null
       */
      async authorize(credentials) {
        // 1. Adım: Gerekli alanların kontrolü
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Auth: Eksik credentials");
          return null;
        }

        // Type safety için string'e çevirme
        const email = credentials.email as string;
        const password = credentials.password as string;

        // 2. Adım: Veritabanından kullanıcıyı bulma
        const user = await db.user.findUnique({
          where: { email }
        });

        // Kullanıcı bulunamadı veya şifre hash'i yok
        if (!user || !user.password) {
          console.log("❌ Auth: Kullanıcı bulunamadı veya şifre yok");
          return null;
        }

        // 3. Adım: Şifre doğrulama (bcrypt compare)
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // 4. Adım: Doğrulama sonucu kontrolü
        if (isPasswordValid) {
          console.log("✅ Auth: Başarılı giriş -", user.email);
          
          // Şifreyi response'dan çıkararak user objesi döndür
          const { password: _, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }

        console.log("❌ Auth: Yanlış şifre");
        return null;
      }
    })
  ],
  
  // Session Stratejisi - JWT kullanıyoruz (stateless)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün - session süresi
  },
  
  // Güvenlik için secret key
  secret: process.env.NEXTAUTH_SECRET,
  
  // Custom sayfalar - Kendi login sayfamızı kullanıyoruz
  pages: {
    signIn: "/login",
    error: "/login", // Hata durumunda da login'e yönlendir
  },
  
  /**
   * Callback Fonksiyonları
   * 
   * Bu callback'ler authentication akışının farklı noktalarında çalışır
   * ve token ile session'a ekstra data eklememizi sağlar.
   */
  callbacks: {
    /**
     * JWT Callback - Token oluşturma ve güncelleme
     * 
     * Her token oluşturulduğunda veya güncellendiğinde çalışır.
     * User bilgilerini token'a ekler.
     * 
     * @param token - Mevcut JWT token
     * @param user - Login olan user (sadece ilk seferde dolu)
     * @returns Güncellenmiş token
     */
          async jwt({ token, user }) {
        // İlk login'de user bilgilerini token'a ekle
        if (user) {
          console.log("🔄 JWT Callback: Token'a user bilgisi ekleniyor");
          token.id = user.id;
          token.role = (user as any).role;
          token.username = (user as any).username;
          token.displayName = (user as any).displayName;
        }
        return token;
      },
    
    /**
     * Session Callback - Client'a gönderilecek session oluşturma
     * 
     * Her session erişiminde çalışır ve client'ın göreceği
     * session objesini oluşturur.
     * 
     * @param session - Mevcut session objesi
     * @param token - JWT token'dan gelen bilgiler
     * @returns Client'a gönderilecek session
     */
    async session({ session, token }) {
      // Token'daki bilgileri session'a aktar
      if (session.user && token) {
        console.log("🔄 Session Callback: Session güncelleniyor");
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.displayName = token.displayName as string;
      }
      return session;
    }
  }
})

// NextAuth handlers'ları export et
export const { auth, signIn, signOut } = authConfig

/**
 * Server-side Authentication Helper
 * 
 * Server-side component'lerde ve API route'larda kullanılmak üzere
 * mevcut authentication session'ını almak için helper fonksiyon.
 * 
 * @returns Promise<Session | null>
 */
export async function getAuthSession() {
  return await auth();
} 