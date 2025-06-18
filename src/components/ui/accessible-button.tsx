'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useAccessibilityPreferences, useTouchDevice } from '@/hooks/useResponsive';
import { Loader2 } from 'lucide-react';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  // Accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  focusRing?: boolean;
  // Touch-friendly
  touchOptimized?: boolean;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ariaLabel,
    ariaDescribedBy,
    role,
    focusRing = true,
    touchOptimized = true,
    ...props
  }, ref) => {
    const { prefersReducedMotion } = useAccessibilityPreferences();
    const { isTouch } = useTouchDevice();

    // Base styles with accessibility considerations
    const baseStyles = [
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
      'transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden',
      // High contrast mode support
      'contrast-more:border-2 contrast-more:border-current',
      // Reduced motion support
      prefersReducedMotion ? 'transition-none' : 'transition-all duration-200',
      // Focus ring for accessibility
      focusRing && 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
      // Touch optimization
      (touchOptimized && isTouch) && 'active:scale-95'
    ];

    // Variant styles
    const variantStyles = {
      primary: [
        'bg-primary text-white',
        'hover:bg-primary/90',
        'focus:ring-primary/50',
        'shadow-md hover:shadow-lg'
      ],
      secondary: [
        'bg-gray-100 text-gray-900',
        'hover:bg-gray-200',
        'focus:ring-gray-500/50'
      ],
      outline: [
        'border border-gray-300 bg-white text-gray-700',
        'hover:bg-gray-50',
        'focus:ring-gray-500/50'
      ],
      ghost: [
        'bg-transparent text-gray-700',
        'hover:bg-gray-100',
        'focus:ring-gray-500/50'
      ],
      danger: [
        'bg-red-500 text-white',
        'hover:bg-red-600',
        'focus:ring-red-500/50',
        'shadow-md hover:shadow-lg'
      ]
    };

    // Size styles with touch-friendly targets
    const sizeStyles = {
      sm: [
        'text-sm px-3 py-2',
        (touchOptimized && isTouch) ? 'min-h-[44px]' : 'h-9'
      ],
      md: [
        'text-sm px-4 py-2.5',
        (touchOptimized && isTouch) ? 'min-h-[48px]' : 'h-10'
      ],
      lg: [
        'text-base px-6 py-3',
        (touchOptimized && isTouch) ? 'min-h-[52px]' : 'h-12'
      ]
    };

    // Loading spinner component
    const LoadingSpinner = () => (
      <Loader2 
        className={cn(
          'animate-spin',
          size === 'sm' && 'w-4 h-4',
          size === 'md' && 'w-4 h-4',
          size === 'lg' && 'w-5 h-5'
        )}
        aria-hidden="true"
      />
    );

    // Content with icon and loading states
    const buttonContent = () => {
      if (loading) {
        return (
          <>
            <LoadingSpinner />
            <span>{loadingText || children}</span>
          </>
        );
      }

      if (icon) {
        return iconPosition === 'left' ? (
          <>
            <span aria-hidden="true">{icon}</span>
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {children && <span>{children}</span>}
            <span aria-hidden="true">{icon}</span>
          </>
        );
      }

      return children;
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        role={role}
        {...props}
      >
        {buttonContent()}
        
        {/* Ripple effect for touch devices */}
        {!prefersReducedMotion && isTouch && (
          <span 
            className="absolute inset-0 rounded-xl opacity-0 bg-white/20 transition-opacity duration-150 pointer-events-none"
            aria-hidden="true"
          />
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton; 