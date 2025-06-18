'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchInput, { useSearchInput } from '@/components/ui/search-input';
import { 
  Search,
  Filter, 
  SlidersHorizontal,
  Grid3X3,
  List,
  Calendar,
  Star,
  Tag,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data - normalde backend'den gelecek
const categories = [
  'Aksiyon', 'Drama', 'Komedi', 'Korku', 'Romantik', 'Bilim Kurgu', 
  'Gerilim', 'Suç', 'Macera', 'Animasyon', 'Belgesel', 'Fantastik'
];

const years = Array.from({ length: 50 }, (_, i) => 2024 - i);

const mockMovies = [
  {
    id: 1,
    title: "Fight Club",
    year: 1999,
    rating: 8.8,
    poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    genres: ["Drama", "Gerilim"],
    director: "David Fincher"
  },
  {
    id: 2,
    title: "The Godfather",
    year: 1972,
    rating: 9.2,
    poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    genres: ["Suç", "Drama"],
    director: "Francis Ford Coppola"
  },
  {
    id: 3,
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    genres: ["Aksiyon", "Suç", "Drama"],
    director: "Christopher Nolan"
  },
  {
    id: 4,
    title: "Pulp Fiction",
    year: 1994,
    rating: 8.9,
    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    genres: ["Suç", "Drama"],
    director: "Quentin Tarantino"
  },
  {
    id: 5,
    title: "Inception",
    year: 2010,
    rating: 8.7,
    poster: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
    genres: ["Aksiyon", "Bilim Kurgu", "Gerilim"],
    director: "Christopher Nolan"
  },
  {
    id: 6,
    title: "Forrest Gump",
    year: 1994,
    rating: 8.8,
    poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    genres: ["Drama", "Romantik", "Komedi"],
    director: "Robert Zemeckis"
  },
  {
    id: 7,
    title: "The Shawshank Redemption",
    year: 1994,
    rating: 9.3,
    poster: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflyCy3FpPiy3BXg.jpg",
    genres: ["Drama", "Suç"],
    director: "Frank Darabont"
  },
  {
    id: 8,
    title: "Interstellar",
    year: 2014,
    rating: 8.6,
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    genres: ["Bilim Kurgu", "Drama", "Macera"],
    director: "Christopher Nolan"
  },
  {
    id: 9,
    title: "Goodfellas",
    year: 1990,
    rating: 8.7,
    poster: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    genres: ["Suç", "Drama"],
    director: "Martin Scorsese"
  },
  {
    id: 10,
    title: "The Matrix",
    year: 1999,
    rating: 8.7,
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    genres: ["Aksiyon", "Bilim Kurgu"],
    director: "Lana Wachowski"
  },
  {
    id: 11,
    title: "Parasite",
    year: 2019,
    rating: 8.5,
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    genres: ["Komedi", "Drama", "Gerilim"],
    director: "Bong Joon-ho"
  },
  {
    id: 12,
    title: "Spirited Away",
    year: 2001,
    rating: 9.3,
    poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    genres: ["Animasyon", "Macera", "Fantastik"],
    director: "Hayao Miyazaki"
  }
];

// Search suggestions - kategoriler ve genel terimler
const searchSuggestions = [
  'Aksiyon', 'Drama', 'Komedi', 'Korku', 'Romantik', 'Bilim Kurgu',
  'Gerilim', 'Suç', 'Macera', 'Animasyon', 'Belgesel', 'Fantastik',
  '2024 filmleri', '2023 filmleri', 'En yeni filmler', 'Popüler filmler'
];

export default function SearchPage() {
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

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title' | 'popularity'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  // Local movies'i yükle
  useEffect(() => {
    const fetchLocalMovies = async () => {
      try {
        const response = await fetch('/api/movies');
        if (response.ok) {
          const movies = await response.json();
          setLocalMovies(movies);
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
      console.log('Searching for:', query);
    }
  };

  // Filtrelenmiş sonuçlar - sadece yerel veritabanı filmlerini kullan
  const filteredMovies = useMemo(() => {
    if (localMovies.length === 0) return [];

    // Yerel filmleri uygun formata dönüştür
    let filtered = localMovies.map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Bilinmiyor',
      poster: movie.posterPath ? (movie.posterPath.startsWith('http') ? movie.posterPath : `https://image.tmdb.org/t/p/w500${movie.posterPath}`) : 'https://via.placeholder.com/200x300/f3f4f6/9ca3af?text=Film+Posteri',
      rating: movie.votes && movie.votes.length > 0 
        ? Number((movie.votes.reduce((sum: number, vote: any) => sum + (Number(vote.value) || 0), 0) / movie.votes.length).toFixed(1))
        : 0,
      genres: movie.categories ? movie.categories.map((cat: any) => cat.category?.name || 'Bilinmiyor') : [],
      director: 'Bilinmiyor', // Local movies'de director bilgisi yok
      overview: movie.overview || '' // Arama için overview da dahil edilebilir
    }));

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
      filtered = filtered.filter(movie =>
        movie.genres.some((genre: string) => selectedCategories.includes(genre))
      );
    }

    // Yıl filtresi
    if (selectedYears.length > 0) {
      filtered = filtered.filter(movie => {
        const movieYear = Number(movie.year);
        return !isNaN(movieYear) && selectedYears.includes(movieYear);
      });
    }

    // Rating filtresi
    if (minRating > 0) {
      filtered = filtered.filter(movie => {
        const movieRating = Number(movie.rating);
        return !isNaN(movieRating) && movieRating >= minRating;
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
  }, [debouncedQuery, localMovies, selectedCategories, selectedYears, minRating, sortBy]);

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
    setMinRating(0);
    setSearchQuery('');
  };

  const activeFiltersCount = selectedCategories.length + selectedYears.length + (minRating > 0 ? 1 : 0);

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
              {['Aksiyon', 'Drama', 'Komedi', 'Korku'].map((suggestion) => (
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

            {/* Rating Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Minimum Puan
              </h3>
              <div className="space-y-2">
                {[9, 8, 7, 6, 5].map((rating) => (
                  <label
                    key={rating}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === rating}
                      onChange={() => setMinRating(rating)}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary/20"
                    />
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-700">{rating}+ ve üzeri</span>
                    </div>
                  </label>
                ))}
                
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === 0}
                    onChange={() => setMinRating(0)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary/20"
                  />
                  <span className="text-sm text-gray-700">Tüm puanlar</span>
                </label>
              </div>
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

                {/* View Mode Toggle */}
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
                  {minRating > 0 && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer bg-blue-100 text-blue-800"
                      onClick={() => setMinRating(0)}
                    >
                      {minRating}+ puan <X className="w-3 h-3 ml-1" />
                    </Badge>
                  )}
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

            {/* Results Grid/List */}
            {!isLoading && filteredMovies.length > 0 ? (
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              )}>
                {filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className={cn(
                      'bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
                      viewMode === 'list' && 'flex gap-4 p-4'
                    )}
                    onClick={() => router.push(`/movies/${movie.id}`)}
                  >
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className={cn(
                        'object-cover bg-gray-100',
                        viewMode === 'grid' 
                          ? 'w-full h-64' 
                          : 'w-20 h-28 rounded-lg flex-shrink-0'
                      )}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://via.placeholder.com/200x300/f3f4f6/9ca3af?text=Film+Posteri';
                      }}
                    />
                    <div className={cn(
                      viewMode === 'grid' ? 'p-4' : 'flex-1'
                    )}>
                      <h3 className="font-semibold text-gray-900 mb-1">{movie.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{movie.year || 'Bilinmiyor'} • {movie.director}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{movie.rating || 0}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {movie.genres.map((genre: string) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
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
 