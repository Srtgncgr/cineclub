import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15'te params artık Promise döndürüyor
    const resolvedParams = await params;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'newest';

    const skip = (page - 1) * limit;

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

    // Sıralama
    let orderBy: any = { createdAt: 'desc' }; // default: newest
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'most_liked':
        orderBy = { likeCount: 'desc' };
        break;
      case 'highest_rated':
        orderBy = { rating: 'desc' };
        break;
    }

    // Yorumları çek (sadece ana yorumlar, reply'ler dahil)
    const comments = await prisma.comment.findMany({
      where: { 
        movieId: resolvedParams.id,
        parentId: null // Sadece ana yorumlar
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // Toplam yorum sayısı
    const totalComments = await prisma.comment.count({
      where: { 
        movieId: resolvedParams.id,
        parentId: null
      }
    });

    // İstatistikler
    const allComments = await prisma.comment.findMany({
      where: { movieId: resolvedParams.id },
      select: {
        rating: true,
        likeCount: true
      }
    });

    const ratedComments = allComments.filter(c => c.rating && c.rating > 0);
    const averageRating = ratedComments.length > 0 
      ? ratedComments.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedComments.length 
      : 0;
    const totalLikes = allComments.reduce((sum, c) => sum + c.likeCount, 0);

    return NextResponse.json({
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        rating: comment.rating,
        likes: comment.likeCount,
        dislikes: comment.dislikeCount,
        date: comment.createdAt,
        user: {
          id: comment.user.id,
          name: comment.user.displayName || 'Anonim',
          avatar: comment.user.avatar || '/placeholder-avatar.png'
        },
        replies: comment.replies.map(reply => ({
          id: reply.id,
          content: reply.content,
          date: reply.createdAt,
          likes: reply.likeCount,
          dislikes: reply.dislikeCount,
          user: {
            id: reply.user.id,
            name: reply.user.displayName || 'Anonim',
            avatar: reply.user.avatar || '/placeholder-avatar.png'
          }
        }))
      })),
      pagination: {
        page,
        limit,
        total: totalComments,
        totalPages: Math.ceil(totalComments / limit)
      },
      stats: {
        totalComments: allComments.length,
        ratedComments: ratedComments.length,
        averageRating: Number(averageRating.toFixed(1)),
        totalLikes
      }
    });

  } catch (error) {
    console.error('Get comments API error:', error);
    return NextResponse.json(
      { error: 'Yorumlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

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
        { error: 'Yorum yazmak için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { content, rating, parentId } = await request.json();

    // Validasyon
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Yorum içeriği boş olamaz' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Yorum 1000 karakterden uzun olamaz' },
        { status: 400 }
      );
    }

    if (rating !== undefined && (rating < 0 || rating > 5 || !Number.isInteger(rating))) {
      return NextResponse.json(
        { error: 'Geçerli bir puan giriniz (0-5 arası tam sayı)' },
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

    // Parent comment kontrolü (eğer reply ise)
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment || parentComment.movieId !== resolvedParams.id) {
        return NextResponse.json(
          { error: 'Geçersiz parent yorum' },
          { status: 400 }
        );
      }
    }

    // Mevcut yorum/rating kontrolü
    const existingComment = await prisma.comment.findFirst({
      where: {
        userId: user.id,
        movieId: resolvedParams.id,
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    let comment;

    if (existingComment) {
      // Mevcut yorumu güncelle
      comment = await prisma.comment.update({
        where: { id: existingComment.id },
        data: {
          content: content.trim(),
          // Rating sadece belirtilmişse güncelle, yoksa mevcut rating'i koru
          rating: parentId ? existingComment.rating : (rating !== undefined ? rating : existingComment.rating),
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              avatar: true
            }
          }
        }
      });
    } else {
      // Yeni yorum oluştur
      comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          rating: parentId ? 0 : rating || 0, // Reply'larda rating 0
          movieId: resolvedParams.id,
          userId: user.id,
          parentId: parentId || null
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              avatar: true
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: existingComment ? 'Yorumunuz başarıyla güncellendi' : 'Yorumunuz başarıyla eklendi',
      comment: {
        id: comment.id,
        content: comment.content,
        rating: comment.rating,
        likes: comment.likeCount,
        dislikes: comment.dislikeCount,
        date: comment.createdAt,
        user: {
          id: comment.user.id,
          name: comment.user.displayName || 'Anonim',
          avatar: comment.user.avatar || '/placeholder-avatar.png'
        },
        replies: []
      }
    });

  } catch (error) {
    console.error('Create comment API error:', error);
    return NextResponse.json(
      { error: 'Yorum eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 