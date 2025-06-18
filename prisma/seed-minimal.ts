import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting minimal database seeding...')

  // Clear existing data (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Clearing existing data...')
    await prisma.message.deleteMany()
    await prisma.weeklyListMovie.deleteMany()
    await prisma.weeklyList.deleteMany()
    await prisma.favorite.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.vote.deleteMany()
    await prisma.watchlist.deleteMany()
    await prisma.movieCast.deleteMany()
    await prisma.movieCrew.deleteMany()
    await prisma.movieGenre.deleteMany()
    await prisma.movie.deleteMany()
    await prisma.person.deleteMany()
    await prisma.genre.deleteMany()
    await prisma.user.deleteMany()
  }

  // Hash password for users
  const hashedPassword = await bcrypt.hash('123456', 10)

  // 1. Create Users
  console.log('👥 Creating users...')
  const admin = await prisma.user.create({
    data: {
      email: 'admin@cineclub.com',
      username: 'admin',
      displayName: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      bio: 'CineClub yöneticisi ve film tutkunu',
      avatar: '/avatars/admin.jpg',
    }
  })

  const testUser = await prisma.user.create({
    data: {
      email: 'test@cineclub.com',
      username: 'filmfanatic',
      displayName: 'Film Fanatic',
      password: hashedPassword,
      role: 'USER',
      bio: 'Sinema ve film analizi tutkunu. Her türden filme açığım!',
      avatar: '/avatars/user1.jpg',
    }
  })

  // 2. Create Genres
  console.log('🎭 Creating genres...')
  const genres = [
    { tmdbId: 28, name: 'Aksiyon', slug: 'aksiyon' },
    { tmdbId: 35, name: 'Komedi', slug: 'komedi' },
    { tmdbId: 18, name: 'Drama', slug: 'drama' },
    { tmdbId: 27, name: 'Korku', slug: 'korku' },
    { tmdbId: 878, name: 'Bilim Kurgu', slug: 'bilim-kurgu' },
    { tmdbId: 10749, name: 'Romantik', slug: 'romantik' },
    { tmdbId: 53, name: 'Gerilim', slug: 'gerilim' },
    { tmdbId: 80, name: 'Suç', slug: 'suc' },
    { tmdbId: 99, name: 'Belgesel', slug: 'belgesel' },
    { tmdbId: 16, name: 'Animasyon', slug: 'animasyon' }
  ]

  const createdGenres = await Promise.all(
    genres.map(genre => 
      prisma.genre.create({ data: genre })
    )
  )

  // 3. Create People (Directors & Actors)
  console.log('👨‍🎬 Creating people...')
  const people = [
    { tmdbId: 7467, name: 'David Fincher', biography: 'Amerikalı yönetmen', profilePath: '/dcBHMgoWkv0LCkQ32W1LF5cczjq.jpg' },
    { tmdbId: 819, name: 'Edward Norton', biography: 'Amerikalı aktör', profilePath: '/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg' },
    { tmdbId: 287, name: 'Brad Pitt', biography: 'Amerikalı aktör', profilePath: '/oTWjbwO5SIqIe2zJj0pODlY8sTr.jpg' },
    { tmdbId: 138, name: 'Quentin Tarantino', biography: 'Amerikalı yönetmen', profilePath: '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg' },
    { tmdbId: 62, name: 'John Travolta', biography: 'Amerikalı aktör', profilePath: '/fuXsynLgkgJLqSa2LjcBXKPsDZS.jpg' },
    { tmdbId: 8891, name: 'Samuel L. Jackson', biography: 'Amerikalı aktör', profilePath: '/AiAYAqwpM5xmiFrAIeQvUXDCVvo.jpg' }
  ]

  const createdPeople = await Promise.all(
    people.map(person => 
      prisma.person.create({ data: person })
    )
  )

  // 4. Create Sample Movies
  console.log('🎬 Creating movies...')
  const fightClub = await prisma.movie.create({
    data: {
      tmdbId: 550,
      imdbId: 'tt0137523',
      title: 'Fight Club',
      originalTitle: 'Fight Club',
      overview: 'Uykusuzluk çeken bir ofis çalışanı ve sabun satıcısı Tyler Durden, yeraltı dövüş kulübü kurarak modern topluma karşı isyan eder.',
      releaseDate: new Date('1999-10-15'),
      year: 1999,
      runtime: 139,
      posterPath: '/8uO0gUM8aNqYLs1OsTBQiXu0fEv.jpg',
      backdropPath: '/52AfXWuXCHn3UjD17rBruA9f5qb.jpg',
      popularity: 41.416,
      voteAverage: 8.4,
      voteCount: 26280,
      addedById: admin.id
    }
  })

  const pulpFiction = await prisma.movie.create({
    data: {
      tmdbId: 680,
      imdbId: 'tt0110912',
      title: 'Pulp Fiction',
      originalTitle: 'Pulp Fiction',
      overview: 'Los Angeles\'ta geçen, birbirine bağlı hikayeler anlatan suç filmi.',
      releaseDate: new Date('1994-10-14'),
      year: 1994,
      runtime: 154,
      posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      backdropPath: '/4O3zOz8qwdm3QMR0iX0nDwJdqY1.jpg',
      popularity: 65.342,
      voteAverage: 8.5,
      voteCount: 24500,
      addedById: testUser.id
    }
  })

  // 5. Create Movie-Genre Relations
  console.log('🔗 Creating movie-genre relations...')
  
  // Fight Club - Drama, Thriller
  await prisma.movieGenre.create({
    data: {
      movieId: fightClub.id,
      genreId: createdGenres.find(g => g.name === 'Drama')!.id
    }
  })
  
  await prisma.movieGenre.create({
    data: {
      movieId: fightClub.id,
      genreId: createdGenres.find(g => g.name === 'Gerilim')!.id
    }
  })

  // Pulp Fiction - Crime, Drama
  await prisma.movieGenre.create({
    data: {
      movieId: pulpFiction.id,
      genreId: createdGenres.find(g => g.name === 'Suç')!.id
    }
  })
  
  await prisma.movieGenre.create({
    data: {
      movieId: pulpFiction.id,
      genreId: createdGenres.find(g => g.name === 'Drama')!.id
    }
  })

  // 6. Create Movie Crew (Directors)
  console.log('🎬 Creating movie crew...')
  
  // Fight Club - David Fincher
  await prisma.movieCrew.create({
    data: {
      movieId: fightClub.id,
      personId: createdPeople.find(p => p.name === 'David Fincher')!.id,
      job: 'Director',
      department: 'Directing'
    }
  })

  // Pulp Fiction - Quentin Tarantino
  await prisma.movieCrew.create({
    data: {
      movieId: pulpFiction.id,
      personId: createdPeople.find(p => p.name === 'Quentin Tarantino')!.id,
      job: 'Director',
      department: 'Directing'
    }
  })

  // 7. Create Movie Cast
  console.log('🎭 Creating movie cast...')
  
  // Fight Club Cast
  await prisma.movieCast.create({
    data: {
      movieId: fightClub.id,
      personId: createdPeople.find(p => p.name === 'Edward Norton')!.id,
      character: 'The Narrator',
      order: 0
    }
  })

  await prisma.movieCast.create({
    data: {
      movieId: fightClub.id,
      personId: createdPeople.find(p => p.name === 'Brad Pitt')!.id,
      character: 'Tyler Durden',
      order: 1
    }
  })

  // Pulp Fiction Cast
  await prisma.movieCast.create({
    data: {
      movieId: pulpFiction.id,
      personId: createdPeople.find(p => p.name === 'John Travolta')!.id,
      character: 'Vincent Vega',
      order: 0
    }
  })

  await prisma.movieCast.create({
    data: {
      movieId: pulpFiction.id,
      personId: createdPeople.find(p => p.name === 'Samuel L. Jackson')!.id,
      character: 'Jules Winnfield',
      order: 1
    }
  })

  // 8. Create Some Sample Data
  console.log('⭐ Creating sample votes...')
  await prisma.vote.create({
    data: {
      userId: testUser.id,
      movieId: fightClub.id,
      rating: 9,
      review: 'Muhteşem bir film! Tyler Durden karakteri unutulmaz.'
    }
  })

  await prisma.favorite.create({
    data: {
      userId: testUser.id,
      movieId: pulpFiction.id
    }
  })

  await prisma.watchlist.create({
    data: {
      userId: admin.id,
      movieId: fightClub.id,
      watched: true,
      watchedAt: new Date()
    }
  })

  console.log('✅ Minimal seeding completed!')
  console.log('📊 Created:')
  console.log(`- ${2} users`)
  console.log(`- ${createdGenres.length} genres`)
  console.log(`- ${createdPeople.length} people`) 
  console.log(`- ${2} movies`)
  console.log(`- ${4} movie-genre relations`)
  console.log(`- ${2} crew records`)
  console.log(`- ${4} cast records`)
  console.log(`- ${1} vote, ${1} favorite, ${1} watchlist item`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 