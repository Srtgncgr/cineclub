'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  const fetchUnreadCount = async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/messages');
      const data = await response.json();
      
      if (data.success && data.conversations) {
        const totalUnread = data.conversations.reduce((sum: number, conv: any) => {
          return sum + (conv.unreadCount || 0);
        }, 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Okunmamış mesaj sayısı alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [status, session?.user?.id]);

  // Her 30 saniyede bir kontrol et
  useEffect(() => {
    if (status === 'authenticated') {
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [status]);

  return {
    unreadCount,
    loading,
    refreshUnreadCount: fetchUnreadCount
  };
} 