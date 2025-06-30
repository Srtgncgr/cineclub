'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings, 
  Star, 
  Heart, 
  HeartOff,
  Film, 
  Calendar,
  TrendingUp,
  Award,
  Users,
  MessageCircle,
  ChevronRight,
  Clock,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  joinDate: string;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

interface UserStats {
  moviesRated: number;
  averageRating: number;
  favoriteMovies: number;
  listsCreated: number;
  followers: number;
  following: number;
  totalWatchTime: string;
  topGenre: string;
}

interface MonthlyStats {
  moviesRated: number;
  favoriteMovies: number;
  watchTime: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');

  // Poster URL'ini güvenli şekilde formatla
  const formatPosterUrl = (posterPath: string | null | undefined): string => {
    if (!posterPath) return '/placeholder.svg';
    
    // API'den gelen fallback'leri kontrol et
    if (posterPath === '/placeholder.png' || posterPath === '/placeholder.svg') {
      return '/placeholder.svg';
    }
    
    if (posterPath.startsWith('http')) return posterPath; // Zaten tam URL
    if (posterPath.startsWith('/')) return `https://image.tmdb.org/t/p/w500${posterPath}`; // TMDB path
    return `/placeholder.svg`; // Fallback
  };

  // Tarih formatlamayı güvenli şekilde yap (hydration sorununu önlemek için)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [favoriteMovies, setFavoriteMovies] = useState<any[]>([]);
  const [recentRatings, setRecentRatings] = useState<any[]>([]);
  const [allFavoriteMovies, setAllFavoriteMovies] = useState<any[]>([]);
  const [allRecentRatings, setAllRecentRatings] = useState<any[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<any[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Kapsamlı profil verilerini al
        const profileResponse = await fetch(`/api/users/${session.user.id}/profile`);
        
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.message || errorData.error || 'Profil bilgileri alınamadı');
        }

        const profileData = await profileResponse.json();
        
        if (!profileData.success) {
          throw new Error(profileData.error || 'Profil bilgileri alınamadı');
        }

        const userProfile: UserProfile = {
          id: profileData.user.id,
          name: profileData.user.name,
          username: profileData.user.username,
          email: session.user.email || '',
          bio: profileData.user.bio,
          joinDate: profileData.user.joinDate,
          isFollowing: false,
          isOwnProfile: profileData.user.isOwnProfile
        };

        setUser(userProfile);

        // Gerçek istatistikleri set et
        const realStats: UserStats = {
          moviesRated: profileData.stats.moviesRated,
          averageRating: profileData.stats.averageRating,
          favoriteMovies: profileData.stats.favoriteMovies,
          listsCreated: profileData.stats.listsCreated,
          followers: profileData.stats.followers,
          following: profileData.stats.following,
          totalWatchTime: profileData.stats.totalWatchTime,
          topGenre: profileData.stats.topGenre
        };

        setStats(realStats);

        // Bu ay istatistiklerini set et
        setMonthlyStats({
          moviesRated: profileData.thisMonth.moviesRated,
          favoriteMovies: profileData.thisMonth.favoriteMovies,
          watchTime: profileData.thisMonth.watchTime
        });

        // Genel bakış için sınırlı veri (ilk 6 favori, ilk 5 oylama)
        setFavoriteMovies((profileData.favoriteMovies || []).slice(0, 6));
        setRecentRatings((profileData.recentRatings || []).slice(0, 5));
        
