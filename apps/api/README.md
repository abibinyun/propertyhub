# PropertyHub — Backend

REST API untuk platform listing properti. Dibangun dengan NestJS + PostgreSQL + Prisma.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + cookie-based (httpOnly)
- **Storage**: Cloudinary (image upload)
- **Runtime**: Bun

## Setup

```bash
bun install
cp .env.example .env   # isi semua variabel
bunx prisma migrate dev
bunx prisma db seed
bun run start:dev
```

Server berjalan di `http://localhost:3001`.

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/propertyhub
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
APP_URL=http://localhost:3000
NODE_ENV=development
```

## API Endpoints (82 total)

### Auth
| Method | Path | Deskripsi |
|---|---|---|
| POST | /auth/register | Register user baru |
| POST | /auth/login | Login, set cookie |
| POST | /auth/logout | Logout, clear cookie |
| GET | /auth/me | Data user saat ini |

### Properties
| Method | Path | Deskripsi |
|---|---|---|
| GET | /properties | Semua properti |
| GET | /properties/jual | Properti dijual |
| GET | /properties/jual/:city | Per kota |
| GET | /properties/jual/:city/:type | Per kota + jenis |
| GET | /properties/jual/:city/:district/:type | Per kota + kecamatan + jenis |
| GET | /properties/properti/detail/:slug | Detail properti |
| GET | /properties/my | Properti milik user (auth) |
| POST | /properties | Buat properti (auth) |
| PATCH | /properties/:slug | Update properti (auth) |
| DELETE | /properties/:slug | Hapus properti (auth) |
| POST | /properties/:id/images | Upload gambar (auth) |
| PATCH | /properties/images/:imageId/primary | Set foto utama (auth) |
| DELETE | /properties/images/:imageId | Hapus gambar (auth) |

### Leads, Favorites, Admin — lihat [docs/API.md](../docs/API.md)

## Modules

```
src/
├── auth/           # JWT, guards, strategies, OAuth, password reset
├── users/          # Profile, stats, password change
├── properties/     # CRUD, ranking, slug, validation, analytics
├── leads/          # Lead management, anti-spam, CSV export
├── favorites/      # Favorit properti
├── admin/          # Moderasi, statistik, user management
├── reviews/        # Agent reviews & ratings
├── reports/        # Report spam/scam listings
├── saved-searches/ # Saved search filters + digest
├── notifications/  # In-app notifications (bell icon)
├── payment/        # Modular payment (log/midtrans)
├── email/          # Modular email (log/resend)
├── digest/         # Weekly email digest cron
├── settings/       # SiteSettings (admin-configurable)
├── cloudinary/     # Image upload service
└── prisma/         # Database service
```

## Database

15 tabel: `User`, `Property`, `PropertyImage`, `PropertyFeature`, `PropertyView`, `Lead`, `Transaction`, `ModerationLog`, `Favorite`, `Report`, `SavedSearch`, `Notification`, `PriceHistory`, `SiteSettings`, `Review`

`PropertyFeature` menyimpan fasilitas properti sebagai string per baris (e.g. `security_24h`, `swimming_pool`, `other_nama_custom`).

```bash
bunx prisma studio   # GUI database
bunx prisma db seed  # Seed 50 properti, 4 users
```
