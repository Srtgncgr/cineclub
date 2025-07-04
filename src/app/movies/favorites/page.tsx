'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Star, 
  Calendar, 
  Clock, 
  Filter,
  Search,
  X,
  HeartOff,
  Film,
  SortAsc,
  SortDesc,
  Loader2,
  Lock,
  LogIn
} from 'lucide-react';

// Favorite movie type
type FavoriteMovie = {
  id: string;
  addedDate: string;
  movie: {
    id: string;
    title: string;
    year: number | null;
    poster: string;
    rating: number;
    duration: number;
    genres: string[];
    description: string | null;
    isFavorite: boolean;
  };
};

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);

  // API'den favorileri yükle
  useEffect(() => {
    // Sadece authenticated kullanıcılar için veri çek
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
        } else {
          console.error('Failed to fetch favorites');
    }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [status]);

  const removeFromFavorites = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(favorite => favorite.id !== favoriteId));
      } else {
        console.error('Failed to remove favorite');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

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
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Favoriler İçin Giriş Yapın
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Favori filmlerinizi görmek ve yönetmek için önce giriş yapmanız gerekiyor.
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
              onClick={() => router.push('/movies')}
              className="w-full text-gray-500"
            >
              Filmleri Keşfet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Page Header */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-50 border border-red-200 rounded-full text-red-600 text-sm font-medium mb-6">
              <Heart className="w-4 h-4 fill-red-600" />
              <span>Favorilerim</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Favori Filmlerim
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Beğendiğin ve daha sonra izlemek için kaydettiğin filmlerin koleksiyonu.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4" />
                <span>{loading ? '...' : favorites.length} film</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                <span>Favori koleksiyonum</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* View Mode Toggle */}
      <section className="py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{favorites.length}</span> favori film
            </p>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Favoriler yükleniyor...</span>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <HeartOff className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Henüz favori filmin yok
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Beğendiğin filmleri favorilere ekleyerek burada kolayca bulabilirsin.
              </p>
            <a href="/movies">
              <Button variant="primary">
                Filmleri Keşfet
              </Button>
            </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                      src={favorite.movie.poster}
                      alt={favorite.movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <a href={`/movies/${favorite.movie.id}`}>
                          <Button 
                            variant="primary" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <Film className="w-4 h-4 mr-2" />
                            Detay
                          </Button>
                        </a>
                      </div>
                      <button
                      onClick={() => removeFromFavorites(favorite.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Favorilerden çıkar"
                      >
                        <HeartOff className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {favorite.movie.title}
                      </h3>
                    <p className="text-sm text-gray-500 mb-2">{favorite.movie.year}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">{favorite.movie.rating}</span>
                      <span className="text-xs text-gray-500">({favorite.movie.duration} dk)</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                      {favorite.movie.genres.slice(0, 2).map((genre: string) => (
                        <Badge key={genre} variant="secondary" className="text-xs px-2 py-1">
                            {genre}
                          </Badge>
                        ))}
                      {favorite.movie.genres.length > 2 && (
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          +{favorite.movie.genres.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          )}
      </main>
    </div>
  );
} 