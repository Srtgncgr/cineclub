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
        { error: 'Oy vermek için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { rating } = await request.json();

    // Oy validasyonu
    if (rating !== 0 && (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return NextResponse.json(
        { error: 'Geçerli bir puan giriniz (0-5 arası tam sayı, 0=puan kaldır)' },
        { status: 400 }
      );
    }

    // Film kontrolü
    const movie = await prisma.movie.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Film bulunamadı' },
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

    // Mevcut comment/rating kontrolü
    const existingComment = await prisma.comment.findFirst({
      where: {
          userId: user.id,
          movieId: resolvedParams.id
        }
    });

    let comment;
    
    if (existingComment) {
      if (rating === 0) {
        // Eğer sadece rating varsa ve content boşsa, kaydı sil
        if (!existingComment.content || existingComment.content.trim() === "") {
          await prisma.comment.delete({
            where: { id: existingComment.id }
          });
          comment = null; // Silindi
        } else {
          // Content varsa sadece rating'i 0 yap
          comment = await prisma.comment.update({
            where: { id: existingComment.id },
            data: {
              rating: 0,
              updatedAt: new Date()
            }
          });
        }
      } else {
        // Normal rating güncellemesi
        comment = await prisma.comment.update({
          where: { id: existingComment.id },
        data: {
          rating: rating,
          updatedAt: new Date()
        }
      });
      }
    } else {
      if (rating === 0) {
        return NextResponse.json({
          success: true,
          message: 'Puanınız zaten yok',
          vote: null,
          movieStats: {
            localVoteCount: 0,
            localVoteAverage: 0
          }
        });
      } else {
        // Yeni rating-only comment oluştur
        comment = await prisma.comment.create({
        data: {
          userId: user.id,
          movieId: resolvedParams.id,
            content: "", // Boş content, sadece rating
          rating: rating
        }
      });
    }
    }

    // Site içi film istatistiklerini güncelle
    const comments = await prisma.comment.findMany({
      where: { 
        movieId: resolvedParams.id,
        rating: { gt: 0 } // Sadece puanlı yorumları say
      }
    });

    const totalVotes = comments.length;
    const averageRating = totalVotes > 0 
      ? comments.reduce((sum: number, c: any) => sum + c.rating, 0) / totalVotes 
      : 0;

    await prisma.movie.update({
      where: { id: resolvedParams.id },
      data: {
        localVoteCount: totalVotes,
        localVoteAverage: averageRating
      }
    });

    return NextResponse.json({
      success: true,
      message: comment === null ? 'Puanınız kaldırıldı' : (existingComment ? 'Oyunuz güncellendi' : 'Oyunuz kaydedildi'),
      vote: comment ? {
        rating: comment.rating,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      } : null,
      movieStats: {
        localVoteCount: totalVotes,
        localVoteAverage: Number(averageRating.toFixed(1))
      }
    });

  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json(
      { error: 'Oyunuz kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15'te params artık Promise döndürüyor
    const resolvedParams = await params;
    
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
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

    // Kullanıcının bu filme verdiği comment/rating'i bul
    const comment = await prisma.comment.findFirst({
      where: {
          userId: user.id,
          movieId: resolvedParams.id
      }
    });

    return NextResponse.json({
      userVote: comment ? {
        rating: comment.rating,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      } : null
    });

  } catch (error) {
    console.error('Get vote API error:', error);
    return NextResponse.json(
      { error: 'Oy bilgisi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 