        // Tüm veriler için ayrı state'ler (tab'larda kullanmak için)
        setAllFavoriteMovies(profileData.favoriteMovies || []);
        setAllRecentRatings(profileData.recentRatings || []);

      } catch (err) {
        console.error('Profil yükleme hatası:', err);
        setError(err instanceof Error ? err.message : 'Profil yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [session, status, router]);

  const fetchWatchlist = async () => {
    if (!session?.user?.id) return;
    
    try {
      setWatchlistLoading(true);
      const response = await fetch('/api/watchlist');
      
      if (response.ok) {
        const data = await response.json();
        const formattedWatchlist = data.map((item: any) => ({
          id: item.movie.id,
          title: item.movie.title,
          year: item.movie.year || (item.movie.releaseDate ? new Date(item.movie.releaseDate).getFullYear() : 'Bilinmiyor'),
          poster: formatPosterUrl(item.movie.posterPath),
          dateAdded: item.createdAt,
          watched: item.watched,
          genres: item.movie.genres?.map((genreItem: any) => genreItem.genre.name) || []
        }));
        setWatchlistMovies(formattedWatchlist);
      }
    } catch (error) {
      console.error('İzleme listesi yükleme hatası:', error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (movieId: string) => {
    try {
      const response = await fetch(`/api/movies/${movieId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // API response'ını kontrol et, favorilerden çıkarıldı mı?
        if (!data.isFavorite) {
          // Favorilerden çıkarılan filmi state'lerden kaldır
          setFavoriteMovies(prev => prev.filter(movie => movie.id !== movieId));
          setAllFavoriteMovies(prev => prev.filter(movie => movie.id !== movieId));
          
          // İstatistikleri güncelle
          if (stats) {
            setStats(prev => prev ? {
              ...prev,
              favoriteMovies: prev.favoriteMovies - 1
            } : null);
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Favorilerden çıkarma hatası:', errorData);
        alert('Film favorilerden çıkarılamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Favorilerden çıkarma hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: User },
    { id: 'favorites', label: 'Favoriler', icon: Heart },
    { id: 'ratings', label: 'Oylamalar', icon: Star },
    { id: 'lists', label: 'İzleme Listem', icon: Film }
  ];

  // Tab değiştiğinde izleme listesini yükle
  useEffect(() => {
    if (activeTab === 'lists' && session?.user?.id) {
      fetchWatchlist();
    }
  }, [activeTab, session?.user?.id]);

  // Sayfa focus olduğunda verileri yenile (film detayından dönüldüğünde)
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === 'lists' && session?.user?.id) {
        fetchWatchlist();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeTab, session?.user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bir Hata Oluştu
          </h3>
          <p className="text-gray-600 mb-6">
            {error || 'Profil bilgileri yüklenemedi'}
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
      
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            
            {/* Left - Profile Info */}
                <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mb-3">@{user.username}</p>
              
              {user.bio && (
                <p className="text-gray-700 mb-4 max-w-lg">
                  {user.bio}
                </p>
              )}
                      
              <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(user.joinDate).getFullYear()} yılında katıldı
                  </span>
                          </div>
                      </div>
                    </div>

            {/* Right - Action Buttons */}
            <div className="flex items-center gap-3">
                      {user.isOwnProfile ? (
                          <Button 
                  variant="primary"
                  size="sm"
                            onClick={() => router.push('/profile/edit')}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Düzenle
                          </Button>
                      ) : (
                        <>
                  <Button variant={user.isFollowing ? "outline" : "primary"} size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            {user.isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                          </Button>
                  <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Mesaj
                          </Button>
                        </>
                      )}
              </div>
            </div>

            {/* Stats Row */}
          {stats && (
            <div className="flex flex-wrap items-center gap-8 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-gray-900">{stats.moviesRated}</div>
                <div className="text-sm text-gray-600">Film Oyladı</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-gray-900">{stats.averageRating}</div>
                <div className="text-sm text-gray-600">Ort. Puan</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-gray-900">{stats.favoriteMovies}</div>
                <div className="text-sm text-gray-600">Favori</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm p-1">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          </div>
        </div>

        {/* Tab Content */}
      <div className="container mx-auto px-4 mt-8 pb-12">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Ana İçerik */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Favori Filmler */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Favori Filmler
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('favorites')}
                  >
                    Tümünü Gör
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                    </div>
                
                {favoriteMovies.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Henüz favori film yok
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Beğendiğiniz filmleri favorilerinize ekleyin.
                    </p>
                    <Button variant="primary" onClick={() => router.push('/movies')}>
                      <Film className="w-4 h-4 mr-2" />
                      Filmleri Keşfet
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {favoriteMovies.slice(0, 6).map((movie) => (
                      <div key={movie.id} className="group cursor-pointer">
                        <div className="relative overflow-hidden rounded-lg">
                          <img
                            src={formatPosterUrl(movie.poster)}
                            alt={movie.title}
                            className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <div className="flex items-center gap-1 bg-black/80 text-white px-2 py-1 rounded text-xs">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {movie.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
                        <div className="mt-2">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{movie.title}</h4>
                          <p className="text-gray-600 text-xs">{movie.year}</p>
                    </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Son Oylamalar */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Son Oylamalar
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('ratings')}
                  >
                    Tümünü Gör
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                {recentRatings.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Henüz film oylaması yok
                    </h3>
                    <p className="text-gray-600 mb-6">
                      İzlediğiniz filmleri oylayın ve düşüncelerinizi paylaşın.
                    </p>
                    <Button variant="primary" onClick={() => router.push('/movies')}>
                      <Star className="w-4 h-4 mr-2" />
                      Film Oylamaya Başla
                    </Button>
                  </div>
                ) : (
                <div className="space-y-4">
                    {recentRatings.map((rating) => (
                      <div key={rating.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={formatPosterUrl(rating.poster)}
                        alt={rating.title}
                          className="w-16 h-24 object-cover rounded"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = '/placeholder.svg';
                          }}
                      />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{rating.title} ({rating.year})</h4>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-medium">{rating.rating}/10</span>
                        </div>
                          </div>
                        {rating.review && (
                            <p className="text-gray-700 text-sm mb-2">{rating.review}</p>
                        )}
                          <p className="text-gray-500 text-xs">{formatDate(rating.dateRated)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>

            {/* Yan Çubuk */}
            <div className="space-y-6">
              
              {/* Bu Ay */}
              {monthlyStats && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu Ay</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Verilen Oy</span>
                    </div>
                        <span className="font-semibold text-gray-900">{monthlyStats.moviesRated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">Favoriye Eklenen</span>
                    </div>
                        <span className="font-semibold text-gray-900">{monthlyStats.favoriteMovies}</span>
                      </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Favori Filmler</h2>
            {allFavoriteMovies.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz favori film eklenmemiş
                </h3>
                <p className="text-gray-600">
                  Beğendiğiniz filmleri favorilerinize ekleyin.
                </p>
              </div>
            ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {allFavoriteMovies.map((movie) => (
                  <div key={movie.id} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={formatPosterUrl(movie.poster)}
                      alt={movie.title}
                        className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-200"
                        onClick={() => router.push(`/movies/${movie.id}`)}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/placeholder.svg';
                        }}
                    />
                      
                      {/* Rating Badge */}
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1 bg-black/80 text-white px-2 py-1 rounded text-xs">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {movie.rating.toFixed(1)}
                        </div>
                      </div>

                      {/* Hover Overlay - Butona engel olmayacak şekilde */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                      {/* Favoriden Çıkar Butonu */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleRemoveFromFavorites(movie.id);
                          }}
                          className="p-1.5 bg-white/90 hover:bg-red-500 border border-gray-200 hover:border-red-500 text-red-500 hover:text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm"
                          title="Favorilerden çıkar"
                        >
                          <HeartOff className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{movie.title}</h4>
                      <p className="text-gray-600 text-xs">{movie.year}</p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(movie.dateAdded)} tarihinde eklendi
                      </p>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Film Oylamalarım</h2>
            {allRecentRatings.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz film oylaması yapılmamış
                </h3>
                <p className="text-gray-600">
                  İzlediğiniz filmleri oylayın ve düşüncelerinizi paylaşın.
                </p>
              </div>
            ) : (
            <div className="space-y-6">
                {allRecentRatings.map((rating) => (
                  <div key={rating.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <img
                    src={formatPosterUrl(rating.poster)}
                    alt={rating.title}
                      className="w-20 h-30 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/placeholder.svg';
                      }}
                  />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{rating.title} ({rating.year})</h4>
                      <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{rating.rating}/5</span>
                        </div>
                      </div>
                      {rating.review && (
                        <p className="text-gray-700 text-sm mb-2">{rating.review}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {rating.genres?.slice(0, 3).map((genre: string) => (
                          <span key={genre} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {genre}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-500 text-xs">
                        {formatDate(rating.dateRated)} tarihinde oylandı
                      </p>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {activeTab === 'lists' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">İzleme Listem</h2>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={fetchWatchlist}
                  disabled={watchlistLoading}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Yenile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/watchlist')}
                  className="flex items-center gap-2"
                >
                  <Film className="w-4 h-4" />
                  Tümünü Gör
                </Button>
              </div>
            </div>
            {watchlistLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">İzleme listesi yükleniyor...</p>
              </div>
            ) : watchlistMovies.length === 0 ? (
              <div className="text-center py-12">
                <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz izleme listesi oluşturulmamış
                </h3>
                <p className="text-gray-600 mb-6">
                  İzlemek istediğiniz filmleri listenize ekleyin.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="primary" onClick={() => router.push('/movies')}>
                    <Film className="w-4 h-4 mr-2" />
                    Film Keşfet
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/watchlist')}>
                    İzleme Listesine Git
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-6">
                  {watchlistMovies.map((movie) => (
                    <div key={movie.id} className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={formatPosterUrl(movie.poster)}
                          alt={movie.title}
                          className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-200"
                          onClick={() => router.push(`/movies/${movie.id}`)}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = '/placeholder.svg';
                          }}
                        />
                        {movie.watched && (
                          <div className="absolute top-2 left-2">
                            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                              İzlendi
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{movie.title}</h4>
                        <p className="text-gray-600 text-xs">{movie.year}</p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(movie.dateAdded)} tarihinde eklendi
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 