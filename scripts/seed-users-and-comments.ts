import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Kullanıcılar ve yorumlar ekleniyor...')

  // Hash şifresi
  const hashedPassword = await bcrypt.hash('123456', 10)

  // 10 adet kullanıcı verileri
  const users = [
    {
      email: 'ahmet@cineclub.com',
      username: 'ahmet_film',
      displayName: 'Ahmet Yılmaz',
      bio: 'Klasik filmler ve yönetmen sineması tutkunu. Özellikle 70ler sinemasını seviyorum.',
      avatar: '/avatars/ahmet.jpg'
    },
    {
      email: 'ayse@cineclub.com',
      username: 'ayse_sinema',
      displayName: 'Ayşe Demir',
      bio: 'Independent filmler ve festival filmleri izleyicisi. Sanat sineması aşığı.',
      avatar: '/avatars/ayse.jpg'
    },
    {
      email: 'mehmet@cineclub.com',
      username: 'mehmet_movie',
      displayName: 'Mehmet Özkan',
      bio: 'Aksiyon ve bilim kurgu severim. Marvel ve DC hayranı.',
      avatar: '/avatars/mehmet.jpg'
    },
    {
      email: 'fatma@cineclub.com',
      username: 'fatma_sinephile',
      displayName: 'Fatma Yılmaz',
      bio: 'Drama ve romantik komedi tutkunu. İyi bir hikaye her şeyden önemli.',
      avatar: '/avatars/fatma.jpg'
    },
    {
      email: 'ali@cineclub.com',
      username: 'ali_cineaste',
      displayName: 'Ali Vural',
      bio: 'Korku filmleri ve gerilim severim. John Carpenter hayranı.',
      avatar: '/avatars/ali.jpg'
    },
    {
      email: 'zeynep@cineclub.com',
      username: 'zeynep_film',
      displayName: 'Zeynep Aktaş',
      bio: 'Animasyon ve müzikal film tutkunu. Studio Ghibli aşığı.',
      avatar: '/avatars/zeynep.jpg'
    },
    {
      email: 'murat@cineclub.com',
      username: 'murat_cinephile',
      displayName: 'Murat Şen',
      bio: 'Suç filmleri ve noir severim. Martin Scorsese hayranı.',
      avatar: '/avatars/murat.jpg'
    },
    {
      email: 'elif@cineclub.com',
      username: 'elif_movie',
      displayName: 'Elif Çelik',
      bio: 'Belgesel ve biyografi filmleri izleyicisi. Gerçek hikayelere ilgi duyarım.',
      avatar: '/avatars/elif.jpg'
    },
    {
      email: 'burak@cineclub.com',
      username: 'burak_film',
      displayName: 'Burak Aydın',
      bio: 'Comedy ve komedi dramas severim. Christopher Nolan hayranı.',
      avatar: '/avatars/burak.jpg'
    },
    {
      email: 'selin@cineclub.com',
      username: 'selin_cinema',
      displayName: 'Selin Kılıç',
      bio: 'Türk sineması ve dünya sineması tutkunu. Yönetmen analizi yapmayı severim.',
      avatar: '/avatars/selin.jpg'
    }
  ]

  // Kullanıcıları oluştur
  console.log('👥 10 kullanıcı oluşturuluyor...')
  const createdUsers = []
  for (const userData of users) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: 'USER'
      }
    })
    createdUsers.push(user)
    console.log(`✅ ${user.displayName} oluşturuldu`)
  }

  // Mevcut filmleri al
  console.log('🎬 Mevcut filmler getiriliyor...')
  const movies = await prisma.movie.findMany({
    select: { id: true, title: true }
  })

  if (movies.length === 0) {
    console.log('⚠️ Sistemde film bulunamadı. Önce film seedi çalıştırın.')
    return
  }

  console.log(`📝 ${movies.length} film için yorumlar oluşturuluyor...`)

  // Her film için 2-3 yorum oluştur
  const commentTemplates = [
    // Pozitif yorumlar
    "Bu film gerçekten mükemmel! Yönetmenlik ve oyunculuk çok başarılı.",
    "Harika bir yapım. Her dakikası keyifli geçti, kesinlikle tavsiye ederim.",
    "Bu filmi kaç kez izlesem de bıkmıyorum. Klasik olmuş gerçekten.",
    "Muhteşem bir senaryo ve karakter gelişimi. Her detay düşünülmüş.",
    "Görsel efektler ve müzikler de çok güzel. Atmosfer mükemmel yakalanmış.",
    "Bu filmden sonra yönetmenin diğer filmlerini de izlemeye başladım.",
    "Oyuncuların performansı inanılmaz. Özellikle ana karakter çok etkileyici.",
    "Film boyunca gerilim hiç düşmüyor. Sürükleyici bir hikaye.",
    
    // Analitik yorumlar
    "Bu film toplumsal mesajlarıyla da çok önemli. Düşündürücü bir yapım.",
    "Sinematografi açısından da çok başarılı. Her kare resim gibi.",
    "Dialoglar çok güçlü yazılmış. Karakterlerin derinliği hissediliyor.",
    "Bu tür filmlerin daha çok yapılması gerekiyor. Kaliteli sinema.",
    "Prodüksiyon değerleri çok yüksek. Büyük emek verildiği belli.",
    "Hikaye anlatımı çok akıcı. Zamanı hiç hissetmedim.",
    "Bu konuyu ele alış biçimi çok orijinal. Farklı bir bakış açısı.",
    "Film müziği de ayrı bir güzellik. Sahnelerle mükemmel uyum.",
    
    // Kişisel yorumlar
    "Bu filmi arkadaşlarımla beraber izlemiştik, herkesi etkilemişti.",
    "Uzun zamandır izlediğim en iyi film diyebilirim.",
    "Bu filmle tanıştıktan sonra bu türe olan ilgim arttı.",
    "İlk izlediğimde anlayamadığım detayları şimdi fark ediyorum.",
    "Bu film benim favori filmlerim listesine girdi kesinlikle.",
    "Tekrar tekrar izlenebilecek nadir filmlerden biri.",
    "Bu film sayesinde sinema sevgim daha da arttı.",
    "Her izlediğimde yeni şeyler keşfettiğim bir yapım."
  ]

  // Her film için yorumlar
  for (const movie of movies) {
    // Her film için 2-3 arası rastgele yorum sayısı
    const commentCount = Math.floor(Math.random() * 2) + 2; // 2 veya 3 yorum
    
    // Bu film için rastgele kullanıcılar seç
    const shuffledUsers = [...createdUsers].sort(() => Math.random() - 0.5);
    const selectedUsers = shuffledUsers.slice(0, commentCount);
    
    // Bu film için rastgele yorumlar seç
    const shuffledComments = [...commentTemplates].sort(() => Math.random() - 0.5);
    const selectedComments = shuffledComments.slice(0, commentCount);
    
    for (let i = 0; i < commentCount; i++) {
      await prisma.comment.create({
        data: {
          userId: selectedUsers[i].id,
          movieId: movie.id,
          content: selectedComments[i],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Son 30 gün içinde rastgele
        }
      })
    }
    
    // Film yorum sayısını güncelle
    await prisma.movie.update({
      where: { id: movie.id },
      data: {
        commentCount: commentCount
      }
    })
    
    console.log(`✅ ${movie.title} için ${commentCount} yorum eklendi`)
  }

  // İstatistikleri göster
  const totalUsers = await prisma.user.count()
  const totalComments = await prisma.comment.count()
  const totalMovies = await prisma.movie.count()

  console.log('\n📊 Seed tamamlandı!')
  console.log(`👥 Toplam kullanıcı: ${totalUsers}`)
  console.log(`🎬 Toplam film: ${totalMovies}`)
  console.log(`💬 Toplam yorum: ${totalComments}`)
  console.log('\n✨ Tüm kullanıcılar için şifre: 123456')
}

main()
  .catch(async (e) => {
    console.error('❌ Seed hatası:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 