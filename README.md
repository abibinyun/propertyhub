# PropertyHub

Platform listing properti fullstack — jual, beli, dan sewa properti di Indonesia.

![Homepage](docs/screenshot/homepage.png)

**Last Updated:** 2026-05-30 | **Status:** Production-ready (minus deployment)

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS + PostgreSQL + Prisma |
| Frontend | Next.js 16 + Tailwind v4 + shadcn/ui |
| Runtime | Bun |
| Auth | JWT cookie-based (httpOnly) + OAuth Google |
| Storage | Cloudinary |
| Payment | Midtrans (modular, log default) |
| Maps | Leaflet + OpenStreetMap + data wilayah offline |

## Fitur Utama

- Listing properti dengan SEO URL hierarki 5 level
- Filter, sort, pagination di listing dan dashboard
- Detail page: gallery premium, specs, floor plan, price history chart, video, properti serupa, sticky contact
- Leads system: anti-spam, rate limit, dashboard dua sisi (pengirim & penerima), export CSV
- Favorites: per-user, count per properti, load more
- Dashboard: sidebar, stats real-time, sort properti (views/leads/favorites/rank), analitik per properti
- Access control: views tidak increment untuk pemilik, self-favorite/lead/review dicegah
- Auth: JWT cookie, refresh token, redirect balik ke halaman asal setelah login
- Admin: moderation queue, approve/reject/flag, ban user, reports
- Notifikasi in-app (bell icon), reviews & rating agen, perbandingan properti, KPR calculator

## Struktur Monorepo

```
property-webapp/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── api/          # NestJS backend (port 3001)
├── packages/
│   └── shared/       # Shared types & utilities
└── docs/             # Dokumentasi teknis
```

## Quick Start

```bash
# Jalankan keduanya sekaligus
./dev.sh

# Atau via Turborepo
bun install
bun dev

# Atau manual:

# Backend
cd apps/api
cp .env.example .env   # isi DATABASE_URL, JWT_SECRET, CLOUDINARY_*, GOOGLE_*
bun install
bunx prisma migrate dev
bunx prisma db seed
bun run start:dev

# Frontend
cd apps/web
cp .env.example .env.local   # isi NEXT_PUBLIC_API_URL
bun install
bun run dev
```

## Fitur

- Listing properti dengan URL SEO-friendly (`/jual/jakarta-selatan/rumah`)
- Detail properti dengan peta interaktif (Leaflet)
- Auth: register, login, JWT cookie, **OAuth Google**
- **Password reset** via email
- Dashboard: kelola properti, favorit, leads, **analitik per properti**
- **Featured listing** — BASIC/PREMIUM/ULTIMATE, payment modular (Midtrans)
- **Email notifikasi** — lead baru langsung dikirim ke pemilik properti
- Admin: moderasi, approve/reject, statistik
- Ranking algorithm (quality, freshness, engagement, reputation)
- SEO: generateMetadata, JSON-LD, sitemap.xml, robots.txt
- **Data wilayah offline** — dropdown Provinsi→Kota→Kecamatan tanpa API eksternal

## Env Variables

### Backend (`apps/api/.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/propertyhub
JWT_SECRET=
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_PROVIDER=log          # log | resend
RESEND_API_KEY=             # jika EMAIL_PROVIDER=resend
PAYMENT_PROVIDER=log        # log | midtrans
MIDTRANS_SERVER_KEY=        # jika PAYMENT_PROVIDER=midtrans
MIDTRANS_CLIENT_KEY=        # jika PAYMENT_PROVIDER=midtrans
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PAYMENT_PROVIDER=log        # log | midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=        # jika PAYMENT_PROVIDER=midtrans
```

## Dokumentasi

- [docs/API.md](docs/API.md) — 82 API endpoints
- [docs/ERD.md](docs/ERD.md) — Database schema (15 tabel)
- [docs/FEATURED_RANKING.md](docs/FEATURED_RANKING.md) — Featured listing & ranking algorithm
- [docs/ANALYTICS.md](docs/ANALYTICS.md) — Setup Umami + built-in analytics
- [docs/MODULAR_ARCHITECTURE.md](docs/MODULAR_ARCHITECTURE.md) — Modular provider pattern
- [docs/SEO_STRATEGY.md](docs/SEO_STRATEGY.md) — SEO strategy & anti-gaming
- [STATUS.md](STATUS.md) — Status pengerjaan
