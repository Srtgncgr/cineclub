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
  console.log('🚀 TMDB En Popüler Filmler Tohumlama Başlatılıyor...');
  console.log('📊 Tüm zamanların en popüler 100-150 filmini çekeceğiz');

  if (!TMDB_API_KEY) {
    console.error('❌ HATA: TMDB_API_KEY environment değişkeni bulunamadı.');
    console.error('📝 Lütfen .env veya .env.local dosyasında TMDB_API_KEY=your_key_here ayarlayın');
    return;
  }

  try {
    // 1. TMDB'den film türlerini kontrol et ve eksikleri ekle
    console.log('🎭 Film türleri kontrol ediliyor ve eksikler ekleniyor...');
    const { genres: tmdbGenres } = await fetchFromTmdb<{ genres: TmdbGenre[] }>('genre/movie/list');
    
    // Mevcut türleri kontrol et
    const existingGenres = await prisma.genre.findMany();
    const existingTmdbIds = new Set(existingGenres.map(g => g.tmdbId));
    
    for (const tmdbGenre of tmdbGenres) {
      if (existingTmdbIds.has(tmdbGenre.id)) {
        console.log(`   ⏭️ Tür "${tmdbGenre.name}" zaten mevcut, geçiliyor...`);
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
    console.log(`✅ Film türleri kontrol edildi.`);

    const allGenres = await prisma.genre.findMany();
    const genreMap = new Map(allGenres.map(g => [g.tmdbId, g.id]));

    // 2. EN POPÜLER filmleri çek (discover endpoint kullanarak, popülerliğe göre sıralama)
    console.log('🔥 Tüm zamanların en popüler filmleri TMDB\'den çekiliyor...');
    let allPopularMovies: TmdbMovieResult[] = [];
    const totalPages = 8; // 8 sayfa = 160 film (20 film per sayfa)

    for (let page = 1; page <= totalPages; page++) {
      console.log(`📄 Sayfa ${page}/${totalPages} çekiliyor...`);
      
      // Discover API - popülerliğe göre sıralama, yetişkin içerik hariç
      const { results } = await fetchFromTmdb<{ results: TmdbMovieResult[] }>(
        `discover/movie?sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&vote_count.gte=1000`
      );
      
      allPopularMovies.push(...results);
      console.log(`  📝 ${results.length} film eklendi (Toplam: ${allPopularMovies.length})`);
    }

    // Yetişkin filmleri filtrele ve popülerliğe göre sırala
    allPopularMovies = allPopularMovies
      .filter(movie => !movie.adult && movie.vote_count >= 1000)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 150); // En popüler 150 film

    console.log(`🌟 Toplam ${allPopularMovies.length} adet en popüler film seçildi!`);

    // 3. Her film için detayları çek ve veritabanına kaydet
    let processedCount = 0;
    for (const movie of allPopularMovies) {
      processedCount++;
      console.log(`\n🎬 [${processedCount}/${allPopularMovies.length}] "${movie.title}" işleniyor...`);
      console.log(`   📈 Popülerlik: ${movie.popularity.toFixed(1)} | Puan: ${movie.vote_average}/10 | Oy: ${movie.vote_count}`);

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
            const genreId = genreMap.get(g.id);
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

        // Oyuncuları ve ekip üyelerini işle
        const castAndCrew = [...credits.cast, ...credits.crew];
        const uniquePeople = new Map<number, { name: string; profile_path: string | null }>();
        castAndCrew.forEach(p => uniquePeople.set(p.id, { name: p.name, profile_path: p.profile_path }));

        // Kişileri oluştur/güncelle
        for (const [tmdbId, personData] of uniquePeople.entries()) {
          await prisma.person.upsert({
            where: { tmdbId },
            update: { name: personData.name, profilePath: personData.profile_path },
            create: { tmdbId, name: personData.name, profilePath: personData.profile_path },
          });
        }

        const allPeople = await prisma.person.findMany({ 
          where: { tmdbId: { in: Array.from(uniquePeople.keys()) } } 
        });
        const personMap = new Map(allPeople.map(p => [p.tmdbId, p.id]));

        // Oyuncu bağlantıları (en popüler 15 oyuncu)
        const castConnections = credits.cast
          .slice(0, 15)
          .map(c => {
            const personId = personMap.get(c.id);
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

        // Ekip bağlantıları (yönetmen, yapımcı, senarist)
        const crewConnections = credits.crew
          .filter(c => ['Director', 'Screenplay', 'Writer', 'Producer', 'Executive Producer'].includes(c.job))
          .map(c => {
            const personId = personMap.get(c.id);
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

    console.log('\n🎊 EN POPÜLER FİLMLER BAŞARIYLA EKLENDİ!');
    console.log('📊 VERITABANI İSTATİSTİKLERİ:');
    console.log(`   🎬 Toplam Film: ${totalMovies}`);
    console.log(`   🏷️ Toplam Tür: ${totalGenres}`);
    console.log(`   👥 Toplam Kişi: ${totalPeople}`);
    console.log('\n✨ Artık sitenizde tüm zamanların en popüler filmlerini görebilirsiniz!');

  } catch (error) {
    console.error('❌ Script çalışırken hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Veritabanı bağlantısı kapatıldı.');
  }
}

main(); 