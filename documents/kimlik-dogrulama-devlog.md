# CineClub - Kimlik Doğrulama Sistemi Geliştirme Günlüğü (Auth.js v5)

Bu döküman, CineClub projesine `Next.js` ve `Auth.js (NextAuth) v5` kullanılarak e-posta/şifre tabanlı kimlik doğrulama sisteminin nasıl entegre edildiğini adım adım açıklamaktadır. Amaç, süreci başlangıç seviyesindeki bir geliştiricinin bile anlayabileceği ve uygulayabileceği şekilde detaylandırmaktır.

## 1. Adım: Bağımlılıkların Kurulumu

Kimlik doğrulama sistemi için Auth.js'nin beta sürümünü, Prisma adaptörünü ve şifreleme için `bcryptjs` kütüphanesini projemize ekledik.

Aşağıdaki komutu terminalde çalıştırarak ilgili paketleri kurun:

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
```

Ayrıca, `bcryptjs` için type desteği sağlamak üzere geliştirme bağımlılığı olarak `@types/bcryptjs` paketini de kurduk:

```bash
npm install -D @types/bcryptjs
```

## 2. Adım: Ortam Değişkenlerinin (Environment Variables) Ayarlanması

Güvenlik ve veritabanı bağlantısı için gerekli olan ortam değişkenlerini projenin ana dizinindeki `.env.local` dosyasına eklememiz gerekiyor. Bu dosya gizli bilgileri içerdiği için `.gitignore` dosyasında yer almalıdır.

`.env.local` dosyanıza aşağıdaki değişkenleri ekleyin:

```env
# Veritabanı bağlantı adresiniz. Prisma kurulumunda zaten eklenmiş olmalı.
DATABASE_URL="file:./dev.db"

# Auth.js için GEREKLİ güvenlik anahtarı.
# Bu anahtar, JWT (JSON Web Tokens) ve diğer güvenlik elemanlarını imzalamak için kullanılır.
# Aşağıdaki komutla yeni bir anahtar üretebilirsiniz:
# openssl rand -base64 32
AUTH_SECRET="BURAYA_COK_GIZLI_BIR_ANAHTAR_GELECEK"
```

> **Önemli:** `AUTH_SECRET` olmadan uygulamanız üretim modunda çalışmayacaktır ve bir `MissingSecret` hatası alırsınız.

## 3. Adım: Prisma Şemasının Auth.js İçin Güncellenmesi

`Auth.js`'nin oturum, kullanıcı ve hesap bilgilerini veritabanında saklayabilmesi için `prisma/schema.prisma` dosyamıza bazı modeller eklememiz gerekiyor. `PrismaAdapter`, bu modelleri kullanarak veritabanı işlemlerini otomatik olarak yönetir.

`prisma/schema.prisma` dosyasını açın ve mevcut `User` modelini güncelleyip, `Account`, `Session` ve `VerificationToken` modellerini ekleyin:

```prisma
// ... existing models ...

