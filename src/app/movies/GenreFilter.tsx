'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Genre } from '@prisma/client';
import { ChevronDown } from 'lucide-react';

type GenreFilterProps = {
  genres: Genre[];
  currentGenreId?: string;
};

export default function GenreFilter({ genres, currentGenreId }: GenreFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const genreId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (genreId === 'all') {
      params.delete('genre');
    } else {
      params.set('genre', genreId);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative">
      <select
        onChange={handleValueChange}
        value={currentGenreId || 'all'}
        className="w-48 appearance-none cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 pr-8 text-gray-700 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="all">Tüm Türler</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
} 