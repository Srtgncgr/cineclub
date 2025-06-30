import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, WeeklyStatus } from '@prisma/client';
import { getAuthSession } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Tüm haftalık listeleri getir
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Basit haftalık liste verisi (Prisma type hatalarını geçici olarak basit tutuyoruz)
    const weeklyLists = await prisma.weeklyList.findMany({
      where,
      orderBy: {
        startDate: 'desc'
      }
    });

    // Şimdilik basit dönüş, filmler olmadan
    const transformedLists = weeklyLists.map(list => ({
      id: list.id,
      title: list.title,
      description: list.description,
      startDate: list.startDate.toISOString(),
      endDate: list.endDate.toISOString(),
      status: list.status.toLowerCase(),
      movies: [], // Şimdilik boş, daha sonra ekleyeceğiz
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString()
    }));

    return NextResponse.json(transformedLists);
  } catch (error) {
    console.error('Error fetching weekly lists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Yeni haftalık liste oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startDate, endDate } = body;

    // Yeni haftalık liste oluştur
    const weeklyList = await prisma.weeklyList.create({
      data: {
        title,
        description: description || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: WeeklyStatus.UPCOMING // Doğru enum değeri
      }
    });

    return NextResponse.json({ 
      id: weeklyList.id,
      message: 'Haftalık liste başarıyla oluşturuldu' 
    });
  } catch (error) {
    console.error('Error creating weekly list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Haftalık liste toplu güncelleme (yayınla, iptal et)
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listIds, action } = body;

    if (!listIds || !Array.isArray(listIds) || listIds.length === 0) {
      return NextResponse.json({ error: 'Liste ID\'leri gerekli' }, { status: 400 });
    }

    let newStatus: WeeklyStatus;
    let message: string;

    switch (action) {
      case 'publish':
        newStatus = WeeklyStatus.ACTIVE;
        message = 'Listeler başarıyla yayınlandı';
        break;
      case 'cancel':
        newStatus = WeeklyStatus.ARCHIVED;
        message = 'Listeler başarıyla iptal edildi';
        break;
      default:
        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    }

    // Toplu güncelleme
    await prisma.weeklyList.updateMany({
      where: {
        id: {
          in: listIds
        }
      },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message,
      updatedCount: listIds.length
    });
  } catch (error) {
    console.error('Error updating weekly lists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Haftalık liste toplu silme
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listIdsParam = searchParams.get('listIds');

    if (!listIdsParam) {
      return NextResponse.json({ error: 'Liste ID\'leri gerekli' }, { status: 400 });
    }

    const listIds = listIdsParam.split(',');

    // Önce ilişkili filmleri sil
    await prisma.weeklyListMovie.deleteMany({
      where: {
        weeklyListId: {
          in: listIds
        }
      }
    });

    // Sonra listeleri sil
    const deleteResult = await prisma.weeklyList.deleteMany({
      where: {
        id: {
          in: listIds
        }
      }
    });

    return NextResponse.json({ 
      message: 'Listeler başarıyla silindi',
      deletedCount: deleteResult.count
    });
  } catch (error) {
    console.error('Error deleting weekly lists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 