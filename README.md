# Structa CMS

Bir mimarlık/tasarım stüdyosu için geliştirilmiş, çok dilli (TR/EN) içerik yönetim sistemi. Üç bağımsız uygulamadan oluşur: bir REST API, bir yönetim paneli (admin) ve herkese açık kurumsal web sitesi.

## Proje Özeti

Structa CMS; sayfa, hizmet, proje ve blog içeriklerini rol tabanlı yetkilendirme ile yöneten, her içerik türü için TR/EN çevirisini destekleyen, sürüm geçmişi ve denetim (audit) kaydı tutan bir CMS'tir. Admin panelinden yönetilen içerikler, salt-okunur bir public API üzerinden herkese açık web sitesinde `/tr` ve `/en` altında yayınlanır.

## Mimari

Monorepo yapısında, npm workspace kullanılmadan üç bağımsız Node.js uygulaması:

```
structa-cms/
├── apps/
│   ├── api/       NestJS + Prisma 7 + PostgreSQL — REST API (port 4000)
│   ├── admin/     Next.js 16 — yönetim paneli (port 3001)
│   └── website/   Next.js 16 — herkese açık web sitesi (port 3000)
├── docker-compose.yml   PostgreSQL servisi
└── .env.example         Docker Compose ortam değişkenleri
```

