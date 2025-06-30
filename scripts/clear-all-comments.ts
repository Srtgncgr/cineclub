import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllComments() {
  try {
    console.log('🧹 TÜM yorumlar kaldırılıyor...');

    // Önce mevcut yorum sayısını kontrol et
    const totalComments = await prisma.comment.count();
    console.log(`📝 Toplam ${totalComments} yorum bulundu`);

    if (totalComments === 0) {
      console.log('✅ Sistemde hiç yorum bulunamadı.');
      return;
    }

    // Onay mesajı
    console.log('⚠️ Bu işlem TÜM yorumları (gerçek kullanıcı yorumları dahil) silecektir!');
    
    // Tüm yorumları sil
    console.log('🗑️ Tüm yorumlar siliniyor...');
    
    const deleteResult = await prisma.comment.deleteMany();
    console.log(`✅ ${deleteResult.count} yorum silindi`);

    // Film istatistiklerini sıfırla
    console.log('📊 Film istatistikleri sıfırlanıyor...');
    
    const updateResult = await prisma.movie.updateMany({
      data: {
        commentCount: 0,
        localVoteCount: 0,
        localVoteAverage: 0
      }
    });

    console.log(`📊 ${updateResult.count} film istatistiği güncellendi`);

    // Son durum raporu
    const remainingComments = await prisma.comment.count();
    const totalMovies = await prisma.movie.count();
    const totalUsers = await prisma.user.count();

    console.log('\n📊 Temizlik tamamlandı!');
    console.log(`👥 Toplam kullanıcı: ${totalUsers}`);
    console.log(`🎬 Toplam film: ${totalMovies}`);
    console.log(`💬 Kalan yorum: ${remainingComments}`);
    console.log(`🗑️ Silinen toplam yorum: ${deleteResult.count}`);
    console.log('\n✨ Tüm yorumlar temizlendi. Sistem yeni yorumlar için hazır!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllComments(); 