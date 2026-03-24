# TODO - PropertyHub

**Last Updated:** 2026-03-24 18:30 WIB

---

## 🔥 Prioritas Sekarang

- [ ] Footer redesign
- [ ] Auth pages styling (login/register form)
- [ ] Dashboard overhaul (stats cards, tabel properti milik agen)
- [ ] Email notifications — agen dapat email saat ada lead baru (Resend/Nodemailer)

---

## 📈 SEO Enhancement

- [ ] Filter pages SEO (`/jual/rumah?harga=1m-2m`, `/jual/rumah?kamar=3`)
- [ ] Structured data untuk listing page (BreadcrumbList sudah ada)

---

## 🔐 Auth Enhancements (Future)

- [ ] Refresh token (access 15min + refresh 7 days)
- [ ] Password reset via email
- [ ] Email verification saat register
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

## ✅ Sudah Selesai

### Backend
- [x] NestJS + Prisma + PostgreSQL, 46 endpoints
- [x] JWT cookie-based auth
- [x] Properties CRUD + SEO URL (5 level hierarki)
- [x] Leads system + anti-spam (duplikat 24 jam, daily limit, self-lead prevention)
- [x] Global rate limiting (@nestjs/throttler)
- [x] GET /leads/received (paginated, search, filter)
- [x] GET /leads/unread-count
- [x] Favorites, Admin, Cloudinary
- [x] Ranking algorithm
- [x] Seeder 100 properti, 8 kota, 6 tipe

### Frontend
- [x] Homepage, Listing, Detail page
- [x] Detail page redesign (gallery premium, specs, properti serupa, sticky sidebar)
- [x] PropertyGallery — grid + lightbox
- [x] PropertyQuickView — modal dari listing card
- [x] ShareButton — WA/Twitter/Facebook/copy
- [x] MobileStickyContact — auth-aware
- [x] AuthGate — block kontak jika belum login
- [x] ContactForm — pre-fill, auth-aware, error handling
- [x] Auth redirect — balik ke halaman asal setelah login
- [x] Bell notif — real unread count
- [x] Leads dashboard — 2 tab, search, filter, pagination
- [x] SEO: generateMetadata, JSON-LD, sitemap, robots.txt
- [x] Maps: Leaflet (picker + view)
- [x] Dashboard: properties, favorites, leads, profile
- [x] Admin panel UI
