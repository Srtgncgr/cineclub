import React from 'react';
import { cn } from '@/lib/utils';

// Spinner bileşeni
interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'accent' | 'muted';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', color = 'primary', ...props }, ref) => {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-6 h-6 border-2',
      lg: 'w-8 h-8 border-2',
      xl: 'w-12 h-12 border-2'
    };

    const colors = {
      primary: 'border-primary',
      accent: 'border-accent',
      muted: 'border-foreground/30'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full',
          sizes[size],
          colors[color],
          className
        )}
        style={{
          borderColor: 'transparent',
          borderTopColor: 'currentColor',
          animation: 'spin 1s linear infinite'
        }}
        role="status"
        aria-label="Yükleniyor..."
        {...props}
      >
        <span className="sr-only">Yükleniyor...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Loading Button için inline spinner
interface ButtonSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const ButtonSpinner = React.forwardRef<HTMLDivElement, ButtonSpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'w-3 h-3 border-2',
      md: 'w-4 h-4 border-2',
      lg: 'w-5 h-5 border-2'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full',
          sizes[size],
          className
        )}
        style={{
          borderColor: 'transparent',
          borderTopColor: 'currentColor',
          animation: 'spin 1s linear infinite'
        }}
        role="status"
        aria-label="Yükleniyor..."
        {...props}
      >
        <span className="sr-only">Yükleniyor...</span>
      </div>
    );
  }
);

ButtonSpinner.displayName = 'ButtonSpinner';

// Skeleton bileşeni
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', width, height, lines = 1, ...props }, ref) => {
    const variants = {
      text: 'rounded-md',
      circular: 'rounded-full',
      rectangular: 'rounded-lg'
    };

    const baseClasses = [
      'bg-muted/30',
      variants[variant]
    ];

    const pulseStyle = {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    };

    // Eğer text variant'ı ve lines > 1 ise, multiple lines render et
    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                baseClasses,
                'h-4',
                index === lines - 1 ? 'w-3/4' : 'w-full' // Son satır daha kısa
              )}
              style={{
                width: index === lines - 1 ? '75%' : width,
                height: height,
                ...pulseStyle
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, className)}
        style={{ width, height, ...pulseStyle }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Movie Card Skeleton
const MovieCardSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-card rounded-xl p-6 border border-border', className)}
        {...props}
      >
        {/* Poster Skeleton */}
        <Skeleton variant="rectangular" className="w-full h-48 mb-4" />
        
        {/* Title Skeleton */}
        <Skeleton variant="text" className="h-6 mb-2" width="80%" />
        
        {/* Year and Duration */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="text" className="h-4" width="60px" />
          <Skeleton variant="text" className="h-4" width="80px" />
        </div>
        
        {/* Description */}
        <Skeleton variant="text" lines={3} className="mb-4" />
        
        {/* Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((star) => (
              <Skeleton key={star} variant="rectangular" className="w-4 h-4" />
            ))}
          </div>
          <Skeleton variant="text" className="h-4" width="30px" />
        </div>
        
        {/* Tags */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton variant="rectangular" className="h-6 w-16 rounded-md" />
          <Skeleton variant="rectangular" className="h-6 w-20 rounded-md" />
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2">
          <Skeleton variant="rectangular" className="h-8 flex-1 rounded-lg" />
          <Skeleton variant="rectangular" className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    );
  }
);

MovieCardSkeleton.displayName = 'MovieCardSkeleton';

// User Card Skeleton
const UserCardSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-card rounded-xl p-6 border border-border', className)}
        {...props}
      >
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <Skeleton variant="circular" className="w-12 h-12" />
          
          <div className="flex-1">
            {/* Name */}
            <Skeleton variant="text" className="h-5 mb-1" width="120px" />
            {/* Username */}
            <Skeleton variant="text" className="h-4" width="80px" />
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <Skeleton variant="text" className="h-6 mb-1" />
            <Skeleton variant="text" className="h-4" />
          </div>
          <div className="text-center">
            <Skeleton variant="text" className="h-6 mb-1" />
            <Skeleton variant="text" className="h-4" />
          </div>
          <div className="text-center">
            <Skeleton variant="text" className="h-6 mb-1" />
            <Skeleton variant="text" className="h-4" />
          </div>
        </div>
        
        {/* Button */}
        <Skeleton variant="rectangular" className="h-10 w-full rounded-lg" />
      </div>
    );
  }
);

UserCardSkeleton.displayName = 'UserCardSkeleton';

// Loading Screen bileşeni
interface LoadingScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingScreen = React.forwardRef<HTMLDivElement, LoadingScreenProps>(
  ({ className, message = 'Yükleniyor...', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center min-h-[200px] p-8',
          className
        )}
        {...props}
      >
        <Spinner size={size} color="primary" className="mb-4" />
        <p className="text-body text-foreground/70">{message}</p>
      </div>
    );
  }
);

LoadingScreen.displayName = 'LoadingScreen';

// Loading Overlay bileşeni
interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, isLoading, message = 'Yükleniyor...', children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="flex flex-col items-center">
              <Spinner size="lg" color="primary" className="mb-3" />
              <p className="text-body-small text-foreground/70">{message}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

export {
  Spinner,
  ButtonSpinner,
  Skeleton,
  MovieCardSkeleton,
  UserCardSkeleton,
  LoadingScreen,
  LoadingOverlay,
  type SpinnerProps,
  type SkeletonProps,
  type LoadingScreenProps,
  type LoadingOverlayProps
};

export default Spinner; 