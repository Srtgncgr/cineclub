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
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Geçerli bir puan giriniz (1-5 arası tam sayı)' },
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

    // Mevcut oyu kontrol et
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: resolvedParams.id
        }
      }
    });

    let vote;
    
    if (existingVote) {
      // Mevcut oyu güncelle
      vote = await prisma.vote.update({
        where: {
          userId_movieId: {
            userId: user.id,
            movieId: resolvedParams.id
          }
        },
        data: {
          rating: rating,
          updatedAt: new Date()
        }
      });
    } else {
      // Yeni oy ekle
      vote = await prisma.vote.create({
        data: {
          userId: user.id,
          movieId: resolvedParams.id,
          rating: rating
        }
      });
    }

    // Site içi film istatistiklerini güncelle (TMDB puanlarına dokunma!)
    const votes = await prisma.vote.findMany({
      where: { movieId: resolvedParams.id }
    });

    const totalVotes = votes.length;
    const averageRating = votes.reduce((sum: number, v: any) => sum + v.rating, 0) / totalVotes;

    await prisma.movie.update({
      where: { id: resolvedParams.id },
      data: {
        localVoteCount: totalVotes,
        localVoteAverage: averageRating
      }
    });

    return NextResponse.json({
      success: true,
      message: existingVote ? 'Oyunuz güncellendi' : 'Oyunuz kaydedildi',
      vote: {
        rating: vote.rating,
        createdAt: vote.createdAt,
        updatedAt: vote.updatedAt
      },
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

    // Kullanıcının bu filme verdiği oyu bul
    const vote = await prisma.vote.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: resolvedParams.id
        }
      }
    });

    return NextResponse.json({
      userVote: vote ? {
        rating: vote.rating,
        createdAt: vote.createdAt,
        updatedAt: vote.updatedAt
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