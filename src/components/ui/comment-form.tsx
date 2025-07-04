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
  movieId: string; // Movie ID'yi ekliyoruz
  currentUser?: {
    id: number;
    name: string;
    avatar: string;
  };
  userRating?: number; // Dışarıdan gelen mevcut kullanıcı puanı
  maxLength?: number;
  className?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = "Bu film hakkında ne düşünüyorsunuz?",
  showRating = true,
  movieId,
  currentUser,
  userRating: externalUserRating = 0,
  maxLength = 1000,
  className
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // External rating'i kullan (artık API çağrısı yok, senkronize)
  const userRating = externalUserRating;

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

    // Puan artık zorunlu değil - kullanıcı puansız yorum yazabilir

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        content: content.trim(),
        rating: showRating && userRating > 0 ? userRating : undefined
      });
      
      // Form'u temizle (rating'i temizleme, mevcut puanı koru)
      setContent('');
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

      {/* Rating Bilgisi (sadece göster, değiştirme) */}
      {showRating && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puanınız
          </label>
          {userRating > 0 ? (
            <div className="flex items-center gap-2">
              <StarRating
                rating={userRating}
                onRatingChange={() => {}} // Değiştirilemez
                size="lg"
                showText={false}
                className="mb-1"
              />
              <span className="text-lg font-semibold text-gray-900">
                {userRating}/5
              </span>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ⭐ Henüz puan vermediniz. İsterseniz üstteki yıldızlardan puan verebilirsiniz (opsiyonel)
              </p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Puanınızı değiştirmek için üstteki yıldızları kullanın
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