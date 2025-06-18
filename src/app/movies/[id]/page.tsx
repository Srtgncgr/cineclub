'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InteractiveRating } from '@/components/ui/interactive-rating';
import { CommentList } from '@/components/ui/comment-list';
import { 
  Star, 
  Heart,
  ArrowLeft,
  Bookmark,
  User as UserIcon,
  MessageCircle,
  StarIcon as StarRating
} from 'lucide-react';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';
const TMDB_PROFILE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

interface Genre {
  id: string;
  name: string;
}

interface Person {
  id: string;
  name: string;
  profilePath?: string;
}

interface Cast {
  person: Person;
  character: string;
}

interface Crew {
  person: Person;
  job: string;
}

interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  overview: string;
  tagline?: string;
  year: number;
  runtime?: number;
  posterPath?: string;
  backdropPath?: string;
  voteAverage: number;
  voteCount: number;
  releaseDate?: string;
  popularity: number;
  imdbId?: string;
  genres: { genre: Genre }[];
  cast: Cast[];
  crew: Crew[];
  // Orijinal IMDb puanları (değişmez)
  originalVoteAverage?: number;
  originalVoteCount?: number;
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  // Next.js 15'te client component'lerde params Promise döndürüyor
  const resolvedParams = use(params);
  const { data: session } = useSession();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  // İzleme listesi ve favoriler için state'ler
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  
  // IMDb puanını statik tutmak için - bir kez set edilir, değişmez
  const [staticImdbRating, setStaticImdbRating] = useState<{ average: number; count: number } | null>(null);
  // Tamamen sabit IMDb puanı - hiç değişmez
  const [fixedImdbRating, setFixedImdbRating] = useState<{ average: number; count: number } | null>(null);

  useEffect(() => {
    fetchMovieDetails();
    fetchComments();
    checkWatchlistStatus();
    checkFavoriteStatus();
  }, [resolvedParams.id]);

  // Poster URL'ini formatla
  const formatPosterUrl = (posterPath: string | null | undefined) => {
    if (!posterPath) return '/placeholder.svg';
    if (posterPath.startsWith('http')) return posterPath; // Harici URL
    if (posterPath.startsWith('/')) return `${TMDB_IMAGE_BASE_URL}${posterPath}`; // TMDB path
    return posterPath; // Diğer durumlar
  };

  // Backdrop URL'ini formatla
  const formatBackdropUrl = (backdropPath: string | null | undefined) => {
    if (!backdropPath) return '/placeholder-backdrop.svg';
    if (backdropPath.startsWith('http')) return backdropPath; // Harici URL
    if (backdropPath.startsWith('/')) return `${TMDB_BACKDROP_BASE_URL}${backdropPath}`; // TMDB path
    return backdropPath; // Diğer durumlar
  };

  const fetchMovieDetails = async () => {
    try {
      const response = await fetch(`/api/movies/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Film bulunamadı');
      }
      const data = await response.json();
      
      // İlk yüklemede orijinal IMDb puanını kaydet (sadece bir kez)
      if (!staticImdbRating) {
        setStaticImdbRating({
          average: data.voteAverage,
          count: data.voteCount
        });
      }
      
      // Tamamen sabit puan - hiç değişmez
      if (!fixedImdbRating) {
        setFixedImdbRating({
          average: data.voteAverage,
          count: data.voteCount
        });
      }
      
      setMovie(data);
    } catch (error) {
      console.error('Error fetching movie:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlistStatus = async () => {
    try {
      const response = await fetch(`/api/watchlist/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsInWatchlist(data.isInWatchlist);
      }
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  const handleWatchlistToggle = async () => {
    if (isWatchlistLoading) return;
    
    setIsWatchlistLoading(true);
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieId: resolvedParams.id }),
      });

      if (response.ok) {
        const data = await response.json();
        // API response'una göre durumu güncelle
        if (data.action === 'added') {
          setIsInWatchlist(true);
        } else if (data.action === 'removed') {
          setIsInWatchlist(false);
        }
      } else {
        throw new Error('İzleme listesi güncellenemedi');
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (isFavoriteLoading) return;
    
    setIsFavoriteLoading(true);
    try {
      const response = await fetch(`/api/movies/${resolvedParams.id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      } else {
        throw new Error('Favoriler güncellenemedi');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/movies/${resolvedParams.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
    }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (data: { content: string; rating?: number }) => {
    try {
      const response = await fetch(`/api/movies/${resolvedParams.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Yorum eklenemedi');
      }
      
      console.log('Comment added successfully:', result);
      fetchComments(); // Yorumları yenile
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleLikeComment = async (commentId: number, action: 'like' | 'dislike') => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'İşlem başarısız');
      }
      
      console.log('Comment action successful:', result);
      fetchComments(); // Yorumları yenile
    } catch (error) {
      console.error('Error with comment action:', error);
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Yorum güncellenemedi');
      }
      
      console.log('Comment updated successfully:', result);
      fetchComments(); // Yorumları yenile
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Yorum güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Yorum silinemedi');
      }
      
      console.log('Comment deleted successfully:', result);
      fetchComments(); // Yorumları yenile
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Yorum silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleReplyToComment = async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/movies/${resolvedParams.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, parentId: commentId }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Yanıt eklenemedi');
      }
      
      console.log('Reply added successfully:', result);
      fetchComments(); // Yorumları yenile
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Yanıt eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/movies/${resolvedParams.id}/favorite`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Film yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    notFound();
  }

  const directors = movie.crew.filter(member => member.job === 'Director');

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-[60vh] min-h-[400px] md:h-[70vh] text-white">
        <div className="absolute inset-0">
          <img
            src={formatBackdropUrl(movie.backdropPath)}
            alt={`Backdrop for ${movie.title}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-backdrop.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-48 md:w-60 flex-shrink-0 -mt-8 md:-mt-16">
                  <img
                src={formatPosterUrl(movie.posterPath)}
                alt={`Poster for ${movie.title}`}
                className="w-full h-auto rounded-xl shadow-2xl border-4 border-gray-200 max-h-[350px] md:max-h-[450px] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
                </div>
            <div className="flex-grow pt-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xl font-semibold text-gray-300">{movie.year}</span>
                {movie.runtime && <span className="text-xl font-semibold text-gray-300">{movie.runtime} min</span>}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg mb-4">{movie.title}</h1>
              {directors.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-300">Yönetmen:</span>
                  <span className="font-semibold text-white">
                    {directors.map(d => d.person.name).join(', ')}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {movie.genres.map(({ genre }) => (
                  <Badge key={genre.id} variant="secondary" className="bg-white/10 text-white border-white/20">
                    {genre.name}
                  </Badge>
                  ))}
                </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={isFavorite ? "primary" : "outline"} 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={handleFavoriteToggle}
                  disabled={isFavoriteLoading}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavoriteLoading ? 'Yükleniyor...' : (isFavorite ? 'Favorilerden Çıkar' : 'Favoriye Ekle')}
                </Button>
                <Button 
                  variant={isInWatchlist ? "primary" : "outline"} 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={handleWatchlistToggle}
                  disabled={isWatchlistLoading}
                >
                  <Bookmark className={`w-5 h-5 mr-2 ${isInWatchlist ? 'fill-current' : ''}`} />
                  {isWatchlistLoading ? 'Yükleniyor...' : (isInWatchlist ? 'Listeden Çıkar' : 'İzleme Listesine Ekle')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            {/* Film Özeti */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-2xl font-bold mb-4">Özet</h2>
              {movie.tagline && <p className="text-lg italic text-gray-500 mb-4">"{movie.tagline}"</p>}
              <p className="text-base leading-relaxed text-gray-700">{movie.overview}</p>
            </div>
            
            {/* Puan Verme Bölümü */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-4">Bu filme puan verin</h2>
              <InteractiveRating 
                movieId={movie.id} 
                size="md"
              />
            </div>
            
            {/* Yorumlar Bölümü */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <CommentList 
                comments={comments}
                onAddComment={handleAddComment}
                onReplyToComment={handleReplyToComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                currentUser={session?.user ? {
                  id: session.user.id,
                  name: session.user.displayName || session.user.username || 'User',
                  avatar: session.user.avatar || "/placeholder-avatar.png"
                } : undefined}
                allowRating={true}
                showCommentForm={true}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Film Detayları */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold border-b pb-2 mb-4">Film Detayları</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Orijinal İsim</span>
                  <span className="text-gray-600 text-right">{movie.originalTitle}</span>
                      </div>
                {movie.releaseDate && 
                  <div className="flex justify-between">
                    <span className="font-semibold">Vizyon Tarihi</span>
                    <span className="text-gray-600">{new Date(movie.releaseDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                }
                <div className="flex justify-between">
                  <span className="font-semibold">Popülerlik</span>
                  <span className="text-gray-600">{movie.popularity.toFixed(2)}</span>
                    </div>
                {movie.imdbId && (
                  <div className="flex justify-between">
                    <span className="font-semibold">IMDB</span>
                    <a 
                      href={`https://www.imdb.com/title/${movie.imdbId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Sayfasına Git
                    </a>
                  </div>
                )}
                  </div>
                </div>

            {/* Oyuncular */}
            {movie.cast.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4">Oyuncular</h3>
                <div className="grid grid-cols-3 gap-2">
                  {movie.cast.slice(0, 9).map(({ person, character }) => (
                    <div key={person.id} className="text-center">
                      <div className="w-full aspect-[3/4] bg-gray-200 rounded-md mb-1 overflow-hidden">
                        {person.profilePath ? (
                          <img
                            src={`${TMDB_PROFILE_BASE_URL}${person.profilePath}`}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-gray-500" />
                </div>
              )}
                      </div>
                      <p className="font-medium text-xs truncate" title={person.name}>{person.name}</p>
                      <p className="text-[10px] text-gray-500 truncate" title={character}>{character}</p>
                        </div>
                      ))}
                    </div>
                {movie.cast.length > 9 && (
                  <div className="mt-3 text-center">
                    <Button variant="outline" size="sm" className="text-xs">
                      Tüm Oyuncuları Gör ({movie.cast.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed top-24 left-4 z-20">
        <Link href="/movies">
          <Button variant="outline" className="bg-white/80 backdrop-blur-sm pr-5">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Filmlere Dön
          </Button>
        </Link>
      </div>
    </div>
  );
} 