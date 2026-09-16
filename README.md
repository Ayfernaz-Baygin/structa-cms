# Structa CMS

Structa CMS, mimarlık ve tasarım stüdyoları için geliştirilmiş, TR/EN destekli bir içerik yönetim sistemi ve kurumsal web platformudur. Yönetim paneli, REST API ve public website birbirinden bağımsız üç uygulama olarak çalışır.

**Production durumu:** Aktif — Railway üzerinde yayındadır.

## Production

| Servis | Adres |
| --- | --- |
| Website | [structa-website-production.up.railway.app](https://structa-website-production.up.railway.app) |
| Admin | [structa-admin-production.up.railway.app](https://structa-admin-production.up.railway.app) |
| API | [structa-cms-production.up.railway.app](https://structa-cms-production.up.railway.app) |
| API Health | [structa-cms-production.up.railway.app/health](https://structa-cms-production.up.railway.app/health) |
| Database Health | [structa-cms-production.up.railway.app/health/database](https://structa-cms-production.up.railway.app/health/database) |

Production ortamında Railway PostgreSQL ve yüklenen medya dosyaları için persistent volume kullanılmaktadır.

## Temel Özellikler

- Sayfa, hizmet, proje ve blog içerik yönetimi
- TR/EN içerik, site ayarı ve menü desteği
- Hero, metin, görsel, liste ve CTA bölümlerinden oluşan Page Builder
- Draft/Publish içerik akışı
- Sayfa revision history ve önceki sürüme dönüş
- Kullanıcı işlemleri için audit logs
- SEO başlığı ve açıklaması yönetimi
- Görsel ve doküman destekli media library
- Header/footer menüleri ve iki seviyeli menü yapısı
- JWT authentication ve rol tabanlı yetkilendirme (RBAC)
- `SUPER_ADMIN`, `ADMIN`, `EDITOR` ve `AUTHOR` rolleri
- Public içerikler için salt okunur API

Admin paneli authentication ile korunur. Yetkili endpointler JWT ve RBAC kontrollerinden geçer; erişim tokenı admin uygulamasında `httpOnly` cookie ile yönetilir.

## Teknoloji Stack'i

| Katman | Teknolojiler |
| --- | --- |
| API | NestJS 12, TypeScript, Prisma ORM 7, PostgreSQL 17 |
| Authentication | JWT, argon2, RBAC guards |
| Admin | Next.js 16, React 19, Tailwind CSS 4 |
| Website | Next.js 16, React Server Components, Tailwind CSS 4 |
| Validation | class-validator, class-transformer |
| Test | Vitest, Supertest |
| Deployment | Railway, PostgreSQL, persistent media volume |

## Mimari

```text
structa-cms/
├── apps/
│   ├── api/       # NestJS REST API, Prisma ve iş kuralları
│   ├── admin/     # Next.js yönetim paneli
│   └── website/   # Next.js public website
├── docker-compose.yml
└── .env.example
```

### `apps/api`

Veri modeli, authentication, RBAC, içerik işlemleri, revision history, audit logs, medya depolama ve public API burada bulunur. Yönetim endpointleri korumalıdır; `/public/*` endpointleri yayınlanmış içeriği website'e sunar.

### `apps/admin`

İçerik, kullanıcı, medya, menü ve site ayarlarının yönetildiği paneldir. Tarayıcı isteklerini kendi `/api/*` route'ları üzerinden backend'e iletir.

### `apps/website`

Public API'den yayınlanmış içeriği alan kurumsal web uygulamasıdır. `/tr` ve `/en` rotaları üzerinden çok dilli içerik sunar.

## Local Development

### Gereksinimler

- Node.js 24.15+
- Docker Desktop veya PostgreSQL 17

### 1. Ortam dosyaları

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/admin/.env.example apps/admin/.env.local
cp apps/website/.env.example apps/website/.env.local
```

Örnek dosyalardaki placeholder değerleri yerel ortamınıza göre doldurun. Secret ve bağlantı bilgilerini repoya eklemeyin.

### 2. PostgreSQL

```bash
docker compose up -d
```

### 3. Bağımlılıklar

Her uygulama bağımsız bir `package.json` kullanır:

```bash
cd apps/api && npm install
cd ../admin && npm install
cd ../website && npm install
```

### 4. Migration ve başlangıç verisi

```bash
cd apps/api
npm run db:migrate
npm run db:seed
```

Seed komutu bir `SUPER_ADMIN` hesabını env değişkenlerinden oluşturur veya günceller. Giriş bilgileri kaynak kodda ya da bu dokümantasyonda tutulmaz.

### 5. Uygulamaları çalıştırma

Her komutu ayrı terminalde çalıştırın:

```bash
cd apps/api && npm run start:dev
cd apps/admin && npm run dev
cd apps/website && npm run dev
```

Yerel adresler sırasıyla API için `http://localhost:4000`, admin için `http://localhost:3001` ve website için `http://localhost:3000` şeklindedir.

## Ortam Değişkenleri

Gerçek değerler yalnızca deployment platformunda veya takip edilmeyen yerel env dosyalarında tutulmalıdır.

### API

- `DATABASE_URL`: PostgreSQL bağlantı adresi
- `JWT_SECRET`: JWT imzalama anahtarı
- `CORS_ORIGINS`: İzin verilen admin origin listesi
- `UPLOADS_DIR`: Kalıcı medya volume dizini
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`: Yalnızca seed işlemi için yönetici bilgileri
- `NODE_ENV`, `HOST`, `PORT`: Çalışma ortamı ve sunucu ayarları

### Admin ve Website

- `API_URL`: Sunucu tarafındaki API adresi
- `NEXT_PUBLIC_API_URL`: Tarayıcıdan erişilebilen public API/medya adresi
- `ALLOW_LOCAL_MEDIA_IP`: Website image optimizer için yalnızca güvenilen özel ağlarda kullanılan opsiyonel ayar

## Build ve Production Komutları

| Uygulama | Build | Type-check | Production start |
| --- | --- | --- | --- |
| API | `npm run build` | `npm run typecheck` | `npm run start:prod` |
| Admin | `npm run build` | `npm run typecheck` | `npm run start` |
| Website | `npm run build` | `npm run typecheck` | `npm run start` |

Railway üzerinde API production build komutu `npx prisma generate && npm run build` olarak yapılandırılmıştır.

Production migration'ları API dizininde `npm run db:migrate` ile uygulanır. `npm run db:seed` her deploy'da çalıştırılmamalı; yalnızca ilk kurulum veya kontrollü yönetici hesabı güncellemesi için kullanılmalıdır.

Medya dosyaları local filesystem tabanlıdır ve Railway persistent volume üzerinde saklanır. Volume silinmemeli ve deployment sırasında aynı `UPLOADS_DIR` konumuna bağlanmalıdır.
