'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CommentCard, Comment } from '@/components/ui/comment-card';
import { CommentForm } from '@/components/ui/comment-form';
import { 
  MessageCircle, 
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'newest' | 'oldest';

interface CommentListProps {
  comments: Comment[];
  movieId: string; // Movie ID'yi ekliyoruz
  onAddComment?: (data: { content: string; rating?: number }) => Promise<void>;
  onReplyToComment?: (commentId: string, content: string) => void;
  onEditComment?: (commentId: string, newContent: string) => void;
  onDeleteComment?: (commentId: string) => void;
  showCommentForm?: boolean;
  allowRating?: boolean;
  currentUser?: {
    id: string;
    name: string;
    avatar: string;
  };
  emptyStateText?: string;
  className?: string;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  movieId,
  onAddComment,
  onReplyToComment,
  onEditComment,
  onDeleteComment,
  showCommentForm = true,
  allowRating = true,
  currentUser,
  emptyStateText = "Henüz yorum yapılmamış. İlk yorumu siz yapın!",
  className
}) => {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Yorumları sırala
  const sortedComments = useMemo(() => {
    const filtered = [...comments];

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [comments, sortBy]);

  const handleAddComment = async (data: { content: string; rating?: number }) => {
    if (onAddComment) {
      await onAddComment(data);
      setShowForm(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">
            Yorumlar
          </h2>
          {comments.length > 0 && (
            <span className="text-gray-500">
              ({comments.length})
            </span>
          )}
        </div>

        {showCommentForm && (
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yorum Ekle
          </Button>
        )}
      </div>

      {/* Yorum Ekleme Formu */}
      {showForm && showCommentForm && (
        <CommentForm
          onSubmit={handleAddComment}
          movieId={movieId}
          showRating={allowRating}
          currentUser={currentUser ? {
            id: Number(currentUser.id),
            name: currentUser.name,
            avatar: currentUser.avatar
          } : undefined}
          className="bg-white p-4 rounded-lg border border-gray-200"
        />
      )}

      {/* Sıralama */}
      {comments.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sırala:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
          </select>
        </div>
      )}

      {/* Yorum Listesi */}
      <div className="space-y-4">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReply={onReplyToComment}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
              currentUserId={currentUser?.id}
            />
          ))
        ) : (
          // Hiç yorum yok
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p>{emptyStateText}</p>
            {showCommentForm && !showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="mt-3"
                size="sm"
              >
                İlk Yorumu Ekle
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList; 