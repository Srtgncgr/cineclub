import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthSession } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Tekil haftalık liste detayı
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const listId = resolvedParams.id;

    const weeklyList = await prisma.weeklyList.findUnique({
      where: { id: listId },
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
      }
    });

    if (!weeklyList) {
      return NextResponse.json({ error: 'Liste bulunamadı' }, { status: 404 });
    }

    const transformedList = {
      id: weeklyList.id,
      title: weeklyList.title,
      description: weeklyList.description,
      startDate: weeklyList.startDate.toISOString(),
      endDate: weeklyList.endDate.toISOString(),
      status: weeklyList.status.toLowerCase(),
      movies: weeklyList.movies.map((item: any) => ({
        id: item.id,
        movieId: item.movieId,
        title: item.movie.title,
        year: item.movie.year || (item.movie.releaseDate ? new Date(item.movie.releaseDate).getFullYear() : 0),
        poster: item.movie.posterPath,
        director: '',
        genres: item.movie.genres.map((g: any) => g.genre.name),
        description: item.movie.overview || '',
        rating: item.movie.voteAverage,
        position: item.position
      })),
      createdAt: weeklyList.createdAt.toISOString(),
      updatedAt: weeklyList.updatedAt.toISOString()
    };

    return NextResponse.json(transformedList);
  } catch (error) {
    console.error('Error fetching weekly list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Haftalık liste güncelleme
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const listId = resolvedParams.id;
    const body = await request.json();
    const { title, description, startDate, endDate } = body;

    // Liste güncelle
    const updatedList = await prisma.weeklyList.update({
      where: { id: listId },
      data: {
        title,
        description: description || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      id: updatedList.id,
      message: 'Haftalık liste başarıyla güncellendi' 
    });
  } catch (error) {
    console.error('Error updating weekly list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Tekil haftalık liste silme
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const listId = resolvedParams.id;

    // Önce ilişkili filmleri sil
    await prisma.weeklyListMovie.deleteMany({
      where: { weeklyListId: listId }
    });

    // Sonra listeyi sil
    await prisma.weeklyList.delete({
      where: { id: listId }
    });

    return NextResponse.json({ 
      message: 'Liste başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting weekly list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 