# PropertyHub — Project Status

**Last Updated:** 2026-03-24 18:30 WIB  
**Status:** ✅ Production-ready (minus deployment)

---

## Backend — 100% ✅

- NestJS + PostgreSQL + Prisma
- Auth: JWT cookie-based (`httpOnly`)
- Modules: auth, users, properties, leads, favorites, admin, cloudinary
- 46 API endpoints, 9 DB tables, 5 migrations
- Seed: **100 properties**, 4 users, 8 kota, 6 tipe properti, koordinat realistis
- Admin moderation (approve/reject/flag + audit log)
- Ranking algorithm (quality 35%, freshness 25%, engagement 25%, reputation 15%)
- Title validation & anti-spam
- Image upload via Cloudinary
- **Global rate limiting** via `@nestjs/throttler` (10 req/s, 100 req/min, 500 req/hr)
- **Leads anti-spam**: duplikat 24 jam, daily limit 10, self-lead prevention, throttle 3/menit

## Frontend — 100% ✅

**Stack:** Next.js 16 + Tailwind v4 + shadcn/ui + Bun  
**Arsitektur:** Server Components by default, `'use client'` hanya untuk interaksi

### URL Structure
- Listing: `/(jual|sewa)/[city]/[district]/[type]`
- Detail: `/properti/[location]/[slug]`

### Pages
- Homepage — fetch properti terbaru (Server Component)
- Listing — filter, sort, pagination, skeleton loading (Server Component)
- Detail — gallery premium, specs, contact form, JSON-LD, properti serupa (Server Component)
- Auth — login, register (dengan redirect balik ke halaman asal)
- Dashboard — stats, my properties, favorites, leads, profile
- Admin — dashboard, moderation queue, properties, users

### UI Components
- **Header**: mega menu, announcement bar, search, bell notif (real-time unread count)
- **PropertyCard**: ratio 4/3, badge Baru, FavoriteButton, quick view (Eye icon hover)
- **PropertyGallery**: grid 2 kolom, lightbox fullscreen, thumbnail strip
- **PropertyFilters**: kamar tidur, harga preset+manual, luas tanah, sertifikat, furnishing
- **SortControls**: price_asc/desc, newest, default
- **PaginationControls**: ellipsis smart, scroll to top
- **PropertyQuickView**: modal dialog, responsive mobile/desktop
- **ShareButton**: popover WA/Twitter/Facebook/copy link
- **MobileStickyContact**: fixed bottom bar, auth-aware
- **AuthGate**: block kontak jika belum login, redirect dengan `?redirect=` param
- **ContactForm**: pre-fill dari user, auth-aware, error handling dari backend
- **SimilarProperties**: server component, 3 properti serupa per kota
- **LeadsSearchBar**: debounce search, filter status
- **LeadStatusActions**: dropdown update status lead

### Leads System
- Pengirim (pembeli): lihat riwayat pesan terkirim di dashboard
- Penerima (agen): lihat semua leads masuk, info kontak pengirim, update status
- Tab "Leads Masuk" + "Pesan Terkirim" dengan badge count
- Search + filter status + pagination di kedua tab
- Bell notif di header menampilkan jumlah leads NEW yang belum ditangani

### Auth Flow
- Login/register → `setUser()` langsung update context tanpa full reload
- Redirect balik ke halaman asal setelah login (`?redirect=` param)
- `AuthGate` component untuk block aksi yang butuh login

### SEO
- `generateMetadata()` di semua halaman (title, description, canonical, OG, Twitter card)
- JSON-LD `RealEstateListing` di detail page
- JSON-LD `BreadcrumbList` di listing page
- `sitemap.xml` — static + per-kota + semua properti
- `robots.txt` — block `/dashboard/`, `/admin/`

---

## Backlog

- [ ] Email notifications (Resend/Nodemailer) — agen dapat email saat ada lead baru
- [ ] Footer redesign
- [ ] Auth pages styling (login/register form)
- [ ] Dashboard overhaul (stats cards, tabel properti)
- [ ] Advanced filter pages (`/harga-1m-2m`, `/3-kamar`)
- [ ] Email verification saat register
- [ ] Docker production setup
- [ ] CI/CD pipeline
