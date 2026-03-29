# Development Guide — PropertyHub

**Last Updated:** 2026-03-28 WIB
**Status:** Backend ✅ | Frontend ✅ | Deployment ⏳

---

## 🚀 Menjalankan Project

### Cara Tercepat
```bash
cd ~/data/LATIHAN/property-webapp
./dev.sh
# Backend  → http://localhost:3001
# Frontend → http://localhost:3000
# Ctrl+C untuk stop keduanya
```

### Manual

#### Backend
```bash
cd server
cp .env.example .env   # isi semua variabel
bun install
bunx prisma migrate deploy
bunx prisma db seed
bun run start:dev
```

#### Frontend
```bash
cd client
cp .env.example .env.local
bun install
bun run dev
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
property-webapp/
├── dev.sh                ← jalankan backend + frontend sekaligus
├── server/               ← NestJS backend (port 3001)
│   ├── src/
│   │   ├── auth/         ← JWT, register, login, OAuth Google, password reset
│   │   ├── email/        ← EmailService modular (log/resend)
│   │   ├── payment/      ← PaymentService modular (log/midtrans)
│   │   ├── users/        ← Profile management
│   │   ├── properties/   ← CRUD, SEO slug, ranking, analytics, image upload
│   │   ├── leads/        ← Contact forms, anti-spam, email notifikasi
│   │   ├── favorites/    ← Bookmarks
│   │   ├── admin/        ← Moderation, stats, charts
│   │   └── cloudinary/   ← Image upload service
│   └── prisma/
│       ├── schema.prisma
│       ├── migrations/
│       └── seed.ts
│
├── client/               ← Next.js frontend (port 3000)
│   ├── app/
│   │   ├── (listing)/    ← /jual, /sewa, /jual/[city]/...
│   │   ├── properti/     ← /properti/[location]/[slug]
│   │   ├── dashboard/    ← User dashboard
│   │   │   └── properties/[id]/analytics/ ← Analitik per properti
│   │   ├── admin/        ← Admin panel
│   │   ├── forgot-password/ ← Reset password step 1
│   │   ├── reset-password/  ← Reset password step 2
│   │   └── login|register/
│   ├── components/
│   │   ├── client/       ← 'use client' components
│   │   ├── property/     ← Shared property components
│   │   └── ui/           ← shadcn/ui components
│   ├── lib/
│   │   ├── api/          ← Client-side API wrappers
│   │   └── server/       ← Server-side fetchers (cookies)
│   └── types/
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
NODE_ENV=development

# URL
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OAuth Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# Google Console → Authorized redirect URI: http://localhost:3001/auth/google/callback

# Email (default: log ke console)
EMAIL_PROVIDER=log          # log | resend
RESEND_API_KEY=             # isi jika EMAIL_PROVIDER=resend

# Payment (default: log ke console, featured langsung aktif)
PAYMENT_PROVIDER=log        # log | midtrans
MIDTRANS_SERVER_KEY=        # isi jika PAYMENT_PROVIDER=midtrans
MIDTRANS_CLIENT_KEY=        # isi jika PAYMENT_PROVIDER=midtrans
MIDTRANS_IS_PRODUCTION=false
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment (default: log)
NEXT_PUBLIC_PAYMENT_PROVIDER=log        # log | midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=        # isi jika PAYMENT_PROVIDER=midtrans
```

---

## 🏗️ Arsitektur Penting

### Server Components vs Client Components
- **Default:** Server Component — fetch data di server
- **`'use client'`:** hanya untuk interaksi (form, map, filter, state)
- **API calls dari server:** lewat `lib/server/api.ts` (pakai cookie dari `next/headers`)
- **API calls dari client:** lewat `lib/api/*.ts` (pakai `credentials: 'include'`)

### Email System (Modular)
```
EmailService
├── LogEmailProvider    ← default, log ke console
└── ResendEmailProvider ← aktif via EMAIL_PROVIDER=resend
```
Tambah provider baru: implement `EmailProvider` interface di `server/src/email/`.

### Payment System (Modular)
```
PaymentService
├── LogPaymentProvider      ← default, log ke console, featured langsung aktif
└── MidtransPaymentProvider ← aktif via PAYMENT_PROVIDER=midtrans
```
Tambah provider baru: implement `PaymentProvider` interface di `server/src/payment/`.

### OAuth Google Flow
```
User klik "Login Google"
  → frontend: window.location.href = /auth/google (backend)
  → backend redirect ke Google
  → Google callback ke /auth/google/callback
  → backend set JWT cookie
  → backend redirect ke FRONTEND_URL/dashboard
```

### Data Wilayah
- `public/wilayah/provinsi-kabupaten.json` — load saat form dibuka
- `public/wilayah/kecamatan.json` — lazy load + in-memory cache

---

## ⚠️ Hal Penting

1. **Properti baru** → status `DRAFT`, `moderationStatus: PENDING` → tidak muncul di listing sampai admin approve
2. **Email development** → cek log terminal backend untuk link verifikasi & reset password
3. **Payment development** → `PAYMENT_PROVIDER=log` → featured langsung aktif tanpa bayar
4. **Ranking** → dihitung otomatis saat create/update/view properti
5. **APP_URL** di backend = URL backend itu sendiri (3001), bukan frontend

---

## 🤖 Cara Lanjutkan dengan AI (Kiro)

Jika ingin melanjutkan development dengan AI, share file-file ini:
1. `STATUS.md` — status fitur saat ini
2. `docs/TODO.md` — backlog & prioritas
3. `RULES_FE.md` — aturan coding frontend (wajib dipatuhi AI)
4. `DEVELOPMENT_GUIDE.md` — file ini

Lalu katakan: *"Lanjutkan development PropertyHub. Baca semua file konteks yang saya share."*

---

## 📚 Dokumentasi Lain

| File | Isi |
|---|---|
| [docs/API.md](docs/API.md) | Semua API endpoints |
| [docs/ERD.md](docs/ERD.md) | Database schema & relasi |
| [docs/TODO.md](docs/TODO.md) | Backlog + prioritas |
| [STATUS.md](STATUS.md) | Status per fitur |
| [RULES_FE.md](RULES_FE.md) | Aturan coding frontend (wajib) |
