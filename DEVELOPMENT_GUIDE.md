# Development Guide — PropertyHub

**Last Updated:** 2026-03-25 WIB
**Status:** Backend ✅ | Frontend ✅ | Deployment ⏳

---

## 🚀 Menjalankan Project

### Prasyarat
- Bun >= 1.0
- PostgreSQL (bisa via Docker)
- Node.js >= 20 (untuk tooling)

### Backend
```bash
cd server
cp .env.example .env   # isi semua variabel
bun install
bunx prisma migrate deploy
bunx prisma db seed
bun run start:dev      # http://localhost:3001
```

### Frontend
```bash
cd client
cp .env.example .env.local
bun install
bun run dev            # http://localhost:3000 (Turbopack)
```

### Database via Docker
```bash
docker run -d --name postgres \
  -e POSTGRES_DB=property \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:15-alpine
```

---

## 📁 Struktur Project

```
property-webapp/          ← Monorepo
├── server/               ← NestJS backend (port 3001)
│   ├── src/
│   │   ├── auth/         ← JWT, register, login, email verification
│   │   ├── email/        ← EmailService modular (log/resend)
│   │   ├── users/        ← Profile management
│   │   ├── properties/   ← CRUD, SEO slug, ranking, image upload
│   │   ├── leads/        ← Contact forms, anti-spam
│   │   ├── favorites/    ← Bookmarks
│   │   ├── admin/        ← Moderation, stats, charts
│   │   └── cloudinary/   ← Image upload service
│   └── prisma/
│       ├── schema.prisma
│       ├── migrations/
│       └── seed.ts
│
├── client/               ← Next.js frontend (port 3000)
│   ├── app/              ← App Router pages (Server Components)
│   │   ├── (listing)/    ← /jual, /sewa, /jual/[city]/...
│   │   ├── properti/     ← /properti/[location]/[slug]
│   │   ├── dashboard/    ← User dashboard
│   │   ├── admin/        ← Admin panel
│   │   ├── verify-email/ ← Email verification page
│   │   └── login|register/
│   ├── components/
│   │   ├── client/       ← 'use client' components
│   │   ├── property/     ← Shared property components
│   │   └── ui/           ← shadcn/ui components
│   ├── lib/
│   │   ├── api/          ← Client-side API wrappers
│   │   └── server/       ← Server-side fetchers (cookies)
│   ├── public/
│   │   └── wilayah/      ← Data wilayah Indonesia offline
│   └── types/            ← TypeScript interfaces
│
└── docs/                 ← Dokumentasi teknis
```

---

## 🔑 Akun Development (Seeder)

| Role  | Email | Password |
|---|---|---|
| Admin | admin@propertyhub.com | admin123 |
| Agent | agent1@propertyhub.com | admin123 |
| Agent | agent2@propertyhub.com | admin123 |
| User  | user@propertyhub.com | admin123 |

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
APP_URL=http://localhost:3000
NODE_ENV=development

# Email (default: log ke console)
EMAIL_PROVIDER=log          # log | resend
RESEND_API_KEY=             # isi jika EMAIL_PROVIDER=resend
EMAIL_FROM=PropertyHub <noreply@propertyhub.id>
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🏗️ Arsitektur Penting

### Server Components vs Client Components
- **Default:** Server Component — fetch data di server, tidak ada JS di client
- **`'use client'`:** hanya untuk interaksi (form, map, filter, button dengan state)
- **API calls dari server:** lewat `lib/server/api.ts` (pakai cookie dari `next/headers`)
- **API calls dari client:** lewat `lib/api/*.ts` (pakai `credentials: 'include'`)

### Email System
```
EmailService (factory)
├── LogEmailProvider    ← default, log ke console
└── ResendEmailProvider ← aktif via EMAIL_PROVIDER=resend
```
Untuk tambah provider baru: implement `EmailProvider` interface di `server/src/email/`.

### Data Wilayah
- `public/wilayah/provinsi-kabupaten.json` — load saat form dibuka
- `public/wilayah/kecamatan.json` — lazy load + in-memory cache
- Sumber: [ibnux/data-indonesia](https://github.com/ibnux/data-indonesia)

### Git Workflow (Monorepo → 2 Repo)
```bash
# Push frontend
git subtree push --prefix=client fe main

# Push backend
git subtree push --prefix=server be main
```

---

## ⚠️ Hal Penting

1. **Properti baru** → status `DRAFT`, `moderationStatus: PENDING` → tidak muncul di listing sampai admin approve
2. **Email verification** → development: cek log terminal backend untuk link verifikasi
3. **Ranking** → dihitung otomatis saat create/update/view properti
4. **Route ordering** di NestJS — specific routes harus di atas wildcard (sudah difix)
5. **Turbopack** aktif di dev — build production tetap pakai webpack standar

---

## 📚 Dokumentasi Lain

| File | Isi |
|---|---|
| [docs/API.md](docs/API.md) | 53 API endpoints lengkap |
| [docs/ERD.md](docs/ERD.md) | Database schema & relasi |
| [docs/TODO.md](docs/TODO.md) | Backlog + cara lanjutkan |
| [TASKS.md](TASKS.md) | Task tracker (TASK-001~099) |
| [STATUS.md](STATUS.md) | Status per fitur |
| [RULES_FE.md](RULES_FE.md) | Aturan coding frontend |
