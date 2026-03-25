# Task Tracker — PropertyHub

**Last Updated:** 2026-03-25 WIB

---

## ✅ Selesai

### Backend
- TASK-001~036: Core backend — auth, properties, leads, favorites, admin, cloudinary, seeder
- TASK-037: `OptionalJwtAuthGuard` — views tidak increment untuk pemilik
- TASK-038: Self-favorite prevention
- TASK-039: `GET /properties/my` — pagination, search, filter, sort
- TASK-040: `GET /favorites/property-counts`
- TASK-041: `getUserStats` — views aggregate, leads received, receivedFavorites
- TASK-042: `PATCH /properties/images/:id/primary` — set foto utama
- TASK-043: `UpdatePropertyDto` — tambah `features` field
- TASK-044: `update()` service — handle features (deleteMany + create)
- TASK-045: Fix route ordering (specific sebelum wildcard `:slug`)
- TASK-046: EmailModule — modular provider (log/resend), factory pattern
- TASK-047: Email verification — token UUID, 24h expiry, resend rate-limit 5 menit
- TASK-048: `GET /auth/verify-email?token=xxx`
- TASK-049: `POST /auth/resend-verification`
- TASK-050: Admin `getDashboardStats` — charts data (groupBy, queryRaw harian)
- TASK-051: Admin `getAllLeads` endpoint
- TASK-052: Admin `getAllUsers` + `getAllProperties` — search support

### Frontend
- TASK-053~080: UI overhaul, dashboard, detail page, leads, favorites (lihat git log)
- TASK-081: Property form 2-kolom layout
- TASK-082: Profile form 2-kolom layout
- TASK-083: LocationSection — cascading dropdown offline + map sync
- TASK-084: FeaturesSection — 30 toggle pills + custom other fields
- TASK-085: ImageUploadSection — set primary photo (bintang button)
- TASK-086: Edit mode fix — kota/kecamatan disabled (restore dari nama)
- TASK-087: Edit mode fix — `other_*` features tidak muncul (lazy init)
- TASK-088: Detail page — `featureLabel()` helper, raw key → label readable
- TASK-089: Turbopack diaktifkan di dev script
- TASK-090: `/verify-email` page — sukses/gagal/expired/no-token state
- TASK-091: `EmailVerificationBanner` di dashboard layout
- TASK-092: Admin layout redesign — dark sidebar slate-900
- TASK-093: Admin dashboard — KPI 8 cards, bar chart, donut chart, top kota
- TASK-094: Admin properties — data table, filter, search, pagination
- TASK-095: Admin users — data table, filter role, ban/unban
- TASK-096: Admin moderation — card view besar, preview link
- TASK-097: Admin leads — halaman baru, table, filter status
- TASK-098: Fix `AdminSidebarActive` — pindah NAV_ITEMS ke client component
- TASK-099: Fix leads status enum — validasi sebelum Prisma query

---

## 📋 Backlog

### Prioritas Tinggi
- [ ] TASK-100: Footer redesign
- [ ] TASK-101: Auth pages styling (login/register)
- [ ] TASK-102: Search header fungsional (autocomplete)
- [ ] TASK-103: Email notifikasi lead baru ke pemilik properti (EmailService sudah siap)
- [ ] TASK-104: Password reset via email

### Prioritas Menengah
- [ ] TASK-105: OAuth login (Google)
- [ ] TASK-106: Analytics per properti (views/leads trend chart)
- [ ] TASK-107: Featured listing (BASIC/PREMIUM/ULTIMATE tiers)
- [ ] TASK-108: Payment integration (Midtrans)

### Infrastruktur
- [ ] TASK-109: Docker production setup (docker-compose.prod.yml)
- [ ] TASK-110: CI/CD pipeline (GitHub Actions — test, build, deploy)
- [ ] TASK-111: Monitoring (Sentry)
- [ ] TASK-112: Database backup otomatis
