import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MovieSchema } from "@/lib/validators/movie";
import { z } from "zod";
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15'te params artık Promise döndürüyor
    const resolvedParams = await params;
    
    const movie = await prisma.movie.findUnique({
      where: { id: resolvedParams.id },
      include: {
        genres: { 
          include: { 
            genre: true 
          } 
        },
        cast: {
          include: { 
            person: true 
          },
          orderBy: { order: 'asc' },
          take: 20,
        },
        crew: {
          include: { 
            person: true 
          },
          where: { 
            job: { 
              in: ['Director', 'Producer', 'Writer', 'Cinematography'] 
            } 
          },
        },
      },
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Film bulunamadı' },
        { status: 404 }
      );
    }

    // Response formatını frontend'in beklediği şekilde düzenle
    const response = {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.originalTitle,
      overview: movie.overview,
      tagline: movie.tagline,
      year: movie.year,
      runtime: movie.runtime,
      posterPath: movie.posterPath,
      backdropPath: movie.backdropPath,
      voteAverage: movie.voteAverage,
      voteCount: movie.voteCount,
      releaseDate: movie.releaseDate,
      popularity: movie.popularity,
      imdbId: movie.imdbId,
      genres: movie.genres.map(({ genre }) => ({
        genre: {
          id: genre.id,
          name: genre.name
        }
      })),
      cast: movie.cast.map(({ person, character }) => ({
        person: {
          id: person.id,
          name: person.name,
          profilePath: person.profilePath
        },
        character
      })),
      crew: movie.crew.map(({ person, job }) => ({
        person: {
          id: person.id,
          name: person.name,
          profilePath: person.profilePath
        },
        job
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get movie API error:', error);
    return NextResponse.json(
      { error: 'Film detayları alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15'te params artık Promise döndürüyor
    const resolvedParams = await params;
    
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, overview, posterUrl, releaseDate, genres } =
      MovieSchema.parse(body);

    const movieToUpdate = await db.movie.findFirst({
      where: {
        id: resolvedParams.id,
      },
    });

    if (!movieToUpdate) {
      return new Response("Movie not found", { status: 404 });
    }

    if (
      movieToUpdate.addedById !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    // Önce mevcut genre ilişkilerini temizle
    await db.movieGenre.deleteMany({ where: { movieId: resolvedParams.id } });

    await db.movie.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        title,
        overview,
        posterPath: posterUrl,
        releaseDate: new Date(releaseDate),
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
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    console.error(error);
    return new Response("Could not update movie", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15'te params artık Promise döndürüyor
    const resolvedParams = await params;
    
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const movieToDelete = await db.movie.findFirst({
      where: {
        id: resolvedParams.id,
      },
    });

    if (!movieToDelete) {
      return new Response("Movie not found", { status: 404 });
    }

    if (
      movieToDelete.addedById !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    await db.movie.delete({
      where: {
        id: resolvedParams.id,
      },
    });

    return new Response("OK");
  } catch (error) {
    return new Response("Could not delete movie", { status: 500 });
  }
} 