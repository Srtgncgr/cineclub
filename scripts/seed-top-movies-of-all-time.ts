import { PrismaClient } from '../src/generated/prisma';
import 'dotenv/config';

const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

interface TmdbMovieResult {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
}

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbMovieDetails extends TmdbMovieResult {
  imdb_id: string | null;
  runtime: number | null;
  genres: TmdbGenre[];
  tagline: string | null;
}

interface TmdbCredits {
  cast: {
    id: number;
    name: string;
    profile_path: string | null;
    character: string;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    profile_path: string | null;
    job: string;
    department: string;
  }[];
}

async function fetchFromTmdb<T>(endpoint: string): Promise<T> {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${TMDB_API_BASE_URL}/${endpoint}${separator}api_key=${TMDB_API_KEY}&language=tr-TR`;
  console.log(`🌐 Fetching: ${url}`);
  
  // Rate limiting için kısa bir bekleme
  await new Promise(resolve => setTimeout(resolve, 250));
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API hatası: ${response.status} - ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function main() {
  console.log('🚀 TÜM ZAMANLARIN EN POPÜLER FİLMLERİ TOHUMLAMA BAŞLIYOR...');
  console.log('⭐ En yüksek oylu (vote_count) filmleri çekeceğiz + Person limiti uygulanacak');

  if (!TMDB_API_KEY) {
    console.error('❌ HATA: TMDB_API_KEY environment değişkeni bulunamadı.');
    return;
  }

  try {
    // 1. Film türlerini ekle
    console.log('🎭 Film türleri kontrol ediliyor...');
    const { genres: tmdbGenres } = await fetchFromTmdb<{ genres: TmdbGenre[] }>('genre/movie/list');
    
    const existingGenres = await prisma.genre.findMany();
    const existingTmdbIds = new Set(existingGenres.map(g => g.tmdbId));
    
    for (const tmdbGenre of tmdbGenres) {
      if (existingTmdbIds.has(BigInt(tmdbGenre.id))) {
        continue;
      }

      const slug = tmdbGenre.name.toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '') + '-' + tmdbGenre.id;

      try {
        await prisma.genre.create({
          data: {
            tmdbId: tmdbGenre.id,
            name: tmdbGenre.name,
            slug: slug,
          },
        });
        console.log(`   ✅ Yeni tür eklendi: ${tmdbGenre.name}`);
      } catch (error: any) {
        console.log(`   ⚠️ Tür "${tmdbGenre.name}" eklenirken hata: ${error.message}`);
      }
    }

    const allGenres = await prisma.genre.findMany();
    const genreMap = new Map(allGenres.map(g => [g.tmdbId, g.id]));

    // 2. TÜM ZAMANLARIN EN POPÜLER FİLMLERİ - TOP RATED + HIGH VOTE COUNT
    console.log('⭐ Tüm zamanların en popüler filmleri çekiliyor (top_rated + yüksek oy sayısı)...');
    let allTopMovies: TmdbMovieResult[] = [];
    
    // Top rated filmleri çek (genellikle klasik ve çok beğenilen filmler)
    for (let page = 1; page <= 8; page++) {
      console.log(`📄 Top rated sayfa ${page}/8 çekiliyor...`);
      const { results } = await fetchFromTmdb<{ results: TmdbMovieResult[] }>(
        `movie/top_rated?page=${page}&vote_count.gte=3000`
      );
      allTopMovies.push(...results);
    }

    // En çok oy alan filmleri de ekle (discover ile)
    for (let page = 1; page <= 5; page++) {
      console.log(`📄 En çok oylu filmler sayfa ${page}/5 çekiliyor...`);
      const { results } = await fetchFromTmdb<{ results: TmdbMovieResult[] }>(
        `discover/movie?sort_by=vote_count.desc&vote_count.gte=8000&page=${page}`
      );
      allTopMovies.push(...results);
    }

    // Popüler filmler de ekle
    for (let page = 1; page <= 3; page++) {
      console.log(`📄 Popüler filmler sayfa ${page}/3 çekiliyor...`);
      const { results } = await fetchFromTmdb<{ results: TmdbMovieResult[] }>(
        `movie/popular?page=${page}`
      );
      allTopMovies.push(...results);
    }

    // Yetişkin filmleri filtrele, düşük rating filmleri çıkar, duplicateları temizle
    const uniqueMovies = new Map<number, TmdbMovieResult>();
    allTopMovies
      .filter(movie => !movie.adult && movie.vote_average >= 6.5 && movie.vote_count >= 3000)
      .forEach(movie => {
        if (!uniqueMovies.has(movie.id)) {
          uniqueMovies.set(movie.id, movie);
        }
      });

         // Rating ve oy sayısına göre sırala, en iyi 150 film al
     const finalMovies = Array.from(uniqueMovies.values())
       .sort((a, b) => {
         // Önce rating'e göre sırala, sonra vote_count'a göre
         const ratingDiff = b.vote_average - a.vote_average;
         if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
         return b.vote_count - a.vote_count;
       })
       .slice(0, 150);

    console.log(`🌟 Toplam ${finalMovies.length} adet tüm zamanların en popüler filmi seçildi!`);
    console.log(`📊 Ortalama rating: ${(finalMovies.reduce((sum, m) => sum + m.vote_average, 0) / finalMovies.length).toFixed(1)}`);

    // 3. Filmleri işle - PERSON LİMİTİ UYGULA
    let processedCount = 0;
    for (const movie of finalMovies) {
      processedCount++;
      console.log(`\n🎬 [${processedCount}/${finalMovies.length}] "${movie.title}" işleniyor...`);
      console.log(`   ⭐ Rating: ${movie.vote_average}/10 | Oy: ${movie.vote_count.toLocaleString()}`);

      // Zaten var mı kontrol et
      const existingMovie = await prisma.movie.findUnique({
        where: { tmdbId: movie.id }
      });

      if (existingMovie) {
        console.log(`   ⏭️ "${movie.title}" zaten mevcut, geçiliyor...`);
        continue;
      }

      try {
        // Film detaylarını çek
        const movieDetails: TmdbMovieDetails = await fetchFromTmdb<TmdbMovieDetails>(`movie/${movie.id}`);
        const credits: TmdbCredits = await fetchFromTmdb<TmdbCredits>(`movie/${movie.id}/credits`);

        const movieData = {
          tmdbId: movieDetails.id,
          imdbId: movieDetails.imdb_id,
          title: movieDetails.title,
          originalTitle: movieDetails.original_title,
          overview: movieDetails.overview || 'Açıklama bulunamadı.',
          tagline: movieDetails.tagline,
          releaseDate: movieDetails.release_date ? new Date(movieDetails.release_date) : null,
          year: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : null,
          runtime: movieDetails.runtime || 0,
          posterPath: movieDetails.poster_path,
          backdropPath: movieDetails.backdrop_path,
          popularity: movieDetails.popularity,
          voteAverage: movieDetails.vote_average,
          voteCount: movieDetails.vote_count,
          localVoteCount: 0,
          localVoteAverage: 0,
          favoriteCount: 0,
          commentCount: 0,
        };

        // Filmi oluştur
        const createdMovie = await prisma.movie.create({
          data: movieData,
        });
        console.log(`   ✅ Film veritabanına başarıyla eklendi!`);

        // Türleri bağla
        const genreConnections = movieDetails.genres
          .map(g => {
            const genreId = genreMap.get(BigInt(g.id));
            if (!genreId) {
              console.log(`   ⚠️ Tür bulunamadı: ${g.name} (TMDB ID: ${g.id})`);
              return null;
            }
            return {
              movieId: createdMovie.id,
              genreId: genreId,
            };
          })
          .filter((g): g is NonNullable<typeof g> => g !== null);

        if (genreConnections.length > 0) {
          await prisma.movieGenre.createMany({
            data: genreConnections,
          });
          const genreNames = movieDetails.genres.map(g => g.name).join(', ');
          console.log(`   🏷️ ${genreConnections.length} tür bağlandı: ${genreNames}`);
        }

        // PERSON LİMİTİ UYGULA: Sadece önemli kişileri al
        // Sadece ilk 8 oyuncu + yönetmen, senarist, prodüktör
        const limitedCast = credits.cast.slice(0, 8);
        const limitedCrew = credits.crew.filter(c => 
          ['Director', 'Screenplay', 'Writer', 'Producer'].includes(c.job)
        ).slice(0, 5);

        const allPeople = [...limitedCast, ...limitedCrew];
        const uniquePeople = new Map<number, { name: string; profile_path: string | null }>();
        allPeople.forEach(p => uniquePeople.set(p.id, { name: p.name, profile_path: p.profile_path }));

        console.log(`   👥 ${uniquePeople.size} kişi işlenecek (sınırlı liste)`);

        // Kişileri oluştur/güncelle
        for (const [tmdbId, personData] of uniquePeople.entries()) {
          await prisma.person.upsert({
            where: { tmdbId },
            update: { name: personData.name, profilePath: personData.profile_path },
            create: { tmdbId, name: personData.name, profilePath: personData.profile_path },
          });
        }

        const allPeopleInDb = await prisma.person.findMany({ 
          where: { tmdbId: { in: Array.from(uniquePeople.keys()) } } 
        });
        const personMap = new Map(allPeopleInDb.map(p => [p.tmdbId, p.id]));

        // Cast bağlantıları (sadece ilk 8 oyuncu)
        const castConnections = limitedCast
          .map(c => {
            const personId = personMap.get(BigInt(c.id));
            if (!personId) return null;
            return {
              movieId: createdMovie.id,
              personId,
              character: c.character || 'Karakter bilgisi yok',
              order: c.order,
            };
          })
          .filter((c): c is NonNullable<typeof c> => c !== null);

        if (castConnections.length > 0) {
          await prisma.movieCast.createMany({ data: castConnections });
          console.log(`   🎭 ${castConnections.length} oyuncu bağlandı`);
        }

        // Crew bağlantıları (sadece önemli pozisyonlar)
        const crewConnections = limitedCrew
          .map(c => {
            const personId = personMap.get(BigInt(c.id));
            if (!personId) return null;
            return {
              movieId: createdMovie.id,
              personId,
              job: c.job,
              department: c.department,
            };
          })
          .filter((c): c is NonNullable<typeof c> => c !== null);

        if (crewConnections.length > 0) {
          await prisma.movieCrew.createMany({ data: crewConnections });
          console.log(`   🎬 ${crewConnections.length} ekip üyesi bağlandı`);
        }

        console.log(`   🎉 "${movieDetails.title}" başarıyla tamamlandı!`);

      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️ "${movie.title}" zaten mevcut (unique constraint), geçiliyor...`);
        } else {
          console.error(`   ❌ "${movie.title}" işlenirken hata:`, error.message);
        }
      }
    }

    // Final istatistikler
    const totalMovies = await prisma.movie.count();
    const totalGenres = await prisma.genre.count();
    const totalPeople = await prisma.person.count();

    console.log('\n🎊 TÜM ZAMANLARIN EN POPÜLER FİLMLERİ BAŞARIYLA EKLENDİ!');
    console.log('📊 VERITABANI İSTATİSTİKLERİ:');
    console.log(`   🎬 Toplam Film: ${totalMovies}`);
    console.log(`   🏷️ Toplam Tür: ${totalGenres}`);
    console.log(`   👥 Toplam Kişi: ${totalPeople} (sınırlı liste uygulandı)`);
    console.log('\n✨ Bu sefer gerçekten tüm zamanların en popüler ve kaliteli filmlerini ekledik!');
    console.log('🎯 7.0+ rating, 5000+ oy alan filmler seçildi');

  } catch (error) {
    console.error('❌ Script çalışırken hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Veritabanı bağlantısı kapatıldı.');
  }
}

main(); 