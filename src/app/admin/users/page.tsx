'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Search, 
  Filter, 
  MoreHorizontal,
  Plus,
  Users,
  Shield,
  Ban,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Activity,
  Star,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  Film,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActive: string;
  stats: {
    movieCount: number;
    reviewCount: number;
    messageCount: number;
    avgRating: number;
  };
  isOnline: boolean;
}

export default function UsersManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'USER'
  });

  // API'den kullanıcı verilerini çek
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.error || 'Kullanıcılar yüklenemedi');
        }
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        setError('Kullanıcılar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Loading ve error durumları
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any = a[sortBy as keyof User];
    let bValue: any = b[sortBy as keyof User];
    
    if (sortBy === 'joinDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === sortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(sortedUsers.map(user => user.id));
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'moderator':
        return Shield;
      case 'user':
      default:
        return Users;
    }
  };

  // İşlem fonksiyonları
  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!newUserForm.name || !newUserForm.username || !newUserForm.email || !newUserForm.password) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Kullanıcı başarıyla eklendi!');
        setShowAddUserModal(false);
        setNewUserForm({
          name: '',
          username: '',
          email: '',
          password: '',
          role: 'USER'
        });
        window.location.reload();
      } else {
        alert(data.error || 'Kullanıcı ekleme başarısız');
      }
    } catch (error) {
      console.error('Add user error:', error);
      alert('Kullanıcı ekleme sırasında hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddUserModal(false);
    setNewUserForm({
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'USER'
    });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;
    
    const confirmMessage = {
      delete: 'Seçili kullanıcıları silmek istediğinizden emin misiniz?',
      suspend: 'Seçili kullanıcıları askıya almak istediğinizden emin misiniz?',
      make_moderator: 'Seçili kullanıcıları moderatör yapmak istediğinizden emin misiniz?'
    }[action];

    if (!confirm(confirmMessage)) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userIds: selectedUsers
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setSelectedUsers([]);
        // Kullanıcı listesini yenile
        window.location.reload();
      } else {
        alert(data.error || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('İşlem sırasında hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    const confirmMessage = {
      delete: 'Bu kullanıcıyı silmek istediğinizden emin misiniz?',
      edit: 'Kullanıcı bilgilerini düzenlemek istediğinizden emin misiniz?'
    }[action];

    if (action === 'delete' && !confirm(confirmMessage)) return;

    if (action === 'edit') {
      // Basit rol değiştirme
      const newRole = prompt('Yeni rol (USER/MODERATOR/ADMIN):');
      if (!newRole) return;

      setActionLoading(true);
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: newRole.toUpperCase()
          })
        });

        const data = await response.json();
        
        if (data.success) {
          alert(data.message);
          window.location.reload();
        } else {
          alert(data.error || 'Güncelleme başarısız');
        }
      } catch (error) {
        console.error('Update user error:', error);
        alert('Güncelleme sırasında hata oluştu');
      } finally {
        setActionLoading(false);
      }
      return;
    }

    if (action === 'delete') {
      setActionLoading(true);
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
          alert(data.message);
          window.location.reload();
        } else {
          alert(data.error || 'Silme başarısız');
        }
      } catch (error) {
        console.error('Delete user error:', error);
        alert('Silme sırasında hata oluştu');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const totalUsers = users.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Kullanıcı Yönetimi
            </h1>
            <p className="text-gray-600 mt-1">
              Toplam {totalUsers} kullanıcı
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleAddUser}>
              <Plus className="w-4 h-4 mr-2" />
              Kullanıcı Ekle
            </Button>
          </div>
        </div>

        {/* Filtreleme ve Arama */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Arama Çubuğu */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="İsim, kullanıcı adı veya e-posta ile ara..."
              />
            </div>

            {/* Filtreler */}
            <div className="flex gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tüm Roller</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderatör</option>
                <option value="user">Kullanıcı</option>
              </select>



              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="joinDate-desc">En Yeni</option>
                <option value="joinDate-asc">En Eski</option>
                <option value="name-asc">İsim A-Z</option>
                <option value="name-desc">İsim Z-A</option>
              </select>
            </div>
          </div>

          {/* Seçilen Kullanıcılar İçin Toplu İşlemler */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">
                  {selectedUsers.length} kullanıcı seçildi
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('make_moderator')}
                    disabled={actionLoading}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Moderatör Yap
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('suspend')}
                    disabled={actionLoading}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Askıya Al
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    disabled={actionLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kullanıcı Tablosu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === sortedUsers.length && sortedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    İstatistikler
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Katılım Tarihi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Son Aktivite
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar}
                            alt={user.name}
                            size="md"
                            showStatus
                            status={user.isOnline ? 'online' : 'offline'}
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <RoleIcon className="w-4 h-4 text-gray-500" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getRoleBadge(user.role)}`}>
                            {user.role === 'admin' ? 'Admin' : 
                             user.role === 'moderator' ? 'Moderatör' : 'Kullanıcı'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Film className="w-3 h-3 text-gray-400" />
                            <span>{user.stats.movieCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>{user.stats.avgRating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-gray-400" />
                            <span>{user.stats.reviewCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-gray-400" />
                            <span>{user.stats.messageCount}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(user.joinDate).toLocaleDateString('tr-TR')}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {user.lastActive}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1"
                            onClick={() => handleUserAction(user.id, 'edit')}
                            disabled={actionLoading}
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 text-red-600 hover:text-red-700"
                            onClick={() => handleUserAction(user.id, 'delete')}
                            disabled={actionLoading}
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sayfalama */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {sortedUsers.length} kullanıcı gösteriliyor
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Önceki
                </Button>
                <span className="px-3 py-1 bg-primary text-white text-sm rounded-lg">
                  1
                </span>
                <Button variant="outline" size="sm" disabled>
                  Sonraki
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kullanıcı Ekleme Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Yeni Kullanıcı Ekle
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              {/* Ad Soyad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Örn: Ahmet Yılmaz"
                  required
                />
              </div>

              {/* Kullanıcı Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı *
                </label>
                <input
                  type="text"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Örn: ahmetyilmaz"
                  required
                />
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi *
                </label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Örn: ahmet@example.com"
                  required
                />
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="En az 6 karakter"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="USER">Kullanıcı</option>
                  <option value="MODERATOR">Moderatör</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                  disabled={actionLoading}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Ekleniyor...
                    </div>
                  ) : (
                    'Kullanıcı Ekle'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 