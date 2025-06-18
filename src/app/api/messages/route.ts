import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/messages - Kullanıcının tüm konuşmalarını getir
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Kullanıcının tüm mesajlarını getir ve konuşma partnerleri ile grupla
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
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
        createdAt: 'desc'
      }
    });

    // Konuşmaları partner'a göre grupla
    const conversationMap = new Map();
    
    for (const message of conversations) {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? message.receiver : message.sender;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          id: `conv-${partnerId}`,
          otherUser: {
            id: partner.id,
            name: partner.displayName || partner.username,
            displayName: partner.displayName,
            username: partner.username,
            avatar: partner.avatar || '/default-avatar.png',
            isOnline: false, // Bu bilgiyi gerçek zamanlı olarak almak için başka bir sistem gerekebilir
            lastSeen: null
          },
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt.toISOString(),
            senderId: message.senderId,
            isRead: message.isRead
          },
          unreadCount: 0
        });
      }
      
      // Okunmamış mesaj sayısını hesapla
      if (message.receiverId === userId && !message.isRead) {
        conversationMap.get(partnerId).unreadCount++;
      }
    }

    const conversationList = Array.from(conversationMap.values());

    return NextResponse.json({
      success: true,
      conversations: conversationList,
      currentUserId: userId
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Yeni mesaj gönder
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, content } = await request.json();

    // Validation
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Receiver ID and content are required' },
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
