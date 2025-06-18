import { getAuthSession } from "@/lib/auth";
import { PrismaClient } from '@/generated/prisma';
import { NextRequest } from 'next/server';

const db = new PrismaClient();

// GET /api/watchlist/[movieId] - Filmin watchlist durumunu kontrol et
export async function GET(req: NextRequest, { params }: { params: Promise<{ movieId: string }> }) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { movieId } = await params;

    const watchlistItem = await db.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: movieId,
        },
      },
    });

    return new Response(JSON.stringify({
      isInWatchlist: !!watchlistItem,
      item: watchlistItem
    }));
  } catch (error) {
    console.error('Watchlist check error:', error);
    return new Response("Could not check watchlist status", { status: 500 });
  }
}

// PATCH /api/watchlist/[movieId] - Watched durumunu güncelle
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ movieId: string }> }) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { movieId } = await params;
    const { watched } = await req.json();

    const watchlistItem = await db.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: movieId,
        },
      },
    });

    if (!watchlistItem) {
      return new Response("Movie not in watchlist", { status: 404 });
    }

    const updatedItem = await db.watchlist.update({
      where: {
        id: watchlistItem.id,
      },
      data: {
        watched: watched,
        watchedAt: watched ? new Date() : null,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      item: updatedItem,
      message: watched ? 'Film izlendi olarak işaretlendi' : 'Film izlenmedi olarak işaretlendi'
    }));
  } catch (error) {
    console.error('Watchlist update error:', error);
    return new Response("Could not update watchlist item", { status: 500 });
  }
} 