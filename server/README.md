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

## API Endpoints (43 total)

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
├── auth/           # JWT, guards, strategies
├── users/          # Profile, stats
├── properties/     # CRUD, ranking, slug, validation
├── leads/          # Lead management
├── favorites/      # Favorit properti
├── admin/          # Moderasi, statistik
├── cloudinary/     # Image upload
└── prisma/         # Database service
```

## Database

9 tabel: `User`, `Property`, `PropertyImage`, `PropertyFeature`, `Lead`, `Favorite`, `ModerationLog`, `AuditLog`, `Session`

`PropertyFeature` menyimpan fasilitas properti sebagai string per baris (e.g. `security_24h`, `swimming_pool`, `other_nama_custom`).

```bash
bunx prisma studio   # GUI database
bunx prisma db seed  # Seed 50 properti, 4 users
```
