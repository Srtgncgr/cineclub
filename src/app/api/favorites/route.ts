import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Favori ekleme için validation schema
const AddFavoriteSchema = z.object({
  movieId: z.string().min(1, "Film ID gerekli"),
});

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const favorites = await db.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
            votes: true,
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

    return new Response(JSON.stringify(formattedFavorites));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return new Response("Could not fetch favorites", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { movieId } = AddFavoriteSchema.parse(body);

    // Film var mı kontrol et
    const movie = await db.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return new Response("Movie not found", { status: 404 });
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
      return new Response("Movie already in favorites", { status: 409 });
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

    return new Response(JSON.stringify(newFavorite), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    console.error('Error adding favorite:', error);
    return new Response("Could not add favorite", { status: 500 });
  }
} 
