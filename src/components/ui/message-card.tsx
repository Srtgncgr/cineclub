import React, { useState } from 'react';
import { Avatar } from './avatar';
import { Button } from './button';
import { 
  MoreHorizontal, 
  Reply, 
  Edit2, 
  Trash2, 
  Heart, 
  MessageCircle,
  Check,
  CheckCheck,
  Copy,
  Flag,
  Star
} from 'lucide-react';

interface MessageCardProps {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead?: boolean;
  isDelivered?: boolean;
  user: {
    id: string;
    name: string;
    avatar: string;
    isOnline?: boolean;
  };
  replyTo?: {
    id: string;
    content: string;
    userName: string;
  };
  reactions?: {
    type: 'heart' | 'like' | 'star';
    count: number;
    isReacted: boolean;
  }[];
  movieReference?: {
    title: string;
    poster: string;
    year: number;
  };
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, type: string) => void;
  onCopy?: (content: string) => void;
  onReport?: (messageId: string) => void;
}

export function MessageCard({
  id,
  content,
  timestamp,
  isOwn,
  isRead = false,
  isDelivered = false,
  user,
  replyTo,
  reactions = [],
  movieReference,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onCopy,
  onReport
}: MessageCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleReaction = (type: string) => {
    onReact?.(id, type);
    setShowReactions(false);
  };

  return (
    <div className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Avatar - only show for other users */}
      {!isOwn && (
        <div className="flex-shrink-0">
          <Avatar
            src={user.avatar}
            alt={user.name}
            size="sm"
            showStatus
            status={user.isOnline ? 'online' : 'offline'}
          />
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        
        {/* Reply Context */}
        {replyTo && (
          <div className={`mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-gray-300 max-w-full ${
            isOwn ? 'mr-2' : 'ml-2'
          }`}>
            <p className="text-xs text-gray-600 font-medium">{replyTo.userName}</p>
            <p className="text-sm text-gray-700 truncate">{replyTo.content}</p>
          </div>
        )}

        {/* Main Message Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3 ${
            isOwn
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          
          {/* Message Text */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>

          {/* Movie Reference */}
          {movieReference && (
            <div className="mt-3 p-3 bg-black/10 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={movieReference.poster}
                  alt={movieReference.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm truncate ${
                    isOwn ? 'text-white' : 'text-gray-900'
                  }`}>
                    {movieReference.title}
                  </h4>
                  <p className={`text-xs ${
                    isOwn ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {movieReference.year}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Message Actions */}
          {showActions && (
            <div className={`absolute ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
              
              {/* React Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-1"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                
                {/* Reactions Dropdown */}
                {showReactions && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1 z-10">
                    {['❤️', '👍', '😍', '😂', '😢', '⭐'].map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleReaction(emoji)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply?.(id)}
                className="p-1"
              >
                <Reply className="w-4 h-4" />
              </Button>

              {/* Copy Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy?.(content)}
                className="p-1"
              >
                <Copy className="w-4 h-4" />
              </Button>

              {/* Own Message Actions */}
              {isOwn ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(id)}
                    className="p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReport?.(id)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <Flag className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Reactions Display */}
        {reactions.length > 0 && (
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'mr-2' : 'ml-2'}`}>
            {reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={() => handleReaction(reaction.type)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                  reaction.isReacted
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {reaction.type === 'heart' && '❤️'}
                {reaction.type === 'like' && '👍'}
                {reaction.type === 'star' && '⭐'}
                <span className="font-medium">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp and Status */}
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'mr-2' : 'ml-2'}`}>
          <span className="text-xs text-gray-500">
            {formatTime(timestamp)}
          </span>
          
          {/* Message Status for own messages */}
          {isOwn && (
            <div className="text-gray-500">
              {isRead ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : isDelivered ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Own message avatar placeholder for alignment */}
      {isOwn && (
        <div className="flex-shrink-0 w-8" />
      )}
    </div>
  );
} 