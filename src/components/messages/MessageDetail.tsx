'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { 
  Send,
  ArrowLeft,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
  };
}

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface MessageDetailProps {
  userId: string;
  initialUser: User;
  initialMessages: Message[];
}

export default function MessageDetail({ userId, initialUser, initialMessages }: MessageDetailProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User>(initialUser);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const { refreshUnreadCount } = useUnreadMessages();

  // Mesajları getir
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/messages/${userId}?page=${page}&limit=50`);
        if (!response.ok) {
          throw new Error('Mesajlar alınamadı');
        }
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Mesajlar yüklenirken bir hata oluştu');
        }

        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          timestamp: msg.createdAt,
          isOwn: msg.senderId === data.currentUserId,
          isRead: msg.isRead,
          sender: {
            id: msg.sender.id,
            name: msg.sender.displayName || msg.sender.name || 'İsimsiz Kullanıcı',
            username: msg.sender.username || '',
            avatar: msg.sender.avatar || '/default-avatar.png',
            isOnline: msg.sender.isOnline || false
          }
        }));

        setMessages(prev => page === 1 ? formattedMessages : [...prev, ...formattedMessages]);
        setHasMore(data.messages.length === 50);
      } catch (err) {
        console.error('Mesaj yükleme hatası:', err);
        setError(err instanceof Error ? err.message : 'Mesajlar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    if (page > 1) {
      fetchMessages();
    }
  }, [userId, page]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await fetch(`/api/messages/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) {
        throw new Error('Mesaj gönderilemedi');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Mesaj gönderilemedi');
      }

      setMessages(prev => [...prev, {
        id: data.message.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        isOwn: true,
        isRead: false,
        sender: {
          id: data.message.senderId,
          name: user?.name || 'Sen',
          username: '',
          avatar: user?.avatar || '/default-avatar.png',
          isOnline: true
        }
      }]);
      
      setNewMessage('');
      // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      // Header'daki badge'i güncellemek için unread count'ı refresh et
      setTimeout(() => {
        refreshUnreadCount();
      }, 500);
    } catch (err) {
      console.error('Mesaj gönderme hatası:', err);
      setError(err instanceof Error ? err.message : 'Mesaj gönderilemedi');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return 'Dün';
      } else {
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      }
    } catch (error) {
      console.error('Tarih formatı hatası:', error);
      return '';
    }
  };

  const loadMoreMessages = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Bir Hata Oluştu
          </h3>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Sayfayı Yenile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-primary hover:bg-primary/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                size="md"
                showStatus
                status={user?.isOnline ? 'online' : 'offline'}
              />
              <div>
                <h2 className="font-semibold text-gray-900">
                  {user?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  @{user?.username}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-lg font-medium mb-2">Henüz mesaj yok</p>
                  <p className="text-sm">İlk mesajı göndererek konuşmayı başlatın!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.id}-${index}`}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[75%] ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!message.isOwn && (
                        <Avatar
                          src={message.sender.avatar}
                          alt={message.sender.name}
                          size="sm"
                        />
                      )}
                      
                      <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-xl px-4 py-3 ${
                          message.isOwn
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Mesajınızı yazın..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
            />
            
            <Button
              variant="primary"
              size="md"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="px-4 py-3"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 