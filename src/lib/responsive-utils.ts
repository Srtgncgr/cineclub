// Responsive Design & Accessibility Utilities

export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

export const mediaQueries = {
  mobile: `(max-width: ${breakpoints.md})`,
  tablet: `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `(min-width: ${breakpoints.lg})`,
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)'
} as const;

// Touch interaction detection
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Screen size detection
export const useScreenSize = () => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Accessibility helpers
export const a11yProps = {
  // Skip to main content
  skipLink: {
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50',
    href: '#main-content'
  },
  
  // Aria labels for common actions
  labels: {
    search: 'Film ara',
    menu: 'Ana menü',
    userMenu: 'Kullanıcı menüsü',
    notifications: 'Bildirimler',
    close: 'Kapat',
    loadMore: 'Daha fazla yükle',
    like: 'Beğen',
    share: 'Paylaş',
    addToFavorites: 'Favorilere ekle'
  }
};

// Focus management
export const focusManagement = {
  // Trap focus within modal
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => element.removeEventListener('keydown', handleTab);
  },

  // Return focus to trigger element
  returnFocus: (triggerElement: HTMLElement) => {
    return () => triggerElement?.focus();
  }
};

// Responsive grid configurations
export const gridConfigs = {
  movies: {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3', 
    desktop: 'grid-cols-4',
    wide: 'grid-cols-5'
  },
  categories: {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: 'grid-cols-4'
  },
  stats: {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-4'
  }
};

// Responsive spacing
export const spacing = {
  container: {
    mobile: 'px-4',
    tablet: 'px-6',
    desktop: 'px-8'
  },
  section: {
    mobile: 'py-8',
    tablet: 'py-12',
    desktop: 'py-16'
  },
  gap: {
    mobile: 'gap-4',
    tablet: 'gap-6',
    desktop: 'gap-8'
  }
};

// Touch-friendly sizes
export const touchSizes = {
  minTouchTarget: '44px', // iOS/Android minimum
  button: {
    sm: 'min-h-[44px] px-4',
    md: 'min-h-[48px] px-6',
    lg: 'min-h-[52px] px-8'
  },
  input: {
    sm: 'min-h-[44px]',
    md: 'min-h-[48px]',
    lg: 'min-h-[52px]'
  }
};

// Loading states for better UX
export const loadingStates = {
  skeleton: 'animate-pulse bg-gray-200 rounded',
  shimmer: 'relative overflow-hidden bg-gray-200 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
  spinner: 'animate-spin border-2 border-current border-t-transparent rounded-full'
};

// Color contrast helpers
export const colorContrast = {
  // High contrast mode detection
  prefersHighContrast: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  },
  
  // Reduced motion detection
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// Performance optimizations
export const performance = {
  // Lazy loading intersection observer
  createLazyObserver: (callback: (entry: IntersectionObserverEntry) => void) => {
    if (typeof window === 'undefined') return null;
    
    return new IntersectionObserver(
      (entries) => {
        entries.forEach(callback);
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  },

  // Debounce for performance
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
}; 