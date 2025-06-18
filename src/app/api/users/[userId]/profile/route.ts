import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// GET /api/users/[userId]/profile - Kullanıcının profil verilerini detaylı şekilde getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Session kontrolü
    const session = await auth();
    console.log('Session:', session); // Debug için session bilgisini logla
    
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    if (!session.user?.id) {
      console.log('No user ID in session');
      return NextResponse.json({ error: 'Kullanıcı bilgisi bulunamadı' }, { status: 401 });
    }

    const { userId } = await params;
    console.log('Requested userId:', userId); // Debug için userId'yi logla

    // Kullanıcının temel bilgilerini al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        joinDate: true,
        createdAt: true,
        movieCount: true,
        followerCount: true,
        followingCount: true
      }
    });

    if (!user) {
      console.log('User not found:', userId);
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Kullanıcının favori filmlerini al
    const favorites = await prisma.favorite.findMany({
      where: { userId },
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
      orderBy: { createdAt: 'desc' }
      // Tüm favori filmleri al
    });

    // Kullanıcının son oylamalarını al
    const recentRatings = await prisma.vote.findMany({
      where: { userId },
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
      orderBy: { createdAt: 'desc' }
      // Tüm oylamaları al
    });

    // Kullanıcının listelerini al
    const userLists = await prisma.userList.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        createdAt: true,
        items: {
          select: {
            movie: {
              select: {
                id: true,
                title: true,
                posterPath: true
              }
            }
          }
        }
      }
    });

    // İzleme listesi ayrı API'den alınacak

    // İstatistikleri hesapla
    const totalVotes = await prisma.vote.count({
      where: { userId }
    });

    const averageRating = await prisma.vote.aggregate({
      where: { userId },
      _avg: {
        rating: true
      }
    });

    const totalFavorites = await prisma.favorite.count({
      where: { userId }
    });

    const totalLists = userLists.length;

    // Bu ay için veriler (şimdilik mock)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const thisMonthVotes = await prisma.vote.count({
      where: {
        userId,
        createdAt: {
          gte: thisMonth
        }
      }
    });

    const thisMonthFavorites = await prisma.favorite.count({
      where: {
        userId,
        createdAt: {
          gte: thisMonth
        }
      }
    });

    // En popüler türü bul
    const genreStats = await prisma.vote.findMany({
      where: { userId },
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
      }
    });

    const genreCount: { [key: string]: number } = {};
    genreStats.forEach((vote: any) => {
      vote.movie.genres.forEach((movieGenre: any) => {
        const genreName = movieGenre.genre.name;
        genreCount[genreName] = (genreCount[genreName] || 0) + 1;
      });
    });

    const topGenre = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Henüz yok';

    // Poster URL'ini güvenli şekilde formatla
    const formatPosterUrl = (posterPath: string | null) => {
      if (!posterPath) return '/placeholder.svg';
      if (posterPath.startsWith('http')) return posterPath; // Zaten tam URL
      if (posterPath.startsWith('/')) return `https://image.tmdb.org/t/p/w500${posterPath}`; // TMDB path
      return '/placeholder.svg'; // Fallback
    };

    // Favori filmleri formatla
    const formattedFavorites = favorites.map((fav: any) => ({
      id: fav.movie.id,
      title: fav.movie.title,
      year: fav.movie.year,
      poster: formatPosterUrl(fav.movie.posterPath),
      rating: fav.movie.voteAverage,
      dateAdded: fav.createdAt.toISOString(),
      genres: fav.movie.genres.map((g: any) => g.genre.name)
    }));

    // Son oylamaları formatla
    const formattedRatings = recentRatings.map((rating: any) => ({
      id: rating.movie.id,
      title: rating.movie.title,
      year: rating.movie.year,
      poster: formatPosterUrl(rating.movie.posterPath),
      rating: rating.rating,
      review: rating.review,
      dateRated: rating.createdAt.toISOString(),
      genres: rating.movie.genres.map((g: any) => g.genre.name)
    }));

    // Response
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.displayName || user.username,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        joinDate: user.joinDate || user.createdAt,
        isOwnProfile: session.user.id === userId
      },
      stats: {
        moviesRated: totalVotes,
        averageRating: Math.round((averageRating._avg.rating || 0) * 10) / 10,
        favoriteMovies: totalFavorites,
        listsCreated: totalLists,
        followers: user.followerCount,
        following: user.followingCount,
        totalWatchTime: "0", // Bu hesaplama için film süreleri gerekli
        topGenre
      },
      thisMonth: {
        moviesRated: thisMonthVotes,
        favoriteMovies: thisMonthFavorites,
        watchTime: "0"
      },
      favoriteMovies: formattedFavorites,
      recentRatings: formattedRatings,
      userLists: userLists.map((list: any) => ({
        id: list.id,
        title: list.title,
        description: list.description,
        isPublic: list.isPublic,
        itemCount: list.items.length,
        createdAt: list.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Profile API error:', error);
    
    // Hata detaylarını logla
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    // Prisma hatalarını özel olarak ele al
    if (error instanceof Error && error.message.includes('prisma')) {
      console.error('Prisma error:', error);
      return NextResponse.json(
        { 
          error: 'Veritabanı hatası',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Veritabanı işlemi sırasında bir hata oluştu'
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Bilinmeyen hata' : 'Bir hata oluştu'
      }, 
      { status: 500 }
    );
  }
} 