'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useResponsiveSpacing } from '@/hooks/useResponsive';
import { 
  Film,
  Home,
  Search,
  ArrowLeft,
  Sparkles,
  Star,
  Users
} from 'lucide-react';

export default function NotFound() {
  const { container, section } = useResponsiveSpacing();

  const quickLinks = [
    { label: 'Ana Sayfa', href: '/', icon: Home, description: 'Ana sayfaya dön' },
    { label: 'Filmler', href: '/movies', icon: Film, description: 'Film kataloğunu keşfet' },
    { label: 'Arama', href: '/search', icon: Search, description: 'İstediğin filmi ara' },
    { label: 'Topluluk', href: '/community', icon: Users, description: 'Diğer kullanıcılarla etkileşim' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${container} ${section} flex items-center`}>
      <div className="w-full max-w-4xl mx-auto text-center">
        
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold text-gray-200 select-none">
              404
            </h1>
            
            {/* Floating film icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Film className="w-16 h-16 md:w-20 md:h-20 text-primary animate-bounce" />
            </div>
            
            {/* Decorative stars */}
            <Star className="absolute top-4 left-1/4 w-6 h-6 text-yellow-400 animate-pulse" />
            <Star className="absolute bottom-4 right-1/4 w-4 h-4 text-yellow-400 animate-pulse delay-300" />
            <Sparkles className="absolute top-1/2 left-8 w-5 h-5 text-purple-400 animate-pulse delay-150" />
            <Sparkles className="absolute top-1/3 right-8 w-5 h-5 text-blue-400 animate-pulse delay-500" />
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6 mb-12">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Sayfa Bulunamadı
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
              Film dünyasında kaybolmak kolay, ama sizi doğru yöne yönlendirelim!
            </p>
          </div>

          {/* Error details */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <span className="text-sm font-medium">
              HTTP 404 - Sayfa Bulunamadı
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-8">
          {/* Primary actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/">
              <Button variant="primary" size="lg" className="min-w-[200px]">
                <Home className="w-5 h-5" />
                Ana Sayfaya Dön
              </Button>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Geri Git
            </button>
          </div>

          {/* Quick links grid */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Size yardımcı olabilecek bağlantılar:
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {quickLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="group"
                >
                  <div className="p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                      <link.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {link.label}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {link.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Fun fact */}
        <div className="mt-16 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">
              Film Bilgisi
            </span>
          </div>
          <p className="text-sm text-gray-700">
            Biliyormusunuz? İlk "404" hatası 1990'da CERN'de Tim Berners-Lee tarafından yazılan 
            HTTP protokolünde tanımlandı. O zamandan beri milyonlarca web geliştiricisi bu hatayı görüyor!
          </p>
        </div>

        {/* Contact support */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Yardıma mı ihtiyacınız var?{' '}
            <Link 
              href="/support" 
              className="text-primary hover:text-primary/80 font-medium underline"
            >
              Destek ekibimizle iletişime geçin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 