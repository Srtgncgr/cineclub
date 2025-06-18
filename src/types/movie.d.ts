export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  votes: number;
  poster: string;
  genres: string[];
  isFavorite: boolean;
  description?: string;
  director?: string;
  weeklyTheme?: string;
  position?: number;
  votes_this_week?: number;
} 