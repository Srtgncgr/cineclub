import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }
    
    // Toplam kullanıcı sayısı
    const totalUsers = await db.user.count();
    
    // Bu hafta katılan kullanıcılar
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const usersThisWeek = await db.user.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    });

    // Toplam film sayısı
    const totalMovies = await db.movie.count();
    
    // Bu hafta eklenen filmler
    const moviesThisWeek = await db.movie.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    });

    // Aktif kullanıcılar (son 24 saatte aktivite göstermiş)
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    
    const activeUsers = await db.user.count({
      where: {
        OR: [
          {
            comments: {
              some: {
                createdAt: {
                  gte: dayAgo
                }
              }
            }
          },
          {
            favorites: {
              some: {
                createdAt: {
                  gte: dayAgo
                }
              }
            }
          },
          {
            watchlist: {
              some: {
                createdAt: {
                  gte: dayAgo
                }
              }
            }
          }
        ]
      }
    });

    // Bu hafta aktif olan kullanıcılar
    const activeUsersThisWeek = await db.user.count({
      where: {
        OR: [
          {
            comments: {
              some: {
                createdAt: {
                  gte: weekAgo
                }
              }
            }
          },
          {
            favorites: {
              some: {
                createdAt: {
                  gte: weekAgo
                }
              }
            }
          },
          {
            watchlist: {
              some: {
                createdAt: {
                  gte: weekAgo
                }
              }
            }
          }
        ]
      }
    });

    // Toplam değerlendirme sayısı (tüm yorumlar)
    const totalReviews = await db.comment.count();
    
    // Bu hafta yapılan değerlendirmeler
    const reviewsThisWeek = await db.comment.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    });

    // Değişim yüzdelerini hesapla
    const userGrowth = totalUsers > 0 ? Math.round((usersThisWeek / totalUsers) * 100) : 0;
    const movieGrowth = totalMovies > 0 ? Math.round((moviesThisWeek / totalMovies) * 100) : 0;
    const activeUserGrowth = totalUsers > 0 ? Math.round((activeUsersThisWeek / totalUsers) * 100) : 0;
    const reviewGrowth = totalReviews > 0 ? Math.round((reviewsThisWeek / totalReviews) * 100) : 0;

    const result = {
      success: true,
      stats: {
        totalUsers: {
          value: totalUsers,
          change: `+${userGrowth}%`,
          trend: 'up'
        },
        totalMovies: {
          value: totalMovies,
          change: `+${movieGrowth}%`,
          trend: 'up'
        },
        activeUsers: {
          value: activeUsers,
          change: `+${activeUserGrowth}%`,
          trend: 'up'
        },
        totalReviews: {
          value: totalReviews,
          change: `+${reviewGrowth}%`,
          trend: 'up'
        }
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'İstatistikler alınırken hata oluştu' },
      { status: 500 }
    );
  }
} 
