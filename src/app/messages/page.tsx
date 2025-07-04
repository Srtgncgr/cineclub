'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { 
  Search,
  Plus,
  MessageCircle,
  MoreHorizontal,
  Check,
  CheckCheck,
  Pin,
  Settings,
  AlertTriangle,
  Lock,
  LogIn
} from 'lucide-react';

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isOwn: boolean;
    isRead: boolean;
  };
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  movieContext?: {
    title: string;
    poster: string;
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const { refreshUnreadCount } = useUnreadMessages();

  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sadece authenticated kullanıcılar için veri çek
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/messages');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Mesajlar yüklenirken bir hata oluştu');
        }

        // API'den gelen verileri dönüştür
        const formattedConversations = (data.conversations || []).map((conv: any) => {
          // Null check ve varsayılan değerler
          const otherUser = conv.otherUser || {};
          const lastMessage = conv.lastMessage || {};
          
          return {
            id: conv.id || `conv-${Math.random().toString(36).substr(2, 9)}`,
            user: {
              id: otherUser.id || `user-${Math.random().toString(36).substr(2, 9)}`,
              name: otherUser.displayName || otherUser.name || 'İsimsiz Kullanıcı',
              username: otherUser.username || '',
              avatar: otherUser.avatar || '/default-avatar.png',
              isOnline: otherUser.isOnline || false,
              lastSeen: otherUser.lastSeen || null
            },
            lastMessage: {
              content: lastMessage.content || 'Henüz mesaj yok',
              timestamp: lastMessage.createdAt || new Date().toISOString(),
              isOwn: lastMessage.senderId === data.currentUserId,
              isRead: lastMessage.isRead || false
            },
            unreadCount: conv.unreadCount || 0,
            isPinned: conv.isPinned || false,
            isArchived: conv.isArchived || false
          };
        });

        setConversations(formattedConversations);
      } catch (err) {
        console.error('Mesaj yükleme hatası:', err);
        setError(err instanceof Error ? err.message : 'Mesajlar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [status]);

  // Filtrelenmiş konuşmalar
  const filteredConversations = conversations.filter(conv => {
    if (!conv?.user?.name) return false;
    
    const matchesSearch = conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch && !conv.isArchived;
  });

  // Sıralama: pinned first, then by timestamp
  const sortedConversations = filteredConversations.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime();
  });

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

  const handleConversationClick = (userId: string) => {
    router.push(`/messages/${userId}`);
    // Konuşmaya girildiğinde unread count'ı güncelle
    setTimeout(() => {
      refreshUnreadCount();
    }, 1000);
  };

  const toggleConversationSelection = (id: string) => {
    setSelectedConversations(prev => 
      prev.includes(id) 
        ? prev.filter(convId => convId !== id)
        : [...prev, id]
    );
  };

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  const onlineUsers = conversations.filter(conv => conv.user?.isOnline).length;

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Authentication required
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Mesajlar İçin Giriş Yapın
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Diğer kullanıcılarla mesajlaşmak ve konuşmalarınızı görüntülemek için önce giriş yapmanız gerekiyor.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Giriş Yap
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/register')}
              className="w-full"
              size="lg"
            >
              Hesap Oluştur
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="w-full text-gray-500"
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary" />
              Mesajlar
              {totalUnreadCount > 0 && (
                <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                  {totalUnreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              {onlineUsers} kişi çevrimiçi • {conversations.length} konuşma
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={() => router.push('/messages/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Mesaj
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Mesajlarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>


          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-12 text-center">
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
        )}

        {/* Conversations List */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
            {sortedConversations.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Sonuç bulunamadı' : 'Henüz mesaj yok'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? 'Arama kriterlerinize uygun konuşma bulunamadı.' 
                    : 'İlk mesajınızı gönderin ve konuşmaya başlayın!'
                  }
                </p>
                {!searchQuery && (
                  <Button variant="primary" onClick={() => router.push('/messages/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Mesaj Başlat
                  </Button>
                )}
              </div>
            ) : (
              sortedConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.user.id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group"
                >
                  <div className="flex items-center gap-4">
                    
                    {/* Avatar with Online Status */}
                    <div className="relative">
                      <Avatar
                        src={conversation.user.avatar}
                        alt={conversation.user.name}
                        size="md"
                        showStatus
                        status={conversation.user.isOnline ? 'online' : 'offline'}
                      />
                      {conversation.isPinned && (
                        <div className="absolute -top-1 -right-1 p-1 bg-primary rounded-full">
                          <Pin className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.user.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                          {conversation.lastMessage.isOwn && (
                            <div className="text-primary">
                              {conversation.lastMessage.isRead ? (
                                <CheckCheck className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {conversation.lastMessage.isOwn && 'Sen: '}
                          {conversation.lastMessage.content}
                        </p>
                        
                        <div className="flex items-center gap-2 ml-3">
                          {conversation.unreadCount > 0 && (
                            <span className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Movie Context */}
                      {conversation.movieContext && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg">
                          <img
                            src={conversation.movieContext.poster}
                            alt={conversation.movieContext.title}
                            className="w-8 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Film hakkında</p>
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {conversation.movieContext.title}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}


      </div>
    </div>
  );
} 