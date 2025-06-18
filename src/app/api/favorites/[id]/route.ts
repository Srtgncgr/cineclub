import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
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

    const favoriteId = resolvedParams.id;

    // Favori var mı ve kullanıcıya ait mi kontrol et
    const favorite = await db.favorite.findUnique({
      where: { id: favoriteId },
      include: { movie: true },
    });

    if (!favorite) {
      return new Response("Favorite not found", { status: 404 });
    }

    if (favorite.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Favoriden çıkar
    await db.favorite.delete({
      where: { id: favoriteId },
    });

    // Film favori sayısını güncelle
    await db.movie.update({
      where: { id: favorite.movieId },
      data: {
        favoriteCount: {
          decrement: 1,
        },
      },
    });

    return new Response("OK");
  } catch (error) {
    console.error('Error removing favorite:', error);
    return new Response("Could not remove favorite", { status: 500 });
  }
} 