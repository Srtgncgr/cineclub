import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

interface TmdbMovieDetails {
  id: number;
  title: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
}

async function fetchTmdbMovieDetails(tmdbId: number): Promise<TmdbMovieDetails | null> {
  try {
    const response = await fetch(`${TMDB_API_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
    
    if (!response.ok) {
      console.warn(`❌ TMDB API hatası (${response.status}) film ID: ${tmdbId}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Film detayları alınırken hata oluştu (TMDB ID: ${tmdbId}):`, error);
    return null;
  }
}

async function restoreTmdbRatings() {
  console.log('🎬 TMDB puanları geri yükleniyor...\n');

  try {
    // TMDB ID'si olan tüm filmleri al
    const movies = await prisma.movie.findMany({
      where: {
        tmdbId: {
          not: null
        }
      },
      select: {
        id: true,
        tmdbId: true,
        title: true,
        voteAverage: true,
        voteCount: true,
        localVoteAverage: true,
        localVoteCount: true
      }
    });

    console.log(`📊 ${movies.length} film bulundu.\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const movie of movies) {
      if (!movie.tmdbId) {
        skippedCount++;
        continue;
      }

      console.log(`🔄 "${movie.title}" için TMDB puanları kontrol ediliyor...`);
      
      // TMDB'den güncel verileri al
      const tmdbData = await fetchTmdbMovieDetails(movie.tmdbId);
      
      if (!tmdbData) {
        console.warn(`⚠️ "${movie.title}" için TMDB verisi alınamadı, geçiliyor.\n`);
        errorCount++;
        continue;
      }

      // Güncel TMDB puanları ile veritabanını karşılaştır
      const currentVoteAverage = Number(movie.voteAverage);
      const newVoteAverage = Number(tmdbData.vote_average);
      
      if (Math.abs(currentVoteAverage - newVoteAverage) > 0.1) {
        // Puanlar farklı, güncelle
        await prisma.movie.update({
          where: { id: movie.id },
          data: {
            voteAverage: tmdbData.vote_average,
            voteCount: tmdbData.vote_count,
            popularity: tmdbData.popularity
          }
        });

        console.log(`✅ "${movie.title}" güncellendi:`);
        console.log(`   📈 Puan: ${currentVoteAverage} → ${newVoteAverage}`);
        console.log(`   🗳️ Oy sayısı: ${movie.voteCount} → ${tmdbData.vote_count}`);
        console.log(`   📊 Site içi puan: ${movie.localVoteAverage} (${movie.localVoteCount} oy)`);
        console.log('');
        
        updatedCount++;
      } else {
        console.log(`✓ "${movie.title}" zaten güncel (${currentVoteAverage})\n`);
        skippedCount++;
      }

      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n🎉 TMDB puanları geri yükleme tamamlandı!');
    console.log(`✅ ${updatedCount} film güncellendi`);
    console.log(`➡️ ${skippedCount} film zaten günceldi`);
    console.log(`❌ ${errorCount} filmde hata oluştu`);

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
if (!TMDB_API_KEY) {
  console.error('❌ TMDB_API_KEY environment variable tanımlı değil!');
  process.exit(1);
}

restoreTmdbRatings()
  .then(() => {
    console.log('\n✨ Script başarıyla tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script hatası:', error);
    process.exit(1);
  }); 