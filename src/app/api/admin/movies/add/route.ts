import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 DEBUG: Film ekleme işlemi başladı');
    
    const session = await getAuthSession();
    console.log('👤 DEBUG: Session kontrol:', !!session, session?.user?.role);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('❌ DEBUG: Yetki hatası - Session:', !!session, 'Role:', session?.user?.role);
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    console.log('📦 DEBUG: Request body parse ediliyor...');
    const body = await request.json();
    console.log('📝 DEBUG: Gelen veri:', JSON.stringify(body, null, 2));
    const {
      title,
      originalTitle,
      year,
      duration,
      poster,
      backdrop,
      genres,
      director,
      cast,
      rating,
      description,
      tmdbId
    } = body;

    console.log('✅ DEBUG: Zorunlu alanlar kontrol ediliyor - Title:', !!title, 'Director:', !!director);
    if (!title || !director) {
      console.log('❌ DEBUG: Zorunlu alan eksik - Title:', title, 'Director:', director);
      return NextResponse.json(
        { error: 'Film adı ve yönetmen alanları zorunludur' },
        { status: 400 }
      );
    }

    // Poster URL'ini işle - eğer tam URL değilse TMDB prefix'i ekle
    let posterPath = null;
    if (poster) {
      if (poster.startsWith('http')) {
        // Tam URL verilmişse, TMDB formatına dönüştür
        if (poster.includes('image.tmdb.org')) {
          posterPath = poster.replace('https://image.tmdb.org/t/p/w500', '');
        } else {
          // Harici URL ise olduğu gibi kaydet
          posterPath = poster;
        }
      } else {
        // Sadece path verilmişse olduğu gibi kaydet
        posterPath = poster.startsWith('/') ? poster : `/${poster}`;
      }
    }

    // Backdrop URL'ini işle
    let backdropPath = null;
    if (backdrop) {
      if (backdrop.startsWith('http')) {
        if (backdrop.includes('image.tmdb.org')) {
          backdropPath = backdrop.replace('https://image.tmdb.org/t/p/w1920_and_h800_multi_faces', '');
        } else {
          backdropPath = backdrop;
        }
      } else {
        backdropPath = backdrop.startsWith('/') ? backdrop : `/${backdrop}`;
      }
    }

    // Yeni film oluştur
    console.log('🎬 DEBUG: Film database\'e ekleniyor...');
    console.log('📊 DEBUG: Film verisi:', {
      title,
      originalTitle: originalTitle || title,
      year: year || new Date().getFullYear(),
      runtime: duration || 0,
      posterPath: posterPath,
      backdropPath: backdropPath,
      voteAverage: rating || 0,
      tmdbId: tmdbId || 0,
      addedById: session.user.id
    });
    
    const newMovie = await prisma.movie.create({
      data: {
        title,
        originalTitle: originalTitle || title,
        year: year || new Date().getFullYear(),
        runtime: duration || 0,
        posterPath: posterPath,
        backdropPath: backdropPath,
        voteAverage: rating || 0,
        voteCount: 0,
        overview: description || '',
        tmdbId: tmdbId || null,
        popularity: 0,
        releaseDate: new Date(`${year || new Date().getFullYear()}-01-01`),
        addedById: session.user.id
      }
    });
    console.log('✅ DEBUG: Film oluşturuldu, ID:', newMovie.id);

    // Türleri ekle
    console.log('🎨 DEBUG: Türler ekleniyor:', genres);
    if (genres && genres.length > 0) {
      for (const genreName of genres) {
        console.log(`🔍 DEBUG: Tür aranıyor: ${genreName}`);
        
        // Tür var mı kontrol et, yoksa oluştur
        let genre = await prisma.genre.findFirst({
          where: { name: genreName }
        });

        if (!genre) {
          console.log(`➕ DEBUG: Yeni tür oluşturuluyor: ${genreName}`);
          // Manuel eklenen türler için tmdbId 0
          genre = await prisma.genre.create({
            data: {
              name: genreName,
              slug: genreName.toLowerCase().replace(/\s+/g, '-'),
              tmdbId: Math.floor(Math.random() * 1000000) + 1
            }
          });
          console.log(`✅ DEBUG: Tür oluşturuldu, ID: ${genre.id}`);
        } else {
          console.log(`✅ DEBUG: Tür bulundu, ID: ${genre.id}`);
        }

        // Film-tür ilişkisini oluştur
        console.log(`🔗 DEBUG: Film-tür ilişkisi oluşturuluyor: MovieID ${newMovie.id} - GenreID ${genre.id}`);
        await prisma.movieGenre.create({
          data: {
            movieId: newMovie.id,
            genreId: genre.id
          }
        });
        console.log(`✅ DEBUG: Film-tür ilişkisi oluşturuldu`);
      }
    }

    // Yönetmeni ekle
    console.log('🎭 DEBUG: Yönetmen ekleniyor:', director);
    if (director) {
      console.log(`🔍 DEBUG: Yönetmen aranıyor: ${director}`);
      
      // Kişi var mı kontrol et, yoksa oluştur
      let person = await prisma.person.findFirst({
        where: { name: director }
      });

      if (!person) {
        console.log(`➕ DEBUG: Yeni yönetmen oluşturuluyor: ${director}`);
        const tmdbId = Math.floor(Math.random() * 1000000) + 1;
        console.log(`🔢 DEBUG: Yönetmen için TMDB ID: ${tmdbId}`);
        
        // Manuel eklenen kişiler için unique tmdbId
        person = await prisma.person.create({
          data: {
            name: director,
            profilePath: null,
            tmdbId: tmdbId
          }
        });
        console.log(`✅ DEBUG: Yönetmen oluşturuldu, ID: ${person.id}`);
      } else {
        console.log(`✅ DEBUG: Yönetmen bulundu, ID: ${person.id}`);
      }

      // Yönetmen olarak ekle
      console.log(`🔗 DEBUG: Yönetmen-film ilişkisi oluşturuluyor: MovieID ${newMovie.id} - PersonID ${person.id}`);
      await prisma.movieCrew.create({
        data: {
          movieId: newMovie.id,
          personId: person.id,
          job: 'Director',
          department: 'Directing'
        }
      });
      console.log(`✅ DEBUG: Yönetmen-film ilişkisi oluşturuldu`);
    }

    // Oyuncuları ekle
    console.log('🎬 DEBUG: Oyuncular ekleniyor:', cast);
    if (cast && cast.length > 0) {
      for (let i = 0; i < cast.length; i++) {
        const actorName = cast[i];
        console.log(`🔍 DEBUG: Oyuncu aranıyor (${i+1}/${cast.length}): ${actorName}`);
        
        // Kişi var mı kontrol et, yoksa oluştur
        let person = await prisma.person.findFirst({
          where: { name: actorName }
        });

        if (!person) {
          console.log(`➕ DEBUG: Yeni oyuncu oluşturuluyor: ${actorName}`);
          const tmdbId = Math.floor(Math.random() * 1000000) + 1;
          console.log(`🔢 DEBUG: Oyuncu için TMDB ID: ${tmdbId}`);
          
          // Manuel eklenen kişiler için unique tmdbId
          person = await prisma.person.create({
            data: {
              name: actorName,
              profilePath: null,
              tmdbId: tmdbId
            }
          });
          console.log(`✅ DEBUG: Oyuncu oluşturuldu, ID: ${person.id}`);
        } else {
          console.log(`✅ DEBUG: Oyuncu bulundu, ID: ${person.id}`);
        }

        // Oyuncu olarak ekle
        console.log(`🔗 DEBUG: Oyuncu-film ilişkisi oluşturuluyor: MovieID ${newMovie.id} - PersonID ${person.id} - Order ${i}`);
        await prisma.movieCast.create({
          data: {
            movieId: newMovie.id,
            personId: person.id,
            character: '', // Karakter adı şimdilik boş
            order: i
          }
        });
        console.log(`✅ DEBUG: Oyuncu-film ilişkisi oluşturuldu`);
      }
    }

    // Eklenen filmi formatla ve döndür
    console.log('📋 DEBUG: Eklenen film detayları alınıyor...');
    const movieWithDetails = await prisma.movie.findUnique({
      where: { id: newMovie.id },
      include: {
        genres: {
          include: {
            genre: true
          }
        },
        crew: {
          include: {
            person: true
          },
          where: {
            job: 'Director'
          },
          take: 1
        },
        cast: {
          include: {
            person: true
          },
          take: 5
        }
      }
    });
    console.log('✅ DEBUG: Film detayları alındı, formatlanıyor...');

    // Poster URL'ini frontend için formatla
    const formatPosterUrl = (path: string | null) => {
      if (!path) return '/placeholder.svg';
      if (path.startsWith('http')) return path; // Harici URL
      if (path.startsWith('/')) return `https://image.tmdb.org/t/p/w500${path}`; // TMDB path
      return path; // Diğer durumlar
    };

    const formatBackdropUrl = (path: string | null) => {
      if (!path) return '';
      if (path.startsWith('http')) return path; // Harici URL
      if (path.startsWith('/')) return `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${path}`; // TMDB path
      return path; // Diğer durumlar
    };

    const formattedMovie = {
      id: movieWithDetails!.id,
      title: movieWithDetails!.title,
      originalTitle: movieWithDetails!.originalTitle || movieWithDetails!.title,
      year: movieWithDetails!.year,
      duration: movieWithDetails!.runtime,
      poster: formatPosterUrl(movieWithDetails!.posterPath),
      backdrop: formatBackdropUrl(movieWithDetails!.backdropPath),
      genres: movieWithDetails!.genres.map(g => g.genre.name),
      director: movieWithDetails!.crew.length > 0 ? movieWithDetails!.crew[0].person.name : 'Bilinmiyor',
      cast: movieWithDetails!.cast.map(c => c.person.name),
      rating: movieWithDetails!.voteAverage,
      voteCount: movieWithDetails!.voteCount,
      description: movieWithDetails!.overview,
      tmdbId: movieWithDetails!.tmdbId,
      language: 'tr',
      country: 'Turkey',
      budget: 0,
      revenue: 0,
      createdAt: movieWithDetails!.createdAt.toISOString(),
      updatedAt: movieWithDetails!.updatedAt.toISOString()
    };

    console.log('🎉 DEBUG: Film başarıyla eklendi, response hazırlanıyor...');
    console.log('📤 DEBUG: Response verisi:', JSON.stringify(formattedMovie, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Film başarıyla eklendi',
      movie: formattedMovie
    });

  } catch (error) {
    console.error('💥 DEBUG: HATA YAKALANDI!');
    console.error('💥 DEBUG: Hata türü:', typeof error);
    console.error('💥 DEBUG: Hata nesnesi:', error);
    console.error('💥 DEBUG: Hata mesajı:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    console.error('💥 DEBUG: Stack trace:', error instanceof Error ? error.stack : 'Stack yok');
    
    // Prisma hatalarını özel olarak kontrol et
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('💥 DEBUG: Prisma hata kodu:', (error as any).code);
      console.error('💥 DEBUG: Prisma hata meta:', (error as any).meta);
    }
    
    return NextResponse.json(
      { 
        error: 'Film eklenirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
        type: typeof error,
        code: error && typeof error === 'object' && 'code' in error ? (error as any).code : 'NO_CODE'
      },
      { status: 500 }
    );
  }
} 
