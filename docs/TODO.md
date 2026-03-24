# TODO - PropertyHub

**Last Updated:** 2026-03-23 20:05 WIB

---

## 🔥 Frontend — Prioritas Sekarang

### Bug Kritis
- [ ] `next.config.ts` — tambah domain Cloudinary (`res.cloudinary.com`) agar `next/image` bisa load gambar

### Halaman yang Belum Ada
- [ ] Edit property form (`/dashboard/properties/[id]/edit`)
- [ ] Upload gambar di form properti (dengan preview)
- [ ] Favorites page (`/dashboard/favorites`)
- [ ] Leads page (`/dashboard/leads`)
- [ ] Profile page (`/dashboard/profile`)
- [ ] Lead/contact form di property detail page
- [ ] Admin panel UI (dashboard, users, moderation queue)

### Fitur yang Belum Berfungsi
- [ ] Homepage — fetch properti featured/terbaru dari API (sekarang static)
- [ ] Filter & search di listing page (tombol ada, belum berfungsi)
- [ ] Dashboard stats — fetch data real dari API (sekarang hardcoded 0)
- [ ] Pagination pakai `router.push` bukan `window.location.href` (full reload)

---

## 📈 SEO Enhancement

- [ ] Meta tags & Open Graph per properti (title, description, image)
- [ ] Structured data JSON-LD (Property schema)
- [ ] Canonical URLs
- [ ] Sitemap generation (`/sitemap.xml`)
- [ ] `robots.txt`
- [ ] Filter pages SEO (`/properties/jual/rumah?harga=1m-2m`, `/properties/jual/rumah?kamar=3`)

---

## 🔐 Auth Enhancements (Future)

- [ ] Refresh token (access 15min + refresh 7 days)
- [ ] Password reset via email
- [ ] Email verification
- [ ] OAuth (Google)

---

## 💰 Monetization (Future)

- [ ] Payment integration (Midtrans)
- [ ] Featured listing management (BASIC/PREMIUM/ULTIMATE)
- [ ] Auto-expire featured listings
- [ ] Analytics dashboard untuk pemilik properti

---

## 🚀 Deployment (Future)

- [ ] Docker setup production
- [ ] CI/CD pipeline
- [ ] SSL & domain configuration
- [ ] Monitoring (Sentry, uptime)
- [ ] Database backup otomatis

---

## ✅ Sudah Selesai (Backend)

- [x] SEO URL structure (5 level hierarki)
- [x] Title validation & anti-spam
- [x] Ranking algorithm (quality, freshness, engagement, reputation)
- [x] Admin moderation system (approve/reject/flag, audit log, ban)
- [x] Semua CRUD (properties, leads, favorites, users)
- [x] Image upload (Cloudinary)
- [x] JWT authentication & RBAC
- [x] Database seed (50 properties, 4 users)

## ✅ Sudah Selesai (Frontend)

- [x] Setup (Next.js 16, Tailwind v4, shadcn/ui, React Query)
- [x] Auth context & protected routes
- [x] Header & Footer
- [x] Homepage (static)
- [x] Property listing page (SEO URLs, pagination)
- [x] Property detail page (gallery, specs, agent info)
- [x] Login & Register
- [x] Dashboard (stats placeholder)
- [x] My Properties (list, delete)
- [x] Add Property form
