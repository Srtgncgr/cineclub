import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { movieIds } = body;

    if (!movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz film ID\'leri' },
        { status: 400 }
      );
    }

    // Toplu silme işlemi
    const deleteResult = await prisma.movie.deleteMany({
      where: {
        id: {
          in: movieIds
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} film başarıyla silindi`,
      deletedCount: deleteResult.count
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Filmler silinirken hata oluştu' },
      { status: 500 }
    );
  }
} 
