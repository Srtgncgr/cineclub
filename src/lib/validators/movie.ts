import { z } from "zod";

export const MovieSchema = z.object({
  title: z.string().min(1, "Title is required."),
  overview: z.string().min(1, "Overview is required."),
  posterUrl: z.string().url("Invalid URL format."),
  releaseDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format.",
  }),
  tmdbId: z.number().optional(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })).min(1, "At least one genre is required."),
  tags: z.array(z.object({ name: z.string() })).optional(),
}); 