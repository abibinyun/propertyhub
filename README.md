# PropertyHub

![Homepage](docs/screenshot/homepage.png)

> Fullstack property listing platform — buy, sell, and rent properties in Indonesia.

## Tech Stack

!Next.js !NestJS !Prisma !TailwindCSS !TypeScript !Bun !PostgreSQL !Cloudinary

## Features

- **SEO-friendly URLs** — hierarchical 5-level URLs (`/jual/jakarta-selatan/rumah`)
- **Advanced filtering** — search, sort, pagination, and radius-based location search
- **Property dashboard** — manage listings, view analytics, track leads
- **Leads system** — anti-spam, rate limiting, CSV export, email notifications
- **Featured listings** — tiered promotion (BASIC/PREMIUM/ULTIMATE) with modular payment
- **Admin panel** — moderation queue, user management, analytics dashboard
- **Reviews & ratings** — agent verification, review eligibility system
- **In-app notifications** — real-time bell icon with mark read/mark all

## Getting Started

```bash
# Install dependencies
bun install

# Run development servers
bun dev
```

Frontend runs on `http://localhost:3002`, Backend on `http://localhost:3003`.

## What I Learned

Building PropertyHub taught me how to architect a production-grade monorepo with Turborepo, implement complex business logic like ranking algorithms and anti-spam systems, and design modular provider patterns for payment and email services.
