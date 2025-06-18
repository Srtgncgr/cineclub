'use client';

import React, { useState } from 'react';
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
  Vote,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlayCircle,
  Trophy,
  Target,
  Activity,
  Zap
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
  voteCount: number;
  position: number;
  addedBy: {
    name: string;
    id: string;
  };
  addedAt: string;
}

interface WeeklyList {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  movies: WeeklyListMovie[];
  totalVotes: number;
  participantCount: number;
  isPublished: boolean;
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
  const [activeTab, setActiveTab] = useState<'all' | 'current' | 'draft' | 'history'>('all');

  // Demo haftalık liste verileri
  const weeklyLists: WeeklyList[] = [
    {
      id: '1',
      title: 'Bu Haftanın Filmleri',
      description: 'Ocak 2024 - 3. Hafta',
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      status: 'active',
      movies: [
        {
          id: '1',
          movieId: 'movie1',
          title: 'Dune: Part Two',
          year: 2024,
          poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
          director: 'Denis Villeneuve',
          genres: ['Sci-Fi', 'Adventure'],
          description: 'Paul Atreides, Fremen kabilesi ile bir araya gelerek intikam peşindedir.',
          rating: 8.7,
          voteCount: 1234,
          position: 1,
          addedBy: { name: 'Admin', id: 'admin1' },
          addedAt: '2024-01-14'
        },
        {
          id: '2',
          movieId: 'movie2',
          title: 'Oppenheimer',
          year: 2023,
          poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
          director: 'Christopher Nolan',
          genres: ['Biography', 'Drama'],
          description: 'J. Robert Oppenheimer\'ın atom bombasını geliştirirkenki hikayesi.',
          rating: 8.4,
          voteCount: 987,
          position: 2,
          addedBy: { name: 'Admin', id: 'admin1' },
          addedAt: '2024-01-14'
        },
        {
          id: '3',
          movieId: 'movie3',
          title: 'Barbie',
          year: 2023,
          poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
          director: 'Greta Gerwig',
          genres: ['Comedy', 'Adventure'],
          description: 'Barbie ve Ken\'in renkli dünyalarından gerçek dünyaya yolculukları.',
          rating: 7.1,
          voteCount: 756,
          position: 3,
          addedBy: { name: 'Admin', id: 'admin1' },
          addedAt: '2024-01-14'
        }
      ],
      totalVotes: 3456,
      participantCount: 1234,
      isPublished: true,
      theme: 'Yılın En İyileri',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      title: 'Gelecek Hafta Taslağı',
      description: 'Ocak 2024 - 4. Hafta',
      startDate: '2024-01-22',
      endDate: '2024-01-28',
      status: 'draft',
      movies: [
        {
          id: '4',
          movieId: 'movie4',
          title: 'Kış Uykusu',
          year: 2014,
          poster: 'https://image.tmdb.org/t/p/w500/sBCu4vGfPv7LLrjEgLqHVjPmTOB.jpg',
          director: 'Nuri Bilge Ceylan',
          genres: ['Drama'],
          description: 'Kapadokya\'da yaşayan aydın bir adamın karısı ve kardeşiyle olan ilişkileri.',
          rating: 8.1,
          voteCount: 145,
          position: 1,
          addedBy: { name: 'Moderatör', id: 'mod1' },
          addedAt: '2024-01-19'
        }
      ],
      totalVotes: 0,
      participantCount: 0,
      isPublished: false,
      theme: 'Türk Sineması Özel',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-20'
    },
    {
      id: '3',
      title: 'Geçen Hafta',
      description: 'Ocak 2024 - 2. Hafta',
      startDate: '2024-01-08',
      endDate: '2024-01-14',
      status: 'completed',
      movies: [
        {
          id: '5',
          movieId: 'movie5',
          title: 'The Godfather',
          year: 1972,
          poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
          director: 'Francis Ford Coppola',
          genres: ['Crime', 'Drama'],
          description: 'İtalyan mafya ailesinin hikayesi.',
          rating: 9.2,
          voteCount: 2345,
          position: 1,
          addedBy: { name: 'Admin', id: 'admin1' },
          addedAt: '2024-01-07'
        }
      ],
      totalVotes: 5678,
      participantCount: 2345,
      isPublished: true,
      theme: 'Klasik Filmler',
      createdAt: '2024-01-07',
      updatedAt: '2024-01-14'
    }
  ];

  const filteredLists = weeklyLists.filter(list => {
    const matchesSearch = 
      list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.theme && list.theme.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || list.status === selectedStatus;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'current' && list.status === 'active') ||
      (activeTab === 'draft' && list.status === 'draft') ||
      (activeTab === 'history' && (list.status === 'completed' || list.status === 'cancelled'));
    
    return matchesSearch && matchesStatus && matchesTab;
  });

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

  const totalLists = weeklyLists.length;
  const activeLists = weeklyLists.filter(l => l.status === 'active').length;
  const draftLists = weeklyLists.filter(l => l.status === 'draft').length;
  const totalVotes = weeklyLists.reduce((sum, list) => sum + list.totalVotes, 0);

  const tabCounts = {
    all: totalLists,
    current: activeLists,
    draft: draftLists,
    history: weeklyLists.filter(l => l.status === 'completed' || l.status === 'cancelled').length
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
              {totalLists} liste • {activeLists} aktif • {draftLists} taslak
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              Geçmiş Sonuçlar
            </Button>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Liste
            </Button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Toplam Oy</p>
                <p className="text-2xl font-bold text-gray-900">{totalVotes.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Vote className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Taslak Liste</p>
                <p className="text-2xl font-bold text-gray-900">{draftLists}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                <Edit className="w-6 h-6 text-white" />
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
                { key: 'draft', label: 'Taslak', icon: Edit },
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
                  <option value="draft">Taslak</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
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
                  <option value="totalVotes-desc">En Çok Oy</option>
                  <option value="participantCount-desc">En Çok Katılım</option>
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
                    <Button variant="outline" size="sm">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Yayınla
                    </Button>
                    <Button variant="outline" size="sm">
                      <XCircle className="w-4 h-4 mr-2" />
                      İptal Et
                    </Button>
                    <Button variant="outline" size="sm">
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
                        {list.theme && (
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {list.theme}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Vote className="w-4 h-4" />
                          {list.totalVotes.toLocaleString()} oy
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {list.participantCount.toLocaleString()} katılımcı
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
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
                              src={movie.poster}
                              alt={movie.title}
                              className="w-12 h-18 object-cover rounded"
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
                              <p className="text-xs text-gray-600 mb-1">{movie.director} • {movie.year}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs font-medium">{movie.rating}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Vote className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{movie.voteCount}</span>
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
        {sortedLists.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Liste bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Arama kriterlerinize uygun liste bulunamadı.' : 'Henüz haftalık liste oluşturulmamış.'}
            </p>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              İlk Listeyi Oluştur
            </Button>
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
      </div>
    </div>
  );
} 