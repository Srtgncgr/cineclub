'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Film, 
  Star, 
  Calendar,
  Activity,
  Shield,
  Settings,
  BarChart3,
  TrendingUp
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
      console.log('Admin yetki kontrolü:', { status, role: session?.user?.role });
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        console.log('İstatistik API çağrısı yapılıyor...');
        const response = await fetch('/api/admin/stats');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (data.success) {
          setDynamicStats(data.stats);
          console.log('İstatistikler başarıyla yüklendi:', data.stats);
        } else {
          console.error('API başarısız response döndü:', data);
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
      title: 'Haftalık Liste',
      description: 'Bu haftanın filmlerini belirle',
      icon: Calendar,
      route: '/admin/weekly-list',
      color: 'from-red-500 to-pink-500'
    }
  ];



  const handleQuickAction = (route: string) => {
    router.push(route);
  };



  // Giriş yapmamış kullanıcılar için
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Yetki kontrolü yapılıyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h1>
          <p className="text-gray-600 mb-4">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
          <Button onClick={() => router.push('/login')}>
            Giriş Yap
          </Button>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yetkisiz Erişim</h1>
          <p className="text-gray-600 mb-4">Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.</p>
          <p className="text-sm text-gray-500 mb-4">
            Mevcut role: {session?.user?.role || 'Bilinmiyor'} | Status: {status}
          </p>
          <Button onClick={() => router.push('/')}>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

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

        {/* Hızlı Eylemler */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Hızlı Eylemler
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div
                  key={index}
                  onClick={() => handleQuickAction(action.route)}
                  className="p-4 border border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group bg-white"
                >
                  <div className="text-center">
                    <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-all duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 