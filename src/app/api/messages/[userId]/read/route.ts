import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// POST /api/messages/[userId]/read - Kullanıcıdan gelen mesajları okundu olarak işaretle
export async function POST(
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

    // Diğer kullanıcının var olduğunu kontrol et
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true }
    });

    if (!otherUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Karşı taraftan gelen okunmamış mesajları okundu olarak işaretle
    const updatedMessages = await prisma.message.updateMany({
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
      updatedCount: updatedMessages.count
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
} 