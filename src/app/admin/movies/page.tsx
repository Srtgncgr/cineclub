'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Search, 
  Plus,
  Film,
  Star,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  X
} from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  year: number;
  duration: number;
  poster: string;
  backdrop: string;
  genres: string[];
  director: string;
  cast: string[];
  rating: number;
  voteCount: number;
  description: string;
  tmdbId?: number;
  language: string;
  country: string;
  budget: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

interface AddMovieForm {
  title: string;
  originalTitle: string;
  year: number;
  duration: number;
  poster: string;
  backdrop: string;
  genres: string[];
  director: string;
  cast: string[];
  rating: number;
  description: string;
  tmdbId?: number;
}

export default function MoviesManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [addingMovie, setAddingMovie] = useState(false);
  const [updatingMovie, setUpdatingMovie] = useState(false);
  // Sayfalama state'leri
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Sayfa başına film sayısı
  const [addMovieForm, setAddMovieForm] = useState<AddMovieForm>({
    title: '',
    originalTitle: '',
    year: new Date().getFullYear(),
    duration: 0,
    poster: '',
    backdrop: '',
    genres: [],
    director: '',
    cast: [],
    rating: 0,
    description: '',
    tmdbId: undefined
  });
  const [editMovieForm, setEditMovieForm] = useState<AddMovieForm>({
    title: '',
    originalTitle: '',
    year: new Date().getFullYear(),
    duration: 0,
    poster: '',
    backdrop: '',
    genres: [],
    director: '',
    cast: [],
    rating: 0,
    description: '',
    tmdbId: undefined
  });

  const genres = ['Aksiyon', 'Drama', 'Komedi', 'Korku', 'Sci-Fi', 'Romantik', 'Gerilim', 'Suç', 'Belgesel', 'Animasyon'];

  // Filmleri yükle
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/movies');
      if (response.ok) {
        const data = await response.json();
        setMovies(data.movies || []);
      }
    } catch (error) {
      console.error('Film yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async () => {
    console.log('🎬 Film ekleme başladı');
    console.log('📝 Form verisi:', addMovieForm);
    
    if (!addMovieForm.title || !addMovieForm.director) {
      console.log('❌ Eksik alanlar');
      alert('Film adı ve yönetmen alanları zorunludur');
      return;
    }

    // Boş oyuncu isimlerini filtrele
    const filteredCast = addMovieForm.cast.filter(actor => actor.trim() !== '');
    const formDataWithFilteredCast = {
      ...addMovieForm,
      cast: filteredCast
    };

    try {
      setAddingMovie(true);
      console.log('📡 API çağrısı yapılıyor...');
      const response = await fetch('/api/admin/movies/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataWithFilteredCast),
      });

      console.log('📡 API yanıtı:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('📄 Ham response:', responseText);

      if (response.ok) {
        const newMovie = JSON.parse(responseText);
        console.log('✅ Film başarıyla eklendi:', newMovie);
        setMovies(prev => [newMovie.movie, ...prev]);
        setShowAddModal(false);
        setAddMovieForm({
          title: '',
          originalTitle: '',
          year: new Date().getFullYear(),
          duration: 0,
          poster: '',
          backdrop: '',
          genres: [],
          director: '',
          cast: [],
          rating: 0,
          description: '',
          tmdbId: undefined
        });
        alert('Film başarıyla eklendi');
      } else {
        try {
          const error = JSON.parse(responseText);
          console.log('❌ API hatası:', error);
          alert(error.error || 'Film eklenirken hata oluştu');
        } catch (parseError) {
          console.log('❌ JSON parse hatası:', parseError);
          console.log('❌ Ham hata response:', responseText);
          alert('Film eklenirken hata oluştu');
        }
      }
    } catch (error) {
      console.error('💥 Frontend film ekleme hatası:', error);
      alert('Film eklenirken hata oluştu');
    } finally {
      setAddingMovie(false);
    }
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setEditMovieForm({
      title: movie.title,
      originalTitle: movie.originalTitle,
      year: movie.year,
      duration: movie.duration,
      poster: movie.poster.replace('https://image.tmdb.org/t/p/w500', ''),
      backdrop: movie.backdrop.replace('https://image.tmdb.org/t/p/w1920_and_h800_multi_faces', ''),
      genres: movie.genres,
      director: movie.director,
      cast: movie.cast,
      rating: movie.rating,
      description: movie.description,
      tmdbId: movie.tmdbId
    });
    setShowEditModal(true);
  };

  const handleUpdateMovie = async () => {
    console.log('🔄 Film güncelleme başladı');
    console.log('📝 Güncelleme form verisi:', editMovieForm);
    console.log('🎬 Güncellenecek film:', editingMovie);
    
    if (!editMovieForm.title || !editMovieForm.director || !editingMovie) {
      console.log('❌ Eksik alanlar veya film seçilmemiş');
      alert('Film adı ve yönetmen alanları zorunludur');
      return;
    }

    // Boş oyuncu isimlerini filtrele
    const filteredCast = editMovieForm.cast.filter(actor => actor.trim() !== '');
    const formDataWithFilteredCast = {
      ...editMovieForm,
      cast: filteredCast
    };

    try {
      setUpdatingMovie(true);
      console.log('📡 Güncelleme API çağrısı yapılıyor...');
      const response = await fetch(`/api/admin/movies/${editingMovie.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataWithFilteredCast),
      });

      console.log('📡 Güncelleme API yanıtı:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('📄 Ham güncelleme response:', responseText);

      if (response.ok) {
        const updatedMovie = JSON.parse(responseText);
        console.log('✅ Film başarıyla güncellendi:', updatedMovie);
        setMovies(prev => prev.map(movie => 
          movie.id === editingMovie.id ? updatedMovie.movie : movie
        ));
        setShowEditModal(false);
        setEditingMovie(null);
        alert('Film başarıyla güncellendi');
      } else {
        try {
          const error = JSON.parse(responseText);
          console.log('❌ Güncelleme API hatası:', error);
          alert(error.error || 'Film güncellenirken hata oluştu');
        } catch (parseError) {
          console.log('❌ Güncelleme JSON parse hatası:', parseError);
          console.log('❌ Ham güncelleme hata response:', responseText);
          alert('Film güncellenirken hata oluştu');
        }
      }
    } catch (error) {
      console.error('💥 Frontend film güncelleme hatası:', error);
      alert('Film güncellenirken hata oluştu');
    } finally {
      setUpdatingMovie(false);
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Bu filmi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMovies(prev => prev.filter(movie => movie.id !== movieId));
        setSelectedMovies(prev => prev.filter(id => id !== movieId));
        alert('Film başarıyla silindi');
      } else {
        alert('Film silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Film silme hatası:', error);
      alert('Film silinirken hata oluştu');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMovies.length === 0) return;
    if (!confirm(`${selectedMovies.length} filmi silmek istediğinizden emin misiniz?`)) return;

    try {
      const response = await fetch('/api/admin/movies/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieIds: selectedMovies }),
      });

      if (response.ok) {
        setMovies(prev => prev.filter(movie => !selectedMovies.includes(movie.id)));
        setSelectedMovies([]);
        alert('Seçilen filmler başarıyla silindi');
      } else {
        alert('Filmler silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Toplu silme hatası:', error);
      alert('Filmler silinirken hata oluştu');
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.cast.some(actor => actor.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = selectedGenre === 'all' || movie.genres.some(g => g === selectedGenre);
    
    return matchesSearch && matchesGenre;
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Movie];
    let bValue: any = b[sortBy as keyof Movie];
    
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(sortedMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMovies = sortedMovies.slice(startIndex, endIndex);

  // Sayfa değişikliklerinde currentPage'i sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre, sortBy, sortOrder]);

  const handleMovieSelect = (movieId: string) => {
    setSelectedMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMovies.length === sortedMovies.length) {
      setSelectedMovies([]);
    } else {
      setSelectedMovies(sortedMovies.map(movie => movie.id));
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'Süre belirtilmemiş';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}s ${mins}dk`;
  };

  const handleGenreToggle = (genre: string, isEdit = false) => {
    const form = isEdit ? editMovieForm : addMovieForm;
    const setForm = isEdit ? setEditMovieForm : setAddMovieForm;
    
    setForm(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };



  // Sayfalama fonksiyonları
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-gray-600">Filmler yükleniyor...</span>
        </div>
      </div>
    );
  }

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
              <Film className="w-8 h-8 text-primary" />
              Film Yönetimi
            </h1>
            <p className="text-gray-600 mt-1">
              Toplam {movies.length} film • Manuel film ekleme ve silme
            </p>
          </div>

          <div className="flex items-center gap-3">
              <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Film Ekle
            </Button>
          </div>
        </div>

        {/* Filtreleme ve Arama */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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
                placeholder="Film adı, yönetmen veya oyuncu ara..."
              />
            </div>

            {/* Filtreler */}
            <div className="flex gap-4">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tüm Türler</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
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
                <option value="createdAt-desc">En Yeni Eklenen</option>
                <option value="createdAt-asc">En Eski Eklenen</option>
                <option value="title-asc">İsim A-Z</option>
                <option value="title-desc">İsim Z-A</option>
                <option value="rating-desc">En Yüksek Puan</option>
                <option value="year-desc">En Yeni Çıkan</option>
              </select>
            </div>
          </div>

          {/* Seçilen Filmler İçin Toplu İşlemler */}
          {selectedMovies.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-red-700 font-medium">
                  {selectedMovies.length} film seçildi
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Seçilenleri Sil
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Film Listesi */}
        {sortedMovies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || selectedGenre !== 'all' ? 'Film bulunamadı' : 'Henüz film eklenmemiş'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedGenre !== 'all' 
                ? 'Arama kriterlerinize uygun film bulunamadı. Filtreleri temizleyip tekrar deneyin.'
                : 'İlk filminizi ekleyerek başlayın.'
              }
            </p>
            {(!searchQuery && selectedGenre === 'all') && (
              <Button 
                variant="primary"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                İlk Filmi Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedMovies.length === sortedMovies.length && sortedMovies.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Film
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Yönetmen
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Puan
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Eklenme Tarihi
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedMovies.map((movie) => (
                      <tr key={movie.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedMovies.includes(movie.id)}
                            onChange={() => handleMovieSelect(movie.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-12 h-18 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                              />
                            {movie.tmdbId && movie.tmdbId > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                  <ExternalLink className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{movie.title}</p>
                              {movie.originalTitle && movie.originalTitle !== movie.title && (
                                <p className="text-sm text-gray-500 italic">{movie.originalTitle}</p>
                              )}
                              <p className="text-sm text-gray-600">{movie.year} • {formatDuration(movie.duration)}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {movie.genres.slice(0, 2).map(genre => (
                                  <span key={genre} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                    {genre}
                                  </span>
                                ))}
                                {movie.genres.length > 2 && (
                                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                    +{movie.genres.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-900">
                          {movie.director}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">
                            {movie.rating > 0 ? movie.rating.toFixed(1) : 'Henüz puanlanmamış'}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({movie.voteCount > 0 ? movie.voteCount : 'Henüz oy yok'})
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(movie.createdAt).toLocaleDateString('tr-TR')}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleEditMovie(movie)}
                            title="Filmi Düzenle"
                          >
                              <Edit className="w-4 h-4" />
                            </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteMovie(movie.id)}
                            title="Filmi Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sayfalama */}
        {sortedMovies.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Toplam {sortedMovies.length} filmden {startIndex + 1}-{Math.min(endIndex, sortedMovies.length)} arası gösteriliyor
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                
                {/* Sayfa numaraları */}
                <div className="flex items-center gap-1">
                  {totalPages <= 7 ? (
                    // 7 veya daha az sayfa varsa hepsini göster
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))
                  ) : (
                    // Çok sayfa varsa akıllı sayfalama
                    <>
                      {currentPage > 3 && (
                        <>
                          <button
                            onClick={() => goToPage(1)}
                            className="px-3 py-1 text-sm rounded-lg text-gray-600 hover:bg-gray-100"
                          >
                  1
                          </button>
                          {currentPage > 4 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                        </>
                      )}
                      
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          return page;
                        }
                      ).map(page => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => goToPage(totalPages)}
                            className="px-3 py-1 text-sm rounded-lg text-gray-600 hover:bg-gray-100"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Film Ekleme Modal'ı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header - Sabit */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-xl font-semibold">Yeni Film Ekle</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="p-1"
                >
                  <X className="w-5 h-5" />
                </Button>
                      </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Film Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Film Adı *
                  </label>
                  <input
                    type="text"
                    value={addMovieForm.title}
                    onChange={(e) => setAddMovieForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Film adını girin"
                  />
                    </div>

                {/* Orijinal Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orijinal Adı
                  </label>
                  <input
                    type="text"
                    value={addMovieForm.originalTitle}
                    onChange={(e) => setAddMovieForm(prev => ({ ...prev, originalTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Orijinal film adı"
                  />
                      </div>

                {/* Yıl ve Süre */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yıl
                    </label>
                      <input
                      type="number"
                      value={addMovieForm.year}
                      onChange={(e) => setAddMovieForm(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="1900"
                      max="2030"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Süre (dakika)
                    </label>
                    <input
                      type="number"
                      value={addMovieForm.duration}
                      onChange={(e) => setAddMovieForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                      />
                    </div>
                  </div>

                {/* Yönetmen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yönetmen *
                  </label>
                  <input
                    type="text"
                    value={addMovieForm.director}
                    onChange={(e) => setAddMovieForm(prev => ({ ...prev, director: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Yönetmen adı"
                  />
                </div>

                {/* Oyuncular */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oyuncular
                  </label>
                  <div className="space-y-2">
                    {addMovieForm.cast.map((actor, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={actor}
                          onChange={(e) => {
                            const newCast = [...addMovieForm.cast];
                            newCast[index] = e.target.value;
                            setAddMovieForm(prev => ({ ...prev, cast: newCast }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={`${index + 1}. oyuncu adı`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCast = addMovieForm.cast.filter((_, i) => i !== index);
                            setAddMovieForm(prev => ({ ...prev, cast: newCast }));
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {addMovieForm.cast.length === 0 && (
                      <p className="text-sm text-gray-500 italic">Henüz oyuncu eklenmemiş</p>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAddMovieForm(prev => ({ ...prev, cast: [...prev.cast, ''] }));
                      }}
                      className="w-full text-primary border-primary hover:bg-primary hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Oyuncu Ekle
                    </Button>
                  </div>
                </div>

                {/* Türler */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Türler
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre, false)}
                        className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                          addMovieForm.genres.includes(genre)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                          {genre}
                      </button>
                      ))}
                  </div>
                    </div>

                {/* Puan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puan (0-10)
                  </label>
                  <input
                    type="number"
                    value={addMovieForm.rating}
                    onChange={(e) => setAddMovieForm(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>

                {/* Poster ve Backdrop URL'leri */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poster URL
                    </label>
                    <input
                      type="url"
                      value={addMovieForm.poster}
                      onChange={(e) => setAddMovieForm(prev => ({ ...prev, poster: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://example.com/poster.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backdrop URL
                    </label>
                    <input
                      type="url"
                      value={addMovieForm.backdrop}
                      onChange={(e) => setAddMovieForm(prev => ({ ...prev, backdrop: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://example.com/backdrop.jpg"
                    />
                  </div>
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={addMovieForm.description}
                    onChange={(e) => setAddMovieForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Film açıklaması"
                  />
                </div>
                </div>
              </div>

            {/* Footer - Sabit */}
            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                  disabled={addingMovie}
                >
                  İptal
                        </Button>
                <Button 
                  variant="primary"
                  onClick={handleAddMovie}
                  className="flex-1"
                  disabled={addingMovie}
                >
                  {addingMovie ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ekleniyor...
                    </>
                  ) : (
                    'Film Ekle'
                  )}
                        </Button>
                    </div>
                  </div>
          </div>
        )}

      {/* Film Düzenleme Modal'ı */}
      {showEditModal && editingMovie && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header - Sabit */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-xl font-semibold">Film Düzenle</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMovie(null);
                  }}
                  className="p-1"
                >
                  <X className="w-5 h-5" />
              </Button>
              </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Film Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Film Adı *
                  </label>
                  <input
                    type="text"
                    value={editMovieForm.title}
                    onChange={(e) => setEditMovieForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Film adını girin"
                  />
                </div>

                {/* Orijinal Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orijinal Adı
                  </label>
                  <input
                    type="text"
                    value={editMovieForm.originalTitle}
                    onChange={(e) => setEditMovieForm(prev => ({ ...prev, originalTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Orijinal film adı"
                  />
                </div>

                {/* Yıl ve Süre */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yıl
                    </label>
                    <input
                      type="number"
                      value={editMovieForm.year}
                      onChange={(e) => setEditMovieForm(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="1900"
                      max="2030"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Süre (dakika)
                    </label>
                    <input
                      type="number"
                      value={editMovieForm.duration}
                      onChange={(e) => setEditMovieForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>

                {/* Yönetmen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yönetmen *
                  </label>
                  <input
                    type="text"
                    value={editMovieForm.director}
                    onChange={(e) => setEditMovieForm(prev => ({ ...prev, director: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Yönetmen adı"
                  />
                </div>

                {/* Oyuncular */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oyuncular
                  </label>
                  <div className="space-y-2">
                    {editMovieForm.cast.map((actor, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={actor}
                          onChange={(e) => {
                            const newCast = [...editMovieForm.cast];
                            newCast[index] = e.target.value;
                            setEditMovieForm(prev => ({ ...prev, cast: newCast }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={`${index + 1}. oyuncu adı`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCast = editMovieForm.cast.filter((_, i) => i !== index);
                            setEditMovieForm(prev => ({ ...prev, cast: newCast }));
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {editMovieForm.cast.length === 0 && (
                      <p className="text-sm text-gray-500 italic">Henüz oyuncu eklenmemiş</p>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditMovieForm(prev => ({ ...prev, cast: [...prev.cast, ''] }));
                      }}
                      className="w-full text-primary border-primary hover:bg-primary hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Oyuncu Ekle
                    </Button>
                  </div>
                </div>

                {/* Türler */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Türler
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre, true)}
                        className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                          editMovieForm.genres.includes(genre)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Puan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puan (0-10)
                  </label>
                  <input
                    type="number"
                    value={editMovieForm.rating}
                    onChange={(e) => setEditMovieForm(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>

                {/* Poster ve Backdrop URL'leri */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poster URL
                    </label>
                    <input
                      type="url"
                      value={editMovieForm.poster}
                      onChange={(e) => setEditMovieForm(prev => ({ ...prev, poster: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://example.com/poster.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backdrop URL
                    </label>
                    <input
                      type="url"
                      value={editMovieForm.backdrop}
                      onChange={(e) => setEditMovieForm(prev => ({ ...prev, backdrop: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://example.com/backdrop.jpg"
                    />
                  </div>
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={editMovieForm.description}
                    onChange={(e) => setEditMovieForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Film açıklaması"
                  />
                </div>
                </div>
              </div>

            {/* Footer - Sabit */}
            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMovie(null);
                  }}
                  className="flex-1"
                  disabled={updatingMovie}
                >
                  İptal
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleUpdateMovie}
                  className="flex-1"
                  disabled={updatingMovie}
                >
                  {updatingMovie ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Güncelleniyor...
                    </>
                  ) : (
                    'Güncelle'
                  )}
              </Button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
} 