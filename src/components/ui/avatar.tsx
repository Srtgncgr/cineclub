'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

// Avatar boyut türleri
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Avatar interface
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
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
    
    // Boyut stilleri
    const sizeStyles = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-20 h-20 text-2xl'
    };

    // Status renkleri
    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500'
    };

    // Status boyutları
    const statusSizes = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
      '2xl': 'w-5 h-5'
    };

    // Fallback text oluşturma
    const getFallbackText = (fallback?: string, alt?: string) => {
      if (fallback) return fallback;
      if (alt) {
        const words = alt.split(' ');
        if (words.length >= 2) {
          return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return alt.slice(0, 2).toUpperCase();
      }
      return 'U';
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
                  size === 'xs' ? 'w-3 h-3' :
                  size === 'sm' ? 'w-4 h-4' :
                  size === 'md' ? 'w-5 h-5' :
                  size === 'lg' ? 'w-6 h-6' :
                  size === 'xl' ? 'w-8 h-8' : 'w-10 h-10'
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

// Avatar Group bileşeni (birden fazla avatar gösterimi için)
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  spacing?: 'tight' | 'normal' | 'loose';
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 5, size = 'md', spacing = 'normal', className, ...props }, ref) => {
    
    const spacingStyles = {
      tight: '-space-x-1',
      normal: '-space-x-2',
      loose: '-space-x-1'
    };

    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          spacingStyles[spacing],
          className
        )}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className="relative ring-2 ring-background rounded-full"
            style={{ zIndex: visibleChildren.length - index }}
          >
            {React.isValidElement(child) 
              ? React.cloneElement(child, { size } as any)
              : child
            }
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div
            className="relative ring-2 ring-background rounded-full"
            style={{ zIndex: 0 }}
          >
            <Avatar
              size={size}
              fallback={`+${remainingCount}`}
              className="bg-primary/10 text-primary font-semibold"
            />
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

// User Avatar bileşeni (kullanıcı bilgileri ile birlikte)
interface UserAvatarProps extends Omit<AvatarProps, 'alt' | 'fallback'> {
  user: {
    name: string;
    avatar?: string;
    email?: string;
    isOnline?: boolean;
  };
  showName?: boolean;
  showEmail?: boolean;
  namePosition?: 'right' | 'bottom';
}

export const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ 
    user, 
    showName = false, 
    showEmail = false, 
    namePosition = 'right',
    showStatus = false,
    className,
    ...props 
  }, ref) => {
    
    const avatarElement = (
      <Avatar
        src={user.avatar}
        alt={user.name}
        fallback={user.name}
        showStatus={showStatus}
        status={user.isOnline ? 'online' : 'offline'}
        {...props}
      />
    );

    if (!showName && !showEmail) {
      return <div ref={ref} className={className}>{avatarElement}</div>;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          namePosition === 'bottom' ? 'flex-col' : 'flex-row',
          namePosition === 'right' && 'gap-3',
          namePosition === 'bottom' && 'gap-2',
          className
        )}
      >
        {avatarElement}
        
        {(showName || showEmail) && (
          <div className={cn(
            'flex flex-col',
            namePosition === 'bottom' && 'items-center text-center'
          )}>
            {showName && (
              <span className="text-body-small font-medium text-foreground">
                {user.name}
              </span>
            )}
            {showEmail && user.email && (
              <span className="text-caption text-foreground/60">
                {user.email}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

UserAvatar.displayName = 'UserAvatar';

// Movie Avatar bileşeni (film posterleri için)
interface MovieAvatarProps extends Omit<AvatarProps, 'alt' | 'fallback' | 'showStatus' | 'status'> {
  movie: {
    title: string;
    poster?: string;
    year?: number;
  };
  showTitle?: boolean;
  titlePosition?: 'right' | 'bottom';
}

export const MovieAvatar = React.forwardRef<HTMLDivElement, MovieAvatarProps>(
  ({ 
    movie, 
    showTitle = false, 
    titlePosition = 'bottom',
    className,
    ...props 
  }, ref) => {
    
    const avatarElement = (
      <Avatar
        src={movie.poster}
        alt={movie.title}
        fallback={movie.title.slice(0, 2).toUpperCase()}
        className="rounded-lg" // Film posterleri için köşeli
        {...props}
      >
        {!movie.poster && (
          <div className="text-center">
            <span className="text-xs font-bold">
              {movie.title.slice(0, 3).toUpperCase()}
            </span>
            {movie.year && (
              <div className="text-xs opacity-60">
                {movie.year}
              </div>
            )}
          </div>
        )}
      </Avatar>
    );

    if (!showTitle) {
      return <div ref={ref} className={className}>{avatarElement}</div>;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          titlePosition === 'bottom' ? 'flex-col' : 'flex-row',
          titlePosition === 'right' && 'gap-3',
          titlePosition === 'bottom' && 'gap-2',
          className
        )}
      >
        {avatarElement}
        
        <div className={cn(
          'flex flex-col',
          titlePosition === 'bottom' && 'items-center text-center'
        )}>
          <span className="text-body-small font-medium text-foreground line-clamp-1">
            {movie.title}
          </span>
          {movie.year && (
            <span className="text-caption text-foreground/60">
              {movie.year}
            </span>
          )}
        </div>
      </div>
    );
  }
);

MovieAvatar.displayName = 'MovieAvatar';

export default Avatar; 