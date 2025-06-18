'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Star, 
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Grid3X3,
  List,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchlistItem {
  id: string;
  watched: boolean;
  createdAt: string;
  watchedAt?: string;
  movie: {
    id: string;
    title: string;
    posterPath?: string;
    releaseDate?: string;
    overview?: string;
    genres: Array<{
      genre: {
        name: string;
      }
    }>;
    votes: Array<{
      value: number;
    }>;
  };
}

export default function WatchlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'unwatched' | 'watched'>('all');

  // Auth kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Watchlist'i yükle
  useEffect(() => {
    if (session?.user) {
      fetchWatchlist();
    }
  }, [session]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/watchlist');
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data);
      } else {
        console.error('Failed to fetch watchlist');
      }
    } catch (error) {
      console.error('Watchlist fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieId }),
      });

      if (response.ok) {
        // Watchlist'i yeniden yükle
        fetchWatchlist();
      }
    } catch (error) {
      console.error('Remove from watchlist error:', error);
    }
  };

  const markAsWatched = async (movieId: string, watched: boolean) => {
    try {
      const response = await fetch(`/api/watchlist/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ watched }),
      });

      if (response.ok) {
        fetchWatchlist();
      }
    } catch (error) {
      console.error('Mark as watched error:', error);
    }
  };

  // Filtrelenmiş watchlist
  const filteredWatchlist = watchlist.filter(item => {
    if (filter === 'watched') return item.watched;
    if (filter === 'unwatched') return !item.watched;
    return true;
  });

  const getPosterUrl = (posterPath?: string) => {
    if (!posterPath) return 'https://via.placeholder.com/200x300/f3f4f6/9ca3af?text=Film+Posteri';
    if (posterPath.startsWith('http')) return posterPath;
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const getMovieRating = (votes: Array<{ value: number }>) => {
    if (!votes || votes.length === 0) return 0;
    const average = votes.reduce((sum, vote) => sum + (vote.value || 0), 0) / votes.length;
    const result = Number(average.toFixed(1));
    return isNaN(result) ? 0 : result;
  };

  const getMovieYear = (releaseDate?: string) => {
    if (!releaseDate) return 'Bilinmiyor';
    const year = new Date(releaseDate).getFullYear();
    return isNaN(year) ? 'Bilinmiyor' : year.toString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Bilinmiyor';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Bilinmiyor';
      return date.toLocaleDateString('tr-TR');
    } catch {
      return 'Bilinmiyor';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">İzleme listesi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                İzleme Listem
              </h1>
              <p className="text-lg text-gray-600">
                İzlemek istediğiniz ve izlediğiniz filmler
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{watchlist.length}</div>
                <div className="text-sm text-gray-600">Toplam Film</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{watchlist.filter(item => item.watched).length}</div>
                <div className="text-sm text-gray-600">İzlenen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{watchlist.filter(item => !item.watched).length}</div>
                <div className="text-sm text-gray-600">İzlenecek</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  filter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                Tümü ({watchlist.length})
              </button>
              <button
                onClick={() => setFilter('unwatched')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200',
                  filter === 'unwatched' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                İzlenecek ({watchlist.filter(item => !item.watched).length})
              </button>
              <button
                onClick={() => setFilter('watched')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200',
                  filter === 'watched' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                İzlenen ({watchlist.filter(item => item.watched).length})
              </button>
            </div>
          </div>

          {/* View Mode */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Watchlist Grid/List */}
        {filteredWatchlist.length > 0 ? (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}>
            {filteredWatchlist.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200',
                  viewMode === 'list' && 'flex gap-4 p-4',
                  item.watched 
                    ? 'border-gray-300 bg-gray-50/30' 
                    : 'border-gray-200'
                )}
              >
                <div className="relative">
                  <img
                    src={getPosterUrl(item.movie.posterPath)}
                    alt={item.movie.title}
                    className={cn(
                      'object-cover bg-gray-100 cursor-pointer transition-all duration-200',
                      viewMode === 'grid' 
                        ? 'w-full h-64' 
                        : 'w-20 h-28 rounded-lg flex-shrink-0',
                      item.watched && 'opacity-60 grayscale'
                    )}
                    onClick={() => router.push(`/movies/${item.movie.id}`)}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = 'https://via.placeholder.com/200x300/f3f4f6/9ca3af?text=Film+Posteri';
                    }}
                  />
                  
                  {/* Subtle Watched Badge */}
                  {item.watched && (
                    <div className="absolute bottom-2 left-2">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded text-xs font-medium shadow-sm border border-gray-200">
                        İzlendi
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={cn(
                  'flex-1',
                  viewMode === 'grid' ? 'p-4' : ''
                )}>
                  <h3 
                    className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-primary"
                    onClick={() => router.push(`/movies/${item.movie.id}`)}
                  >
                    {item.movie.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-600 text-sm">
                      {getMovieYear(item.movie.releaseDate)}
                      </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{getMovieRating(item.movie.votes || [])}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.movie.genres?.slice(0, 2).map((genreItem, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {genreItem.genre.name}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                                         <Button
                       size="sm"
                      variant={item.watched ? "secondary" : "primary"}
                       onClick={() => markAsWatched(item.movie.id, !item.watched)}
                      className={cn(
                        "flex-1 transition-all duration-200",
                        item.watched 
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300" 
                          : "bg-primary hover:bg-primary-700 text-white"
                      )}
                     >
                      {item.watched ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {item.watched ? 'İzlenmedi İşaretle' : 'İzlendi İşaretle'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromWatchlist(item.movie.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Date Info */}
                  <div className="mt-2 text-xs text-gray-500">
                    <div>Eklenme: {formatDate(item.createdAt)}</div>
                    {item.watchedAt && (
                      <div>İzlenme: {formatDate(item.watchedAt)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' && 'İzleme listesinde film yok'}
              {filter === 'watched' && 'Henüz izlenen film yok'}
              {filter === 'unwatched' && 'İzlenecek film yok'}
            </h3>
            <p className="text-gray-600 mb-4">
              Film detay sayfalarından "İzleme Listesine Ekle" butonunu kullanarak filmler ekleyebilirsiniz.
            </p>
            <Button
              onClick={() => router.push('/search')}
            >
              Film Ara
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 