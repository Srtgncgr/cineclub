import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const popularMovies = await prisma.movie.findMany({
      orderBy: {
        voteCount: 'desc',
      },
      take: 4,
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    // Prisma'dan gelen veriyi ön yüzün beklediği formata dönüştür
    const formattedMovies = popularMovies.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      rating: movie.voteAverage,
      votes: movie.voteCount,
      poster: movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : '/placeholder.svg',
      genres: movie.genres.map((g: any) => g.genre.name),
      isFavorite: false, // Bu bilgi kullanıcıya özel olmalı, şimdilik false
    }));

    return NextResponse.json(formattedMovies);
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
