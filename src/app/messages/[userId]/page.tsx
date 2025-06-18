import { Suspense } from 'react';
import MessageDetail from '@/components/messages/MessageDetail';
import { Loader2 } from 'lucide-react';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

async function getUser(userId: string, currentUserId: string) {
  try {
    console.log('Kullanıcı bilgisi alınıyor:', userId);
    
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
      throw new Error('Kullanıcı bulunamadı');
    }

    // Kullanıcı verilerini formatla
    const userData = {
      id: user.id,
      name: user.displayName || user.username,
      username: user.username,
      avatar: user.avatar || '/default-avatar.png',
      bio: user.bio,
      role: user.role,
      isPrivate: user.isPrivate,
      joinDate: user.joinDate,
      isOnline: false,
      lastSeen: user.updatedAt.toISOString()
    };

    console.log('Kullanıcı verisi:', userData);
    return userData;
  } catch (error) {
    console.error('getUser hatası:', error);
    throw error;
  }
}

async function getMessages(userId: string, currentUserId: string) {
  try {
    console.log('Mesajlar alınıyor:', userId);
    
    // Diğer kullanıcının var olduğunu kontrol et
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!otherUser) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // İki kullanıcı arasındaki mesajları getir
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: userId
          },
          {
            senderId: userId,
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
      take: 50
    });

    // Karşı taraftan gelen okunmamış mesajları okundu olarak işaretle
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: currentUserId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    // Mesajları component'in beklediği formata çevir
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
      isOwn: msg.senderId === currentUserId,
      isRead: msg.isRead,
      sender: {
        id: msg.sender.id,
        name: msg.sender.displayName || msg.sender.username || 'İsimsiz Kullanıcı',
        username: msg.sender.username || '',
        avatar: msg.sender.avatar || '/default-avatar.png',
        isOnline: false
      }
    }));

    console.log('Mesajlar verisi:', formattedMessages.length);
    return formattedMessages;
  } catch (error) {
    console.error('getMessages hatası:', error);
    throw error;
  }
}

export default async function MessageDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  console.log('MessageDetailPage çağrıldı, userId:', userId);
  
  // Auth kontrolü
  const session = await auth();
  
  if (!session?.user?.id) {
    console.log('Kullanıcı girişi yapılmamış, login sayfasına yönlendiriliyor');
    redirect('/login');
  }

  const currentUserId = session.user.id;
  
  try {
    // Kullanıcı ve mesaj verilerini server tarafında al
    const [userData, messagesData] = await Promise.all([
      getUser(userId, currentUserId),
      getMessages(userId, currentUserId)
    ]);

    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }>
        <MessageDetail 
          userId={userId} 
          initialUser={userData}
          initialMessages={messagesData || []}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('MessageDetailPage genel hatası:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bir Hata Oluştu
          </h3>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu'}
          </p>
          <p className="text-sm text-gray-500">
            Lütfen giriş yaptığınızdan emin olun ve sayfayı yenileyin.
          </p>
        </div>
      </div>
    );
  }
} 