model User {
  id            String    @id @default(cuid())
  name          String?
  username      String?   @unique
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ... existing models ...
```

Bu değişiklikleri yaptıktan sonra, şemayı veritabanına yansıtmak için aşağıdaki komutu çalıştırın:

```bash
npx prisma migrate dev --name authjs_update
```

## 4. Adım: NextAuth API Rotasının Oluşturulması

`Auth.js`'nin tüm kimlik doğrulama mantığını yöneteceği ana API rotasını oluşturacağız.

`src/app/api/auth/[...nextauth]/route.ts` yolunda yeni bir dosya oluşturun ve içeriğini aşağıdaki gibi düzenleyin:

```typescript
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
```

## 5. Adım: Kullanıcı Kayıt (Register) API Rotası

Kullanıcıların e-posta ve şifre ile kayıt olabilmesi için özel bir API rotası oluşturduk.

`src/app/api/auth/register/route.ts` yolunda bir dosya oluşturun ve içeriğini doldurun:

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password } = body;

    if (!name || !username || !email || !password) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: { email },
    });

    if (exist) {
      return new NextResponse('Email already exists', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
```

## 6. Adım: Middleware ile Korumalı Rotalar

Belirli sayfaları sadece giriş yapmış kullanıcıların görebilmesi için bir `middleware` dosyası oluşturduk. Bu dosya, projenin ana dizininde (`src` klasörüyle aynı seviyede) yer almalıdır.

`middleware.ts` dosyasını oluşturun ve içeriğini ekleyin:

```typescript
export { auth as middleware } from '@/app/api/auth/[...nextauth]/route';

export const config = {
  matcher: ['/profile/:path*', '/messages/:path*', '/admin/:path*'],
};
```

Bu yapılandırma, `/profile`, `/messages` ve `/admin` ile başlayan tüm rotaları koruma altına alır. Giriş yapmamış bir kullanıcı bu sayfalara erişmeye çalıştığında otomatik olarak giriş sayfasına yönlendirilir.

## 7. Adım: Frontend Entegrasyonu

Backend kurulumu tamamlandı. Şimdi frontend tarafında gerekli düzenlemeleri yaparak kimlik doğrulama sistemini kullanıcı arayüzüyle entegre edeceğiz.

### 7.1. AuthProvider Oluşturma

`useSession` hook'unun uygulama genelinde çalışabilmesi için tüm uygulamayı `SessionProvider` ile sarmalamamız gerekiyor. Bunu yapmak için özel bir bileşen oluşturduk.

`src/components/providers/auth-provider.tsx` dosyasını oluşturun:

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### 7.2. Ana Layout'u AuthProvider ile Sarmalama

Oluşturduğumuz `AuthProvider`'ı ana `layout.tsx` dosyamıza ekleyerek tüm uygulamayı kapsaması sağlandı.

`src/app/layout.tsx` dosyasını güncelleyin:

```typescript
// ... diğer import'lar
import AuthProvider from '@/components/providers/auth-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 7.3. Header Bileşenini Dinamik Hale Getirme

`Header` bileşenindeki statik "Giriş Yap / Kayıt Ol" butonlarını, kullanıcının oturum durumuna göre dinamik hale getirdik.

`src/components/layout/header.tsx` dosyasını `useSession` hook'unu kullanacak şekilde güncelleyin:

```typescript
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
// ... diğer import'lar

const Header = () => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  // ... diğer kodlar

  return (
    // ... JSX kodları
    <div className="flex items-center gap-4">
      {status === 'loading' ? (
        <div className="h-10 w-24 animate-pulse rounded-md bg-gray-700"></div>
      ) : isLoggedIn ? (
        // ... Profil menüsü JSX kodu (zaten mevcuttu)
      ) : (
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Giriş Yap
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Kayıt Ol</Button>
          </Link>
        </div>
      )}
    </div>
    // ... JSX kodları
  );
};

export default Header;
```

### 7.4. Kayıt ve Giriş Formlarını Backend'e Bağlama

Son olarak, daha önce simülasyon olarak çalışan kayıt ve giriş formlarını, oluşturduğumuz backend'e gerçek istekler gönderecek şekilde güncelledik.

**Kayıt Sayfası (`src/app/register/page.tsx`):**
Formun `onSubmit` fonksiyonunu, `/api/auth/register` rotasına `fetch` ile istek atacak şekilde düzenledik.

**Giriş Sayfası (`src/app/login/page.tsx`):**
Formun `onSubmit` fonksiyonunu, `next-auth/react`'ten gelen `signIn` fonksiyonunu çağıracak şekilde güncelledik. Bu fonksiyon, `CredentialsProvider`'ı tetikleyerek giriş işlemini gerçekleştirir.

```typescript
// src/app/login/page.tsx içindeki handleSubmit fonksiyonu örneği
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// ...

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false, // Sayfa yönlendirmesini manuel yapacağız
      email: formData.email,
      password: formData.password,
    });

    if (result?.error) {
      setError('E-posta veya şifre hatalı.');
      setLoading(false);
    } else {
      // Başarılı giriş sonrası yönlendirme
      router.push('/profile');
    }
};
```

Bu adımlarla birlikte, CineClub projesine tam fonksiyonel bir kimlik doğrulama sistemi başarıyla entegre edilmiştir. Artık kullanıcılar kayıt olabilir, giriş yapabilir ve korumalı sayfalara erişebilirler. 