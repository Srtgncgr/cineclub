import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTemplateComments() {
  try {
    console.log('🧹 Template yorumlar kaldırılıyor...');

    // Seed scriptinden gelen template yorumları
    const templateComments = [
      "Bu film gerçekten mükemmel! Yönetmenlik ve oyunculuk çok başarılı.",
      "Harika bir yapım. Her dakikası keyifli geçti, kesinlikle tavsiye ederim.",
      "Bu filmi kaç kez izlesem de bıkmıyorum. Klasik olmuş gerçekten.",
      "Muhteşem bir senaryo ve karakter gelişimi. Her detay düşünülmüş.",
      "Görsel efektler ve müzikler de çok güzel. Atmosfer mükemmel yakalanmış.",
      "Bu filmden sonra yönetmenin diğer filmlerini de izlemeye başladım.",
      "Oyuncuların performansı inanılmaz. Özellikle ana karakter çok etkileyici.",
      "Film boyunca gerilim hiç düşmüyor. Sürükleyici bir hikaye.",
      "Bu film toplumsal mesajlarıyla da çok önemli. Düşündürücü bir yapım.",
      "Sinematografi açısından da çok başarılı. Her kare resim gibi.",
      "Dialoglar çok güçlü yazılmış. Karakterlerin derinliği hissediliyor.",
      "Bu tür filmlerin daha çok yapılması gerekiyor. Kaliteli sinema.",
      "Prodüksiyon değerleri çok yüksek. Büyük emek verildiği belli.",
      "Hikaye anlatımı çok akıcı. Zamanı hiç hissetmedim.",
      "Bu konuyu ele alış biçimi çok orijinal. Farklı bir bakış açısı.",
      "Film müziği de ayrı bir güzellik. Sahnelerle mükemmel uyum.",
      "Bu filmi arkadaşlarımla beraber izlemiştik, herkesi etkilemişti.",
      "Uzun zamandır izlediğim en iyi film diyebilirim.",
      "Bu filmle tanıştıktan sonra bu türe olan ilgim arttı.",
      "İlk izlediğimde anlayamadığım detayları şimdi fark ediyorum.",
      "Bu film benim favori filmlerim listesine girdi kesinlikle.",
      "Tekrar tekrar izlenebilecek nadir filmlerden biri.",
      "Bu film sayesinde sinema sevgim daha da arttı.",
      "Her izlediğimde yeni şeyler keşfettiğim bir yapım."
    ];

    console.log(`🔍 ${templateComments.length} template yorum aranıyor...`);

    // Template yorumları bul ve say
    const foundTemplateComments = await prisma.comment.findMany({
      where: {
        content: {
          in: templateComments
        }
      },
      include: {
        movie: {
          select: { title: true }
        }
      }
    });

    console.log(`📝 ${foundTemplateComments.length} template yorum bulundu`);

    if (foundTemplateComments.length === 0) {
      console.log('✅ Kaldırılacak template yorum bulunamadı.');
      return;
    }

    // Template yorumları sil
    console.log('🗑️ Template yorumlar siliniyor...');
    
    for (const comment of foundTemplateComments) {
      console.log(`❌ "${comment.content?.substring(0, 50)}..." - ${comment.movie.title}`);
    }

    const deleteResult = await prisma.comment.deleteMany({
      where: {
        content: {
          in: templateComments
        }
      }
    });

    console.log(`✅ ${deleteResult.count} template yorum silindi`);

    // Film istatistiklerini güncelle
    console.log('📊 Film istatistikleri güncelleniyor...');
    
    const movies = await prisma.movie.findMany();
    
    for (const movie of movies) {
      // Kalan yorumları say
      const remainingComments = await prisma.comment.count({
        where: { movieId: movie.id }
      });

      // Kalan puanlı yorumları al
      const ratedComments = await prisma.comment.findMany({
        where: { 
          movieId: movie.id,
          rating: { gt: 0 }
        }
      });

      const totalVotes = ratedComments.length;
      const averageRating = totalVotes > 0 
        ? ratedComments.reduce((sum, c) => sum + (c.rating || 0), 0) / totalVotes 
        : 0;

      // Film istatistiklerini güncelle
      await prisma.movie.update({
        where: { id: movie.id },
        data: {
          commentCount: remainingComments,
          localVoteCount: totalVotes,
          localVoteAverage: averageRating
        }
      });
    }

    // Son durum raporu
    const totalComments = await prisma.comment.count();
    const totalMovies = await prisma.movie.count();

    console.log('\n📊 Temizlik tamamlandı!');
    console.log(`🎬 Toplam film: ${totalMovies}`);
    console.log(`💬 Kalan toplam yorum: ${totalComments}`);
    console.log(`🗑️ Silinen template yorum: ${deleteResult.count}`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTemplateComments(); 