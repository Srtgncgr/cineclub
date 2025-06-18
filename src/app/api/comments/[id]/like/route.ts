import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15'te params artık Promise döndürüyor
    const resolvedParams = await params;
    
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'İşlem yapmak için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { action } = await request.json(); // 'like' or 'dislike'

    if (!action || !['like', 'dislike'].includes(action)) {
      return NextResponse.json(
        { error: 'Geçerli bir aksiyon belirtiniz (like/dislike)' },
        { status: 400 }
      );
    }

    // Yorum kontrolü
    const comment = await prisma.comment.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Yorum bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Kendi yorumunu beğenemez
    if (comment.userId === user.id) {
      return NextResponse.json(
        { error: 'Kendi yorumunuzu beğenemezsiniz' },
        { status: 400 }
      );
    }

    if (action === 'like') {
      // Like count'ı artır
      const updatedComment = await prisma.comment.update({
        where: { id: resolvedParams.id },
        data: {
          likeCount: {
            increment: 1
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Yorum beğenildi',
        likeCount: updatedComment.likeCount,
        dislikeCount: updatedComment.dislikeCount
      });
      
    } else if (action === 'dislike') {
      // Dislike count'ı artır
      const updatedComment = await prisma.comment.update({
        where: { id: resolvedParams.id },
        data: {
          dislikeCount: {
            increment: 1
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Yorum beğenilmedi',
        likeCount: updatedComment.likeCount,
        dislikeCount: updatedComment.dislikeCount
      });
    }

  } catch (error) {
    console.error('Comment like/dislike API error:', error);
    return NextResponse.json(
      { error: 'İşlem gerçekleştirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 