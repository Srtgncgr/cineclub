'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

// Avatar boyut türleri (sadece kullanılanlar)
type AvatarSize = 'sm' | 'md' | 'lg';

// Avatar interface
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
  showStatus?: boolean;
  status?: 'online' | 'offline';
  children?: React.ReactNode;
}

// Avatar bileşeni
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    src, 
    alt, 
    size = 'md', 
    fallback, 
    showStatus = false, 
    status = 'offline', 
    children, 
    className, 
    ...props 
  }, ref) => {
    
    // Boyut stilleri (sadece kullanılanlar)
    const sizeStyles = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg'
    };

    // Status renkleri (sadece kullanılanlar)
    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400'
    };

    // Status boyutları (sadece kullanılanlar)
    const statusSizes = {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3'
    };

    // Fallback text oluşturma
    const getFallbackText = (fallback?: string, alt?: string) => {
      if (fallback) return fallback;
      if (alt) {
        const words = alt.split(' ').filter(word => word.length > 0);
        if (words.length >= 2) {
          return `${words[0][0]}${words[1][0]}`.toUpperCase();
        } else if (words.length === 1) {
          // Tek kelime varsa sadece ilk harfi al
          return words[0][0].toUpperCase();
        }
      }
      return 'K';
    };

    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // Resim yüklenme durumunu sıfırla
    React.useEffect(() => {
      if (src) {
        setImageError(false);
        setImageLoaded(false);
      }
    }, [src]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full bg-muted overflow-hidden',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {/* Resim */}
        {src && !imageError && (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-200',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Fallback içerik */}
        {(!src || imageError || !imageLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-card text-foreground">
            {children || (
              fallback || alt ? (
                <span className="font-medium select-none">
                  {getFallbackText(fallback, alt)}
                </span>
              ) : (
                <User className={cn(
                  'text-foreground/50',
                  size === 'sm' ? 'w-4 h-4' :
                  size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
                )} />
              )
            )}
          </div>
        )}

        {/* Status indicator */}
        {showStatus && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-background',
              statusColors[status],
              statusSizes[size]
            )}
            aria-label={`Durum: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar; 