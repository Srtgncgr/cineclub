'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  X, 
  Film, 
  Users, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut,
  Home,
  Search,
  Heart,
  TrendingUp
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ isOpen, onClose, className }, ref) => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Demo için

    // Demo kullanıcı verisi
    const user = {
      name: "Ali Veli",
      email: "ali@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    };

    const navigationItems = [
      { label: 'Ana Sayfa', href: '/', icon: Home },
      { label: 'Filmler', href: '/movies', icon: Film },
      { label: 'Popüler', href: '/movies/popular', icon: TrendingUp },
      { label: 'Favorilerim', href: '/movies/favorites', icon: Heart },
      { label: 'Topluluk', href: '/community', icon: Users },
      { label: 'Mesajlar', href: '/messages', icon: MessageCircle, badge: 3 },
      { label: 'Arama', href: '/search', icon: Search },
    ];

    const userMenuItems = [
      { label: 'Profil', href: '/profile', icon: User },
      { label: 'Ayarlar', href: '/settings', icon: Settings },
    ];

    // Overlay click handler
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    // ESC key handler
    React.useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}

        {/* Sidebar */}
        <div
          ref={ref}
          className={cn(
            'fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:hidden',
            isOpen ? 'translate-x-0' : '-translate-x-full',
            className
          )}
        >
          <div className="flex flex-col h-full">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <span className="text-heading-4 text-primary font-bold">CineClub</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-card rounded-lg transition-colors"
                aria-label="Menüyü kapat"
              >
                <X className="w-5 h-5 text-foreground/70" />
              </button>
            </div>

            {/* User Section */}
            {isLoggedIn ? (
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar 
                    src={user.avatar}
                    alt={user.name}
                    size="md"
                    showStatus
                    status="online"
                  />
                  <div className="flex-1">
                    <p className="text-body font-medium text-foreground">{user.name}</p>
                    <p className="text-caption text-foreground/60">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-card rounded-lg">
                    <p className="text-body-small font-semibold text-foreground">24</p>
                    <p className="text-caption text-foreground/60">Film</p>
                  </div>
                  <div className="text-center p-2 bg-card rounded-lg">
                    <p className="text-body-small font-semibold text-foreground">156</p>
                    <p className="text-caption text-foreground/60">Oy</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-border">
                <div className="space-y-2">
                  <button 
                    onClick={() => setIsLoggedIn(true)}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg text-body-small font-medium hover:bg-primary/90 transition-colors"
                  >
                    Giriş Yap
                  </button>
                  <button className="w-full px-4 py-2 border border-border text-foreground rounded-lg text-body-small font-medium hover:bg-card transition-colors">
                    Kayıt Ol
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-card rounded-lg transition-colors group"
                    onClick={onClose}
                  >
                    <item.icon className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                    <span className="text-body">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-1 bg-primary text-white text-xs rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>

              {/* User Menu Items */}
              {isLoggedIn && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="space-y-1">
                    {userMenuItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-card rounded-lg transition-colors group"
                        onClick={onClose}
                      >
                        <item.icon className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                        <span className="text-body">{item.label}</span>
                      </a>
                    ))}
                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
                        onClose();
                      }}
                      className="flex items-center gap-3 px-3 py-3 text-foreground hover:bg-card rounded-lg transition-colors group w-full text-left"
                    >
                      <LogOut className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                      <span className="text-body">Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="text-center">
                <p className="text-caption text-foreground/60 mb-2">
                  CineClub v1.0.0
                </p>
                <p className="text-caption text-foreground/60">
                  Made with ❤️ for cinema lovers
                </p>
              </div>
            </div>

          </div>
        </div>
      </>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export default Sidebar; 