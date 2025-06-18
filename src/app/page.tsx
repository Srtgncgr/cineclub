'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Star, 
  Film,
  Heart,
  MessageCircle,
  Search,
  Calendar,
  Clock,
  Users,
  Zap,
  Laugh,
  Shield,
  Heart as HeartIcon,
  Swords,
  Ghost,
  Atom,
  Drama,
  Globe,
  PlayCircle
} from 'lucide-react';
import { Movie } from '@/types/movie';
import Link from 'next/link';

const iconMap: { [key: string]: React.ElementType } = {
  Zap,
  Laugh,
  Drama,
  Atom,
  Film,
  Swords,
  HeartIcon,
  PlayCircle
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [weeklyMovies, setWeeklyMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Hydration safety - only run on client
  useEffect(() => {
    setMounted(true);

    const fetchPopularMovies = async () => {
      try {
        const response = await fetch('/api/movies/popular');
        const data = await response.json();
        setPopularMovies(data);
      } catch (error) {
        console.error('Error fetching popular movies:', error);
      }
    };

    const fetchWeeklyMovies = async () => {
      try {
        const response = await fetch('/api/movies/weekly');
        const data = await response.json();
        setWeeklyMovies(data);
      } catch (error) {
        console.error('Error fetching weekly movies:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/genres');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchPopularMovies();
    fetchWeeklyMovies();
    fetchCategories();
  }, []);

  // Placeholder film verileri
  // const popularMovies = [];

  // Bu haftanın seçilen filmleri
  /* const weeklyMovies = [
    {
      id: 1,
      title: "Parasite",
      year: 2019,
      rating: 8.6,
      votes: 2456,
      poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      genres: ["Thriller", "Drama", "Comedy"],
      director: "Bong Joon-ho",
      description: "Oscar ödüllü güney kore yapımı çarpıcı sosyal drama",
      weeklyTheme: "Uluslararası Sinema",
      position: 1,
      votes_this_week: 1847
    },
    {
      id: 2,
      title: "Spirited Away",
      year: 2001,
      rating: 9.3,
      votes: 1789,
      poster: "https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
      genres: ["Animation", "Adventure", "Family"],
      director: "Hayao Miyazaki",
      description: "Studio Ghibli'nin büyülü dünyasında unutulmaz bir yolculuk",
      weeklyTheme: "Anime Klasikleri",
      position: 2,
      votes_this_week: 1653
    },
    {
      id: 3,
      title: "There Will Be Blood",
      year: 2007,
      rating: 8.2,
      votes: 1234,
      poster: "https://m.media-amazon.com/images/M/MV5BMjAxODQ4MDU5NV5BMl5BanBnXkFtZTcwMDU4MjU1MQ@@._V1_SX300.jpg",
      genres: ["Drama"],
      director: "Paul Thomas Anderson",
      description: "Daniel Day-Lewis'in muhteşem performansıyla epik drama",
      weeklyTheme: "Karakter Odaklı Dramalar",
      position: 3,
      votes_this_week: 982
    }
  ]; */

  // Kategori verileri
  /* const categories = [
    {
      id: 1,
      name: "Aksiyon",
      icon: Zap,
      description: "Adrenalin dolu maceralar",
      movieCount: 1284,
      color: "from-red-500 to-orange-500",
      borderColor: "border-red-500/20",
      bgColor: "bg-red-500/10",
      iconColor: "text-red-500",
      popularMovies: [
        {
          title: "Mad Max: Fury Road",
          year: 2015,
          poster: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
          rating: 8.1
        },
        {
          title: "John Wick",
          year: 2014,
          poster: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
          rating: 7.4
        },
        {
          title: "The Dark Knight",
          year: 2008,
          poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
          rating: 9.0
        },
        {
          title: "Mission: Impossible - Fallout",
          year: 2018,
          poster: "https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg",
          rating: 7.7
        }
      ]
    },
    {
      id: 2,
      name: "Komedi",
      icon: Laugh,
      description: "Güldüren anlar",
      movieCount: 967,
      color: "from-yellow-500 to-orange-400",
      borderColor: "border-yellow-500/20",
      bgColor: "bg-yellow-500/10",
      iconColor: "text-yellow-600",
      popularMovies: [
        {
          title: "The Grand Budapest Hotel",
          year: 2014,
          poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
          rating: 8.1
        },
        {
          title: "Parasite",
          year: 2019,
          poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
          rating: 8.6
        },
        {
          title: "Knives Out",
          year: 2019,
          poster: "https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg",
          rating: 7.9
        },
        {
          title: "Jojo Rabbit",
          year: 2019,
          poster: "https://image.tmdb.org/t/p/w500/7GsM4mtM0worCtIVeiQt28HieeN.jpg",
          rating: 7.9
        }
      ]
    },
    {
      id: 3,
      name: "Drama",
      icon: Drama,
      description: "Derin hikayeler",
      movieCount: 2156,
      color: "from-blue-600 to-purple-600",
      borderColor: "border-blue-500/20",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600",
      popularMovies: [
        {
          title: "The Shawshank Redemption",
          year: 1994,
          poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dYHe.jpg",
          rating: 9.3
        },
        {
          title: "The Godfather",
          year: 1972,
          poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
          rating: 9.2
        },
        {
          title: "Forrest Gump",
          year: 1994,
          poster: "https://image.tmdb.org/t/p/w500/saHP97rEBECbcdDbH82vLzCVdqM.jpg",
          rating: 8.8
        },
        {
          title: "Schindler's List",
          year: 1993,
          poster: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHGqgMjYmv6Mjo2W0.jpg",
          rating: 8.6
        }
      ]
    }
  ]; */

  const [activeCategory, setActiveCategory] = useState<any>(1);

  useEffect(() => {
    // Only run after component is mounted (client-side only)
    if (!mounted) return;
    
    const video = videoRef.current;
    const heroSection = heroRef.current;
    
    if (!video || !heroSection) return;

    const handleScroll = () => {
      const rect = heroSection.getBoundingClientRect();
      const heroHeight = rect.height;
      const viewportHeight = window.innerHeight;
      
      // Video'nun daha uzun süre aktif kalması için scroll range'ini genişlet
      const scrollStart = viewportHeight;
      const scrollEnd = -(heroHeight);
      const totalScrollDistance = scrollStart - scrollEnd;
      
      // Current scroll position within the extended range
      const currentScroll = Math.max(0, Math.min(totalScrollDistance, scrollStart - rect.top));
      const scrollProgress = currentScroll / totalScrollDistance;
      
      if (video.duration && videoLoaded) {
        // Smooth video zamanı ayarlama
        const targetTime = scrollProgress * video.duration;
        
        // Daha smooth threshold
        if (Math.abs(video.currentTime - targetTime) > 0.03) {
          video.currentTime = targetTime;
        }
        
        // Ses kontrolü
        if (scrollProgress > 0.1 && scrollProgress < 0.9) {
          video.muted = false;
          video.volume = Math.min(0.3, scrollProgress * 0.5);
        } else {
          video.muted = true;
        }
      }
    };

    const handleVideoLoad = () => {
      setVideoLoaded(true);
      if (video) {
      video.muted = true;
      }
    };

    if (video) {
    video.addEventListener('loadeddata', handleVideoLoad);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (video) {
      video.removeEventListener('loadeddata', handleVideoLoad);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [videoLoaded, mounted]);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="bg-white">
        <section className="relative border-b border-gray-200 overflow-hidden min-h-[100vh] bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Yükleniyor...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white">
      
      {/* Enhanced Scroll Video Hero */}
      <section ref={heroRef} className="relative border-b border-gray-200 overflow-hidden min-h-[100vh]">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            preload="metadata"
            loop={false}
            suppressHydrationWarning={true}
          >
            <source src="/kevin-spacey-table-knock.mp4" type="video/mp4" />
            <source src="/kevin-spacey-table-knock.webm" type="video/webm" />
          </video>
          
          {/* Enhanced Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 min-h-[100vh] flex flex-col justify-center">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-6xl mx-auto">
              
              {/* Hero Content Grid */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                
                {/* Left Column - Main Content */}
                <div className="space-y-10 text-left">
                  
                  {/* Premium Badge */}
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-full text-white text-xs sm:text-sm font-medium shadow-lg">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="truncate">Türkiye'nin En Büyük Film Topluluğu</span>
                  </div>
                  
                  {/* Hero Heading */}
                  <div className="space-y-6 sm:space-y-8">
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.9] tracking-tight">
                      <span className="block">Sinema</span>
                      <span className="block text-primary">
                        Tutkunu
                      </span>
                      <span className="block">musun?</span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white leading-relaxed font-light max-w-xl drop-shadow-lg" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                      <span className="bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                        Sevdiğin filmleri keşfet, öner ve paylaş. 
                        <span className="text-primary font-medium"> Binlerce sinema severin</span> arasına katıl.
                      </span>
                    </p>
                  </div>

                  {/* CTA Section */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold hover:shadow-2xl hover:shadow-primary/25 hover:scale-105"
                      >
                        Hemen Katıl
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold hover:scale-105 bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                      >
                        Filmleri Gez
                      </Button>
                    </div>
                    
                    <p className="text-white/60 text-xs sm:text-sm">
                      ✨ Ücretsiz hesap oluştur, hemen başla
                    </p>
                  </div>
                </div>

                {/* Right Column - Empty for video focus */}
                <div className="hidden lg:block">
                  {/* Bu alan boş bırakıldı - video odağı için */}
                </div>

              </div>

              {/* Scroll Indicator */}
              <div className="text-center mt-20">
                <div className="space-y-4">
                  <p className="text-white/50 text-sm font-medium">Scroll ile videoyu kontrol et</p>
                  <div className="animate-bounce">
                    <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center mx-auto hover:border-primary/50 transition-colors">
                      <div className="w-1.5 h-4 bg-primary rounded-full mt-2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Popüler Filmler Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>En Çok Beğenilenler</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
              Popüler Filmler
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Topluluk tarafından en çok oy alan ve beğenilen filmler. 
              Sen de favori filmlerini keşfet ve oy ver!
            </p>
          </div>
          
          {/* Film Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {popularMovies.map((movie) => (
              <Link href={`/movies/${movie.id}`} key={movie.id}>
              <div
                  className="group bg-slate-50 border border-gray-200 rounded-xl overflow-hidden hover:bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col"
              >
                {/* Poster */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">{movie.rating}</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 right-3">
                      <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-105 transition-all duration-200">
                        <Heart className={`w-4 h-4 ${movie.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                  <div className="mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">
                      {movie.year}
                    </p>
                  </div>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                    {movie.genres.slice(0, 2).map((genre) => (
                      <span
                        key={genre}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
                      >
                        {genre}
                      </span>
                    ))}
                    {movie.genres.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-xs font-medium rounded-md">
                        +{movie.genres.length - 2}
                      </span>
                    )}
                  </div>
                    </div>
                    </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3 text-lg font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
            >
              Tüm Popüler Filmleri Gör
            </Button>
          </div>

        </div>
      </section>

      {/* Haftalık Liste Section */}
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Bu Hafta Özel</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
              Haftalık Film Listesi
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Her hafta topluluk tarafından seçilen özel temalar ve filmler. 
              Bu hafta <span className="text-accent font-semibold">"Dünya Sineması"</span> temasındayız!
            </p>
            
            {/* Countdown Timer */}
            <div className="inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <span className="text-xs sm:text-sm text-gray-700">Yeni hafta başlangıcına:</span>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-gray-900">
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 rounded text-primary">3</span>
                <span className="text-gray-400">:</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 rounded text-primary">14</span>
                <span className="text-gray-400">:</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 rounded text-primary">27</span>
              </div>
            </div>
          </div>
          
          {/* Weekly Movies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {weeklyMovies.map((movie, index) => (
              <div
                key={movie.id}
                className={`group relative bg-white/90 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  index === 0 
                    ? 'border-yellow-300/50 ring-1 ring-yellow-200/30' 
                    : 'border-white/30 hover:border-primary/20'
                }`}
              >
                {/* Modern Position Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-sm shadow-sm ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    'bg-gradient-to-r from-orange-400 to-orange-500'
                  }`}>
                    {movie.position}
                  </div>
                </div>

                {/* Movie Poster */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  
                  {/* Clean Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  
                  {/* Modern Theme Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-gray-900 text-xs font-semibold shadow-sm">
                      {movie.weeklyTheme}
                    </div>
                  </div>

                  {/* Clean Bottom Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white">
                      <h3 className="text-xl font-bold mb-1">{movie.title}</h3>
                      <p className="text-sm text-white/90 mb-2">{movie.year} • {movie.director}</p>
                      <p className="text-xs text-white/80 line-clamp-2 mb-3">{movie.description}</p>
                      
                      {/* Minimal Rating and Votes */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold">{movie.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/80">
                          <Users className="w-3 h-3" />
                          <span>{movie.votes_this_week} oy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clean Genres */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                variant="primary" 
                size="lg"
                className="px-8 py-3 text-lg font-semibold hover:bg-primary/90 transition-all duration-300"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Bu Hafta Oy Ver
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 text-lg font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
              >
                Geçmiş Listeler
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-gray-600">
              🗳️ Haftalık oylamaya katıl ve topluluğun seçimini etkile
            </p>
          </div>

              </div>
      </section>

      {/* Kategori Showcase Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Film className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Kategori Keşfi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
              Film Kategorileri
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Sevdiğin türlerde binlerce filmi keşfet. Her kategoride en popüler yapımlar ve 
              <span className="text-primary font-semibold"> kişiselleştirilmiş öneriler</span> seni bekliyor.
            </p>
          </div>
          
          {/* Categories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon];
              return (
              <div
                key={category.id}
                className="group relative bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
                  onMouseEnter={() => setActiveCategory(category.id)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Header Section */}
                <div className="relative z-10 p-6 sm:p-8 pb-4 sm:pb-6">
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 ${category.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          {IconComponent && <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${category.iconColor}`} />}
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-primary transition-colors duration-300">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">{category.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm">
                          <span className="text-gray-700 font-semibold">{category.movieCount.toLocaleString('tr-TR')}</span>
                          <span className="text-gray-500">film</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Movies Grid */}
                <div className="relative z-10 px-6 sm:px-8 pb-6 sm:pb-8">
                  <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    {category.popularMovies.map((movie: any, index: number) => (
                      <div key={index} className="group/movie">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden group-hover:scale-105 group/movie-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group/movie-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="text-white text-xs">
                                <div className="flex items-center gap-1 mb-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                  <span className="font-bold">{movie.rating}</span>
                                </div>
                                <p className="font-semibold truncate">{movie.title}</p>
                                <p className="text-white/70">{movie.year}</p>
                              </div>
                            </div>
                          </div>

                          {/* Quick Rating Badge */}
                          <div className="absolute top-2 left-2 opacity-100 group/movie-hover:opacity-0 transition-opacity duration-300">
                            <div className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-bold">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span>{movie.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Section */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">{category.popularMovies.length}</span> popüler film gösteriliyor
                    </div>
                    <Link href={`/movies?genre=${category.id}`}>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary hover:text-white hover:border-primary hover:scale-105 transition-all duration-300 px-3 sm:px-6 shadow-sm hover:shadow-md text-xs sm:text-sm"
                    >
                        <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Tümünü Gör</span>
                      <span className="sm:hidden">Tümü</span>
                    </Button>
                    </Link>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-bl ${category.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500 rounded-bl-full`}></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-full"></div>
              </div>
              );
            })}
          </div>

          {/* Browse All Categories */}
          <div className="text-center">
            <Link href="/movies">
            <Button 
              variant="primary" 
              size="lg"
              className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold hover:scale-105 transition-transform duration-300"
            >
                <Film className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Tüm Filmleri Keşfet
            </Button>
            </Link>
            <p className="text-xs sm:text-sm text-gray-600 mt-4">
              ✨ Binlerce film arasından favorini bul
            </p>
          </div>

              </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 sm:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          
          {/* Call to Action */}
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Sen de Topluluğumuza Katıl!
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4">
              Film severlerin en büyük buluşma noktasında yerini al. Oy ver, yorum yap, 
              film keşfet ve yeni arkadaşlar edin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                variant="primary" 
                size="lg"
                className="px-8 py-3 text-lg font-semibold hover:bg-primary/90 transition-all duration-300"
                onClick={() => window.location.href = '/register'}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Üye Ol
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 text-lg font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                onClick={() => window.location.href = '/movies'}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Film Keşfet
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* Development Link */}
      <div className="fixed bottom-4 right-4 z-40">
        <a 
          href="/test-css" 
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg"
        >
          🎨 UI Test
        </a>
      </div>

    </div>
  );
}
