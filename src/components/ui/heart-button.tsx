'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeartButtonProps {
  isFavorite?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'filled' | 'outline';
  disabled?: boolean;
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
  showTooltip?: boolean;
}

const sizeClasses = {
  sm: {
    button: 'w-8 h-8 p-1.5',
    icon: 'w-4 h-4'
  },
  md: {
    button: 'w-10 h-10 p-2',
    icon: 'w-5 h-5'
  },
  lg: {
    button: 'w-12 h-12 p-2.5',
    icon: 'w-6 h-6'
  }
};

const variantClasses = {
  default: {
    base: 'bg-white/90 hover:bg-white border border-gray-200 hover:border-primary/30',
    favorite: 'bg-primary/10 border-primary/20',
    icon: {
      default: 'text-gray-600 hover:text-primary',
      favorite: 'text-primary'
    }
  },
  minimal: {
    base: 'bg-transparent hover:bg-primary/10',
    favorite: 'bg-primary/10',
    icon: {
      default: 'text-gray-400 hover:text-primary',
      favorite: 'text-primary'
    }
  },
  filled: {
    base: 'bg-gray-100 hover:bg-primary/10 border border-gray-200 hover:border-primary/20',
    favorite: 'bg-primary hover:bg-primary/90 border-primary',
    icon: {
      default: 'text-gray-600',
      favorite: 'text-white'
    }
  },
  outline: {
    base: 'border-2 border-gray-200 hover:border-primary/30 bg-transparent',
    favorite: 'border-2 border-primary bg-primary/10',
    icon: {
      default: 'text-gray-600 hover:text-primary',
      favorite: 'text-primary'
    }
  }
};

export const HeartButton: React.FC<HeartButtonProps> = ({
  isFavorite = false,
  size = 'md',
  variant = 'default',
  disabled = false,
  className,
  onToggle,
  showTooltip = true
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [localFavorite, setLocalFavorite] = useState(isFavorite);

  // isFavorite prop'u değiştiğinde localFavorite'i güncelle
  useEffect(() => {
    setLocalFavorite(isFavorite);
  }, [isFavorite]);

  const handleClick = () => {
    if (disabled) return;

    setIsAnimating(true);
    const newFavoriteState = !localFavorite;
    setLocalFavorite(newFavoriteState);
    
    // Animasyon tamamlandıktan sonra callback çağır
    setTimeout(() => {
      setIsAnimating(false);
      onToggle?.(newFavoriteState);
    }, 300);
  };

  const sizes = sizeClasses[size];
  const variants = variantClasses[variant];
  const currentFavorite = localFavorite;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={showTooltip ? (currentFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle') : undefined}
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center rounded-full',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
        'transform active:scale-95',
        
        // Size
        sizes.button,
        
        // Variant base
        currentFavorite ? variants.favorite : variants.base,
        
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        
        // Hover effects
        !disabled && 'hover:scale-105',
        
        // Animation state
        isAnimating && 'animate-pulse',
        
        className
      )}
    >
      {/* Background pulse effect */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping" />
      )}
      
      {/* Heart icon */}
      <Heart 
        className={cn(
          sizes.icon,
          'transition-all duration-300',
          currentFavorite ? variants.icon.favorite : variants.icon.default,
          
          // Fill animation
          currentFavorite && 'drop-shadow-sm',
          
          // Scale animation during toggle
          isAnimating && 'scale-125',
          
          // Subtle bounce on hover
          !disabled && !isAnimating && 'hover:scale-110'
        )}
        fill={currentFavorite ? "currentColor" : "none"}
        strokeWidth={1.5}
      />
      
      {/* Favorite indicator - small sparkle effect */}
      {currentFavorite && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white opacity-90 animate-pulse" />
      )}
    </button>
  );
};

// Hook for managing favorite state
export const useFavorite = (initialState: boolean = false, movieId?: number) => {
  const [isFavorite, setIsFavorite] = useState(initialState);

  const toggleFavorite = (newState: boolean) => {
    setIsFavorite(newState);
    
    // Burada backend API çağrısı yapılacak
    console.log(`Movie ${movieId} favorite state changed to:`, newState);
    
    // Toast notification (opsiyonel)
    // toast(newState ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
  };

  return {
    isFavorite,
    toggleFavorite,
    setIsFavorite
  };
};

export default HeartButton; 