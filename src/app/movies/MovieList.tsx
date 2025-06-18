'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { HeartButton } from '@/components/ui/heart-button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type MovieWithGenres = {
  genres: { genre: { name: string } }[];
  id: string;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  year: number | null;
};

export type MovieListProps = {
  movies: MovieWithGenres[];
};

export default function MovieList({ movies }: MovieListProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleFavoriteToggle = async (movieId: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/movies/${movieId}/favorite`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.isFavorite) {
          setFavorites(prev => new Set([...prev, movieId]));
        } else {
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(movieId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
    }
  };

  // Poster URL'ini formatla
  const formatPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return '/placeholder.svg';
    if (posterPath.startsWith('http')) return posterPath; // Harici URL
    if (posterPath.startsWith('/')) return `https://image.tmdb.org/t/p/w342${posterPath}`; // TMDB path
    return posterPath; // Diğer durumlar
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {movies.map((movie) => (
        <div key={movie.id} className="group relative">
          <Link href={`/movies/${movie.id}`} className="block">
            <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden relative">
              <img
                src={formatPosterUrl(movie.posterPath)}
                alt={`Poster for ${movie.title}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3 text-white">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold text-sm">{movie.voteAverage.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Heart Button - Hover'da görünür */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <HeartButton
              isFavorite={favorites.has(movie.id)}
              variant="default"
              size="md"
              onToggle={(isFavorite) => handleFavoriteToggle(movie.id, isFavorite)}
            />
          </div>

          <Link href={`/movies/${movie.id}`}>
            <h3 className="mt-2 font-semibold text-gray-800 group-hover:text-primary transition-colors truncate">
              {movie.title}
            </h3>
            <p className="text-sm text-gray-500">{movie.year}</p>
          </Link>
        </div>
      ))}
    </div>
  );
} 