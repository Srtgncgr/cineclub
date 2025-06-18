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
  console.log(`Fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function main() {
  console.log('🚀 Film tohumlama betiği başlatılıyor...');

  if (!TMDB_API_KEY) {
    console.error('❌ HATA: TMDB_API_KEY environment değişkeni bulunamadı.');
    return;
  }

  try {
    // 1. Mevcut tüm filmleri, tür ilişkilerini ve türleri temizle
    console.log('🧹 Mevcut film, kişi ve ilişki verileri temizleniyor...');
    await prisma.movieGenre.deleteMany({});
    await prisma.movieCast.deleteMany({});
    await prisma.movieCrew.deleteMany({});
    await prisma.movie.deleteMany({});
    await prisma.genre.deleteMany({});
    await prisma.person.deleteMany({});
    console.log('✅ Tüm ilgili veriler başarıyla temizlendi.');

    // 2. TMDB'den film türlerini çek ve veritabanına kaydet
    console.log('🎭 Film türleri TMDB\'den çekiliyor...');
    const { genres: tmdbGenres } = await fetchFromTmdb<{ genres: TmdbGenre[] }>('genre/movie/list');
    
    await prisma.genre.createMany({
        data: tmdbGenres.map(g => ({
            tmdbId: g.id,
            name: g.name,
            slug: g.name.toLowerCase().replace(/ /g, '-')
        })),
    });
    console.log(`✅ ${tmdbGenres.length} adet film türü veritabanına eklendi.`);

    const allGenres = await prisma.genre.findMany();
    const genreMap = new Map(allGenres.map(g => [g.tmdbId, g.id]));

    // 3. En yüksek puanlı filmleri çek (ilk 5 sayfa = 100 film)
    console.log('🍿 En yüksek puanlı 100 film TMDB\'den çekiliyor...');
    let allTopRatedMovies: TmdbMovieResult[] = [];
    for (let page = 1; page <= 5; page++) {
        console.log(`Sayfa ${page} çekiliyor...`);
        const { results } = await fetchFromTmdb<{ results: TmdbMovieResult[] }>(`movie/top_rated?page=${page}`);
        allTopRatedMovies.push(...results);
    }
    console.log(`✨ ${allTopRatedMovies.length} adet en yüksek puanlı film bulundu.`);

    // 4. Her film için detayları çek ve veritabanına kaydet
    for (const movie of allTopRatedMovies) {
      console.log(`🎬 "${movie.title}" filminin detayları çekiliyor...`);
      const movieDetails: TmdbMovieDetails = await fetchFromTmdb<TmdbMovieDetails>(`movie/${movie.id}`);
      const credits: TmdbCredits = await fetchFromTmdb<TmdbCredits>(`movie/${movie.id}/credits`);

      const movieData = {
        tmdbId: movieDetails.id,
        imdbId: movieDetails.imdb_id,
        title: movieDetails.title,
        originalTitle: movieDetails.original_title,
        overview: movieDetails.overview,
        tagline: movieDetails.tagline,
        releaseDate: movieDetails.release_date ? new Date(movieDetails.release_date) : null,
        year: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : null,
        runtime: movieDetails.runtime ?? 0,
        posterPath: movieDetails.poster_path,
        backdropPath: movieDetails.backdrop_path,
        adult: movieDetails.adult,
        popularity: movieDetails.popularity,
        voteAverage: movieDetails.vote_average,
        voteCount: movieDetails.vote_count,
      };

      try {
        // Adım 1: Filmi oluştur
        const createdMovie = await prisma.movie.create({
            data: movieData,
        });
        console.log(`✅ "${createdMovie.title}" veritabanına başarıyla eklendi.`);

        // Adım 2: Tür bağlantılarını oluştur
        const genreConnections = movieDetails.genres
            .map(g => {
                const genreId = genreMap.get(g.id);
                if (!genreId) return null;
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
            console.log(`🔗 "${createdMovie.title}" için ${genreConnections.length} tür bağlantısı oluşturuldu.`);
        }

        // Oyuncu ve Ekip üyelerini oluştur/güncelle ve filmle ilişkilendir
        const castAndCrew = [...credits.cast, ...credits.crew];
        const uniquePeople = new Map<number, { name: string; profile_path: string | null }>();
        castAndCrew.forEach(p => uniquePeople.set(p.id, { name: p.name, profile_path: p.profile_path }));

        for (const [tmdbId, personData] of uniquePeople.entries()) {
            await prisma.person.upsert({
                where: { tmdbId },
                update: { name: personData.name, profilePath: personData.profile_path },
                create: { tmdbId, name: personData.name, profilePath: personData.profile_path },
            });
        }
        console.log(`🧑‍🤝‍🧑 "${createdMovie.title}" için ${uniquePeople.size} kişi (oyuncu/ekip) veritabanına eklendi/güncellendi.`);

        const allPeople = await prisma.person.findMany({ where: { tmdbId: { in: Array.from(uniquePeople.keys()) } } });
        const personMap = new Map(allPeople.map(p => [p.tmdbId, p.id]));

        // Cast bağlantılarını oluştur
        const castConnections = credits.cast
            .slice(0, 20) // Sadece ilk 20 oyuncuyu al
            .map(c => {
                const personId = personMap.get(c.id);
                if (!personId) return null;
                return {
                    movieId: createdMovie.id,
                    personId,
                    character: c.character,
                    order: c.order,
                };
            })
            .filter((c): c is NonNullable<typeof c> => c !== null);

        if (castConnections.length > 0) {
            await prisma.movieCast.createMany({ data: castConnections });
            console.log(`🎭 "${createdMovie.title}" için ${castConnections.length} oyuncu bağlantısı oluşturuldu.`);
        }

        // Crew bağlantılarını oluştur
        const crewConnections = credits.crew
            .filter(c => ['Director', 'Screenplay', 'Writer', 'Producer'].includes(c.job)) // Sadece belirli rolleri al
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
            console.log(`📝 "${createdMovie.title}" için ${crewConnections.length} ekip bağlantısı oluşturuldu.`);
        }

      } catch (e: any) {
        if (e.code === 'P2002') { // Unique constraint violation
          console.warn(`⚠️ "${movieData.title}" zaten veritabanında mevcut, geçiliyor.`);
        } else {
            console.error(`❌ "${movieData.title}" eklenirken hata oluştu:`, e);
        }
      }
    }

    console.log('🎉 Film tohumlama işlemi başarıyla tamamlandı!');
  } catch (error) {
    console.error('❌ Betik çalışırken bir hata meydana geldi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 