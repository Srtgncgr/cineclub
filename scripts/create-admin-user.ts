import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔐 Admin kullanıcı oluşturuluyor...');

  const email = 'gencgorserhat@gmail.com';
  const username = 'serosero';
  const displayName = 'serhat gençgör';
  const password = 'Sero55400100'; // Varsayılan şifre - daha sonra değiştirebilirsiniz

  try {
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email,
        username,
        displayName,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin kullanıcı başarıyla oluşturuldu!');
    console.log('📧 Email:', user.email);
    console.log('👤 Username:', user.username);
    console.log('🎭 Rol:', user.role);
    console.log('🔑 Şifre: 123456 (Giriş yaptıktan sonra değiştirin!)');

  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️ Bu email veya username ile zaten bir kullanıcı mevcut.');
    } else {
      console.error('❌ Kullanıcı oluşturulurken hata:', error);
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Veritabanı bağlantısı kapatıldı.');
  }
}

createAdminUser(); 