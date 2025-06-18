import { getAuthSession } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
import { MovieSchema } from "@/lib/validators/movie";
import { z } from "zod";

export async function GET() {
  try {
    const movies = await db.movie.findMany({
      include: {
        genres: { include: { genre: true } },
        votes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(movies));
  } catch (error) {
    return new Response("Could not fetch movies", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, overview, posterUrl, releaseDate, tmdbId, genres } =
      MovieSchema.parse(body);

    const newMovie = await db.movie.create({
      data: {
        title,
        overview,
        posterPath: posterUrl,
        releaseDate: new Date(releaseDate),
        tmdbId: tmdbId ?? 0,
        addedById: session.user.id,
        genres: {
          create: genres.map((genre: { name: string }) => ({
            genre: {
              connectOrCreate: {
                where: { name: genre.name },
                create: { 
                  name: genre.name, 
                  slug: genre.name.toLowerCase().replace(/\s+/g, '-'),
                  tmdbId: 0
                },
              },
            },
          })),
        },
        runtime: 0,
      },
    });

    return new Response(JSON.stringify(newMovie), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    console.error(error)
    return new Response("Could not create movie", { status: 500 });
  }
} 
