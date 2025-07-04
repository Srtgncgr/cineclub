'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly?: boolean;
  showValue?: boolean;
  showText?: boolean;
  className?: string;
  onRatingChange?: (rating: number) => void;
  color?: 'yellow' | 'primary' | 'red' | 'orange' | 'white';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

const colorClasses = {
  yellow: {
    filled: 'text-yellow-500 fill-yellow-500',
    empty: 'text-gray-300',
    hover: 'hover:text-yellow-400'
  },
  primary: {
    filled: 'text-primary fill-primary',
    empty: 'text-gray-300',
    hover: 'hover:text-primary'
  },
  red: {
    filled: 'text-red-500 fill-red-500',
    empty: 'text-gray-300',
    hover: 'hover:text-red-400'
  },
  orange: {
    filled: 'text-orange-500 fill-orange-500',
    empty: 'text-gray-300',
    hover: 'hover:text-orange-400'
  },
  white: {
    filled: 'text-yellow-400 fill-yellow-400',
    empty: 'text-white/40',
    hover: 'hover:text-yellow-300'
  }
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  readonly = false,
  showValue = false,
  showText = false,
  className,
  onRatingChange,
  color = 'yellow'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleStarClick = (clickedRating: number) => {
    if (readonly) return;
    
    // Aynı yıldıza tekrar tıklandıysa sıfırla
    const newRating = rating === clickedRating ? 0 : clickedRating;
    onRatingChange?.(newRating);
  };

  const handleStarHover = (hoveredRating: number) => {
    if (readonly) return;
    setHoverRating(hoveredRating);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
    setIsHovering(false);
  };

  const getStarState = (starIndex: number) => {
    const currentRating = isHovering ? hoverRating : rating;
    return starIndex <= currentRating;
  };

  const colors = colorClasses[color];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Stars */}
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starIndex = index + 1;
          const isFilled = getStarState(starIndex);
          
          return (
            <button
              key={starIndex}
              type="button"
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
              disabled={readonly}
              className={cn(
                sizeClasses[size],
                "transition-all duration-200",
                readonly 
                  ? "cursor-default" 
                  : "cursor-pointer hover:scale-110 active:scale-95",
                isFilled 
                  ? colors.filled
                  : readonly 
                    ? colors.empty 
                    : `${colors.empty} ${colors.hover}`,
                !readonly && "focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
              )}
              title={readonly ? undefined : `${starIndex} yıldız ver`}
            >
              <Star 
                className="w-full h-full" 
                fill={isFilled ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>

      {/* Rating Value */}
      {showValue && rating > 0 && (
        <span className="text-sm font-medium text-gray-700 ml-2">
          {isHovering && !readonly ? hoverRating : rating.toFixed(1)}
        </span>
      )}

      {/* Rating Text */}
      {showText && (
        <span className="text-sm text-gray-600 ml-2">
          {readonly 
            ? rating > 0 ? `${rating.toFixed(1)}/${maxRating}` : "Puan verilmemiş"
            : isHovering 
              ? getRatingText(hoverRating)
              : rating > 0 
                ? getRatingText(rating)
                : "Puan verin"
          }
        </span>
      )}
    </div>
  );
};

// Rating metinleri
const getRatingText = (rating: number): string => {
  if (rating === 0) return "Puan yok";
  if (rating === 1) return "Çok kötü";
  if (rating === 2) return "Kötü";
  if (rating === 3) return "Orta";
  if (rating === 4) return "İyi";
  if (rating === 5) return "Mükemmel";
  return "Puan var";
};

// Özel hook - rating state yönetimi için
export const useStarRating = (initialRating: number = 0) => {
  const [rating, setRating] = useState(initialRating);

  const resetRating = () => setRating(0);
  
  const isRated = rating > 0;

  return {
    rating,
    setRating,
    resetRating,
    isRated
  };
};

export default StarRating; 