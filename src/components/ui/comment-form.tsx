'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/star-rating';
import { cn } from '@/lib/utils';

interface CommentFormProps {
  onSubmit: (data: {
    content: string;
    rating?: number;
  }) => Promise<void>;
  placeholder?: string;
  showRating?: boolean;
  currentUser?: {
    id: number;
    name: string;
    avatar: string;
  };
  maxLength?: number;
  className?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = "Bu film hakkında ne düşünüyorsunuz?",
  showRating = true,
  currentUser,
  maxLength = 1000,
  className
}) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Lütfen bir yorum yazın');
      return;
    }

    if (content.length > maxLength) {
      setError(`Yorum ${maxLength} karakterden uzun olamaz`);
      return;
    }

    if (showRating && rating === 0) {
      setError('Lütfen bir puan verin');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        content: content.trim(),
        rating: showRating ? rating : undefined
      });
      
      // Form'u temizle
      setContent('');
      setRating(0);
    } catch (err) {
      setError('Yorum gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;
  const isNearLimit = characterCount > maxLength * 0.8;

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        'bg-white rounded-xl p-6 border border-gray-200 shadow-sm',
        className
      )}
    >
      {/* Form Başlığı */}
      <div className="flex items-center gap-3 mb-4">
        {currentUser && (
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.name}
            size="md"
          />
        )}
        <div>
          <h3 className="font-semibold text-gray-900">
            Yorumunuzu Ekleyin
          </h3>
          <p className="text-sm text-gray-600">
            Diğer kullanıcılarla deneyiminizi paylaşın
          </p>
        </div>
      </div>

      {/* Rating (opsiyonel) */}
      {showRating && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puanınız
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
            showText
            className="mb-1"
          />
          <p className="text-xs text-gray-500">
            1-5 yıldız arasında puanlayın
          </p>
        </div>
      )}

      {/* Yorum Alanı */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Yorumunuz
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className={cn(
            'w-full p-4 border border-gray-200 rounded-lg resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30',
            'placeholder:text-gray-400',
            isOverLimit && 'border-red-300 focus:border-red-400 focus:ring-red-100'
          )}
        />
        
        {/* Karakter Sayacı */}
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500">
            <span>Lütfen saygılı ve yapıcı yorumlar yazın</span>
          </div>
          <div className={cn(
            'text-xs',
            isOverLimit ? 'text-red-500' : isNearLimit ? 'text-orange-500' : 'text-gray-500'
          )}>
            {characterCount}/{maxLength}
          </div>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form Butonları */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setContent('');
            setRating(0);
            setError('');
          }}
          disabled={isSubmitting}
        >
          Temizle
        </Button>
        
        <Button
          type="submit"
          disabled={!content.trim() || isOverLimit || isSubmitting}
          isLoading={isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Yorum Ekle'}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm; 