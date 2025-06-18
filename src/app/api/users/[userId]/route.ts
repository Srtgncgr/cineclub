import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET /api/users/[userId] - Belirli bir kullanıcının bilgilerini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Kullanıcı bilgilerini getir
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        isPrivate: true,
        joinDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Kullanıcı verilerini API için formatla
    const userData = {
      id: user.id,
      name: user.displayName || user.username,
      username: user.username,
      avatar: user.avatar || '/default-avatar.png',
      bio: user.bio,
      role: user.role,
      isPrivate: user.isPrivate,
      joinDate: user.joinDate,
      isOnline: false, // Bu bilgiyi gerçek zamanlı olarak almak için başka bir sistem gerekebilir
      lastSeen: user.updatedAt
    };

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[userId] - Kullanıcı bilgilerini güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    
    // Sadece kendi profilini düzenleyebilir
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { displayName, username, bio, currentPassword, newPassword } = body;

    // Kullanıcının mevcut bilgilerini al
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        password: true
      }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Username benzersizlik kontrolü (eğer username değiştirildiyse)
    if (username && username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username }
      });
      
      if (usernameExists) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // Şifre değişikliği kontrolü
    let hashedNewPassword: string | undefined;
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Mevcut şifre gerekli' },
          { status: 400 }
        );
      }

      // Mevcut şifreyi doğrula
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Mevcut şifre yanlış' },
          { status: 400 }
        );
      }

      // Yeni şifreyi hashle
      hashedNewPassword = await bcrypt.hash(newPassword, 12);
    }

    // Kullanıcı bilgilerini güncelle
    const updateData: any = {};
    
    if (displayName !== undefined) updateData.displayName = displayName;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (hashedNewPassword) updateData.password = hashedNewPassword;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        isPrivate: true,
        joinDate: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      user: {
        id: updatedUser.id,
        name: updatedUser.displayName || updatedUser.username,
        username: updatedUser.username,
        avatar: updatedUser.avatar || '/default-avatar.png',
        bio: updatedUser.bio,
        role: updatedUser.role,
        isPrivate: updatedUser.isPrivate,
        joinDate: updatedUser.joinDate,
        lastSeen: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[userId] - Kullanıcı hesabını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    
    // Sadece kendi hesabını silebilir
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Kullanıcının mevcut olduğunu kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Kullanıcıyla ilgili tüm verileri sil (cascade delete)
    // Prisma schema'daki onDelete: Cascade ayarları otomatik olarak
    // ilişkili verileri silecek
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Hesap başarıyla silindi'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}