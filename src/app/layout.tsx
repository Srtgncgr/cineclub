/**
 * Ana Layout Dosyası - Tüm Sayfaların Ortak Yapısı
 * 
 * Bu dosya sitenin her sayfasında ortak olan elementleri tanımlar:
 * - Font ayarları
 * - SEO metadata bilgileri  
 * - Header ve Footer bileşenleri
 * - Kimlik doğrulama sağlayıcısı
 */

import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Header, Footer } from "@/components/layout";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/providers/auth-provider";
import "./globals.css";

// Sitenin ana fontları - Google Fonts'tan yüklenir
const inter = Inter({
  variable: "--font-inter",    // CSS değişken adı
  subsets: ["latin"],          // Latin karakter seti
  display: "swap",             // Font yüklenene kadar sistem fontunu göster
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

// SEO ve sosyal medya için metadata tanımlamaları
export const metadata: Metadata = {
  // Temel sayfa bilgileri
  title: "CineClub - Türkiye'nin Film Topluluğu",
  description: "CineClub, film severlerin buluşma noktası. En yeni filmleri keşfet, yorum yap, listeler oluştur ve topluluğa katıl.",
  keywords: ["film", "sinema", "öneri", "topluluk", "oy verme", "film listesi"],
  authors: [{ name: "CineClub Team" }],
  creator: "CineClub",
  publisher: "CineClub",
  
  // Facebook, WhatsApp gibi platformlar için Open Graph bilgileri
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://cineclub.com",
    title: "CineClub - Sinema Tutkunlarının Buluşma Noktası",
    description: "Film önerilerini paylaş, oy ver ve sinema severlerle sohbet et.",
    siteName: "CineClub",
  },
  
  // Twitter paylaşımları için özel ayarlar
  twitter: {
    card: "summary_large_image",
    title: "CineClub - Sinema Tutkunlarının Buluşma Noktası",
    description: "Film önerilerini paylaş, oy ver ve sinema severlerle sohbet et.",
    creator: "@cineclub",
  },
  
  // Arama motorları için bot ayarları
  robots: {
    index: true,           // Sayfaları indeksle
    follow: true,          // Linkleri takip et
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * Ana Layout Bileşeni
 * 
 * Sitenin her sayfasının etrafını saran ana yapı.
 * Header, Footer ve AuthProvider tüm sayfalarda ortak olarak bulunur.
 * 
 * @param children - İçerik olarak render edilecek sayfa bileşeni
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={cn("font-sans antialiased", inter.variable, outfit.variable)}>
        {/* Kimlik doğrulama durumunu tüm sayfalarda kullanılabilir yapar */}
        <AuthProvider>
          {/* Sitenin üst menü çubuğu */}
          <Header />
          
          {/* Ana içerik alanı - her sayfanın kendine özgü içeriği burada gösterilir */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Sitenin alt bilgi bölümü */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
