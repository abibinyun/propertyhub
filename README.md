# PropertyHub

Platform listing properti fullstack — jual, beli, dan sewa properti di Indonesia.

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS + PostgreSQL + Prisma |
| Frontend | Next.js 16 + Tailwind v4 + shadcn/ui |
| Runtime | Bun |
| Auth | JWT cookie-based (httpOnly) |
| Storage | Cloudinary |
| Maps | Leaflet + OpenStreetMap |

## Repositories

- **Backend**: [propertyweb-nestjs](https://github.com/abibinyun/propertyweb-nestjs)
- **Frontend**: [propertyweb-nextjs](https://github.com/abibinyun/propertyweb-nextjs)

## Struktur Monorepo

```
property-webapp/
├── server/     # NestJS backend (port 3001)
├── client/     # Next.js frontend (port 3000)
└── docs/       # Dokumentasi teknis
```

## Quick Start

```bash
# Backend
cd server
cp .env.example .env   # isi DATABASE_URL, JWT_SECRET, CLOUDINARY_*
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
- Auth: register, login, JWT cookie
- Dashboard: kelola properti, favorit, leads
- Admin: moderasi, approve/reject, statistik
- Ranking algorithm (quality, freshness, engagement, reputation)
- SEO: generateMetadata, JSON-LD, sitemap.xml, robots.txt

## Env Variables

### Backend (`server/.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/propertyhub
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
APP_URL=http://localhost:3000
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Dokumentasi

- [docs/API.md](docs/API.md) — 43 API endpoints
- [docs/ERD.md](docs/ERD.md) — Database schema
- [docs/ARCHITECTURE_DECISION.md](docs/ARCHITECTURE_DECISION.md) — Keputusan arsitektur
- [STATUS.md](STATUS.md) — Status pengerjaan
