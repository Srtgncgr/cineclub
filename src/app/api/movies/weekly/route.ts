import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Aktif durumda olan haftalık listeyi bul
    const activeWeeklyList = await prisma.weeklyList.findFirst({
      where: {
        status: 'ACTIVE'
      },
      include: {
        movies: {
          include: {
            movie: {
              include: {
                genres: {
                  include: {
                    genre: true
                  }
                }
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    // Eğer aktif liste yoksa boş dizi döndür
    if (!activeWeeklyList || activeWeeklyList.movies.length === 0) {
      return NextResponse.json([]);
    }

    // Ana sayfa için uygun formata dönüştür
    const weeklyMovies = activeWeeklyList.movies.map((item: any, index: number) => ({
      id: item.movie.id,
      title: item.movie.title,
      year: item.movie.year || (item.movie.releaseDate ? new Date(item.movie.releaseDate).getFullYear() : 0),
      rating: item.movie.voteAverage || 0,
      votes: item.movie.voteCount || 0,
      poster: item.movie.posterPath ? `https://image.tmdb.org/t/p/w500${item.movie.posterPath}` : '/placeholder.svg',
      genres: item.movie.genres.map((g: any) => g.genre.name),
      director: '', // Crew tablosundan alınabilir gerekirse
      description: item.movie.overview || '',
      weeklyTheme: activeWeeklyList.title,
      position: item.position || index + 1
    }));

    return NextResponse.json(weeklyMovies);
  } catch (error) {
    console.error('Error fetching weekly movies:', error);
    
    // Hata durumunda boş dizi döndür
    return NextResponse.json([]);
  }
} 
