'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Film, 
  MessageCircle, 
  Star, 
  Calendar,
  Activity,
  Shield,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  UserPlus,
  FileText,
  Tag,
  Play,
  Heart,
  MessageSquare
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'user_join' | 'movie_add' | 'review_add' | 'report';
  user: string;
  action: string;
  target?: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [timeRange, setTimeRange] = useState('7d');
  const [dynamicStats, setDynamicStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // API'den veri çekme
  useEffect(() => {
    // Sadece admin yetkisi varsa veri çek
    if (status !== 'authenticated' || (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'admin')) {
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        if (data.success) {
          setDynamicStats(data.stats);
        }
      } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session, status]);

  // İstatistik kartları - dinamik verilerle
  const getStatsCards = (): StatCard[] => {
    if (!dynamicStats) {
      return [
    {
      title: 'Toplam Kullanıcı',
          value: '...',
          change: '...',
          trend: 'neutral',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Toplam Film',
          value: '...',
          change: '...',
          trend: 'neutral',
      icon: Film,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Aktif Kullanıcı',
          value: '...',
          change: '...',
          trend: 'neutral',
      icon: Activity,
      color: 'from-green-500 to-emerald-500'
    },
    {
          title: 'Toplam Değerlendirme',
          value: '...',
          change: '...',
          trend: 'neutral',
          icon: Star,
      color: 'from-yellow-500 to-orange-500'
    }
  ];
    }

    return [
      {
        title: 'Toplam Kullanıcı',
        value: dynamicStats.totalUsers.value.toLocaleString('tr-TR'),
        change: dynamicStats.totalUsers.change,
        trend: dynamicStats.totalUsers.trend,
        icon: Users,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        title: 'Toplam Film',
        value: dynamicStats.totalMovies.value.toLocaleString('tr-TR'),
        change: dynamicStats.totalMovies.change,
        trend: dynamicStats.totalMovies.trend,
        icon: Film,
        color: 'from-purple-500 to-pink-500'
      },
      {
        title: 'Aktif Kullanıcı',
        value: dynamicStats.activeUsers.value.toLocaleString('tr-TR'),
        change: dynamicStats.activeUsers.change,
        trend: dynamicStats.activeUsers.trend,
        icon: Activity,
        color: 'from-green-500 to-emerald-500'
      },
      {
        title: 'Toplam Değerlendirme',
        value: dynamicStats.totalReviews.value.toLocaleString('tr-TR'),
        change: dynamicStats.totalReviews.change,
        trend: dynamicStats.totalReviews.trend,
        icon: Star,
        color: 'from-yellow-500 to-orange-500'
      }
    ];
  };

  // Hızlı eylemler
  const quickActions: QuickAction[] = [
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcıları görüntüle, düzenle veya sil',
      icon: Users,
      route: '/admin/users',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Film Yönetimi',
      description: 'Filmleri onayla, düzenle veya sil',
      icon: Film,
      route: '/admin/movies',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Kategori Yönetimi',
      description: 'Film kategorilerini yönet',
      icon: Tag,
      route: '/admin/categories',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Haftalık Liste',
      description: 'Bu haftanın filmlerini belirle',
      icon: Calendar,
      route: '/admin/weekly-list',
      color: 'from-red-500 to-pink-500'
    }
  ];

  // Son aktiviteler
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'user_join',
      user: 'Ahmet Yılmaz',
      action: 'platforma katıldı',
      timestamp: '5 dakika önce',
      status: 'success'
    },
    {
      id: '2',
      type: 'movie_add',
      user: 'Elif Demir',
      action: 'yeni film önerdi',
      target: 'Dune: Part Two',
      timestamp: '12 dakika önce',
      status: 'warning'
    },
    {
      id: '3',
      type: 'review_add',
      user: 'Mehmet Kaya',
      action: 'film değerlendirdi',
      target: 'Inception',
      timestamp: '18 dakika önce',
      status: 'success'
    },
    {
      id: '4',
      type: 'report',
      user: 'Ayşe Özkan',
      action: 'içerik şikayet etti',
      target: 'Yorum #1247',
      timestamp: '25 dakika önce',
      status: 'error'
    },
    {
      id: '5',
      type: 'user_join',
      user: 'Can Yalçın',
      action: 'platforma katıldı',
      timestamp: '32 dakika önce',
      status: 'success'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_join': return UserPlus;
      case 'movie_add': return Film;
      case 'review_add': return Star;
      case 'report': return AlertTriangle;
      default: return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleQuickAction = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              CineClub yönetim paneline hoş geldiniz
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="24h">Son 24 Saat</option>
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
              <option value="90d">Son 3 Ay</option>
            </select>
            
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Ayarlar
            </Button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getStatsCards().map((stat: StatCard, index: number) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`w-4 h-4 ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500">bu hafta</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Ana Eylemler */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Hızlı Eylemler
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => handleQuickAction(action.route)}
                      className="p-5 border border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


          </div>

          {/* Son Aktiviteler */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Son Aktiviteler
              </h2>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.action}
                          {activity.target && (
                            <span className="font-medium text-primary"> {activity.target}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                <Eye className="w-4 h-4 mr-2" />
                Tüm Aktiviteleri Görüntüle
              </Button>
            </div>

            {/* Haftalık Özet */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Bu Hafta
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Yeni üyeler</span>
                  <span className="font-semibold">+47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Film eklemeleri</span>
                  <span className="font-semibold">+12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Değerlendirmeler</span>
                  <span className="font-semibold">+234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Mesajlar</span>
                  <span className="font-semibold">+1,456</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-primary bg-white hover:bg-gray-50">
                <FileText className="w-4 h-4 mr-2" />
                Detaylı Rapor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 