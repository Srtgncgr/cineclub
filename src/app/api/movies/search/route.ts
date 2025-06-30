import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/movies/search - Film arama
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Arama sorgusu gerekli' }, { status: 400 });
    }

    console.log('Searching movies for query:', query);

    // Önce veritabanındaki filmleri ara
    const dbMovies = await prisma.movie.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { originalTitle: { contains: query } }
        ]
      },
      take: 10,
      include: {
        genres: {
          include: {
            genre: true
          }
        }
      }
    });

    console.log('Found DB movies:', dbMovies.length);

    if (dbMovies.length > 0) {
      const movies = dbMovies.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        year: movie.year || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null),
        releaseDate: movie.releaseDate ? movie.releaseDate.toISOString().split('T')[0] : null,
        posterPath: movie.posterPath,
        voteAverage: movie.voteAverage || 0,
        overview: movie.overview || '',
        genres: movie.genres.map((g: any) => g.genre.name)
      }));
      
      console.log('Returning DB movies:', movies);
      return NextResponse.json(movies);
    }

    // Eğer veritabanında bulunamazsa TMDB API'yi dene
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey) {
      console.log('TMDB API key not found, using fallback');
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
      id: movie.id.toString(),
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
      voteAverage: movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : 0,
      overview: movie.overview || '',
      genres: []
    }));

    return NextResponse.json(movies);

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
      id: "1",
      title: "The Shawshank Redemption",
      year: 1994,
      releaseDate: "1994-09-23",
      posterPath: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      voteAverage: 9.3,
      overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.",
      genres: ["Drama", "Crime"]
    },
    {
      id: "2",
      title: "The Godfather",
      year: 1972,
      releaseDate: "1972-03-14",
      posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      voteAverage: 9.2,
      overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
      genres: ["Crime", "Drama"]
    },
    {
      id: "3",
      title: "The Dark Knight",
      year: 2008,
      releaseDate: "2008-07-16",
      posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      voteAverage: 9.0,
      overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
      genres: ["Action", "Crime", "Drama"]
    },
    {
      id: "6",
      title: "Batman Begins",
      year: 2005,
      releaseDate: "2005-06-15",
      posterPath: "/dr6x4GyyegBWtinPBzipY02J2lV.jpg",
      voteAverage: 8.2,
      overview: "Driven by tragedy, billionaire Bruce Wayne dedicates his life to uncovering and defeating the corruption that plagues his home, Gotham City.",
      genres: ["Action", "Crime"]
    },
    {
      id: "7",
      title: "Inception",
      year: 2010,
      releaseDate: "2010-07-16",
      posterPath: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      voteAverage: 8.8,
      overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.",
      genres: ["Action", "Science Fiction", "Adventure"]
    },
    {
      id: "4",
      title: "Pulp Fiction",
      year: 1994,
      releaseDate: "1994-09-10",
      posterPath: "/dM2w364MScsjFf8pfMbaWUcWrR.jpg",
      voteAverage: 8.9,
      overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
      genres: ["Crime", "Drama"]
    },
    {
      id: "5",
      title: "Forrest Gump",
      year: 1994,
      releaseDate: "1994-06-23",
      posterPath: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      voteAverage: 8.8,
      overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do.",
      genres: ["Drama", "Romance"]
    }
  ];

  // Basit arama filtresi
  const filtered = mockMovies.filter(movie => 
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json(filtered);
} 
