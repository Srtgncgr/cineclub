import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/messages/[userId] - Belirli kullanıcı ile olan mesajları getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { userId: otherUserId } = await params;

    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Diğer kullanıcının var olduğunu kontrol et
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true
      }
    });

    if (!otherUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // İki kullanıcı arasındaki mesajları getir
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: otherUserId
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      skip: offset,
      take: limit
    });

    // Toplam mesaj sayısı
    const totalMessages = await prisma.message.count({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: otherUserId
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId
          }
        ]
      }
    });

    // Karşı taraftan gelen okunmamış mesajları okundu olarak işaretle
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({
      success: true,
      messages,
      otherUser,
      currentUserId,
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages/[userId] - Belirli kullanıcıya mesaj gönder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    const { userId: receiverId } = await params;

    // Validation
    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content cannot be empty' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Message content is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Alıcının var olduğunu kontrol et
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true }
    });

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Kendine mesaj göndermesini engelle
    if (session.user.id === receiverId) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }

    // Mesajı oluştur
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: content.trim(),
        type: 'DIRECT'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 