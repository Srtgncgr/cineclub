import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Header, Footer } from "@/components/layout";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/providers/auth-provider";
import "./globals.css";

// CineClub Selected Fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineClub - Türkiye'nin Film Topluluğu",
  description: "CineClub, film severlerin buluşma noktası. En yeni filmleri keşfet, yorum yap, listeler oluştur ve topluluğa katıl.",
  keywords: ["film", "sinema", "öneri", "topluluk", "oy verme", "film listesi"],
  authors: [{ name: "CineClub Team" }],
  creator: "CineClub",
  publisher: "CineClub",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://cineclub.com",
    title: "CineClub - Sinema Tutkunlarının Buluşma Noktası",
    description: "Film önerilerini paylaş, oy ver ve sinema severlerle sohbet et.",
    siteName: "CineClub",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineClub - Sinema Tutkunlarının Buluşma Noktası",
    description: "Film önerilerini paylaş, oy ver ve sinema severlerle sohbet et.",
    creator: "@cineclub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={cn("font-sans antialiased", inter.variable, outfit.variable)}>
        <AuthProvider>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
