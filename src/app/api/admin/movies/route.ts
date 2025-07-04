import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Filmleri çek
    const movies = await prisma.movie.findMany({
      include: {
        genres: {
          include: {
            genre: true
          }
        },
        crew: {
          include: {
            person: true
          },
          where: {
            job: 'Director'
          },
          take: 1
        },
        cast: {
          include: {
            person: true
          },
          take: 5
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Poster URL'ini frontend için formatla
    const formatPosterUrl = (path: string | null) => {
      if (!path) return '/placeholder.svg';
      if (path.startsWith('http')) return path; // Harici URL
      if (path.startsWith('/')) return `https://image.tmdb.org/t/p/w500${path}`; // TMDB path
      return path; // Diğer durumlar
    };

    const formatBackdropUrl = (path: string | null) => {
      if (!path) return '';
      if (path.startsWith('http')) return path; // Harici URL
      if (path.startsWith('/')) return `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${path}`; // TMDB path
      return path; // Diğer durumlar
    };

    // Frontend'in beklediği formata dönüştür
    const formattedMovies = movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      originalTitle: movie.originalTitle || movie.title,
      year: movie.year,
      duration: movie.runtime,
      poster: formatPosterUrl(movie.posterPath),
      backdrop: formatBackdropUrl(movie.backdropPath),
      genres: movie.genres.map(g => g.genre.name),
      director: movie.crew.length > 0 ? movie.crew[0].person.name : 'Bilinmiyor',
      cast: movie.cast.map(c => c.person.name),
      rating: movie.voteAverage,
      voteCount: movie.voteCount,
      description: movie.overview,
      tmdbId: movie.tmdbId,
      language: 'tr', // Varsayılan
      country: 'Turkey', // Varsayılan
      budget: 0, // Şimdilik
      revenue: 0, // Şimdilik
      createdAt: movie.createdAt.toISOString(),
      updatedAt: movie.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      movies: formattedMovies,
      total: formattedMovies.length
    });

  } catch (error) {
    console.error('Admin movies API error:', error);
    return NextResponse.json(
      { error: 'Filmler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

 
