import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// A mapping for visual properties using Turkish names as keys
const genreVisuals: { [key: string]: { icon: string; color: string; borderColor: string; bgColor: string; iconColor: string; description: string;} } = {
  'Aksiyon': { icon: 'Zap', description: "Adrenalin dolu maceralar", color: 'from-red-500 to-orange-500', borderColor: 'border-red-500/20', bgColor: 'bg-red-500/10', iconColor: 'text-red-500' },
  'Komedi': { icon: 'Laugh', description: "Güldüren anlar", color: 'from-yellow-500 to-orange-400', borderColor: 'border-yellow-500/20', bgColor: 'bg-yellow-500/10', iconColor: 'text-yellow-600' },
  'Animasyon': { icon: 'PlayCircle', description: "Çizgi ötesi dünyalar", color: 'from-green-400 to-blue-500', borderColor: 'border-green-500/20', bgColor: 'bg-green-500/10', iconColor: 'text-green-500' },
  'Romantik': { icon: 'HeartIcon', description: "Aşk hikayeleri", color: 'from-pink-500 to-rose-500', borderColor: 'border-pink-500/20', bgColor: 'bg-pink-500/10', iconColor: 'text-pink-500' },
  'default': { icon: 'Film', description: "Tüm filmleri keşfet", color: 'from-gray-500 to-gray-600', borderColor: 'border-gray-500/20', bgColor: 'bg-gray-500/10', iconColor: 'text-gray-500' }
};

export async function GET() {
  try {
    const targetGenres = ['Aksiyon', 'Komedi', 'Animasyon', 'Romantik'];

    // 1. Fetch the specific genres we want from the database
    const genresFromDb = await prisma.genre.findMany({
      where: {
        name: {
          in: targetGenres,
        },
      },
    });

    // Create a mapping for quick lookups
    const genresMap = new Map(genresFromDb.map(g => [g.name, g]));
    
    // 2. For each *TARGET* genre, try to find it in the DB map and fetch its movies
    const categoriesWithMovies = await Promise.all(
      targetGenres.map(async (genreName) => {
        const genre = genresMap.get(genreName);

        if (!genre) {
          console.warn(`DIAGNOSTIC: Genre "${genreName}" not found in database.`);
          return null;
        }

        const movies = await prisma.movie.findMany({
          where: { genres: { some: { genreId: genre.id } } },
          orderBy: { voteCount: 'desc' },
          take: 4,
        });

        const formattedMovies = movies.map(movie => ({
          title: movie.title,
          year: movie.year,
          poster: movie.posterPath ? `${TMDB_IMAGE_BASE_URL}${movie.posterPath}` : '/placeholder.svg',
          rating: movie.voteAverage,
        }));

        const movieCount = await prisma.movie.count({
          where: { genres: { some: { genreId: genre.id } } },
        });
        
        const visuals = genreVisuals[genreName] || genreVisuals['default'];

        return {
          id: genre.id,
          name: genre.name,
          ...visuals,
          movieCount: movieCount,
          popularMovies: formattedMovies,
        };
      })
    );

    const finalCategories = categoriesWithMovies.filter(c => c !== null);
    
    // Maintain the desired order
    finalCategories.sort((a, b) => targetGenres.indexOf(a.name) - targetGenres.indexOf(b.name));

    return NextResponse.json(finalCategories);
  } catch (error) {
    console.error('Error fetching final categories:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
