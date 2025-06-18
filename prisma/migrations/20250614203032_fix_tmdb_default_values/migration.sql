-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_genres" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tmdbId" BIGINT NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);
INSERT INTO "new_genres" ("id", "name", "slug", "tmdbId") SELECT "id", "name", "slug", coalesce("tmdbId", 0) AS "tmdbId" FROM "genres";
DROP TABLE "genres";
ALTER TABLE "new_genres" RENAME TO "genres";
CREATE UNIQUE INDEX "genres_tmdbId_key" ON "genres"("tmdbId");
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");
CREATE TABLE "new_movies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tmdbId" BIGINT DEFAULT 0,
    "imdbId" TEXT,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "overview" TEXT,
    "tagline" TEXT,
    "releaseDate" DATETIME,
    "year" INTEGER,
    "runtime" INTEGER NOT NULL,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "popularity" REAL NOT NULL DEFAULT 0,
    "voteAverage" REAL NOT NULL DEFAULT 0,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "localVoteCount" INTEGER NOT NULL DEFAULT 0,
    "localVoteAverage" REAL NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "addedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "movies_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_movies" ("addedById", "adult", "backdropPath", "commentCount", "createdAt", "favoriteCount", "id", "imdbId", "localVoteAverage", "localVoteCount", "originalTitle", "overview", "popularity", "posterPath", "releaseDate", "runtime", "tagline", "title", "tmdbId", "updatedAt", "voteAverage", "voteCount", "year") SELECT "addedById", "adult", "backdropPath", "commentCount", "createdAt", "favoriteCount", "id", "imdbId", "localVoteAverage", "localVoteCount", "originalTitle", "overview", "popularity", "posterPath", "releaseDate", "runtime", "tagline", "title", "tmdbId", "updatedAt", "voteAverage", "voteCount", "year" FROM "movies";
DROP TABLE "movies";
ALTER TABLE "new_movies" RENAME TO "movies";
CREATE UNIQUE INDEX "movies_tmdbId_key" ON "movies"("tmdbId");
CREATE TABLE "new_people" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tmdbId" BIGINT NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "biography" TEXT,
    "birthday" DATETIME,
    "deathday" DATETIME,
    "placeOfBirth" TEXT,
    "profilePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_people" ("biography", "birthday", "createdAt", "deathday", "id", "name", "placeOfBirth", "profilePath", "tmdbId", "updatedAt") SELECT "biography", "birthday", "createdAt", "deathday", "id", "name", "placeOfBirth", "profilePath", coalesce("tmdbId", 0) AS "tmdbId", "updatedAt" FROM "people";
DROP TABLE "people";
ALTER TABLE "new_people" RENAME TO "people";
CREATE UNIQUE INDEX "people_tmdbId_key" ON "people"("tmdbId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
