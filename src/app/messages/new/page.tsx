'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Search,
  Users,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  role: string;
  isPrivate: boolean;
  joinDate: string;
  lastMessage?: {
    content: string;
    createdAt: string;
  } | null;
}

export default function NewMessagePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users?search=${searchQuery}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Kullanıcılar yüklenirken bir hata oluştu');
        }

        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleUserClick = (userId: string) => {
    router.push(`/messages/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Yeni Mesaj
            </h1>
            <p className="text-gray-600 mt-1">
              Mesajlaşmak istediğiniz kişiyi seçin
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
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

        {/* Users List */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
            {users.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Kullanıcı bulunamadı' : 'Henüz kullanıcı yok'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Arama kriterlerinize uygun kullanıcı bulunamadı.' 
                    : 'Sistemde henüz kayıtlı kullanıcı bulunmuyor.'
                  }
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={user.avatar}
                      alt={user.displayName}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {user.displayName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        @{user.username}
                      </p>
                      {user.lastMessage && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {user.lastMessage.content}
                        </p>
                      )}
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