'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Film, Heart, Github, Twitter, Instagram, Mail } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className }, ref) => {
    const currentYear = 2024;

    const footerLinks = {
      platform: [
        { label: 'Ana Sayfa', href: '/' },
        { label: 'Filmler', href: '/movies' },
        { label: 'Favoriler', href: '/movies/favorites' },
        { label: 'İzleme Listesi', href: '/watchlist' },
      ],
      support: [
        { label: 'Yardım Merkezi', href: '/help' },
        { label: 'İletişim', href: '/contact' },
        { label: 'Geri Bildirim', href: '/feedback' },
        { label: 'Hata Bildir', href: '/report' },
      ],
      legal: [
        { label: 'Gizlilik Politikası', href: '/privacy' },
        { label: 'Kullanım Şartları', href: '/terms' },
        { label: 'Çerez Politikası', href: '/cookies' },
        { label: 'KVKK', href: '/kvkk' },
      ],
      social: [
        { label: 'Twitter', href: '#', icon: Twitter },
        { label: 'Instagram', href: '#', icon: Instagram },
        { label: 'GitHub', href: 'https://github.com/Srtgncgr/cineclub', icon: Github },
        { label: 'E-posta', href: '#', icon: Mail },
      ]
    };

    return (
      <footer 
        ref={ref}
        className={cn(
          'bg-white border-t border-gray-200 mt-auto',
          className
        )}
      >
        <div className="container mx-auto px-6 py-16">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary rounded-xl shadow-sm">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">CineClub</span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
                Sinema tutkunlarının buluşma noktası. Film önerilerini paylaş, 
                oy ver ve diğer sinema severlerle sohbet et.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>for cinema lovers</span>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Platform</h3>
              <ul className="space-y-4">
                {footerLinks.platform.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      className="text-gray-600 hover:text-primary transition-colors duration-200 font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Destek</h3>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      className="text-gray-600 hover:text-primary transition-colors duration-200 font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Yasal</h3>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      className="text-gray-600 hover:text-primary transition-colors duration-200 font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Social Media & Newsletter */}
          <div className="border-t border-gray-200 pt-12 mb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              
              {/* Social Media */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Bizi Takip Edin</h3>
                <div className="flex items-center gap-3">
                  {footerLinks.social.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href !== '#' ? "_blank" : undefined}
                      rel={social.href !== '#' ? "noopener noreferrer" : undefined}
                      onClick={social.href === '#' ? (e) => e.preventDefault() : undefined}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group cursor-pointer"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors duration-200" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="w-full lg:w-auto lg:max-w-md">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Haberdar Ol</h3>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="E-posta adresiniz"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200 whitespace-nowrap shadow-sm">
                    Abone Ol
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Yeni filmler ve özellikler hakkında bilgi alın.
                </p>
              </div>

            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <p className="text-sm text-gray-500">
                © {currentYear} CineClub. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center gap-8">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  Türkiye'den <span className="text-red-500">❤️</span> ile yapıldı
                </span>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">v1.0.0</span>
                  <a 
                    href="/changelog" 
                    className="hover:text-primary transition-colors duration-200 font-medium"
                  >
                    Değişiklikler
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export default Footer; 