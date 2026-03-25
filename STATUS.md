# PropertyHub — Project Status

**Last Updated:** 2026-03-25 WIB
**Status:** ✅ Production-ready (minus deployment)

---

## Backend — ✅ Selesai

**Stack:** NestJS + PostgreSQL + Prisma + Bun | Port: 3001

| Modul | Status | Catatan |
|---|---|---|
| Auth (JWT cookie) | ✅ | httpOnly, 7d expiry |
| Email Verification | ✅ | Modular provider (log/resend) |
| Properties CRUD | ✅ | 5-level SEO URL |
| Image Upload | ✅ | Cloudinary, set primary |
| Leads System | ✅ | Anti-spam, rate limit |
| Favorites | ✅ | Self-favorite dicegah |
| Admin Panel | ✅ | Moderation, stats, charts |
| Ranking Algorithm | ✅ | quality/freshness/engagement/reputation |
| Rate Limiting | ✅ | @nestjs/throttler global |

**Total:** 51 endpoints, 9 tabel, 6 migrations

---

## Frontend — ✅ Selesai

**Stack:** Next.js 16 (App Router, Turbopack) + Tailwind v4 + shadcn/ui + Bun | Port: 3000

| Halaman | Status | Catatan |
|---|---|---|
| Homepage | ✅ | Server Component, favoriteIds |
| Listing (5 level URL) | ✅ | Filter, sort, pagination, skeleton |
| Detail Properti | ✅ | Gallery, specs, JSON-LD, properti serupa |
| Auth (login/register) | ✅ | Redirect ke halaman asal |
| Email Verification | ✅ | `/verify-email`, banner dashboard |
| Dashboard Overview | ✅ | Stats, alert leads, recent activity |
| Dashboard Properties | ✅ | Search, filter, sort, pagination |
| Dashboard Leads | ✅ | 2 tab masuk/terkirim |
| Dashboard Favorites | ✅ | Load more |
| Dashboard Profile | ✅ | Edit info + ganti password |
| Admin Dashboard | ✅ | KPI cards, charts, top kota |
| Admin Properties | ✅ | Data table, filter, search |
| Admin Users | ✅ | Data table, ban/unban, role |
| Admin Moderation | ✅ | Card view, approve/reject/flag |
| Admin Leads | ✅ | Table, filter status |

---

## Fitur Teknis Penting

### Data Wilayah (Offline)
- Dropdown Provinsi → Kota → Kecamatan tanpa API eksternal
- Sumber: [ibnux/data-indonesia](https://github.com/ibnux/data-indonesia)
- File: `public/wilayah/provinsi-kabupaten.json` (49KB) + `kecamatan.json` (623KB, lazy + cache)
- Pilih wilayah → peta otomatis pindah ke koordinat wilayah

### Email System (Modular)
- Default: `LogEmailProvider` — log ke console (development)
- Production: set `EMAIL_PROVIDER=resend` + `RESEND_API_KEY` di `.env`
- Tambah provider baru: implement `EmailProvider` interface di `server/src/email/`

### Access Control
| Aksi | Public | User | Pemilik |
|---|---|---|---|
| Lihat detail | ✅ views+1 | ✅ views+1 | ✅ views tidak bertambah |
| Favoritkan | ❌ 401 | ✅ | ❌ ConflictException |
| Kirim lead | ❌ 401 | ✅ | ❌ ConflictException |
| Edit properti | ❌ | ❌ | ✅ |
| Admin panel | ❌ | ❌ | ❌ ADMIN only |

---

## Backlog (Belum Dikerjakan)

### UI/UX
- [ ] Footer redesign — saat ini belum ada footer
- [ ] Auth pages styling — login/register masih plain
- [ ] Search header fungsional — autocomplete ke listing

### Fitur
- [ ] Password reset via email
- [ ] OAuth login (Google)
- [ ] Notifikasi email saat ada lead baru (EmailService sudah siap, tinggal trigger)
- [ ] Analytics dashboard per properti (views trend, leads trend)
- [ ] Featured/boost listing (BASIC/PREMIUM/ULTIMATE)
- [ ] Payment integration (Midtrans)

### Infrastruktur
- [ ] Docker production setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Sentry error tracking, uptime)
- [ ] Database backup otomatis
- [ ] Redis untuk session/cache (opsional)
