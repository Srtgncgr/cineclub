import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/users - Tüm kullanıcıları listele (mesajlaşma için)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Arama koşulları
    const whereCondition = {
      // Kendini listeden çıkar
      NOT: {
        id: currentUserId
      },
      // Arama varsa kullanıcı adı veya display name'de ara
      ...(search && {
        OR: [
          {
            username: {
              contains: search,
              mode: 'insensitive' as const
            }
          },
          {
            displayName: {
              contains: search,
              mode: 'insensitive' as const
            }
          }
        ]
      })
    };

    // Kullanıcıları getir
    const users = await db.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        role: true,
        joinDate: true,
        // Son mesajlaşma bilgisi için
        sentMessages: {
          where: {
            receiverId: currentUserId
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            createdAt: true,
            content: true
          }
        },
        receivedMessages: {
          where: {
            senderId: currentUserId
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            createdAt: true,
            content: true
          }
        }
      },
      orderBy: [
        // Önce en son mesajlaşılanlar
        { updatedAt: 'desc' },
        // Sonra username'e göre alfabetik
        { username: 'asc' }
      ],
      skip: offset,
      take: limit
    });

    // Toplam kullanıcı sayısı
    const totalUsers = await db.user.count({
      where: whereCondition
    });

    // Kullanıcı listesini düzenle
    const usersWithLastMessage = users.map(user => {
      const lastSentMessage = user.sentMessages[0];
      const lastReceivedMessage = user.receivedMessages[0];
      
      let lastMessage = null;
      if (lastSentMessage && lastReceivedMessage) {
        lastMessage = lastSentMessage.createdAt > lastReceivedMessage.createdAt 
          ? lastSentMessage 
          : lastReceivedMessage;
      } else if (lastSentMessage) {
        lastMessage = lastSentMessage;
      } else if (lastReceivedMessage) {
        lastMessage = lastReceivedMessage;
      }

      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        role: user.role,
        joinDate: user.joinDate,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      users: usersWithLastMessage,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 
