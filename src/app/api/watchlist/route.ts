import { getAuthSession } from "@/lib/auth";
import { PrismaClient } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

const db = new PrismaClient();

// GET /api/watchlist - Kullanıcının izleme listesini getir
export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const watchlist = await db.watchlist.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
            comments: {
              where: {
                userId: session.user.id,
                rating: { gt: 0 }
              },
              select: {
                rating: true
              }
            },
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // BigInt değerleri string'e çevir (JSON serialization için)
    const serializedWatchlist = watchlist.map(item => ({
      ...item,
      movie: {
        ...item.movie,
        tmdbId: item.movie.tmdbId ? item.movie.tmdbId.toString() : null,
        genres: item.movie.genres.map(g => ({
          ...g,
          genre: {
            ...g.genre,
            tmdbId: g.genre.tmdbId ? g.genre.tmdbId.toString() : null,
          }
        }))
      }
    }));

    return NextResponse.json(serializedWatchlist);
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    return NextResponse.json({ error: "Could not fetch watchlist" }, { status: 500 });
  }
}

// POST /api/watchlist - Filme izleme listesine ekle/çıkar
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { movieId } = await req.json();

    if (!movieId) {
      return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
    }

    // Mevcut watchlist item'ını kontrol et
    const existingItem = await db.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: movieId,
        },
      },
    });

    if (existingItem) {
      // Varsa sil (toggle)
      await db.watchlist.delete({
        where: {
          id: existingItem.id,
        },
      });

      return NextResponse.json({ 
        success: true, 
        action: 'removed',
        message: 'Film izleme listesinden çıkarıldı' 
      });
    } else {
      // Yoksa ekle
      const newWatchlistItem = await db.watchlist.create({
        data: {
          userId: session.user.id,
          movieId: movieId,
        },
      });

      return NextResponse.json({ 
        success: true, 
        action: 'added',
        message: 'Film izleme listesine eklendi',
        item: newWatchlistItem
      });
    }
  } catch (error) {
    console.error('Watchlist error:', error);
    return NextResponse.json({ error: "Could not update watchlist" }, { status: 500 });
  }
} 
