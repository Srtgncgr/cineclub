# Geliştirme Günlüğü: Film CRUD API Entegrasyonu

**Tarih:** 25 Temmuz 2024
**Odak:** Film Veritabanı İşlemleri (CRUD) için Backend API'lerinin Oluşturulması

Bu geliştirme sürecinde, projenin temel taşlarından biri olan, kullanıcıların sisteme film eklemesine, mevcut filmleri görmesine, güncellemesine ve silmesine olanak tanıyan API uç noktaları oluşturulmuştur. Bu işlemler, "CRUD" (Create, Read, Update, Delete) olarak bilinen standart veritabanı operasyonlarını kapsar.

---

## 1. Genel Film API Rotası (`/api/movies`)

Bu rota, filmlerle ilgili iki temel işlemi yönetir: tüm filmleri listeleme ve sisteme yeni bir film ekleme.

### a. Tüm Filmleri Listeleme (`GET /api/movies`)

- **Dosya Yolu:** `src/app/api/movies/route.ts`
- **Metot:** `GET`
- **Açıklama:** Veritabanındaki tüm filmleri, en yeniden eskiye doğru sıralanmış bir şekilde getirir. Her film için ilişkili olduğu kategori, etiketler ve oylar gibi detay bilgiler de bu istekle birlikte döner.
- **Teknik Detaylar:**
  - `db.movie.findMany()` Prisma metodu kullanılarak tüm filmler çekilmiştir.
  - `include` parametresi ile `category`, `tags`, ve `votes` ilişkileri sorguya dahil edilmiştir.
  - `orderBy` ile sonuçlar `createdAt` alanına göre azalan sırada (en yeni en üstte) sıralanmıştır.

### b. Yeni Film Oluşturma (`POST /api/movies`)

- **Dosya Yolu:** `src/app/api/movies/route.ts`
- **Metot:** `POST`
- **Açıklama:** Sisteme yeni bir film eklemek için kullanılır. Bu işlem, sadece kimliği doğrulanmış (giriş yapmış) kullanıcılar tarafından gerçekleştirilebilir.
- **İşlem Adımları:**
  1.  **Yetkilendirme:** `getAuthSession()` ile kullanıcının oturum bilgisi kontrol edilir. Eğer kullanıcı giriş yapmamışsa, `401 Unauthorized` hatası döndürülür.
  2.  **Veri Doğrulama (Validation):** Gelen istekteki film verileri (`title`, `description`, `posterUrl`, vb.), `zod` ile oluşturulmuş olan `MovieSchema` kullanılarak doğrulanır. Eğer veriler geçersizse, `422 Unprocessable Entity` hatası döndürülür.
  3.  **Veritabanı Kaydı:** Doğrulanan veriler, `db.movie.create()` metodu ile veritabanına kaydedilir.
      - Film, işlemi yapan kullanıcının ID'si (`addedById`) ile ilişkilendirilir.
      - Filmle birlikte gönderilen kategoriler (`genres`) ve etiketler (`tags`) için `connectOrCreate` metodu kullanılır. Bu sayede, eğer bir kategori veya etiket veritabanında mevcutsa filmle ilişkilendirilir; mevcut değilse önce oluşturulur, sonra ilişkilendirilir.
  4.  **Yanıt:** Başarılı bir şekilde oluşturulan yeni film verisi, `201 Created` durumuyla birlikte istemciye geri döndürülür.

## 2. Spesifik Film API Rotası (`/api/movies/[id]`)

Bu dinamik rota, belirli bir filme ID'si üzerinden erişerek o filme özel işlemleri (detayları getirme, güncelleme, silme) yönetir.

### a. Film Detaylarını Getirme (`GET /api/movies/[id]`)

- **Dosya Yolu:** `src/app/api/movies/[id]/route.ts`
- **Metot:** `GET`
- **Açıklama:** ID'si belirtilen tek bir filmin tüm detaylarını getirir. Filmin yanı sıra kategorisi, etiketleri, oyları, kimin tarafından eklendiği (`addedBy`) ve filme yapılmış yorumlar (`comments`) gibi zenginleştirilmiş verileri de içerir.

### b. Film Güncelleme (`PATCH /api/movies/[id]`)

- **Dosya Yolu:** `src/app/api/movies/[id]/route.ts`
- **Metot:** `PATCH`
- **Açıklama:** Mevcut bir filmin bilgilerini günceller.
- **İşlem Adımları:**
  1.  **Yetkilendirme:** Sadece filmi ekleyen kullanıcı (`addedById`) veya `ADMIN` rolüne sahip bir kullanıcı bu işlemi yapabilir. Aksi takdirde `403 Forbidden` hatası döndürülür.
  2.  **Veri Doğrulama:** Gelen yeni veriler, yine `MovieSchema` ile doğrulanır.
  3.  **Veritabanı Güncellemesi:** `db.movie.update()` metodu ile film güncellenir. Kategori ve etiketler için önce mevcut tüm ilişkiler `set: []` ile koparılır, ardından `connectOrCreate` ile yeni ilişkiler kurulur. Bu, güncelleme sırasında kategori/etiket listesinin tamamen yeniden düzenlenmesine olanak tanır.

### c. Film Silme (`DELETE /api/movies/[id]`)

- **Dosya Yolu:** `src/app/api/movies/[id]/route.ts`
- **Metot:** `DELETE`
- **Açıklama:** Bir filmi veritabanından kalıcı olarak siler.
- **İşlem Adımları:**
  1.  **Yetkilendirme:** Güncelleme işlemindeki gibi, sadece filmi oluşturan kullanıcı veya bir admin silme işlemi yapabilir.
  2.  **Veritabanı Silme:** `db.movie.delete()` metodu ile ilgili film veritabanından silinir.

## 3. Veri Doğrulama Şeması (`MovieSchema`)

- **Dosya Yolu:** `src/lib/validators/movie.ts`
- **Açıklama:** `zod` kütüphanesi kullanılarak oluşturulan bu şema, bir film oluşturulurken veya güncellenirken API'ye gönderilen verilerin yapısını ve kurallarını tanımlar.
- **Kurallar:**
  - `title` ve `description`: Zorunlu ve en az 1 karakter olmalıdır.
  - `posterUrl`: Geçerli bir URL formatında olmalıdır.
  - `releaseDate`: Geçerli bir tarih formatında olmalıdır.
  - `genres`: En az bir kategori içermesi gereken bir dizi olmalıdır.
  - `tags`: Opsiyonel bir etiklet dizisidir.

Bu adımlar sonucunda, film verileri üzerinde tam kontrol sağlayan, güvenli ve doğrulanmış bir API altyapısı kurulmuştur.
