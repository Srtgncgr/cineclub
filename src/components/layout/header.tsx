'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import SearchInput, { useSearchInput } from '@/components/ui/search-input';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { 
  Film, 
  Search, 
  User, 
  Menu, 
  X, 
  Star, 
  MessageCircle,
  Settings,
  LogOut,
  Plus,
  Heart
} from 'lucide-react';

interface HeaderProps {
  className?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className }, ref) => {
      const { data: session, status, update } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [avatarKey, setAvatarKey] = React.useState(0);
  const [userDisplayName, setUserDisplayName] = React.useState<string | null>(null);
  const router = useRouter();
  const { unreadCount } = useUnreadMessages();

    // Search functionality
    const {
      searchQuery,
      setSearchQuery,
      debouncedQuery,
      recentSearches,
      addToRecentSearches
    } = useSearchInput('', 500);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    // Kullanıcı adını çek
    React.useEffect(() => {
      const fetchUserDisplayName = async () => {
        if (session?.user?.id) {
          try {
            const response = await fetch(`/api/users/${session.user.id}`);
            const data = await response.json();
            if (data.success && data.user) {
              setUserDisplayName(data.user.displayName || data.user.username || session.user.name);
            }
          } catch (error) {
            console.error('Kullanıcı adı çekme hatası:', error);
          }
        }
      };

      fetchUserDisplayName();
    }, [session?.user?.id]);

    // Profil güncellemelerini dinle
    React.useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'profile-updated') {
          setAvatarKey(prev => prev + 1);
          // Kullanıcı adını yeniden çek
          if (session?.user?.id) {
            fetch(`/api/users/${session.user.id}`)
              .then(res => res.json())
              .then(data => {
                if (data.success && data.user) {
                  setUserDisplayName(data.user.displayName || data.user.username || session.user.name);
                }
              })
              .catch(console.error);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, [session?.user?.id, session?.user?.name]);

    // Handle search
    const handleSearch = (query: string) => {
      if (query.trim()) {
        addToRecentSearches(query.trim());
        // Next.js router ile arama sayfasına yönlendir
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        // Header'daki search input'u temizle
        setSearchQuery('');
      }
    };

    const user = session?.user;
    const isAuthenticated = status === 'authenticated';

    const navigationItems: NavigationItem[] = [
      { label: 'Ana Sayfa', href: '/', icon: Film },
      { label: 'Filmler', href: '/movies', icon: Star },
      { label: 'Mesajlar', href: '/messages', icon: MessageCircle, badge: unreadCount > 0 ? unreadCount : undefined },
    ];

    // Search suggestions for header
    const headerSearchSuggestions = [
      'Fight Club', 'Godfather', 'Inception', 'Dark Knight', 'Pulp Fiction',
      'Forrest Gump', 'Matrix', 'Interstellar', 'Christopher Nolan', 'Aksiyon'
    ];

        if (!mounted) {
    return (
      <header 
        ref={ref}
        className={cn(
          'sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl shadow-sm',
          className
        )}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-20 items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 min-w-fit hover:opacity-80 transition-opacity duration-200">
              <div className="p-2.5 lg:p-3 bg-primary rounded-xl shadow-sm">
                <Film className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold text-gray-900 hidden sm:block">CineClub</span>
              <span className="text-lg font-bold text-gray-900 sm:hidden">CC</span>
            </Link>
            
            {/* Desktop Navigation - Compact */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 relative whitespace-nowrap"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:block">{item.label}</span>
                  <span className="xl:hidden">{item.label.split(' ')[0]}</span>
                </a>
              ))}
            </nav>
            
            {/* Right Side - Loading skeleton */}
            <div className="flex-1"></div>
            <div className="flex items-center gap-2 min-w-fit">
              <div className="w-32 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      ref={ref}
      className={cn(
        'sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl shadow-sm',
        className
      )}
      suppressHydrationWarning
    >
      <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-20 items-center gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 min-w-fit hover:opacity-80 transition-opacity duration-200">
              <div className="p-2.5 lg:p-3 bg-primary rounded-xl shadow-sm">
                <Film className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold text-gray-900 hidden sm:block">CineClub</span>
              <span className="text-lg font-bold text-gray-900 sm:hidden">CC</span>
            </Link>

            {/* Desktop Navigation - Compact */}
            {mounted && (
              <nav className="hidden lg:flex items-center gap-1">
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 relative whitespace-nowrap"
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden xl:block">{item.label}</span>
                    <span className="xl:hidden">{item.label.split(' ')[0]}</span>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-semibold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </nav>
            )}

            {/* Search Bar (Desktop) - More Flexible */}
            <div className="flex-1 hidden lg:flex items-center min-w-0 mx-4">
              <div className="w-full max-w-md [&_input]:bg-gray-50 [&_input]:border-gray-200">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  placeholder="Film ara..."
                  suggestions={headerSearchSuggestions}
                  recentSearches={recentSearches}
                  size="md"
                  debounceMs={500}
                />
              </div>
            </div>

            {/* Right Side Actions - Compact */}
            <div className="flex items-center gap-2 min-w-fit">
              
              {/* Search Button (Mobile) */}
              <a href="/search" className="lg:hidden">
                <button className="p-2.5 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
              </a>

              {isAuthenticated && user ? (
                <>
                  {/* User Menu - Enhanced */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    >
                      <Avatar 
                        key={`header-sm-${avatarKey}`}
                        src={user.image ?? undefined}
                        alt={mounted ? (userDisplayName || user.name || 'User') : (user.name || 'User')}
                        size="sm"
                        showStatus={mounted}
                        status="online"
                      />
                      {mounted && (
                        <div className="hidden sm:flex flex-col items-start min-w-0">
                          <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px] group-hover:text-gray-700 transition-colors duration-200">
                            {userDisplayName ? 
                              (userDisplayName.split(' ')[0] || userDisplayName) : 
                              (user.name?.split(' ')[0] || 'Kullanıcı')
                            }
                          </span>
                          <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                            Hoş geldin!
                          </span>
                        </div>
                      )}
                      <svg 
                        className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200 hidden sm:block" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Dropdown */}
                    {mounted && isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                        <div className="px-4 py-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <Avatar 
                              key={`header-md-${avatarKey}`}
                              src={user.image ?? undefined}
                              alt={mounted ? (userDisplayName || user.name || 'User') : (user.name || 'User')}
                              size="md"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {mounted ? (userDisplayName || user.name || 'Kullanıcı') : (user.name || 'Kullanıcı')}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-2">
                          <a href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                            <User className="w-4 h-4" />
                            <span>Profil</span>
                          </a>
                          <a href="/movies/favorites" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                            <Heart className="w-4 h-4" />
                            <span>Favorilerim</span>
                          </a>
                          <a href="/watchlist" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                            <Plus className="w-4 h-4" />
                            <span>İzleme Listem</span>
                          </a>
                          <a href="/profile/edit" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                            <Settings className="w-4 h-4" />
                            <span>Ayarlar</span>
                          </a>
                          <hr className="my-2 border-gray-200" />
                          <button 
                            onClick={() => signOut()}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Çıkış Yap</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Login/Register Buttons - Compact */}
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push('/login')}
                    >
                      Giriş Yap
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => router.push('/register')}
                    >
                      Kayıt Ol
                    </Button>
                  </div>
                </>
              )}

              {/* Mobile Menu Button - Compact */}
              <button 
                className="lg:hidden p-2.5 hover:bg-gray-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mounted && isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <nav className="py-6 space-y-2">
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-4 px-6 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 mx-4 rounded-xl relative"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-primary text-white text-xs font-semibold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 ml-auto">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </a>
                ))}
                
                {/* Mobile Search */}
                <div className="px-6 py-3">
                  <div className="w-full [&_input]:bg-gray-50 [&_input]:border-gray-200">
                    <SearchInput
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onSearch={handleSearch}
                      placeholder="Film ara..."
                      suggestions={headerSearchSuggestions}
                      recentSearches={recentSearches}
                      size="lg"
                      debounceMs={500}
                    />
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                {!isAuthenticated && (
                  <div className="px-6 py-3 space-y-3 border-t border-gray-200 mt-4 pt-6">
                    <Button 
                      variant="ghost" 
                      size="md" 
                      className="w-full justify-start text-gray-700"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/login');
                      }}
                    >
                      Giriş Yap
                    </Button>
                    <Button 
                      variant="primary" 
                      size="md" 
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/register');
                      }}
                    >
                      Kayıt Ol
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';

export default Header; 