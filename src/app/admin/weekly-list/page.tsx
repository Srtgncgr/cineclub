'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  Film,
  Users,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlayCircle,
  Trophy,
  Target,
  Activity,
  Zap,
  X
} from 'lucide-react';

interface WeeklyListMovie {
  id: string;
  movieId: string;
  title: string;
  year: number;
  poster: string;
  director: string;
  genres: string[];
  description: string;
  rating: number;
  position: number;
}

interface WeeklyList {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'archived';
  movies: WeeklyListMovie[];
  theme?: string;
  createdAt: string;
  updatedAt: string;
}

export default function WeeklyListManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('all');
  const [weeklyLists, setWeeklyLists] = useState<WeeklyList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedListForMovies, setSelectedListForMovies] = useState<string | null>(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [listMovies, setListMovies] = useState<WeeklyListMovie[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    startDate: '',
    endDate: ''
  });

  // Yeni state'ler
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingList, setEditingList] = useState<WeeklyList | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingList, setViewingList] = useState<WeeklyList | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);

  // API'den haftalık listeleri çek
  useEffect(() => {
    fetchWeeklyLists();
  }, [selectedStatus, searchQuery]);

  const fetchWeeklyLists = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/admin/weekly-lists?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setWeeklyLists(data);
      } else {
        console.error('Error fetching weekly lists:', data);
        setWeeklyLists([]);
      }
    } catch (error) {
      console.error('Error fetching weekly lists:', error);
      setWeeklyLists([]);
    } finally {
      setLoading(false);
    }
  };

  // Film arama fonksiyonu
  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoadingMovies(true);
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok) {
        // console.log('Movie search response:', data); // Debug için
        setSearchResults(Array.isArray(data) ? data : data.movies || data.results || []);
      } else {
        console.error('Error searching movies:', data);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    } finally {
      setLoadingMovies(false);
    }
  };

  // Haftalık listeye film ekleme fonksiyonu
  const addMovieToList = async (movieId: string) => {
    if (!selectedListForMovies) return;

    try {
      const response = await fetch(`/api/admin/weekly-lists/${selectedListForMovies}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Film başarıyla listeye eklendi!');
        fetchListMovies(selectedListForMovies);
        setMovieSearchQuery('');
        setSearchResults([]);
      } else {
        alert('Hata: ' + (data.error || 'Film eklenemedi'));
      }
    } catch (error) {
      console.error('Error adding movie to list:', error);
      alert('Bir hata oluştu! Film eklenemedi.');
    }
  };

  // Haftalık liste filmlerini getirme fonksiyonu
  const fetchListMovies = async (listId: string) => {
    try {
      const response = await fetch(`/api/admin/weekly-lists/${listId}/movies`);
      const data = await response.json();
      
      if (response.ok) {
        setListMovies(data);
      } else {
        console.error('Error fetching list movies:', data);
        setListMovies([]);
      }
    } catch (error) {
      console.error('Error fetching list movies:', error);
      setListMovies([]);
    }
  };

  // Film listeden çıkarma fonksiyonu
  const removeMovieFromList = async (movieId: string) => {
    if (!selectedListForMovies) return;
    
    try {
      const response = await fetch(`/api/admin/weekly-lists/${selectedListForMovies}/movies?movieId=${movieId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Film başarıyla çıkarıldı!');
        // Listeyi güncelle
        fetchListMovies(selectedListForMovies);
      } else {
        alert('Hata: ' + (data.error || 'Film çıkarılamadı'));
      }
    } catch (error) {
      console.error('Error removing movie from list:', error);
      alert('Bir hata oluştu! Film çıkarılamadı.');
    }
  };

  // Toplu liste işlemleri
  const handleBulkPublish = async () => {
    if (selectedLists.length === 0) {
      alert('Lütfen en az bir liste seçin!');
      return;
    }

    if (!confirm(`${selectedLists.length} liste yayınlanacak. Emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/weekly-lists', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listIds: selectedLists,
          action: 'publish'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Listeler başarıyla yayınlandı!');
        setSelectedLists([]);
        fetchWeeklyLists();
      } else {
        alert('Hata: ' + (data.error || 'Listeler yayınlanamadı'));
      }
    } catch (error) {
      console.error('Error publishing lists:', error);
      alert('Bir hata oluştu! Listeler yayınlanamadı.');
    }
  };

  const handleBulkCancel = async () => {
    if (selectedLists.length === 0) {
      alert('Lütfen en az bir liste seçin!');
      return;
    }

    if (!confirm(`${selectedLists.length} liste iptal edilecek. Emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/weekly-lists', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listIds: selectedLists,
          action: 'cancel'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Listeler başarıyla iptal edildi!');
        setSelectedLists([]);
        fetchWeeklyLists();
      } else {
        alert('Hata: ' + (data.error || 'Listeler iptal edilemedi'));
      }
    } catch (error) {
      console.error('Error cancelling lists:', error);
      alert('Bir hata oluştu! Listeler iptal edilemedi.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLists.length === 0) {
      alert('Lütfen en az bir liste seçin!');
      return;
    }

    if (!confirm(`${selectedLists.length} liste kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/weekly-lists?listIds=${selectedLists.join(',')}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Listeler başarıyla silindi!');
        setSelectedLists([]);
        fetchWeeklyLists();
      } else {
        alert('Hata: ' + (data.error || 'Listeler silinemedi'));
      }
    } catch (error) {
      console.error('Error deleting lists:', error);
      alert('Bir hata oluştu! Listeler silinemedi.');
    }
  };

  // Liste görüntüleme
  const handleViewList = (list: WeeklyList) => {
    setViewingList(list);
    setShowViewModal(true);
    if (list.movies.length === 0) {
      fetchListMovies(list.id);
    }
  };

  // Liste düzenleme
  const handleEditList = (list: WeeklyList) => {
    setEditingList(list);
    setFormData({
      title: list.title,
      description: list.description,
      theme: list.theme || '',
      startDate: new Date(list.startDate).toISOString().split('T')[0],
      endDate: new Date(list.endDate).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  // Liste güncelleme
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingList || !formData.title || !formData.startDate || !formData.endDate) {
      alert('Lütfen gerekli alanları doldurun!');
      return;
    }

    try {
      setCreating(true);
      
      const response = await fetch(`/api/admin/weekly-lists/${editingList.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Haftalık liste başarıyla güncellendi!');
        setShowEditModal(false);
        setEditingList(null);
        setFormData({ title: '', description: '', theme: '', startDate: '', endDate: '' });
        fetchWeeklyLists();
      } else {
        alert('Hata: ' + (data.error || 'Liste güncellenemedi'));
      }
    } catch (error) {
      console.error('Error updating weekly list:', error);
      alert('Bir hata oluştu! Lütfen tekrar deneyin.');
    } finally {
      setCreating(false);
    }
  };

  // Tekil liste silme
  const handleDeleteSingleList = async (listId: string) => {
    if (!confirm('Bu liste kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/weekly-lists?listIds=${listId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Liste başarıyla silindi!');
        fetchWeeklyLists();
      } else {
        alert('Hata: ' + (data.error || 'Liste silinemedi'));
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Bir hata oluştu! Liste silinemedi.');
    }
  };

  // Tekil liste durumu değiştirme
  const handleToggleListStatus = async (listId: string, currentStatus: string) => {
    const message = currentStatus === 'active' ? 'Liste iptal edilecek' : 'Liste aktif hale getirilecek. Diğer aktif listeler otomatik olarak arşivlenecek';
    
    if (!confirm(`${message}. Emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/weekly-lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Liste durumu başarıyla güncellendi!');
        fetchWeeklyLists();
      } else {
        alert('Hata: ' + (data.error || 'Liste durumu güncellenemedi'));
      }
    } catch (error) {
      console.error('Error updating list status:', error);
      alert('Bir hata oluştu! Liste durumu güncellenemedi.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert('Lütfen gerekli alanları doldurun!');
      return;
    }

    try {
      setCreating(true);
      
      const response = await fetch('/api/admin/weekly-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Response text'ini önce alalım
      const responseText = await response.text();
      console.log('API Response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response Text:', responseText);
        alert('Sunucu yanıtı bozuk: ' + responseText.substring(0, 100));
        return;
      }

      if (response.ok) {
        alert('Haftalık liste başarıyla oluşturuldu!');
        setShowCreateModal(false);
        setFormData({ title: '', description: '', theme: '', startDate: '', endDate: '' });
        fetchWeeklyLists();
      } else {
        alert('Hata: ' + (result.error || result.message || 'Liste oluşturulamadı'));
      }
    } catch (error) {
      console.error('Error creating weekly list:', error);
      alert('Bir hata oluştu! Lütfen tekrar deneyin.');
    } finally {
      setCreating(false);
    }
  };

  const filteredLists = weeklyLists.filter(list => {
    const matchesSearch = 
      list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.theme && list.theme.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || list.status === selectedStatus;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'current' && list.status === 'active') ||
      (activeTab === 'history' && (list.status === 'completed' || list.status === 'cancelled' || list.status === 'archived'));
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  // İstatistikler
  const totalLists = weeklyLists.length;
  const activeLists = weeklyLists.filter(list => list.status === 'active').length;
  const historyLists = weeklyLists.filter(list => ['completed', 'cancelled', 'archived'].includes(list.status)).length;
  
  const tabCounts = {
    all: totalLists,
    current: activeLists,
    history: historyLists
  };

  const sortedLists = [...filteredLists].sort((a, b) => {
    let aValue: any = a[sortBy as keyof WeeklyList];
    let bValue: any = b[sortBy as keyof WeeklyList];
    
    if (sortBy === 'startDate' || sortBy === 'endDate' || sortBy === 'createdAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleListSelect = (listId: string) => {
    setSelectedLists(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLists.length === sortedLists.length) {
      setSelectedLists([]);
    } else {
      setSelectedLists(sortedLists.map(list => list.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          style: 'bg-green-100 text-green-800 border-green-200',
          icon: PlayCircle,
          text: 'Aktif'
        };
      case 'draft':
        return { 
          style: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Edit,
          text: 'Taslak'
        };
      case 'completed':
        return { 
          style: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle,
          text: 'Tamamlandı'
        };
      case 'cancelled':
        return { 
          style: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          text: 'İptal'
        };
      default:
        return { 
          style: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertTriangle,
          text: 'Bilinmiyor'
        };
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    const end = new Date(endDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    return `${start} - ${end}`;
  };

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
              <Calendar className="w-8 h-8 text-primary" />
              Haftalık Liste Yönetimi
            </h1>
            <p className="text-gray-600 mt-1">
              {totalLists} liste • {activeLists} aktif • {historyLists} geçmiş
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Liste
            </Button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Toplam Liste</p>
                <p className="text-2xl font-bold text-gray-900">{totalLists}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Aktif Liste</p>
                <p className="text-2xl font-bold text-gray-900">{activeLists}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <PlayCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>



        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { key: 'all', label: 'Tümü', icon: Calendar },
                { key: 'current', label: 'Aktif', icon: PlayCircle },
                { key: 'history', label: 'Geçmiş', icon: Trophy }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tabCounts[tab.key as keyof typeof tabCounts]}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Filtreleme ve Arama */}
          <div className="p-6">
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
                  placeholder="Liste başlığı veya tema ara..."
                />
              </div>

              {/* Filtreler */}
              <div className="flex gap-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                  <option value="archived">Arşivlenmiş</option>
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
                  <option value="startDate-desc">En Yeni Tarih</option>
                  <option value="startDate-asc">En Eski Tarih</option>
                  <option value="title-asc">İsim A-Z</option>
                </select>
              </div>
            </div>

            {/* Seçilen Listeler İçin Toplu İşlemler */}
            {selectedLists.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">
                    {selectedLists.length} liste seçildi
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleBulkPublish}>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Yayınla
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkCancel}>
                      <XCircle className="w-4 h-4 mr-2" />
                      İptal Et
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sil
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Liste Kartları */}
        <div className="space-y-6">
          {sortedLists.map((list) => {
            const statusData = getStatusBadge(list.status);
            const StatusIcon = statusData.icon;
            
            return (
              <div key={list.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedLists.includes(list.id)}
                          onChange={() => handleListSelect(list.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <h3 className="text-xl font-semibold text-gray-900">{list.title}</h3>
                        <div className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border ${statusData.style}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusData.text}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{list.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDateRange(list.startDate, list.endDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedListForMovies(list.id);
                          setShowMovieModal(true);
                          fetchListMovies(list.id);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Film Ekle
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewList(list)}
                        title="Listeyi Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditList(list)}
                        title="Listeyi Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowMoreMenu(showMoreMenu === list.id ? null : list.id)}
                          title="Daha Fazla Seçenek"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        
                        {/* Dropdown Menu */}
                        {showMoreMenu === list.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleToggleListStatus(list.id, list.status);
                                  setShowMoreMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                {list.status === 'active' ? (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    İptal Et
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-4 h-4" />
                                    Yayınla
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteSingleList(list.id);
                                  setShowMoreMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Sil
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Film Listesi */}
                  {list.movies.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Film className="w-4 h-4" />
                        Filmler ({list.movies.length})
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {list.movies.map((movie) => (
                          <div key={movie.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={movie.poster ? `https://image.tmdb.org/t/p/w200${movie.poster}` : '/placeholder.svg'}
                              alt={movie.title}
                              className="w-12 h-18 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                  {movie.position}
                                </span>
                                <h5 className="font-medium text-gray-900 text-sm line-clamp-1">
                                  {movie.title}
                                </h5>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{movie.year}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs font-medium">{movie.rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Oluşturulma: {new Date(list.createdAt).toLocaleDateString('tr-TR')}</span>
                      <span>Son güncelleme: {new Date(list.updatedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {!loading && sortedLists.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Liste bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Arama kriterlerinize uygun liste bulunamadı.' : 'Henüz haftalık liste oluşturulmamış.'}
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              İlk Listeyi Oluştur
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Haftalık listeler yükleniyor...</p>
          </div>
        )}

        {/* Yeni Liste Oluşturma Modal'ı */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Yeni Haftalık Liste Oluştur</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

                             {/* Modal Content */}
               <div className="p-6">
                 <form onSubmit={handleCreateSubmit} className="space-y-6">
                   {/* Liste Başlığı */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Liste Başlığı <span className="text-red-500">*</span>
                     </label>
                     <input
                       type="text"
                       value={formData.title}
                       onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                       placeholder="Örn: Bu Haftanın Seçkileri"
                       required
                     />
                   </div>

                   {/* Açıklama */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Açıklama
                     </label>
                     <textarea
                       rows={3}
                       value={formData.description}
                       onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                       placeholder="Liste hakkında kısa açıklama..."
                     />
                   </div>

                   {/* Tema */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Tema
                     </label>
                     <input
                       type="text"
                       value={formData.theme}
                       onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                       className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                       placeholder="Örn: Dünya Sineması, Aksiyon Filmleri..."
                     />
                   </div>

                   {/* Tarih Aralığı */}
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Başlangıç Tarihi <span className="text-red-500">*</span>
                       </label>
                       <input
                         type="date"
                         value={formData.startDate}
                         onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                         required
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Bitiş Tarihi <span className="text-red-500">*</span>
                       </label>
                       <input
                         type="date"
                         value={formData.endDate}
                         onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                         className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                         required
                       />
                     </div>
                   </div>

                   {/* Butonlar */}
                   <div className="flex gap-3 pt-4 border-t border-gray-200">
                     <Button
                       type="button"
                       variant="outline"
                       onClick={() => setShowCreateModal(false)}
                       className="flex-1"
                       disabled={creating}
                     >
                       İptal
                     </Button>
                     <Button
                       type="submit"
                       variant="primary"
                       className="flex-1"
                       disabled={creating}
                     >
                       {creating ? 'Oluşturuluyor...' : 'Liste Oluştur'}
                     </Button>
                   </div>
                 </form>
               </div>
            </div>
          </div>
        )}

        {/* Sayfalama */}
        {sortedLists.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {sortedLists.length} liste gösteriliyor
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
        )}

        {/* Film Ekleme Modal'ı */}
        {showMovieModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Haftalık Listeye Film Ekle</h2>
                <button
                  onClick={() => {
                    setShowMovieModal(false);
                    setMovieSearchQuery('');
                    setSearchResults([]);
                    setSelectedListForMovies(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Film Arama */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Film Ara
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={movieSearchQuery}
                      onChange={(e) => {
                        setMovieSearchQuery(e.target.value);
                        searchMovies(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Film adı yazın..."
                      disabled={listMovies.length >= 3}
                    />
                  </div>
                  {listMovies.length >= 3 && (
                    <p className="text-red-500 text-sm mt-2">Bir haftalık listeye en fazla 3 film ekleyebilirsiniz.</p>
                  )}
                </div>

                {/* Arama Sonuçları */}
                {movieSearchQuery && listMovies.length < 3 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Arama Sonuçları</h3>
                    {loadingMovies ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-gray-600 mt-2">Filmler aranıyor...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid gap-3 max-h-60 overflow-y-auto">
                        {searchResults.map((movie: any) => (
                          <div key={movie.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <img
                              src={movie.posterPath ? `https://image.tmdb.org/t/p/w200${movie.posterPath}` : '/placeholder.svg'}
                              alt={movie.title}
                              className="w-12 h-18 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{movie.title}</h4>
                              <p className="text-sm text-gray-600">{movie.year || new Date(movie.releaseDate || '').getFullYear()}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">{movie.voteAverage?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => addMovieToList(movie.id)}
                              disabled={listMovies.length >= 3}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Ekle
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Film bulunamadı</p>
                    )}
                  </div>
                )}

                {/* Mevcut Liste Filmleri */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Listedeki Filmler ({listMovies.length})
                  </h3>
                  {listMovies.length > 0 ? (
                    <div className="grid gap-3 max-h-60 overflow-y-auto">
                      {listMovies.map((movie) => (
                        <div key={movie.id} className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <img
                            src={movie.poster ? `https://image.tmdb.org/t/p/w200${movie.poster}` : '/placeholder.svg'}
                            alt={movie.title}
                            className="w-12 h-18 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                {movie.position}
                              </span>
                              <h4 className="font-medium text-gray-900">{movie.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{movie.year}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-medium">{movie.rating?.toFixed(1) || 'N/A'}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMovieFromList(movie.movieId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Bu listede henüz film yok</p>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowMovieModal(false);
                      setMovieSearchQuery('');
                      setSearchResults([]);
                      setSelectedListForMovies(null);
                    }}
                    className="flex-1"
                  >
                    Kapat
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      alert(`${listMovies.length} film başarıyla listeye eklendi!`);
                      setShowMovieModal(false);
                      setMovieSearchQuery('');
                      setSearchResults([]);
                      setSelectedListForMovies(null);
                      fetchWeeklyLists(); // Ana listeyi yenile
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tamamla ({listMovies.length} film)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste Düzenleme Modal'ı */}
        {showEditModal && editingList && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Haftalık Liste Düzenle</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingList(null);
                    setFormData({ title: '', description: '', theme: '', startDate: '', endDate: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <form onSubmit={handleUpdateSubmit} className="space-y-6">
                  {/* Liste Başlığı */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Liste Başlığı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Örn: Bu Haftanın Seçkileri"
                      required
                    />
                  </div>

                  {/* Açıklama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                      placeholder="Liste hakkında kısa açıklama..."
                    />
                  </div>

                  {/* Tema */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tema
                    </label>
                    <input
                      type="text"
                      value={formData.theme}
                      onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Örn: Dünya Sineması, Aksiyon Filmleri..."
                    />
                  </div>

                  {/* Tarih Aralığı */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Başlangıç Tarihi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bitiş Tarihi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Butonlar */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingList(null);
                        setFormData({ title: '', description: '', theme: '', startDate: '', endDate: '' });
                      }}
                      className="flex-1"
                      disabled={creating}
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={creating}
                    >
                      {creating ? 'Güncelleniyor...' : 'Güncelle'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Liste Görüntüleme Modal'ı */}
        {showViewModal && viewingList && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{viewingList.title}</h2>
                  <p className="text-gray-600 mt-1">{viewingList.description}</p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingList(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Liste Bilgileri */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Durum</label>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border ${getStatusBadge(viewingList.status).style}`}>
                      {React.createElement(getStatusBadge(viewingList.status).icon, { className: "w-3 h-3" })}
                      {getStatusBadge(viewingList.status).text}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tarih Aralığı</label>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateRange(viewingList.startDate, viewingList.endDate)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Film Sayısı</label>
                    <p className="text-sm font-medium text-gray-900">{viewingList.movies.length} film</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Oluşturulma</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(viewingList.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                {/* Filmler */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    Listeki Filmler ({viewingList.movies.length})
                  </h3>
                  
                  {viewingList.movies.length > 0 ? (
                    <div className="grid gap-4">
                      {viewingList.movies.map((movie) => (
                        <div key={movie.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <img
                            src={movie.poster ? `https://image.tmdb.org/t/p/w200${movie.poster}` : '/placeholder.svg'}
                            alt={movie.title}
                            className="w-16 h-24 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="w-6 h-6 bg-primary text-white text-sm rounded-full flex items-center justify-center font-medium">
                                {movie.position}
                              </span>
                              <h4 className="text-lg font-semibold text-gray-900">{movie.title}</h4>
                              <span className="text-gray-600">({movie.year})</span>
                            </div>
                            <p className="text-gray-600 mb-2 line-clamp-2">{movie.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{movie.rating?.toFixed(1) || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <span>{movie.genres.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Bu listede henüz film yok</h4>
                      <p className="text-gray-600">Film eklemek için düzenleme modunu kullanın.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menü dışına tıklandığında kapat */}
        {showMoreMenu && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setShowMoreMenu(null)}
          />
        )}
      </div>
    </div>
  );
} 