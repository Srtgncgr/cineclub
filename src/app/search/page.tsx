'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchInput, { useSearchInput } from '@/components/ui/search-input';
import { 
  Search,
  Filter, 
  X,
  Star,
  Calendar,
  Tag,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

const years = Array.from({ length: 50 }, (_, i) => 2024 - i);

// Search suggestions - kategoriler ve genel terimler
const searchSuggestions = [
  'Aksiyon', 'Drama', 'Komedi', 'Korku', 'Romantik', 'Bilim Kurgu',
  'Gerilim', 'Suç', 'Macera', 'Animasyon', 'Belgesel', 'Fantastik',
  '2024 filmleri', '2023 filmleri', 'En yeni filmler', 'Popüler filmler'
];

// SearchParams kullanan component
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Search state management with custom hook
  const {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches
  } = useSearchInput('', 300);

  // Dinamik kategoriler - veritabanından gelecek
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title' | 'popularity'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localMovies, setLocalMovies] = useState<any[]>([]);

  // URL'den gelen search query'yi oku ve set et
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam || '');
      // URL'den gelen aramayı recent searches'e ekle
      if (queryParam) {
        addToRecentSearches(queryParam);
      }
    }
  }, [searchParams]);

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/genres');
        const fallbackCategories = [
          'Aksiyon', 'Drama', 'Komedi', 'Korku', 'Romantik', 'Bilim Kurgu', 
          'Gerilim', 'Suç', 'Macera', 'Animasyon', 'Belgesel', 'Fantastik',
          'Tarih', 'Savaş', 'Western', 'Müzikal', 'Aile', 'Gizem', 
          'TV Film', 'Biyografi', 'Spor', 'Müzik'
        ];
        
        if (response.ok) {
          const genres = await response.json();
          const apiCategories = genres.map((g: any) => g.name);
          
          // API'den gelen kategoriler + fallback kategorileri birleştir (tekrarları kaldır)
          const allCategories = [...new Set([...apiCategories, ...fallbackCategories])];
          setCategories(allCategories.sort());
        } else {
          // API başarısızsa sadece fallback kategorileri kullan
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Genres fetch error:', error);
        // Fallback kategoriler - genişletilmiş liste
        setCategories([
          'Aksiyon', 'Drama', 'Komedi', 'Korku', 'Romantik', 'Bilim Kurgu', 
          'Gerilim', 'Suç', 'Macera', 'Animasyon', 'Belgesel', 'Fantastik',
          'Tarih', 'Savaş', 'Western', 'Müzikal', 'Aile', 'Gizem', 
          'TV Film', 'Biyografi', 'Spor', 'Müzik'
        ]);
      }
    };

    fetchCategories();
  }, []);

  // Local movies'i yükle
  useEffect(() => {
    const fetchLocalMovies = async () => {
      try {
        const response = await fetch('/api/movies');
        if (response.ok) {
          const movies = await response.json();
          // Önce filmleri director bilgisi olmadan yükle (hızlı gösterim için)
          setLocalMovies(movies.map((movie: any) => ({ ...movie, director: null })));
          
          // Sonra director bilgilerini batch halinde yükle (en fazla 5'er tane)
          const batchSize = 5;
          for (let i = 0; i < movies.length; i += batchSize) {
            const batch = movies.slice(i, i + batchSize);
            try {
              const moviesWithDirectors = await Promise.all(
                batch.map(async (movie: any) => {
                  try {
                    const movieResponse = await fetch(`/api/movies/${movie.id}`);
                    if (movieResponse.ok) {
                      const movieDetails = await movieResponse.json();
                      const directors = movieDetails.crew?.filter((member: any) => member.job === 'Director') || [];
                      return {
                        ...movie,
                        director: directors.length > 0 ? directors.map((d: any) => d.person.name).join(', ') : null
                      };
                    }
                    return { ...movie, director: null };
                  } catch (error) {
                    console.error(`Error fetching director for movie ${movie.id}:`, error);
                    return { ...movie, director: null };
                  }
                })
              );
              
              // Mevcut movies state'ini güncelle
              setLocalMovies(prev => {
                const updated = [...prev];
                moviesWithDirectors.forEach(movieWithDirector => {
                  const index = updated.findIndex(m => m.id === movieWithDirector.id);
                  if (index !== -1) {
                    updated[index] = movieWithDirector;
                  }
                });
                return updated;
              });
              
              // Batch'ler arasında kısa bir bekleme
              await new Promise(resolve => setTimeout(resolve, 200));
              
            } catch (error) {
              console.error('Batch director fetch error:', error);
            }
          }
        }
      } catch (error) {
        console.error('Local movies fetch error:', error);
      }
    };

    fetchLocalMovies();
  }, []);

  // Loading state for search
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setIsLoading(true);
      // Simulate search delay for better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  // Search handler
  const handleSearch = (query: string) => {
    if (query.trim()) {
      addToRecentSearches(query.trim());
      // URL'i güncelle ama input'u temizleme, URL'den gelecek
      router.push(`/search?q=${encodeURIComponent(query.trim())}`, { scroll: false });
    }
  };

  // Filtrelenmiş sonuçlar - sadece yerel veritabanı filmlerini kullan
  const filteredMovies = useMemo(() => {
    if (localMovies.length === 0) return [];

    // Yerel filmleri uygun formata dönüştür
    let filtered = localMovies.map(movie => {
      // Movies sayfasındaki gibi direkt voteAverage kullan
      const movieRating = movie.localVoteAverage || movie.voteAverage || 0;
      
      const movieGenres = movie.genres ? movie.genres.map((g: any) => g.genre?.name || 'Bilinmiyor') : [];
      
      return {
        id: movie.id,
        title: movie.title,
        year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Bilinmiyor',
        poster: movie.posterPath ? (movie.posterPath.startsWith('http') ? movie.posterPath : `https://image.tmdb.org/t/p/w500${movie.posterPath}`) : 'https://via.placeholder.com/200x300/f3f4f6/9ca3af?text=Film+Posteri',
        rating: movieRating,
        genres: movieGenres,
        director: movie.director || null,
        overview: movie.overview || ''
      };
    });

    // Arama filtresi - film adı, overview veya genre'de ara
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(query) ||
        movie.overview.toLowerCase().includes(query) ||
        movie.genres.some((genre: string) => genre.toLowerCase().includes(query))
      );
    }

    // Kategori filtresi
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(movie => {
        const hasMatchingGenre = movie.genres.some((genre: string) => selectedCategories.includes(genre));
        return hasMatchingGenre;
      });
    }

    // Yıl filtresi
    if (selectedYears.length > 0) {
      filtered = filtered.filter(movie => {
        const movieYear = Number(movie.year);
        return !isNaN(movieYear) && selectedYears.includes(movieYear);
      });
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          const ratingA = Number(a.rating) || 0;
          const ratingB = Number(b.rating) || 0;
          return ratingB - ratingA;
        case 'year':
          const yearA = Number(a.year) || 0;
          const yearB = Number(b.year) || 0;
          return yearB - yearA;
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'popularity':
          const popA = Number(a.rating) || 0;
          const popB = Number(b.rating) || 0;
          return popB - popA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [debouncedQuery, localMovies, selectedCategories, selectedYears, sortBy]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedYears([]);
    setSearchQuery('');
  };

  const activeFiltersCount = selectedCategories.length + selectedYears.length;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Search Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Film Arama
            </h1>
            <p className="text-lg text-gray-600">
              Binlerce film arasından favorinizi bulun
            </p>
          </div>

          {/* Main Search Bar with Debounce */}
          <div className="max-w-4xl mx-auto">
            <div className="shadow-sm rounded-xl">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Film adı, yönetmen veya oyuncu ara..."
                suggestions={searchSuggestions}
                recentSearches={recentSearches}
                size="lg"
                debounceMs={300}
              />
            </div>

            {/* Quick Search Suggestions - Updated */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-gray-600 mr-2">Popüler aramalar:</span>
              {['Aksiyon', 'Drama', 'Komedi', 'Korku', 'Gerilim', 'Romantik', 'Bilim Kurgu', 'Fantastik', 'Animasyon', 'Tarih', 'Belgesel', 'Müzikal'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    handleSearch(suggestion);
                  }}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
              
              {/* Clear Search */}
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    router.push('/search', { scroll: false });
                  }}
                  className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors ml-2"
                >
                  Aramayı temizle
                </button>
              )}
              
              {/* Clear Recent Searches */}
              {recentSearches.length > 0 && (
                <button
                  onClick={clearRecentSearches}
                  className="text-sm px-3 py-1 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors ml-2"
                >
                  Son aramaları temizle
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          
          {/* Filters Sidebar */}
          <aside className={cn(
            "w-80 bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-fit sticky top-8",
            "hidden lg:block"
          )}>
            
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filtreler
              </h2>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  Temizle ({activeFiltersCount})
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Kategoriler
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Yıl Aralığı
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <select
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (year && !selectedYears.includes(year)) {
                      setSelectedYears([...selectedYears, year]);
                    }
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Başlangıç Yılı</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (year && !selectedYears.includes(year)) {
                      setSelectedYears([...selectedYears, year]);
                    }
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Bitiş Yılı</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              {selectedYears.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedYears.map(year => (
                    <Badge
                      key={year}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSelectedYears(prev => prev.filter(y => y !== year))}
                    >
                      {year} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

          </aside>

          {/* Results Area */}
          <main className="flex-1">
            
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Arama Sonuçları
                </h2>
                <span className="text-gray-600">
                  {filteredMovies.length} film bulundu
                  {debouncedQuery && (
                    <span className="ml-2 text-primary font-medium">
                      "{debouncedQuery}" için
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtreler
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="rating">En Yüksek Puan</option>
                  <option value="year">En Yeni</option>
                  <option value="title">Alfabetik</option>
                  <option value="popularity">Popülerlik</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Aktif Filtreler:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(category => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="cursor-pointer bg-blue-100 text-blue-800"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {category} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                  {selectedYears.map(year => (
                    <Badge
                      key={year}
                      variant="secondary"
                      className="cursor-pointer bg-blue-100 text-blue-800"
                      onClick={() => setSelectedYears(prev => prev.filter(y => y !== year))}
                    >
                      {year} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && debouncedQuery.trim() && (
              <div className="text-center py-16">
                <div className="inline-flex items-center gap-2 text-primary">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg font-medium">Aranıyor...</span>
                </div>
                <p className="text-gray-600 mt-2">"{debouncedQuery}" için sonuçlar getiriliyor</p>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && filteredMovies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMovies.map((movie) => (
                  <Link href={`/movies/${movie.id}`} key={movie.id}>
                    <div
                      className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-64 object-cover bg-gray-100"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://via.placeholder.com/200x300/f3f4f6/9ca3af?text=Film+Posteri';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{movie.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {movie.year || 'Bilinmiyor'}
                        {movie.director && (
                          <>
                            {' • '}
                            <span className="text-gray-700">{movie.director}</span>
                          </>
                        )}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {movie.genres.map((genre: string) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : !isLoading && (
              // Empty State
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sonuç Bulunamadı
                </h3>
                <p className="text-gray-600 mb-4">
                  {debouncedQuery 
                    ? `"${debouncedQuery}" için sonuç bulunamadı. Farklı anahtar kelimeler deneyebilirsiniz.`
                    : 'Arama kriterlerinize uygun film bulunamadı. Farklı filtreler deneyebilirsiniz.'
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                >
                  Filtreleri Temizle
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
} 

// Ana component - Suspense ile sarmalıyor
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 text-primary">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg font-medium">Yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
 