import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function clearMovies() {
  console.log('🗑️ Mevcut filmler siliniyor...');
  
  await prisma.movieCast.deleteMany();
  await prisma.movieCrew.deleteMany();
  await prisma.movieGenre.deleteMany();
  await prisma.movie.deleteMany();
  
  console.log('✅ Tüm filmler ve bağlantılar silindi!');
  await prisma.$disconnect();
}

clearMovies().catch(console.error); 