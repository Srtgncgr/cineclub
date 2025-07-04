'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { 
  Reply, 
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  rating?: number;
  date: string;
  replies?: Comment[];
  isReply?: boolean;
}

interface CommentCardProps {
  comment: Comment;
  onReply?: (commentId: string, content: string) => void;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  showReplies?: boolean;
  maxDepth?: number;
  currentDepth?: number;
  className?: string;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
  showReplies = true,
  maxDepth = 3,
  currentDepth = 0,
  className
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    
    setIsSubmittingReply(true);
    try {
      await onReply?.(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    
    setIsSubmittingEdit(true);
    try {
      await onEdit?.(comment.id, editContent);
      setIsEditing(false);
      setShowDropdown(false);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      await onDelete?.(comment.id);
      setShowDropdown(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setShowDropdown(false);
  };

  const canShowReplies = showReplies && comment.replies && comment.replies.length > 0;
  // Herkes herkese yanıt yazabilir (kendi yorumuna da dahil) - sadece derinlik kısıtlaması var
  const canReply = currentDepth < maxDepth && currentUserId; // Login olmuş kullanıcılar yanıt yazabilir
  const isOwner = currentUserId && comment.user.id === currentUserId;

  return (
    <div className={cn(
      'group',
      currentDepth > 0 && 'ml-6 border-l-2 border-gray-100 pl-4',
      className
    )}>
      {/* Ana Yorum */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        {/* Kullanıcı Bilgileri */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar
            src={comment.user.avatar}
            alt={comment.user.name}
            size="md"
            className="flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">
                {comment.user.name}
              </h4>
              
              {comment.user.isVerified && (
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
              
              <span className="text-sm text-gray-500">
                {new Date(comment.date).toLocaleDateString('tr-TR')}
              </span>
            </div>
            
            {/* Rating (varsa) */}
            {comment.rating && comment.rating > 0 && (
              <div className="mb-2">
                <StarRating
                  rating={comment.rating}
                  readonly
                  size="sm"
                  showValue
                />
              </div>
            )}
          </div>

          {/* Daha Fazla Menü - Sadece yorum sahibi için */}
          {isOwner && (
            <div className="flex-shrink-0 relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>

              {/* Dropdown Menü */}
              {showDropdown && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Düzenle
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Yorum İçeriği */}
        <div className="mb-4">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={3}
                placeholder="Yorumunuzu düzenleyin..."
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={isSubmittingEdit}
                >
                  İptal
                </Button>
                <Button
                  size="sm"
                  onClick={handleEditSubmit}
                  disabled={!editContent.trim() || isSubmittingEdit}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmittingEdit ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex items-center gap-2 text-sm">
          {/* Yanıtla Butonu */}
          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-2 text-gray-600 hover:text-primary"
            >
              <Reply className="w-4 h-4" />
              <span>Yanıtla</span>
            </Button>
          )}
        </div>

        {/* Yanıt Formu */}
        {showReplyForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-3">
              <Avatar
                src="/placeholder-avatar.jpg"
                alt="Sen"
                size="sm"
                className="flex-shrink-0 mt-1"
              />
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`${comment.user.name} kullanıcısına yanıt ver...`}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                    }}
                  >
                    İptal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={!replyContent.trim() || isSubmittingReply}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmittingReply ? 'Gönderiliyor...' : 'Yanıtla'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Yanıtlar */}
      {canShowReplies && (
        <div className="mt-4 space-y-4">
          {/* Yanıtları Göster/Gizle Butonu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllReplies(!showAllReplies)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 ml-6"
          >
            {showAllReplies ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>
              {showAllReplies 
                ? 'Yanıtları Gizle' 
                : `${comment.replies!.length} Yanıtı Göster`
              }
            </span>
          </Button>

          {/* Yanıt Listesi */}
          {showAllReplies && (
            <div className="space-y-4">
              {comment.replies!.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  showReplies={showReplies}
                  maxDepth={maxDepth}
                  currentDepth={currentDepth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentCard; 