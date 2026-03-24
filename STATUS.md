# PropertyHub — Project Status

**Last Updated:** 2026-03-24 20:00 WIB  
**Status:** ✅ Production-ready (minus deployment)

---

## Backend — 100% ✅

- NestJS + PostgreSQL + Prisma
- Auth: JWT cookie-based (`httpOnly`)
- Modules: auth, users, properties, leads, favorites, admin, cloudinary
- 49 API endpoints, 9 DB tables, 5 migrations
- Seed: 100 properties, 4 users, 8 kota, 6 tipe properti, koordinat realistis
- Admin moderation (approve/reject/flag + audit log)
- Ranking algorithm (quality 35%, freshness 25%, engagement 25%, reputation 15%)
- Global rate limiting via `@nestjs/throttler`
- **Leads anti-spam**: duplikat 24 jam, daily limit 10, self-lead prevention
- **Self-action prevention**: tidak bisa views++/favorite/lead ke properti sendiri
- **Views**: hanya increment jika bukan pemilik (OptionalJwtAuthGuard)
- **Favorites**: self-favorite dicegah (ConflictException)
- **Stats**: views total, leads masuk, favorites diterima, per-properti favorite counts
- `GET /properties/my` support pagination + search + filter status + sort
- `GET /favorites/property-counts` — favorite count per properti milik user
- `GET /leads/unread-count` — count leads NEW untuk bell notif

## Frontend — 100% ✅

**Stack:** Next.js 16 + Tailwind v4 + shadcn/ui + Bun  
**Arsitektur:** Server Components by default, `'use client'` hanya untuk interaksi

### URL Structure
- Listing: `/(jual|sewa)/[city]/[district]/[type]`
- Detail: `/properti/[location]/[slug]`
- Dashboard: `/dashboard/*` dengan sidebar layout

### Pages
- Homepage — fetch properti terbaru + favoriteIds (Server Component)
- Listing — filter, sort, pagination, skeleton, favoriteIds (Server Component)
- Detail — gallery premium, specs, contact form, JSON-LD, properti serupa (Server Component)
- Auth — login, register (dengan redirect balik ke halaman asal)
- Dashboard layout — sidebar desktop sticky + mobile FAB Sheet
- Dashboard overview — stats cards, alert leads baru, leads terbaru, properti terbaru
- Dashboard properties — stats bar, list view, search + filter status + sort, pagination
- Dashboard leads — 2 tab (Masuk/Terkirim), search, filter status, pagination
- Dashboard favorites — grid card, load more
- Admin — dashboard, moderation queue, properties, users

### Dashboard Sidebar
- Desktop: sticky `w-56` di kiri
- Mobile: FAB button → Sheet dari kiri
- Nav: Overview, Properti Saya, Pesan & Leads, Favorit, Profil
- User info card + Pasang Iklan + Logout

### Stats yang Benar
- `properties` = properti ACTIVE milik user
- `views` = total viewsCount dari semua properti (aggregate sum)
- `leads` = leads masuk ke properti milik user (bukan yang dikirim)
- `favorites` = properti yang user favoritkan
- `receivedFavorites` = berapa kali properti user di-favoritkan orang lain

### Access Control
| Aksi | Public | User Login | Pemilik |
|---|---|---|---|
| Lihat detail | ✅ Views +1 | ✅ Views +1 | ✅ Views tidak bertambah |
| Favoritkan | ❌ 401 | ✅ | ❌ ConflictException |
| Kirim lead | ❌ 401 + prompt login | ✅ | ❌ ConflictException |

### SEO
- `generateMetadata()` di semua halaman
- JSON-LD `RealEstateListing` + `BreadcrumbList`
- `sitemap.xml`, `robots.txt`

---

## Backlog

- [ ] Footer redesign
- [ ] Auth pages styling
- [ ] Email notifications (Resend/Nodemailer)
- [ ] Search header fungsional (autocomplete)
- [ ] Profile page (edit nama, telepon, company)
- [ ] Email verification saat register
- [ ] Docker production setup
- [ ] CI/CD pipeline
