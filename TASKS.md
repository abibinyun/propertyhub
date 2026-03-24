# Task Tracker — PropertyHub

**Last Updated:** 2026-03-24 18:30 WIB  
**Status:** Core complete ✅

---

## ✅ Selesai

### Backend
- TASK-001~031: Semua backend tasks selesai (NestJS, Prisma, Auth, Properties, Leads, Favorites, Admin, Ranking, Cloudinary)
- TASK-032: Global rate limiting (`@nestjs/throttler`)
- TASK-033: Leads anti-spam (duplikat 24 jam, daily limit 10, self-lead prevention)
- TASK-034: `GET /leads/received` — leads masuk ke semua properti milik agen (paginated, search, filter)
- TASK-035: `GET /leads/unread-count` — count leads NEW untuk bell notif
- TASK-036: Seeder 100 properti, 8 kota, 6 tipe, koordinat realistis, `moderationStatus: APPROVED`

### Frontend
- TASK-037~054: Semua frontend tasks selesai
- TASK-055: Detail page redesign (gallery premium, specs cards, properti serupa, sticky sidebar)
- TASK-056: PropertyGallery — grid 2 kolom + lightbox fullscreen
- TASK-057: PropertyQuickView — modal quick view dari listing card
- TASK-058: ShareButton — popover WA/Twitter/Facebook/copy link
- TASK-059: MobileStickyContact — fixed bottom bar, auth-aware
- TASK-060: AuthGate — block kontak jika belum login
- TASK-061: ContactForm — pre-fill user, auth-aware, error dari backend
- TASK-062: SimilarProperties — server component 3 properti serupa
- TASK-063: Auth redirect — login/register balik ke halaman asal via `?redirect=`
- TASK-064: `setUser()` setelah login/register — context update tanpa reload
- TASK-065: Bell notif — real unread count dari `GET /leads/unread-count`
- TASK-066: Leads dashboard — 2 tab (Masuk/Terkirim), search, filter status, pagination
- TASK-067: LeadsSearchBar — debounce search + filter status
- TASK-068: LeadStatusActions — dropdown update status lead
- TASK-069: Harga/bulan untuk properti sewa
- TASK-070: Empty specs fallback di detail page
- TASK-071: Gallery mobile fix — tombol close + relative wrapper

---

## 📋 Backlog

- [ ] Email notifications (Resend/Nodemailer)
- [ ] Footer redesign
- [ ] Auth pages styling
- [ ] Dashboard overhaul (stats cards, tabel properti)
- [ ] Advanced filter pages
- [ ] Email verification saat register
- [ ] Docker production setup
- [ ] CI/CD pipeline
- [ ] Monitoring (Sentry)
