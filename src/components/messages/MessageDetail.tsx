'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { 
  Send,
  ArrowLeft,
  MoreVertical,
  Image,
  Smile,
  Paperclip,
  Phone,
  Video,
  Info,
  AlertTriangle,
  Loader2,
  Check,
  CheckCheck
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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bir Hata Oluştu
          </h3>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Yeniden Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3">
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
                    {user?.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Info className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {hasMore && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Daha Fazla Mesaj Yükle
                  </Button>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={`${message.id}-${index}`}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!message.isOwn && (
                      <Avatar
                        src={message.sender.avatar}
                        alt={message.sender.name}
                        size="sm"
                      />
                    )}
                    
                    <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-lg px-4 py-2 ${
                        message.isOwn
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {formatTime(message.timestamp)}
                        {message.isOwn && (
                          <span className="ml-1">
                            {message.isRead ? (
                              <CheckCheck className="w-3 h-3 inline" />
                            ) : (
                              <Check className="w-3 h-3 inline" />
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Image className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Smile className="w-5 h-5" />
            </Button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Mesajınızı yazın..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
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