'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useAccessibilityPreferences } from '@/hooks/useResponsive';

interface SkeletonProps {
  className?: string;
  variant?: 'pulse' | 'shimmer' | 'wave';
  children?: React.ReactNode;
}

// Base skeleton component
export const Skeleton = ({ className, variant = 'pulse', ...props }: SkeletonProps) => {
  const { prefersReducedMotion } = useAccessibilityPreferences();

  const baseClasses = [
    'bg-gray-200 rounded',
    // Respect reduced motion preference
    !prefersReducedMotion && variant === 'pulse' && 'animate-pulse',
    !prefersReducedMotion && variant === 'shimmer' && 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
    !prefersReducedMotion && variant === 'wave' && 'animate-wave'
  ];

  return (
    <div
      className={cn(baseClasses, className)}
      role="status"
      aria-label="Yükleniyor..."
      {...props}
    />
  );
};

// Movie card skeleton
export const MovieCardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton className="aspect-[2/3] w-full rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-8" />
      </div>
    </div>
  </div>
);

// User avatar skeleton
export const AvatarSkeleton = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return <Skeleton className={cn('rounded-full', sizeClasses[size])} />;
};

// Comment skeleton
export const CommentSkeleton = ({ showReplies = false }: { showReplies?: boolean }) => (
  <div className="space-y-3">
    <div className="flex gap-3">
      <AvatarSkeleton size="md" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
    
    {showReplies && (
      <div className="ml-12 space-y-3">
        <div className="flex gap-3">
          <AvatarSkeleton size="sm" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    )}
  </div>
);

// Message skeleton
export const MessageSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => (
  <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
    {!isOwn && <AvatarSkeleton size="sm" />}
    <div className={cn('space-y-2 max-w-xs', isOwn && 'items-end')}>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-12 w-48 rounded-2xl" />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
);

// Stats card skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="w-12 h-12 rounded-xl" />
    </div>
  </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-6 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// List skeleton (for repeated items)
export const ListSkeleton = ({ 
  count = 3, 
  renderItem 
}: { 
  count?: number;
  renderItem: (index: number) => React.ReactNode;
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index}>
        {renderItem(index)}
      </div>
    ))}
  </div>
);

// Page skeleton (full page loading)
export const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="w-24 h-8 rounded-lg" />
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Loading overlay for interactive elements
export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  className 
}: { 
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('relative', className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    )}
  </div>
); 