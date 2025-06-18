'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveRatingProps {
  movieId: string;
  initialRating?: number;
  userRating?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function InteractiveRating({
  movieId,
  initialRating = 0,
  userRating = 0,
  disabled = false,
  size = 'md',
  showText = true,
  onRatingChange
}: InteractiveRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [currentUserRating, setCurrentUserRating] = useState(userRating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Kullanıcının mevcut puanını yükle
  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        const response = await fetch(`/api/movies/${movieId}/vote`);
        if (response.ok) {
          const data = await response.json();
          if (data.userVote?.rating) {
            setCurrentUserRating(data.userVote.rating);
          }
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRating();
  }, [movieId]);

  const sizeClasses = {
    sm: {
      star: 'w-5 h-5',
      text: 'text-sm'
    },
    md: {
      star: 'w-6 h-6',
      text: 'text-base'
    },
    lg: {
      star: 'w-8 h-8',
      text: 'text-lg'
    }
  };

  const handleRatingClick = async (rating: number) => {
    if (disabled || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/movies/${movieId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Oy verme işlemi başarısız');
      }
      
      setCurrentUserRating(rating);
      onRatingChange?.(rating);
      
      console.log('Rating submitted successfully:', data);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Oy verme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || currentUserRating;

  return (
    <div className="space-y-3">
      {/* Stars */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => {
          const isActive = rating <= displayRating;
          
          return (
            <button
              key={rating}
              type="button"
              disabled={disabled || isSubmitting || isLoading}
              className={cn(
                "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-sm",
                disabled || isSubmitting || isLoading 
                  ? "cursor-not-allowed opacity-50" 
                  : "cursor-pointer hover:scale-105"
              )}
              onMouseEnter={() => !disabled && !isLoading && setHoveredRating(rating)}
              onMouseLeave={() => !disabled && !isLoading && setHoveredRating(0)}
              onClick={() => handleRatingClick(rating)}
            >
              <Star
                className={cn(
                  sizeClasses[size].star,
                  "transition-colors duration-200",
                  isActive 
                    ? "text-yellow-500 fill-yellow-500" 
                    : "text-gray-300 hover:text-yellow-400"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Text */}
      {showText && (
        <div className={cn("space-y-2", sizeClasses[size].text)}>
          {isLoading ? (
            <p className="text-gray-500">
              Yükleniyor...
            </p>
          ) : currentUserRating > 0 ? (
            <p className="text-gray-900 font-medium">
              Puanınız: {currentUserRating}/5
            </p>
          ) : (
            <p className="text-gray-600">
              {hoveredRating > 0 
                ? `${hoveredRating}/5 yıldız` 
                : "Puan verin"
              }
            </p>
          )}
          
          {isSubmitting && (
            <p className="text-gray-500">
              Kaydediliyor...
            </p>
          )}
        </div>
      )}
    </div>
  );
} 