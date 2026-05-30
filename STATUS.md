# PropertyHub — Project Status

**Last Updated:** 2026-03-29 WIB
**Status:** ✅ Production-ready (minus deployment)

---

## Backend — ✅ Selesai

**Stack:** NestJS + PostgreSQL + Prisma + Bun | Port: 3001

| Modul | Status | Catatan |
|---|---|---|
| Auth (JWT cookie) | ✅ | httpOnly, access 15min + refresh 7d |
| OAuth Google | ✅ | passport-google-oauth20, auto-create user |
| Password Reset | ✅ | Token 1 jam, via email |
| Email Verification | ✅ | Modular provider (log/resend) |
| Email Notifikasi Lead | ✅ | Trigger otomatis saat lead baru masuk |
| Email Digest Mingguan | ✅ | Cron Senin 08:00 WIB, performa listing |
| Properties CRUD | ✅ | 5-level SEO URL, videoUrl, floorPlanUrl |
| Property Analytics | ✅ | Leads per hari 30 hari terakhir |
| Price History | ✅ | Trigger saat update harga, chart di detail page |
| Image Upload | ✅ | Cloudinary, set primary, max 20 foto, rate limit |
| Floor Plan Upload | ✅ | Upload terpisah, tampil di detail page |
| Leads System | ✅ | Anti-spam, rate limit (3/mnt, 10/hari), export CSV |
| Favorites | ✅ | Self-favorite dicegah, count per properti |
| Featured Listing | ✅ | BASIC/PREMIUM/ULTIMATE, modular payment |
| Payment (Modular) | ✅ | LogProvider default, Midtrans via env |
| Featured Auto-Expire | ✅ | Cron setiap jam, featured=false + ranking recalculate |
| Featured Fairness | ✅ | Boost berbeda per tier (1.3x/1.5x/2x), freshness freeze saat featured |
| Harga Featured dari DB | ✅ | PaymentService baca dari SiteSettings, bukan hardcode |
| Admin Panel | ✅ | Moderation, stats, charts, ban user |
| Ranking Algorithm | ✅ | quality/freshness/engagement/reputation, boost per tier |
| Auto-flag Listing | ✅ | Foto<3 / deskripsi<50char / harga<10jt |
| Reviews & Rating | ✅ | Rating 1-5, komentar, avg per agen, self-review dicegah |
| Notifications | ✅ | In-app bell, leads/approve/reject |
| Reports | ✅ | Laporkan listing spam/scam, resolve oleh admin |
| Saved Searches | ✅ | Simpan filter, email digest |
| Pencarian Radius | ✅ | Haversine SQL, filter lat/lng/radius |
| Refresh Token | ✅ | Access 15min + refresh 7d, revoke on logout |
| Security | ✅ | Helmet, CORS strict, rate limit, ClassSerializer |
| Decimal Serializer | ✅ | Prisma Decimal → number otomatis di semua response |
| Swagger Docs | ✅ | `/api/docs` (dev only) |
| Health Check | ✅ | `GET /health` |
| Error Handling | ✅ | AllExceptionsFilter, structured error response |

**Total:** 82 endpoints, 15 tabel, 20 migrations

---

## Frontend — ✅ Selesai

**Stack:** Next.js 16 (App Router, Turbopack) + Tailwind v4 + shadcn/ui + Bun | Port: 3000

