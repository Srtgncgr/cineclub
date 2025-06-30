import { PrismaClient, Prisma } from '@prisma/client';
import { 
  Search, 
  Film,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MovieSearch from '@/app/movies/MovieSearch';
import MovieList from '@/app/movies/MovieList';
import GenreFilter from '@/app/movies/GenreFilter';
import SortFilter from '@/app/movies/SortFilter';

const prisma = new PrismaClient();

const sortOptions = [
  { value: 'popularity.desc', label: 'Popülerliğe Göre (En Çok)' },
  { value: 'popularity.asc', label: 'Popülerliğe Göre (En Az)' },
  { value: 'voteAverage.desc', label: 'Puana Göre (En Yüksek)' },
  { value: 'voteAverage.asc', label: 'Puana Göre (En Düşük)' },
  { value: 'releaseDate.desc', label: 'Çıkış Tarihine Göre (En Yeni)' },
  { value: 'releaseDate.asc', label: 'Çıkış Tarihine Göre (En Eski)' },
];

export default async function MoviesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Next.js 15'te searchParams artık Promise döndürüyor
  const resolvedSearchParams = await searchParams;
  
  const query = typeof resolvedSearchParams?.query === 'string' ? resolvedSearchParams.query : undefined;
  const genreId = typeof resolvedSearchParams?.genre === 'string' ? resolvedSearchParams.genre : undefined;
  const sortBy = typeof resolvedSearchParams?.sortBy === 'string' ? resolvedSearchParams.sortBy : 'popularity.desc';

  const [sortField, sortOrder] = sortBy.split('.');

  const where: Prisma.MovieWhereInput = {};
  const conditions: Prisma.MovieWhereInput[] = [];

  if (query) {
    conditions.push({
      OR: [
        { title: { contains: query } },
        { originalTitle: { contains: query } },
        { cast: { some: { person: { name: { contains: query } } } } },
        { crew: { some: { person: { name: { contains: query } } } } },
      ],
    });
  }

  if (genreId) {
    conditions.push({
      genres: { some: { genreId: genreId } },
    });
  }
  
  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const movies = await prisma.movie.findMany({
    where,
    orderBy: {
      [sortField]: sortOrder,
    },
    include: {
      genres: {
        select: {
          genre: true,
        },
      },
    },
  });

  const allGenres = await prisma.genre.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-white">
      
      {/* Page Header */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <Film className="w-4 h-4" />
              <span>Film Koleksiyonu</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Film Koleksiyonunu Keşfet
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Veritabanımızdaki en popüler filmleri ara, filtrele ve keşfet.
            </p>
          </div>

          {/* Search & Filter Bar - Şimdilik devre dışı */}
          <div className="max-w-5xl mx-auto">
            <MovieSearch initialQuery={query} />
            <div className="mt-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <GenreFilter genres={allGenres} currentGenreId={genreId} />
                <SortFilter options={sortOptions} currentSortBy={sortBy} />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold">{movies.length}</span> film bulundu
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Film Listesi - İstemci Bileşeni */}
      <main className="container mx-auto px-4 py-12">
        <MovieList movies={movies} />
      </main>
    </div>
  );
} 