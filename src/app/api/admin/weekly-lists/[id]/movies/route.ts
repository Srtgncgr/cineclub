import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthSession } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Haftalık liste filmlerini getir
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const weeklyListId = resolvedParams.id;

    const weeklyListMovies = await prisma.weeklyListMovie.findMany({
      where: {
        weeklyListId
      },
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
    });

    const formattedMovies = weeklyListMovies.map((item: any) => ({
      id: item.id,
      movieId: item.movieId,
      title: item.movie.title,
      year: item.movie.year || (item.movie.releaseDate ? new Date(item.movie.releaseDate).getFullYear() : 0),
      poster: item.movie.posterPath,
      director: '', // Bu veriyi crew'dan alabiliriz gerekirse
      genres: item.movie.genres.map((g: any) => g.genre.name),
      description: item.movie.overview || '',
      rating: item.movie.voteAverage,
      position: item.position
    }));

    return NextResponse.json(formattedMovies);
  } catch (error) {
    console.error('Error fetching weekly list movies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Haftalık listeye film ekle
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const weeklyListId = resolvedParams.id;
    const body = await request.json();
    const { movieId, position } = body;

    // Film zaten listede mi kontrol et
    const existingMovie = await prisma.weeklyListMovie.findFirst({
      where: {
        weeklyListId,
        movieId
      }
    });

    if (existingMovie) {
      return NextResponse.json({ error: 'Film zaten bu listede mevcut' }, { status: 400 });
    }

    // --- YENİ: Maksimum 3 film kontrolü ---
    const movieCount = await prisma.weeklyListMovie.count({
      where: { weeklyListId }
    });
    if (movieCount >= 3) {
      return NextResponse.json({ error: 'Bir haftalık listeye en fazla 3 film eklenebilir.' }, { status: 400 });
    }
    // --- SON ---

    // Eğer position belirtilmemişse, en son sırayı al
    let finalPosition = position;
    if (!finalPosition) {
      const lastMovie = await prisma.weeklyListMovie.findFirst({
        where: { weeklyListId },
        orderBy: { position: 'desc' }
      });
      finalPosition = (lastMovie?.position || 0) + 1;
    }

    // Film ekle
    const weeklyListMovie = await prisma.weeklyListMovie.create({
      data: {
        weeklyListId,
        movieId,
        position: finalPosition
      },
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
      }
    });

    return NextResponse.json({ 
      message: 'Film haftalık listeye başarıyla eklendi',
      movie: {
        id: weeklyListMovie.id,
        movieId: weeklyListMovie.movieId,
        title: (weeklyListMovie as any).movie.title,
        year: (weeklyListMovie as any).movie.year || ((weeklyListMovie as any).movie.releaseDate ? new Date((weeklyListMovie as any).movie.releaseDate).getFullYear() : 0),
        poster: (weeklyListMovie as any).movie.posterPath,
        genres: (weeklyListMovie as any).movie.genres.map((g: any) => g.genre.name),
        description: (weeklyListMovie as any).movie.overview || '',
        rating: (weeklyListMovie as any).movie.voteAverage,
        position: weeklyListMovie.position
      }
    });
  } catch (error) {
    console.error('Error adding movie to weekly list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Haftalık listeden film çıkar
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const weeklyListId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');

    if (!movieId) {
      return NextResponse.json({ error: 'Film ID gerekli' }, { status: 400 });
    }

    // Film listeden çıkar
    await prisma.weeklyListMovie.deleteMany({
      where: {
        weeklyListId,
        movieId
      }
    });

    return NextResponse.json({ message: 'Film haftalık listeden çıkarıldı' });
  } catch (error) {
    console.error('Error removing movie from weekly list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 