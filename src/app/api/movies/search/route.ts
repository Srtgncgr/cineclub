import { NextRequest, NextResponse } from 'next/server';

// GET /api/movies/search - Film arama
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Arama sorgusu gerekli' }, { status: 400 });
    }

    // TMDB API anahtarını kontrol et
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey) {
      console.error('TMDB API key not found');
      // Fallback: Mock data döndür
      return getFallbackMovies(query);
    }

    // TMDB API'den film ara
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}&language=tr-TR&page=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!tmdbResponse.ok) {
      throw new Error('TMDB API hatası');
    }

    const tmdbData = await tmdbResponse.json();

    // TMDB verilerini dönüştür
    const movies = tmdbData.results.slice(0, 10).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Bilinmiyor',
      poster: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` 
        : '/placeholder-movie.png',
      rating: movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : 0,
      genres: [] // Genre bilgisi ayrı API çağrısı gerektirir
    }));

    return NextResponse.json({
      success: true,
      movies
    });

  } catch (error) {
    console.error('Movie search error:', error);
    
    // Hata durumunda fallback data döndür
    const query = request.nextUrl.searchParams.get('q') || '';
    return getFallbackMovies(query);
  }
}

// Fallback mock data function
function getFallbackMovies(query: string) {
  const mockMovies = [
    {
      id: 1,
      title: "The Shawshank Redemption",
      year: 1994,
      poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_QL75_UX190_CR0,0,190,281_.jpg",
      rating: 9.3,
      genres: ["Drama", "Crime"]
    },
    {
      id: 2,
      title: "The Godfather",
      year: 1972,
      poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzIwMjExOTQ@._V1_QL75_UX190_CR0,0,190,281_.jpg",
      rating: 9.2,
      genres: ["Crime", "Drama"]
    },
    {
      id: 3,
      title: "The Dark Knight",
      year: 2008,
      poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX190_CR0,0,190,281_.jpg",
      rating: 9.0,
      genres: ["Action", "Crime", "Drama"]
    },
    {
      id: 4,
      title: "Pulp Fiction",
      year: 1994,
      poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_QL75_UX190_CR0,0,190,281_.jpg",
      rating: 8.9,
      genres: ["Crime", "Drama"]
    },
    {
      id: 5,
      title: "Forrest Gump",
      year: 1994,
      poster: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_QL75_UX190_CR0,0,190,281_.jpg",
      rating: 8.8,
      genres: ["Drama", "Romance"]
    }
  ];

  // Basit arama filtresi
  const filtered = mockMovies.filter(movie => 
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json({
    success: true,
    movies: filtered,
    isFallback: true
  });
} 
