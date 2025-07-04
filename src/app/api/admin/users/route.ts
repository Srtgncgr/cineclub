import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Kullanıcıları çek
    const users = await db.user.findMany({
      select: {
        id: true,
        displayName: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // İstatistikler için ilişkili veriler
        _count: {
          select: {
            addedMovies: true,
  
            comments: true,
            sentMessages: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Kullanıcı verilerini formatla
    const formattedUsers = users.map(user => {
      // Ortalama rating hesapla (votes tablosu kaldırıldı)
      const avgRating = 0;

      // Son aktivite (şimdilik updatedAt kullanıyoruz)
      const lastActive = user.updatedAt;
      const now = new Date();
      const diffMs = now.getTime() - lastActive.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let lastActiveText = 'Hiç';
      if (diffMins < 1) {
        lastActiveText = 'Şimdi';
      } else if (diffMins < 60) {
        lastActiveText = `${diffMins} dakika önce`;
      } else if (diffHours < 24) {
        lastActiveText = `${diffHours} saat önce`;
      } else if (diffDays < 7) {
        lastActiveText = `${diffDays} gün önce`;
      } else {
        lastActiveText = lastActive.toLocaleDateString('tr-TR');
      }

      // Online durumu (son 5 dakika içinde aktivite)
      const isOnline = diffMins < 5;

      // Status belirleme (şimdilik hepsi active)
      const status = 'active';

      return {
        id: user.id,
        name: user.displayName || user.username,
        username: user.username,
        email: user.email,

        role: user.role.toLowerCase(),
        status,
        joinDate: user.createdAt.toISOString().split('T')[0],
        lastActive: lastActiveText,
        stats: {
          movieCount: user._count.addedMovies,
          reviewCount: user._count.comments,
          messageCount: user._count.sentMessages,
          avgRating: Math.round(avgRating * 10) / 10
        },
        isOnline
      };
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const { name, username, email, password, role } = await request.json();

    // Validasyon
    if (!name || !username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Tüm alanlar gereklidir' },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz' },
        { status: 400 }
      );
    }

    // Rol kontrolü
    const validRoles = ['USER', 'MODERATOR', 'ADMIN'];
    if (!validRoles.includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: 'Geçersiz rol' },
        { status: 400 }
      );
    }

    // Kullanıcı adı ve e-posta benzersizlik kontrolü
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kullanıcıyı oluştur
    const newUser = await db.user.create({
      data: {
        displayName: name,
        username: username,
        email: email,
        password: hashedPassword,
        role: role.toUpperCase()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: newUser.id,
        name: newUser.displayName,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role.toLowerCase()
      }
    });

  } catch (error) {
    console.error('Add user error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
