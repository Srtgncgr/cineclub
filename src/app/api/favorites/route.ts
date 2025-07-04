import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { NextResponse } from 'next/server';

// Favori ekleme için validation schema
const AddFavoriteSchema = z.object({
  movieId: z.string().min(1, "Film ID gerekli"),
});

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await db.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Frontend'in beklediği formata dönüştür
    const formattedFavorites = favorites.map((favorite) => ({
      id: favorite.id,
      addedDate: favorite.createdAt.toISOString(),
      movie: {
        id: favorite.movie.id,
        title: favorite.movie.title,
        year: favorite.movie.year,
        poster: favorite.movie.posterPath 
          ? `https://image.tmdb.org/t/p/w500${favorite.movie.posterPath}` 
          : '/placeholder.png',
        rating: favorite.movie.voteAverage,
        duration: favorite.movie.runtime,
        genres: favorite.movie.genres.map(g => g.genre.name),
        description: favorite.movie.overview,
        isFavorite: true,
      },
    }));

    return NextResponse.json(formattedFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: "Could not fetch favorites" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { movieId } = AddFavoriteSchema.parse(body);

    // Film var mı kontrol et
    const movie = await db.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    // Zaten favorilerde mi kontrol et
    const existingFavorite = await db.favorite.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: movieId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json({ error: "Movie already in favorites" }, { status: 409 });
    }

    // Favorilere ekle
    const newFavorite = await db.favorite.create({
      data: {
        userId: session.user.id,
        movieId: movieId,
      },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
    });

    // Film favori sayısını güncelle
    await db.movie.update({
      where: { id: movieId },
      data: {
        favoriteCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(newFavorite, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: "Could not add favorite" }, { status: 500 });
  }
} 
