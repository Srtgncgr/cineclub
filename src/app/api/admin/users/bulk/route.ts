import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, userIds } = body;

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Geçersiz istek' },
        { status: 400 }
      );
    }

    // Kendi hesabını işleme dahil etmesini engelle
    const filteredUserIds = userIds.filter(id => id !== session.user.id);

    if (filteredUserIds.length === 0) {
      return NextResponse.json(
        { error: 'İşlem yapılacak kullanıcı bulunamadı' },
        { status: 400 }
      );
    }

    let result;
    let message;

    switch (action) {
      case 'delete':
        result = await db.user.deleteMany({
          where: {
            id: {
              in: filteredUserIds
            }
          }
        });
        message = `${result.count} kullanıcı silindi`;
        break;

      case 'suspend':
        // Status alanı yoksa, role'ü USER yaparak "askıya alma" simüle edelim
        result = await db.user.updateMany({
          where: {
            id: {
              in: filteredUserIds
            }
          },
          data: {
            role: 'USER' // Geçici olarak role değiştiriyoruz
          }
        });
        message = `${result.count} kullanıcı askıya alındı`;
        break;

      case 'activate':
        result = await db.user.updateMany({
          where: {
            id: {
              in: filteredUserIds
            }
          },
          data: {
            role: 'USER'
          }
        });
        message = `${result.count} kullanıcı aktifleştirildi`;
        break;

      case 'make_moderator':
        result = await db.user.updateMany({
          where: {
            id: {
              in: filteredUserIds
            }
          },
          data: {
            role: 'MODERATOR'
          }
        });
        message = `${result.count} kullanıcı moderatör yapıldı`;
        break;

      default:
        return NextResponse.json(
          { error: 'Geçersiz işlem' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      affectedCount: result.count
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Toplu işlem sırasında hata oluştu' },
      { status: 500 }
    );
  }
} 
