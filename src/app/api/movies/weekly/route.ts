import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Bu hafta seçilen filmleri getir (şimdilik mock data döndürelim)
    // Gerçekte WeeklyList tablosundan gelecek
    const weeklyMovies = [
      {
        id: 1,
        title: "Parasite",
        year: 2019,
        rating: 8.6,
        votes: 2456,
        poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        genres: ["Thriller", "Drama", "Comedy"],
        director: "Bong Joon-ho",
        description: "Oscar ödüllü güney kore yapımı çarpıcı sosyal drama",
        weeklyTheme: "Uluslararası Sinema",
        position: 1,
        votes_this_week: 1847
      },
      {
        id: 2,
        title: "Spirited Away",
        year: 2001,
        rating: 9.3,
        votes: 1789,
        poster: "https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
        genres: ["Animation", "Adventure", "Family"],
        director: "Hayao Miyazaki",
        description: "Studio Ghibli'nin büyülü dünyasında unutulmaz bir yolculuk",
        weeklyTheme: "Anime Klasikleri",
        position: 2,
        votes_this_week: 1653
      },
      {
        id: 3,
        title: "There Will Be Blood",
        year: 2007,
        rating: 8.2,
        votes: 1234,
        poster: "https://m.media-amazon.com/images/M/MV5BMjAxODQ4MDU5NV5BMl5BanBnXkFtZTcwMDU4MjU1MQ@@._V1_SX300.jpg",
        genres: ["Drama"],
        director: "Paul Thomas Anderson",
        description: "Daniel Day-Lewis'in muhteşem performansıyla epik drama",
        weeklyTheme: "Karakter Odaklı Dramalar",
        position: 3,
        votes_this_week: 982
      }
    ];

    return NextResponse.json(weeklyMovies);
  } catch (error) {
    console.error('Error fetching weekly movies:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