- **apps/api** — Tüm veri modelini ve iş kurallarını barındırır. JWT tabanlı kimlik doğrulama, rol bazlı yetkilendirme (RBAC), denetim kaydı (audit log), sayfa sürüm geçmişi ve TR/EN çeviri tablolarını içerir. Admin ve public olmak üzere iki ayrı uç nokta grubu sunar (`/pages`, `/services`, ... yönetim; `/public/*` salt-okunur).
- **apps/admin** — API'ye sunucu tarafı proxy route'ları (`/api/*`) üzerinden bağlanır; JWT, httpOnly cookie olarak tutulur, tarayıcıya sızmaz. Sayfa oluşturucu (page builder), medya kütüphanesi, TR/EN sekmeli içerik formları, kullanıcı/rol yönetimi ve denetim kaydı görüntüleme burada.
- **apps/website** — Sunucu bileşenleri (React Server Components) üzerinden `apps/api`'nin `/public/*` uçlarını çağırır; tarayıcıdan doğrudan API'ye istek atılmaz (CORS bu yüzden yalnızca admin origin'ine açıktır). `proxy.ts` middleware'i `/tr` ve `/en` önekli URL'leri iç route ağacına rewrite eder, kök `/` isteğini `/tr`'ye yönlendirir.

## Kullanılan Teknolojiler

| Katman | Teknoloji |
| --- | --- |
| API | NestJS 12, Prisma ORM 7 (driver adapters), PostgreSQL 17, JWT (`@nestjs/jwt`), argon2 (parola hash), class-validator/class-transformer |
| Admin | Next.js 16 (App Router), React 19, TypeScript 6, Tailwind CSS 4 |
| Website | Next.js 16 (App Router, RSC, `force-dynamic`), React 19, TypeScript 6, Tailwind CSS 4 |
| Veritabanı | PostgreSQL 17 (Docker Compose ile) |
| Test | Vitest (API unit/e2e) |

## Kurulum

### Ön koşullar

- Node.js 22+ (proje Node 24 ile test edilmiştir)
- Docker Desktop (PostgreSQL için) — veya yerel bir PostgreSQL 17 kurulumu

### 1. Ortam değişkenleri

Her uygulamanın kendi `.env.example` dosyası vardır; gerçek değerlerle `.env` (api, root) veya `.env.local` (website) olarak kopyalanmalıdır:

```bash
cp .env.example .env                       # Docker Compose (Postgres kullanıcı/şifre)
cp apps/api/.env.example apps/api/.env      # DATABASE_URL, JWT_SECRET, SEED_ADMIN_*
cp apps/admin/.env.example apps/admin/.env  # API_URL
cp apps/website/.env.example apps/website/.env.local  # API_URL, NEXT_PUBLIC_API_URL
```

`apps/api/.env` içindeki `JWT_SECRET` ve `SEED_ADMIN_PASSWORD` değerlerini gerçek/kendi ortamınıza göre değiştirin. `.env*` dosyaları `.gitignore` ile hariç tutulur — hiçbir gerçek secret repoya commit edilmez, yalnızca `.env.example` şablonları takip edilir.

### 2. Docker ile PostgreSQL

```bash
docker compose up -d
```

`docker-compose.yml`, kök dizindeki `.env` dosyasındaki `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` değişkenlerini kullanır ve verileri `structa_postgres_data` adlı kalıcı bir volume'de saklar.

### 3. Bağımlılıkları kurun

```bash
cd apps/api && npm install
cd ../admin && npm install
cd ../website && npm install
```

### 4. Migration + seed (apps/api içinde)

```bash
cd apps/api
npx prisma migrate deploy   # tüm migration'ları veritabanına uygular
npx tsx prisma/seed.ts      # tek bir SUPER_ADMIN kullanıcısı upsert eder (idempotent)
```

## API / Admin / Website Çalıştırma Komutları

Her uygulama ayrı bir terminalde, kendi dizininden çalıştırılır (root'ta ortak bir script yoktur):

```bash
# Terminal 1 — API (http://localhost:4000)
cd apps/api && npm run start:dev

# Terminal 2 — Admin panel (http://localhost:3001)
cd apps/admin && npm run dev

# Terminal 3 — Public website (http://localhost:3000)
cd apps/website && npm run dev
```

Diğer scriptler:

| Uygulama | build | test | production start |
| --- | --- | --- | --- |
| api | `npm run build` (nest build) | `npm run test` (vitest, 25 test) / `npm run test:e2e` | `npm run start:prod` (`node dist/main`) |
| admin | `npm run build` | — | `npm run start` |
| website | `npm run build` | — | `npm run start` |

## Demo Kullanıcı Bilgisi

Seed script, `apps/api/.env` içindeki `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` değerleriyle tek bir **SUPER_ADMIN** hesabı oluşturur. Örnek `.env.example` değerleriyle:

```
E-posta: admin@structa.local
Şifre:   apps/api/.env dosyasındaki SEED_ADMIN_PASSWORD değeri
```

Bu bilgilerle `http://localhost:3001/login` üzerinden admin paneline giriş yapılabilir. Diğer roller (`ADMIN`, `EDITOR`, `AUTHOR`) panel içinden Kullanıcılar ekranıyla SUPER_ADMIN tarafından oluşturulur; kullanıcılar API üzerinden sert silinemez, yalnızca pasifleştirilir (`isActive: false`) — bu sayede denetim kaydı (audit log) bütünlüğü korunur.

## Temel Özellikler

- **İçerik yönetimi** — Sayfa (Page Builder ile bölüm bazlı), Hizmet, Proje (galeri görselli), Blog Yazısı CRUD'ları; taslak/yayında durumu.
- **Sayfa Oluşturucu (Page Builder)** — Hero, metin, görsel+metin, hizmetler, projeler, yazılar, CTA bölüm tipleriyle sürükle-bırak sıralamalı sayfa kurulumu; ayarlanabilir ana sayfa seçimi (yalnızca yayında bir sayfa ana sayfa olabilir).
- **Çoklu dil (TR/EN)** — Page/Service/Project/Post içerikleri, site ayarları (site adı, açıklama, footer metni, adres) ve menü öğesi etiketleri için ayrı çeviri tabloları; istenen dilde çeviri yoksa otomatik TR fallback; slug'lar dil bazında benzersiz. Public API `?locale=tr|en` ile, website `/tr` ve `/en` URL önekleriyle çalışır.
- **Rol Bazlı Yetkilendirme (RBAC)** — `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `AUTHOR` rolleri; her uç nokta rol bazlı korunur.
- **Denetim Kaydı (Audit Log)** — Tüm CREATE/UPDATE/DELETE/PUBLISH/RESTORE/LOGIN olayları kullanıcı, zaman ve varlık bilgisiyle otomatik kaydedilir.
- **Sürüm Geçmişi (Version History)** — Sayfa güncellemelerinden önce otomatik anlık görüntü (snapshot) alınır; geçmiş sürümlere (çeviriler dahil) dönülebilir.
- **Medya Kütüphanesi** — Görsel yükleme, boyut/tip bilgisi, admin formlarında medya seçici entegrasyonu.
- **Menü Yönetimi** — Header/Footer menüleri, 2 seviyeli (üst/alt öğe) hiyerarşi, sürükle-bırak olmadan yukarı/aşağı sıralama.
- **Site Ayarları** — Logo/favicon, iletişim bilgileri, sosyal medya linkleri, Google Maps/Analytics entegrasyonu.

## Notlar

- Prisma migration'ları bu ortamda `prisma migrate dev` yerine `migrate deploy` ile uygulanır (non-interaktif); yeni bir migration eklerken önce schema diff'i incelenip migration SQL'i elle yazılmalı, sonra `migrate deploy` çalıştırılmalıdır.
- `apps/api/uploads/` dizini `.gitignore` ile hariç tutulur; medya dosyaları yerel dosya sistemine yazılır, prod ortamında kalıcı bir depolama/volume gerekir.
- Media kütüphanesindeki demo görselleri küçük yer tutucu (placeholder) görsellerdir; gerçek bir demo/sunum öncesi marka görselleriyle (logo, favicon, kapak görselleri) değiştirilmesi önerilir.
