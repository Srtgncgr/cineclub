'use client';

import { useState, useEffect } from 'react';
import { isTouchDevice, colorContrast } from '@/lib/responsive-utils';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

// Screen size hook
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    isClient
  };
};

// Touch device detection
export const useTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsTouch(isTouchDevice());
  }, []);

  return { isTouch, isClient };
};

// Media query hook
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return { matches, isClient };
};

// Accessibility preferences
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    isClient: false
  });

  useEffect(() => {
    setPreferences({
      prefersReducedMotion: colorContrast.prefersReducedMotion(),
      prefersHighContrast: colorContrast.prefersHighContrast(),
      isClient: true
    });

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, prefersReducedMotion: e.matches }));
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, prefersHighContrast: e.matches }));
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  return preferences;
};

// Keyboard navigation
export const useKeyboardNavigation = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return { isKeyboardUser };
};

// Responsive grid classes
export const useResponsiveGrid = (type: 'movies' | 'categories' | 'stats' = 'movies') => {
  const { screenSize } = useScreenSize();

  const gridClasses = {
    movies: {
      mobile: 'grid-cols-2',
      tablet: 'grid-cols-3',
      desktop: 'grid-cols-4'
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

  return gridClasses[type][screenSize];
};

// Responsive spacing
export const useResponsiveSpacing = () => {
  const { screenSize } = useScreenSize();

  const spacing = {
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

  return {
    container: spacing.container[screenSize],
    section: spacing.section[screenSize],
    gap: spacing.gap[screenSize]
  };
};

// Safe area insets for mobile (notch support)
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return safeArea;
}; 