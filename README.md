# PropertyHub

Platform listing properti fullstack — jual, beli, dan sewa properti di Indonesia.

**Last Updated:** 2026-03-29 | **Status:** Production-ready (minus deployment)

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

## Repositories

- **Backend**: [propertyweb-nestjs](https://github.com/abibinyun/propertyweb-nestjs)
- **Frontend**: [propertyweb-nextjs](https://github.com/abibinyun/propertyweb-nextjs)

> Monorepo ini di-push ke dua repo terpisah via `git subtree`:
> ```bash
> git subtree push --prefix=client fe main
> git subtree push --prefix=server be main
> ```

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
├── server/     # NestJS backend (port 3001)
├── client/     # Next.js frontend (port 3000)
└── docs/       # Dokumentasi teknis
```

## Quick Start

```bash
# Jalankan keduanya sekaligus
./dev.sh

# Atau manual:

# Backend
cd server
cp .env.example .env   # isi DATABASE_URL, JWT_SECRET, CLOUDINARY_*, GOOGLE_*
bun install
bunx prisma migrate dev
bunx prisma db seed
bun run start:dev

# Frontend
cd client
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

### Backend (`server/.env`)
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

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PAYMENT_PROVIDER=log        # log | midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=        # jika PAYMENT_PROVIDER=midtrans
```

## Dokumentasi

- [docs/API.md](docs/API.md) — 77 API endpoints
- [docs/ERD.md](docs/ERD.md) — Database schema
- [docs/ARCHITECTURE_DECISION.md](docs/ARCHITECTURE_DECISION.md) — Keputusan arsitektur
- [STATUS.md](STATUS.md) — Status pengerjaan
- [docs/TODO.md](docs/TODO.md) — Backlog & deployment checklist
