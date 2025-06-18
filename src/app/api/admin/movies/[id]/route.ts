import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const { id: movieId } = await params;

    // Film var mı kontrol et
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Film bulunamadı' },
        { status: 404 }
      );
    }

    // İlişkili verileri sil (cascade delete)
    await prisma.movieGenre.deleteMany({
      where: { movieId }
    });

    await prisma.movieCrew.deleteMany({
      where: { movieId }
    });

    await prisma.movieCast.deleteMany({
      where: { movieId }
    });

    // Filmi sil
    await prisma.movie.delete({
      where: { id: movieId }
    });

    return NextResponse.json({
      success: true,
      message: 'Film başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete movie error:', error);
    return NextResponse.json(
      { error: 'Film silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: movieId } = await params;
    console.log('🔄 Film güncelleme API başladı, ID:', movieId);
    
    const session = await getAuthSession();
    console.log('👤 Session kontrol:', session?.user?.role);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('❌ Yetkisiz erişim');
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    console.log('🎬 Güncellenecek film ID:', movieId);

    const body = await request.json();
    console.log('📝 Güncelleme verisi:', JSON.stringify(body, null, 2));
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

    if (!title || !director) {
      return NextResponse.json(
        { error: 'Film adı ve yönetmen alanları zorunludur' },
        { status: 400 }
      );
    }

    // Film var mı kontrol et
    const existingMovie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!existingMovie) {
      return NextResponse.json(
        { error: 'Film bulunamadı' },
        { status: 404 }
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

    // Filmi güncelle
    console.log('🔄 Film güncelleniyor...');
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: {
        title,
        originalTitle: originalTitle || title,
        year: year || new Date().getFullYear(),
        runtime: duration || 0,
        posterPath: posterPath,
        backdropPath: backdropPath,
        voteAverage: rating || 0,
        overview: description || '',
        tmdbId: tmdbId || null,
        releaseDate: new Date(`${year || new Date().getFullYear()}-01-01`)
      }
    });
    console.log('✅ Film güncellendi, ID:', updatedMovie.id);

    // Eski ilişkileri sil
    console.log('🗑️ Eski ilişkiler siliniyor...');
    await prisma.movieGenre.deleteMany({
      where: { movieId }
    });

    await prisma.movieCrew.deleteMany({
      where: { movieId }
    });

    await prisma.movieCast.deleteMany({
      where: { movieId }
    });

    // Türleri ekle
    console.log('🎨 Yeni türler ekleniyor:', genres);
    if (genres && genres.length > 0) {
      for (const genreName of genres) {
        // Tür var mı kontrol et, yoksa oluştur
        let genre = await prisma.genre.findFirst({
          where: { name: genreName }
        });

        if (!genre) {
          // Manuel eklenen türler için tmdbId 0 kullanılır
          genre = await prisma.genre.create({
            data: {
              name: genreName,
              slug: genreName.toLowerCase().replace(/\s+/g, '-'),
              tmdbId: 0
            }
          });
        }

        // Film-tür ilişkisini oluştur
        await prisma.movieGenre.create({
          data: {
            movieId: updatedMovie.id,
            genreId: genre.id
          }
        });
      }
    }

    // Yönetmeni ekle
    if (director) {
      // Kişi var mı kontrol et, yoksa oluştur
      let person = await prisma.person.findFirst({
        where: { name: director }
      });

      if (!person) {
        // Manuel eklenen kişiler için tmdbId 0 kullanılır
        person = await prisma.person.create({
          data: {
            name: director,
            profilePath: null,
            tmdbId: 0
          }
        });
      }

      // Yönetmen olarak ekle
      await prisma.movieCrew.create({
        data: {
          movieId: updatedMovie.id,
          personId: person.id,
          job: 'Director',
          department: 'Directing'
        }
      });
    }

    // Oyuncuları ekle
    if (cast && cast.length > 0) {
      for (let i = 0; i < cast.length; i++) {
        const actorName = cast[i];
        
        // Kişi var mı kontrol et, yoksa oluştur
        let person = await prisma.person.findFirst({
          where: { name: actorName }
        });

        if (!person) {
          // Manuel eklenen kişiler için tmdbId 0 kullanılır
          person = await prisma.person.create({
            data: {
              name: actorName,
              profilePath: null,
              tmdbId: 0
            }
          });
        }

        // Oyuncu olarak ekle
        await prisma.movieCast.create({
          data: {
            movieId: updatedMovie.id,
            personId: person.id,
            character: '', // Karakter adı şimdilik boş
            order: i
          }
        });
      }
    }

    // Güncellenmiş filmi formatla ve döndür
    const movieWithDetails = await prisma.movie.findUnique({
      where: { id: updatedMovie.id },
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

    return NextResponse.json({
      success: true,
      message: 'Film başarıyla güncellendi',
      movie: formattedMovie
    });

  } catch (error) {
    console.error('💥 Film güncelleme hatası:', error);
    console.error('💥 Hata detayı:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'Stack yok');
    
    return NextResponse.json(
      { 
        error: 'Film güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 