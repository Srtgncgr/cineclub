# Mesaj Sistemi Teknik Dokümantasyonu

## İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Veritabanı Şeması](#veritabanı-şeması)
3. [API Endpointleri](#api-endpointleri)
4. [Frontend Bileşenleri](#frontend-bileşenleri)
5. [Özellikler ve İşlevler](#özellikler-ve-işlevler)
6. [Güvenlik](#güvenlik)
7. [Hata Yönetimi](#hata-yönetimi)

## Genel Bakış

Bu dokümantasyon, Next.js ve Prisma kullanılarak geliştirilmiş gerçek zamanlı mesajlaşma sistemini açıklamaktadır. Sistem, kullanıcılar arasında mesajlaşma, okunmamış mesaj takibi, mesaj arama ve filtreleme gibi temel özellikleri içermektedir.

## Veritabanı Şeması

Prisma şeması aşağıdaki gibi tanımlanmıştır:

```prisma
model Message {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  isRead    Boolean  @default(false)
  isOwn     Boolean  @default(false)
  sender    User     @relation("SentMessages", fields: [senderId], references: [id])
  senderId  String
  receiver  User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
  receiverId String
}

model User {
  id              String    @id @default(cuid())
  username        String    @unique
  displayName     String
  email           String    @unique
  password        String
  avatar          String?
  bio            String?
  role           String    @default("user")
  isPrivate      Boolean   @default(false)
  joinDate       DateTime  @default(now())
  sentMessages    Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
}
```

## API Endpointleri

### 1. Tüm Mesajları Getir
```typescript
// GET /api/messages
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      conversations
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
```

### 2. Belirli Bir Kullanıcı ile Mesajları Getir
```typescript
// GET /api/messages/[userId]
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const otherUserId = params.userId;

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
        sender: true,
        receiver: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      messages,
      otherUser: await prisma.user.findUnique({
        where: { id: otherUserId }
      })
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
```

### 3. Mesaj Gönder
```typescript
// POST /api/messages/[userId]
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    const senderId = session.user.id;
    const receiverId = params.userId;

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId
      },
      include: {
        sender: true,
        receiver: true
      }
    });

    return NextResponse.json({
      success: true,
      message
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
```

## Frontend Bileşenleri

### 1. Mesajlar Sayfası (MessagesPage)
```typescript
// src/app/messages/page.tsx
export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/messages');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Mesajlar yüklenirken bir hata oluştu');
        }

        setConversations(data.conversations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // ... diğer kodlar
}
```

### 2. Mesaj Detay Sayfası (MessageDetailPage)
```typescript
// src/app/messages/[userId]/page.tsx
export default function MessageDetailPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/messages/${userId}?page=${page}&limit=50`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Mesajlar yüklenirken bir hata oluştu');
        }

        const formattedMessages = data.messages.map((message: any) => ({
          ...message,
          timestamp: message.createdAt || message.timestamp,
          isOwn: message.senderId === data.currentUserId
        }));

        setMessages(prev => [...prev, ...formattedMessages]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId, page]);

  // ... diğer kodlar
}
```

## Özellikler ve İşlevler

### 1. Mesaj Gönderme
- Kullanıcılar arasında metin tabanlı mesajlaşma
- Mesaj durumu takibi (gönderildi, iletildi, okundu)
- Mesaj geçmişi görüntüleme

### 2. Mesaj Filtreleme ve Arama
- Tüm mesajlar
- Okunmamış mesajlar
- Sabitlenmiş mesajlar
- Kullanıcı adı veya mesaj içeriğine göre arama

### 3. Kullanıcı Yönetimi
- Kullanıcı profilleri
- Çevrimiçi/çevrimdışı durumu
- Son görülme zamanı

## Güvenlik

1. Kimlik Doğrulama
```typescript
// Middleware ile koruma
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = ['/', '/login', '/register'].includes(nextUrl.pathname);

  if (isApiAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});
```

2. API Güvenliği
- Her API isteği için oturum kontrolü
- Kullanıcı yetkilendirmesi
- Rate limiting

## Hata Yönetimi

1. Frontend Hata Yönetimi
```typescript
const [error, setError] = useState<string | null>(null);

try {
  // API isteği
} catch (err) {
  setError(err instanceof Error ? err.message : 'Bir hata oluştu');
}

// Hata gösterimi
{error && (
  <div className="p-12 text-center">
    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Bir Hata Oluştu
    </h3>
    <p className="text-gray-600 mb-6">
      {error}
    </p>
    <Button variant="primary" onClick={() => window.location.reload()}>
      Yeniden Dene
    </Button>
  </div>
)}
```

2. Backend Hata Yönetimi
```typescript
try {
  // İşlem
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'İşlem başarısız oldu' },
    { status: 500 }
  );
}
```

## Kurulum ve Çalıştırma

1. Gerekli paketlerin kurulumu:
```bash
npm install @prisma/client next-auth bcryptjs
npm install -D prisma @types/bcryptjs
```

2. Veritabanı kurulumu:
```bash
npx prisma generate
npx prisma db push
```

3. Ortam değişkenlerinin ayarlanması (.env):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Uygulamayı başlatma:
```bash
npm run dev
```

## Örnek Kullanım

1. Mesaj Gönderme:
```typescript
const handleSendMessage = async () => {
  if (!newMessage.trim()) return;

  try {
    const response = await fetch(`/api/messages/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newMessage }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Mesaj gönderilirken bir hata oluştu');
    }

    setMessages(prev => [...prev, data.message]);
    setNewMessage('');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Bir hata oluştu');
  }
};
```

2. Mesajları Getirme:
```typescript
const fetchMessages = async () => {
  try {
    const response = await fetch(`/api/messages/${userId}?page=${page}&limit=50`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Mesajlar yüklenirken bir hata oluştu');
    }

    setMessages(prev => [...prev, ...data.messages]);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Bir hata oluştu');
  }
};
```

## Notlar ve Öneriler

1. Performans İyileştirmeleri
- Mesaj sayfalama (pagination)
- Sonsuz kaydırma (infinite scroll)
- Mesaj önbelleğe alma (caching)

2. Güvenlik Önerileri
- Rate limiting uygulama
- Input validasyonu
- XSS koruması
- CSRF koruması

3. Kullanıcı Deneyimi
- Yükleme durumları
- Hata mesajları
- Geri bildirimler
- Responsive tasarım

4. Gelecek Özellikler
- Dosya paylaşımı
- Emoji desteği
- Sesli mesajlar
- Görüntülü görüşme
- Grup sohbetleri 