| Halaman / Fitur | Status | Catatan |
|---|---|---|
| Homepage | ✅ | ISR 60s, social proof real stats, autocomplete search |
| Listing (5 level URL) | ✅ | ISR 30s, filter, sort, pagination, skeleton |
| Detail Properti | ✅ | ISR 60s, gallery, price history, video, floor plan, OG image |
| Auth (login/register) | ✅ | Redirect ke halaman asal setelah login |
| OAuth Google | ✅ | Tombol di login & register |
| Lupa Password | ✅ | `/forgot-password` + `/reset-password` |
| Email Verification | ✅ | `/verify-email`, banner di dashboard |
| Dashboard Overview | ✅ | Stats, alert leads, recent activity |
| Dashboard Properties | ✅ | Search, filter, sort, pagination |
| Dashboard Analitik | ✅ | `/dashboard/properties/[id]/analytics` — leads chart 30 hari |
| Dashboard Leads | ✅ | 2 tab masuk/terkirim, search, filter status, export CSV |
| Dashboard Favorites | ✅ | Load more |
| Dashboard Profile | ✅ | Edit info + ganti password |
| Dashboard Saved Searches | ✅ | List + hapus saved search |
| Featured Modal | ✅ | Pilih tier, bayar/aktifkan langsung |
| Perbandingan Properti | ✅ | `/bandingkan`, side-by-side max 3 properti |
| Profil Agen | ✅ | `/agen/[id]`, listing aktif, reviews, avg rating |
| Admin Dashboard | ✅ | KPI cards, charts, top kota |
| Admin Properties | ✅ | Data table, filter, search, update status, hapus |
| Admin Users | ✅ | Data table, ban/unban, ubah role |
| Admin Moderation | ✅ | Card view, approve/reject/flag, auto-flag reason |
| Admin Leads | ✅ | Table, filter status |
| Admin Reports | ✅ | List laporan, resolve |
| Notification Bell | ✅ | In-app, mark read, mark all read |
| Floor Plan Upload | ✅ | Di form create (step 2) dan edit |
| Near Me Button | ✅ | Filter properti berdasarkan lokasi GPS |
| KPR Calculator | ✅ | Kalkulator cicilan di detail page |
| Share Button | ✅ | Share URL properti |
| Report Button | ✅ | Laporkan listing dari detail page |
| Compare Bar | ✅ | Sticky bar untuk bandingkan properti |
| Quick View | ✅ | Preview properti tanpa buka halaman baru |
| SEO | ✅ | generateMetadata, JSON-LD, sitemap.xml, robots.txt, OG image |

---

## Fitur Teknis Penting

### ISR (Incremental Static Regeneration)
- Homepage: `revalidate = 60` detik
- Listing page: `revalidate = 30` detik
- Detail page: `revalidate = 60` detik
- Dashboard/admin: `no-store` (selalu fresh, butuh auth)

### Data Wilayah (Offline)
- Dropdown Provinsi → Kota → Kecamatan tanpa API eksternal
- Autocomplete search bar: 543 kota/kabupaten
- File: `public/wilayah/provinsi-kabupaten.json` + `kecamatan.json`

### Auth Flow
- Login → set `token` cookie (15min) + `refresh_token` cookie (7d)
- Request 401 → auto-refresh via `POST /auth/refresh` → retry
- Logout → revoke refresh token di DB + clear kedua cookie
- Google OAuth → sama, set dua cookie, redirect ke `/dashboard`

### Email System (Modular)
- Default: `LogEmailProvider` — log ke console
- Production: `EMAIL_PROVIDER=resend` + `RESEND_API_KEY`

### Payment System (Modular)
- Default: `LogPaymentProvider` — log ke console, featured langsung aktif
- Production: `PAYMENT_PROVIDER=midtrans` + keys

### Security Stack
- Helmet — HTTP security headers
- CORS — restrict ke `FRONTEND_URL`
- Rate limit — global + per-endpoint (upload foto: 20/10mnt, floor plan: 10/10mnt, lead: 3/mnt + 10/hari)
- `ClassSerializerInterceptor` — safety net field sensitif
- `DecimalSerializerInterceptor` — Prisma Decimal → number
- JWT httpOnly cookie — tidak accessible via JS

### Access Control
| Aksi | Public | User | Pemilik | Admin |
|---|---|---|---|---|
| Lihat detail | ✅ views+1 | ✅ views+1 | ✅ no increment | ✅ |
| Favoritkan | ❌ | ✅ | ❌ self | ✅ |
| Kirim lead | ❌ | ✅ | ❌ self | ✅ |
| Review agen | ❌ | ✅ | ❌ self | ✅ |
| Edit properti | ❌ | ❌ | ✅ | ✅ |
| Admin panel | ❌ | ❌ | ❌ | ✅ |

### Auto-flag Rules
| Kondisi | Flag |
|---|---|
| Foto < 3 | ✅ |
| Deskripsi < 50 karakter | ✅ |
| Harga < Rp 10 juta | ✅ |

---

## Backlog

- [ ] Docker production setup (Dockerfile BE + FE, docker-compose.prod.yml)
- [ ] CI/CD pipeline (GitHub Actions — push main → build → deploy)
- [ ] Monitoring (Sentry error tracking BE + FE, uptime monitoring)
- [ ] Database backup otomatis harian
- [ ] Redis caching (saat traffic > 1000 req/mnt)
- [ ] Radius slider UI yang lebih lengkap di halaman listing
- [ ] "Properti serupa baru masuk" — email ke user yang pernah favorit area serupa
- [ ] Blacklist nomor telepon/email (admin)
- [ ] Soft delete properti (audit trail)
- [ ] Views trend di analytics (saat ini hanya leads per hari)
