import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

// Badge variant türleri
type BadgeVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';

// Badge boyut türleri
type BadgeSize = 'sm' | 'md' | 'lg';

// Badge interface
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  removable?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

// Badge bileşeni
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', removable = false, onRemove, children, className, ...props }, ref) => {
    
    // Variant stilleri
    const variantStyles = {
      default: 'bg-muted text-foreground border-border',
      primary: 'bg-primary/20 text-primary border-primary/30',
      secondary: 'bg-card text-foreground border-border',
      accent: 'bg-accent/30 text-foreground border-accent/40',
      success: 'bg-green-100 text-green-800 border-green-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      error: 'bg-red-100 text-red-800 border-red-300',
      info: 'bg-blue-100 text-blue-800 border-blue-300'
    };

    // Boyut stilleri
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-caption',
      lg: 'px-3 py-1.5 text-body-small'
    };

    return (
      <span
        ref={ref}
        className={cn(
          // Temel stiller
          'inline-flex items-center gap-1 rounded-md border font-medium transition-colors',
          // Variant stilleri
          variantStyles[variant],
          // Boyut stilleri
          sizeStyles[size],
          // Custom className
          className
        )}
        {...props}
      >
        {children}
        {removable && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              'ml-1 rounded-sm hover:bg-black/10 transition-colors',
              size === 'sm' ? 'p-0.5' : 'p-1'
            )}
            aria-label="Etiketi kaldır"
          >
            <X className={cn(
              size === 'sm' ? 'w-2.5 h-2.5' : 
              size === 'md' ? 'w-3 h-3' : 'w-3.5 h-3.5'
            )} />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Kategori Badge bileşeni (film kategorileri için özel)
interface CategoryBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  category: string;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'info';
}

export const CategoryBadge = React.forwardRef<HTMLSpanElement, CategoryBadgeProps>(
  ({ category, color = 'primary', ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant={color}
        {...props}
      >
        {category}
      </Badge>
    );
  }
);

CategoryBadge.displayName = 'CategoryBadge';

// Status Badge bileşeni (durum gösterimi için)
interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    
    const statusConfig = {
      active: { variant: 'success' as const, label: 'Aktif' },
      inactive: { variant: 'default' as const, label: 'Pasif' },
      pending: { variant: 'warning' as const, label: 'Beklemede' },
      approved: { variant: 'success' as const, label: 'Onaylandı' },
      rejected: { variant: 'error' as const, label: 'Reddedildi' }
    };

    const config = statusConfig[status];

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        {...props}
      >
        {config.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// Rating Badge bileşeni (puan gösterimi için)
interface RatingBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  rating: number;
  maxRating?: number;
}

export const RatingBadge = React.forwardRef<HTMLSpanElement, RatingBadgeProps>(
  ({ rating, maxRating = 10, ...props }, ref) => {
    
    // Rating'e göre renk belirleme
    const getVariant = (rating: number, max: number): BadgeVariant => {
      const percentage = (rating / max) * 100;
      if (percentage >= 80) return 'success';
      if (percentage >= 60) return 'accent';
      if (percentage >= 40) return 'warning';
      return 'error';
    };

    return (
      <Badge
        ref={ref}
        variant={getVariant(rating, maxRating)}
        {...props}
      >
        {rating.toFixed(1)}
      </Badge>
    );
  }
);

RatingBadge.displayName = 'RatingBadge';

// Count Badge bileşeni (sayı gösterimi için)
interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number;
  max?: number;
  showPlus?: boolean;
}

export const CountBadge = React.forwardRef<HTMLSpanElement, CountBadgeProps>(
  ({ count, max = 99, showPlus = true, ...props }, ref) => {
    
    const displayCount = count > max ? `${max}${showPlus ? '+' : ''}` : count.toString();

    return (
      <Badge
        ref={ref}
        variant="primary"
        size="sm"
        {...props}
      >
        {displayCount}
      </Badge>
    );
  }
);

CountBadge.displayName = 'CountBadge';

export default Badge; 