import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pozitif ve negatif kelimeler
const positiveWords = [
  'harika', 'muhteşem', 'mükemmel', 'süper', 'çok iyi', 'güzel', 'başarılı', 
  'etkileyici', 'beğendim', 'sevdim', 'favori', 'tavsiye', 'izleyin', 'kesinlikle',
  'excellent', 'amazing', 'perfect', 'great', 'good', 'love', 'awesome', 'fantastic',
  'brilliant', 'outstanding', 'wonderful', 'incredible', 'masterpiece', 'recommend'
];

const negativeWords = [
  'kötü', 'berbat', 'saçma', 'sıkıcı', 'boş', 'anlamsız', 'zaman kaybı', 
  'beğenmedim', 'sevmedim', 'başarısız', 'vasat', 'zayıf', 'izlemeyin',
  'bad', 'terrible', 'awful', 'boring', 'waste', 'hate', 'horrible', 'stupid',
  'disappointing', 'worst', 'pathetic', 'ridiculous', 'pointless'
];

function analyzeComment(content: string): number {
  if (!content) return 3; // Boş yorum için orta puan

  const lowerContent = content.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  // Pozitif kelime sayısı
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) {
      positiveScore++;
    }
  });
  
  // Negatif kelime sayısı
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) {
      negativeScore++;
    }
  });
  
  // Puan hesaplama
  if (positiveScore > negativeScore) {
    return positiveScore >= 2 ? 5 : 4; // Çok pozitif = 5, pozitif = 4
  } else if (negativeScore > positiveScore) {
    return negativeScore >= 2 ? 1 : 2; // Çok negatif = 1, negatif = 2
  } else {
    return 3; // Nötr
  }
}

async function smartCommentRatings() {
  try {
    console.log('🧠 Akıllı yorum puanları güncelleniyor...');

    // Tüm yorumları al
    const comments = await prisma.comment.findMany({
      where: {
        content: {
          not: ""
        }
      }
    });

    console.log(`📝 ${comments.length} yorum analiz ediliyor...`);

    // Her yorumu analiz et ve puan ver
    for (const comment of comments) {
      if (comment.content) {
        const smartRating = analyzeComment(comment.content);
        
        await prisma.comment.update({
          where: { id: comment.id },
          data: { rating: smartRating }
        });

        console.log(`✅ "${comment.content.substring(0, 50)}..." → ${smartRating} puan`);
      }
    }

    // Film istatistiklerini güncelle
    console.log('📊 Film istatistikleri güncelleniyor...');
    
    const movies = await prisma.movie.findMany();
    
    for (const movie of movies) {
      const movieComments = await prisma.comment.findMany({
        where: { 
          movieId: movie.id,
          rating: { gt: 0 }
        }
      });

      const totalVotes = movieComments.length;
      const averageRating = totalVotes > 0 
        ? movieComments.reduce((sum, c) => sum + (c.rating || 0), 0) / totalVotes 
        : 0;

      await prisma.movie.update({
        where: { id: movie.id },
        data: {
          localVoteCount: totalVotes,
          localVoteAverage: averageRating
        }
      });
    }

    console.log('✅ Akıllı puanlama tamamlandı!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

smartCommentRatings(); 