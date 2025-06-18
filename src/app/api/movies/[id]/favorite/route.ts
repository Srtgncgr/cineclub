import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15'te params artık Promise döndürüyor
    const resolvedParams = await params;
    
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const movieId = resolvedParams.id;

    // Film var mı kontrol et
    const movie = await db.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return new Response("Movie not found", { status: 404 });
    }

    // Kullanıcının bu filmi favorilerde var mı kontrol et
    const favorite = await db.favorite.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: movieId,
        },
      },
    });

    return new Response(JSON.stringify({ 
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null,
    }));
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return new Response("Could not check favorite status", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15'te params artık Promise döndürüyor
    const resolvedParams = await params;
    
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const movieId = resolvedParams.id;

    // Film var mı kontrol et
    const movie = await db.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return new Response("Movie not found", { status: 404 });
    }

    // Mevcut favori durumunu kontrol et
    const existingFavorite = await db.favorite.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: movieId,
        },
      },
    });

    if (existingFavorite) {
      // Favorilerden çıkar
      await db.favorite.delete({
        where: { id: existingFavorite.id },
      });

      // Film favori sayısını güncelle
      await db.movie.update({
        where: { id: movieId },
        data: {
          favoriteCount: {
            decrement: 1,
          },
        },
      });

      return new Response(JSON.stringify({ 
        isFavorite: false,
        favoriteId: null,
        message: "Favorilerden çıkarıldı",
      }));
    } else {
      // Favorilere ekle
      const newFavorite = await db.favorite.create({
        data: {
          userId: session.user.id,
          movieId: movieId,
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

      return new Response(JSON.stringify({ 
        isFavorite: true,
        favoriteId: newFavorite.id,
        message: "Favorilere eklendi",
      }), { status: 201 });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return new Response("Could not toggle favorite", { status: 500 });
  }
} 