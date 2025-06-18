-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_genres" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tmdbId" BIGINT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);
INSERT INTO "new_genres" ("id", "name", "slug", "tmdbId") SELECT "id", "name", "slug", "tmdbId" FROM "genres";
DROP TABLE "genres";
ALTER TABLE "new_genres" RENAME TO "genres";
CREATE UNIQUE INDEX "genres_tmdbId_key" ON "genres"("tmdbId");
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");
CREATE TABLE "new_people" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tmdbId" BIGINT,
    "name" TEXT NOT NULL,
    "biography" TEXT,
    "birthday" DATETIME,
    "deathday" DATETIME,
    "placeOfBirth" TEXT,
    "profilePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_people" ("biography", "birthday", "createdAt", "deathday", "id", "name", "placeOfBirth", "profilePath", "tmdbId", "updatedAt") SELECT "biography", "birthday", "createdAt", "deathday", "id", "name", "placeOfBirth", "profilePath", "tmdbId", "updatedAt" FROM "people";
DROP TABLE "people";
ALTER TABLE "new_people" RENAME TO "people";
CREATE UNIQUE INDEX "people_tmdbId_key" ON "people"("tmdbId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
